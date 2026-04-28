// lib/entitlements.ts
//
// Storage strategy:
//   - Vercel with REDIS_URL: use ioredis — persistent across all serverless instances
//   - Vercel with KV_REST_API_URL: use @vercel/kv
//   - Local dev: use data/entitlements.json on disk

import { ProductId } from "./pricing";
import { overrides } from "@/config/overrides";

export type UserEntitlements = {
  resume: boolean;
  coverLetter: boolean;
  bundle: boolean;
};

const EMPTY: UserEntitlements = { resume: false, coverLetter: false, bundle: false };
const KEY = (userId: string) => `entitlements:${userId}`;

// ── Storage detection ─────────────────────────────────────────────────────────

function getRedisUrl(): string | undefined {
  return process.env.REDIS_URL || process.env.KV_URL;
}

function getKVRestUrl(): string | undefined {
  return process.env.KV_REST_API_URL || process.env.TRADEPRO_KV_REST_API_URL;
}

function getKVRestToken(): string | undefined {
  return process.env.KV_REST_API_TOKEN || process.env.TRADEPRO_KV_REST_API_TOKEN;
}

// ── ioredis helpers (REDIS_URL) ───────────────────────────────────────────────

function createRedisClient() {
  const Redis = require("ioredis");
  const url = getRedisUrl()!;
  // rediss:// requires TLS — rejectUnauthorized: false for Upstash/Vercel Redis
  const tls = url.startsWith("rediss://") ? { rejectUnauthorized: false } : undefined;
  return new Redis(url, {
    tls,
    connectTimeout: 5000,
    maxRetriesPerRequest: 1,
    // enableOfflineQueue must stay true (default) so commands wait for the
    // connection to be ready instead of throwing immediately
  });
}

async function redisGet(userId: string): Promise<UserEntitlements> {
  const client = createRedisClient();
  try {
    const val = await client.get(KEY(userId));
    return val ? JSON.parse(val) : { ...EMPTY };
  } catch {
    return { ...EMPTY };
  } finally {
    client.disconnect();
  }
}

async function redisSet(userId: string, data: UserEntitlements): Promise<void> {
  const client = createRedisClient();
  try {
    await client.set(KEY(userId), JSON.stringify(data));
  } finally {
    client.disconnect();
  }
}

async function redisDel(userId: string): Promise<void> {
  const client = createRedisClient();
  try {
    await client.del(KEY(userId));
  } finally {
    client.disconnect();
  }
}

async function redisDelAll(): Promise<void> {
  const client = createRedisClient();
  try {
    const keys: string[] = await client.keys("entitlements:*");
    if (keys.length > 0) await client.del(...keys);
  } finally {
    client.disconnect();
  }
}

// ── @vercel/kv helpers (KV_REST_API_URL) ─────────────────────────────────────

function getKVClient() {
  const { createClient } = require("@vercel/kv");
  return createClient({ url: getKVRestUrl(), token: getKVRestToken() });
}

async function kvGet(userId: string): Promise<UserEntitlements> {
  const val = await getKVClient().get<UserEntitlements>(KEY(userId));
  return val ?? { ...EMPTY };
}

async function kvSet(userId: string, data: UserEntitlements): Promise<void> {
  await getKVClient().set(KEY(userId), data);
}

async function kvDel(userId: string): Promise<void> {
  await getKVClient().del(KEY(userId));
}

async function kvDelAll(): Promise<void> {
  const client = getKVClient();
  const keys: string[] = await client.keys("entitlements:*");
  if (keys.length > 0) await Promise.all(keys.map((k: string) => client.del(k)));
}

// ── JSON file helpers (local dev) ─────────────────────────────────────────────

import fs from "fs/promises";
import path from "path";

type EntitlementStore = Record<string, UserEntitlements>;
const DATA_DIR = path.join(process.cwd(), "data");
const ENTITLEMENTS_FILE = path.join(DATA_DIR, "entitlements.json");

async function readStore(): Promise<EntitlementStore> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const raw = await fs.readFile(ENTITLEMENTS_FILE, "utf-8").catch(() => "{}");
    return JSON.parse(raw) as EntitlementStore;
  } catch {
    return {};
  }
}

async function writeStore(store: EntitlementStore): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(ENTITLEMENTS_FILE, JSON.stringify(store, null, 2), "utf-8");
}

// ── Routing ───────────────────────────────────────────────────────────────────

type StorageBackend = "redis" | "kv" | "file";

function getBackend(): StorageBackend {
  if (getRedisUrl()) return "redis";
  if (getKVRestUrl() && getKVRestToken()) return "kv";
  return "file";
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function getUserEntitlements(userId: string): Promise<UserEntitlements> {
  if (overrides.devMode || overrides.access) {
    return { resume: true, coverLetter: true, bundle: overrides.premium };
  }
  const backend = getBackend();
  if (backend === "redis") return redisGet(userId);
  if (backend === "kv") return kvGet(userId);
  const store = await readStore();
  return store[userId] ?? { ...EMPTY };
}

export async function grantEntitlement(userId: string, productId: ProductId): Promise<UserEntitlements> {
  const backend = getBackend();
  const current =
    backend === "redis" ? await redisGet(userId) :
    backend === "kv"    ? await kvGet(userId) :
    (await readStore())[userId] ?? { ...EMPTY };

  let updated: UserEntitlements = { ...current };
  switch (productId) {
    case ProductId.RESUME:       updated.resume = true; break;
    case ProductId.COVER_LETTER: updated.coverLetter = true; break;
    case ProductId.BUNDLE:       updated = { resume: true, coverLetter: true, bundle: true }; break;
    default: throw new Error(`Unknown productId: ${productId}`);
  }

  if (backend === "redis") { await redisSet(userId, updated); }
  else if (backend === "kv") { await kvSet(userId, updated); }
  else { const s = await readStore(); s[userId] = updated; await writeStore(s); }

  return updated;
}

export async function resetEntitlements(userId?: string): Promise<void> {
  const backend = getBackend();
  if (backend === "redis") {
    userId ? await redisDel(userId) : await redisDelAll();
  } else if (backend === "kv") {
    userId ? await kvDel(userId) : await kvDelAll();
  } else {
    const store = await readStore();
    if (userId) { delete store[userId]; }
    else { for (const k of Object.keys(store)) delete store[k]; }
    await writeStore(store);
  }
}

export function getStorageBackend(): string {
  return getBackend();
}
