import { UserEntitlements } from "@/lib/entitlements";

export default function EntitlementBadge({ entitlements }: { entitlements: UserEntitlements }) {
  if (entitlements.coverLetter || entitlements.bundle) {
    return (
      <span className="inline-block bg-green-600 text-white text-xs px-2 py-1 rounded">
        Cover Letter Unlocked
      </span>
    );
  }

  return null;
}
