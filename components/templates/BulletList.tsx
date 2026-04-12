import React from "react";

export default function BulletList({ bullets }: { bullets: string[] }) {
  return (
    <ul className="list-disc ml-6 text-sm space-y-1">
      {bullets
        .filter((b) => b.trim() !== "")
        .map((b, i) => (
          <li key={i}>{b}</li>
        ))}
    </ul>
  );
}
