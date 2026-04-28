// lib/entitlements.ts
//
// Storage strategy:
//   - Vercel with REDIS_URL: use ioredis — persistent across all serverless instances
//   - Vercel with KV_REST_API_URL: use @vercel/kv
//   - Local dev: use data/entitlements.json on disk

import { ProductId } from "./pricing";
import { overrides } from "@/config/overrides";

export const MAX_DOWNLOADS = 2;

export type UserEntitlements = {
  resume: boolean;
  coverLetter: boolean;
  bundle: boolean;
  resumeDownloads: number;       // how many resume PDFs downloaded so far
  coverLetterDownloads: number;  // how many cover letter PDFs downloaded so far
};

const EMPTY: UserEntitlements = {
  resume: false,
  coverLetter: false,
  bundle: false,
  resumeDownloads: 0,
  coverLetterDownloads: 0,
};
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
    case ProductId.RESUME:
      updated.resume = true;
      updated.resumeDownloads = 0; // fresh purchase resets counter
      break;
    case ProductId.COVER_LETTER:
      updated.coverLetter = true;
      updated.coverLetterDownloads = 0;
      break;
    case ProductId.BUNDLE:
    case ProductId.UPGRADE_RESUME_TO_BUNDLE:
    case ProductId.UPGRADE_COVER_LETTER_TO_BUNDLE:
    case ProductId.UPGRADE_BOTH_TO_BUNDLE:
      updated.resume = true;
      updated.coverLetter = true;
      updated.bundle = true;
      updated.resumeDownloads = 0;
      updated.coverLetterDownloads = 0;
      break;
    default: throw new Error(`Unknown productId: ${productId}`);
  }

  if (backend === "redis") { await redisSet(userId, updated); }
  else if (backend === "kv") { await kvSet(userId, updated); }
  else { const s = await readStore(); s[userId] = updated; await writeStore(s); }

  return updated;
}

/**
 * Called after each PDF download.
 * Increments the counter for the given type and revokes access when MAX_DOWNLOADS is reached.
 * Returns the updated entitlements so the client can show the remaining count.
 */
export async function recordDownload(
  userId: string,
  type: "resume" | "coverLetter"
): Promise<UserEntitlements> {
  const backend = getBackend();
  const current =
    backend === "redis" ? await redisGet(userId) :
    backend === "kv"    ? await kvGet(userId) :
    (await readStore())[userId] ?? { ...EMPTY };

  const updated: UserEntitlements = { ...current };

  if (type === "resume") {
    updated.resumeDownloads = (current.resumeDownloads ?? 0) + 1;
    if (updated.resumeDownloads >= MAX_DOWNLOADS) {
      updated.resume = false;
    }
  } else {
    updated.coverLetterDownloads = (current.coverLetterDownloads ?? 0) + 1;
    if (updated.coverLetterDownloads >= MAX_DOWNLOADS) {
      updated.coverLetter = false;
    }
  }

  // If bundle — revoke bundle when both limits hit
  if (updated.bundle && !updated.resume && !updated.coverLetter) {
    updated.bundle = false;
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
