// lib/entitlements.ts
//
// Storage strategy:
//   - Vercel (KV_REST_API_URL set): use @vercel/kv — persistent across all serverless instances
//   - Local dev: use data/entitlements.json on disk

import { ProductId } from "./pricing";
import { overrides } from "@/config/overrides";

export type UserEntitlements = {
  resume: boolean;
  coverLetter: boolean;
  bundle: boolean;
};

const EMPTY: UserEntitlements = { resume: false, coverLetter: false, bundle: false };

// ── KV helpers ────────────────────────────────────────────────────────────────

function useKV(): boolean {
  // Check all possible env var names — Vercel may use a prefix if one was set during setup
  return !!(
    process.env.KV_REST_API_URL ||
    process.env.TRADEPRO_KV_REST_API_URL ||
    process.env.KV_URL
  );
}

function getKVUrl(): string | undefined {
  return (
    process.env.KV_REST_API_URL ||
    process.env.TRADEPRO_KV_REST_API_URL ||
    process.env.KV_URL
  );
}

function getKVToken(): string | undefined {
  return (
    process.env.KV_REST_API_TOKEN ||
    process.env.TRADEPRO_KV_REST_API_TOKEN ||
    process.env.KV_REST_READ_ONLY_TOKEN
  );
}

function getKVClient() {
  const { createClient } = require("@vercel/kv");
  return createClient({
    url: getKVUrl(),
    token: getKVToken(),
  });
}

async function kvGet(userId: string): Promise<UserEntitlements> {
  const client = getKVClient();
  const val = await client.get<UserEntitlements>(`entitlements:${userId}`);
  return val ?? { ...EMPTY };
}

async function kvSet(userId: string, data: UserEntitlements): Promise<void> {
  const client = getKVClient();
  await client.set(`entitlements:${userId}`, data);
}

async function kvDel(userId: string): Promise<void> {
  const client = getKVClient();
  await client.del(`entitlements:${userId}`);
}

async function kvDelAll(): Promise<void> {
  const client = getKVClient();
  const keys = await client.keys("entitlements:*");
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

// ── Public API ────────────────────────────────────────────────────────────────

export async function getUserEntitlements(userId: string): Promise<UserEntitlements> {
  if (overrides.devMode || overrides.access) {
    return { resume: true, coverLetter: true, bundle: overrides.premium };
  }

  if (useKV()) {
    return kvGet(userId);
  }

  const store = await readStore();
  return store[userId] ?? { ...EMPTY };
}

export async function grantEntitlement(
  userId: string,
  productId: ProductId
): Promise<UserEntitlements> {
  const current = useKV() ? await kvGet(userId) : (await readStore())[userId] ?? { ...EMPTY };

  let updated: UserEntitlements = { ...current };

  switch (productId) {
    case ProductId.RESUME:
      updated.resume = true;
      break;
    case ProductId.COVER_LETTER:
      updated.coverLetter = true;
      break;
    case ProductId.BUNDLE:
      updated = { resume: true, coverLetter: true, bundle: true };
      break;
    default:
      throw new Error(`Unknown productId in grantEntitlement: ${productId}`);
  }

  if (useKV()) {
    await kvSet(userId, updated);
  } else {
    const store = await readStore();
    store[userId] = updated;
    await writeStore(store);
  }

  return updated;
}

export async function resetEntitlements(userId?: string): Promise<void> {
  if (useKV()) {
    if (userId) {
      await kvDel(userId);
    } else {
      await kvDelAll();
    }
  } else {
    const store = await readStore();
    if (userId) {
      delete store[userId];
    } else {
      for (const key of Object.keys(store)) delete store[key];
    }
    await writeStore(store);
  }
}
