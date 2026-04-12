// lib/entitlements.ts

import fs from "fs/promises";
import path from "path";
import { ProductId } from "./pricing";
import { overrides } from "@/config/overrides";

export type UserEntitlements = {
  resume: boolean;
  coverLetter: boolean;
  bundle: boolean;
};

type EntitlementStore = Record<string, UserEntitlements>;

const DATA_DIR = path.join(process.cwd(), "data");
const ENTITLEMENTS_FILE = path.join(DATA_DIR, "entitlements.json");

async function ensureStoreFile(): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.access(ENTITLEMENTS_FILE);
  } catch {
    const initial: EntitlementStore = {};
    await fs.writeFile(ENTITLEMENTS_FILE, JSON.stringify(initial, null, 2), {
      encoding: "utf-8",
    });
  }
}

async function readStore(): Promise<EntitlementStore> {
  await ensureStoreFile();
  const raw = await fs.readFile(ENTITLEMENTS_FILE, "utf-8");
  try {
    return JSON.parse(raw) as EntitlementStore;
  } catch {
    return {};
  }
}

async function writeStore(store: EntitlementStore): Promise<void> {
  await fs.writeFile(ENTITLEMENTS_FILE, JSON.stringify(store, null, 2), {
    encoding: "utf-8",
  });
}

export async function getUserEntitlements(
  userId: string
): Promise<UserEntitlements> {
  // ⭐ Founder-safe override system
  // If devMode OR access is true → unlock builders
  if (overrides.devMode || overrides.access) {
    return {
      resume: true,
      coverLetter: true,
      bundle: overrides.premium, // premium still controls bundle
    };
  }

  // ⭐ Production: use real entitlements
  const store = await readStore();
  return (
    store[userId] || {
      resume: false,
      coverLetter: false,
      bundle: false,
    }
  );
}

export async function grantEntitlement(
  userId: string,
  productId: ProductId
): Promise<UserEntitlements> {
  const store = await readStore();

  const current: UserEntitlements =
    store[userId] || ({
      resume: false,
      coverLetter: false,
      bundle: false,
    } as UserEntitlements);

  let updated: UserEntitlements = { ...current };

  switch (productId) {
    case ProductId.RESUME:
      updated.resume = true;
      break;
    case ProductId.COVER_LETTER:
      updated.coverLetter = true;
      break;
    case ProductId.BUNDLE:
      updated = {
        resume: true,
        coverLetter: true,
        bundle: true,
      };
      break;
    default:
      throw new Error(`Unknown productId in grantEntitlement: ${productId}`);
  }

  store[userId] = updated;
  await writeStore(store);
  return updated;
}
