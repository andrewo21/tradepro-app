"use client";

import React from "react";
import Image from "next/image";
import { TemplateKey, templateMeta } from "./templateList";

interface Props {
  id: TemplateKey;
  selected: boolean;
  isPremiumUser: boolean;
  onSelect: (id: TemplateKey) => void;
  onBlockPremium: () => void;
}

export default function TemplateCard({
  id,
  selected,
  isPremiumUser,
  onSelect,
  onBlockPremium,
}: Props) {
  const meta = templateMeta[id];
  const isPremium = meta.premium;

  const handleClick = () => {
    if (isPremium && !isPremiumUser) {
      onBlockPremium();
      return;
    }
    onSelect(id);
  };

  return (
    <div
      onClick={handleClick}
      className={`
        relative border rounded-lg shadow-sm cursor-pointer overflow-hidden
        transition hover:shadow-md bg-white group
        ${selected ? "ring-2 ring-neutral-900" : ""}
      `}
    >
      {/* PREMIUM BADGE */}
      {isPremium && (
        <div className="absolute top-2 right-2 bg-yellow-600 text-white text-xs px-2 py-1 rounded shadow z-30">
          Premium
        </div>
      )}

      {/* LOCK OVERLAY */}
      {isPremium && !isPremiumUser && (
        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center z-20 opacity-100 group-hover:bg-black/60 transition">
          <span className="text-white text-3xl mb-2">🔒</span>
          <span className="text-white text-sm font-medium">
            Upgrade to Unlock
          </span>
        </div>
      )}

      {/* THUMBNAIL */}
      <Image
        src={`/thumbnails/${id}.png`}
        alt={meta.name}
        width={400}
        height={500}
        className={`
          w-full object-cover transition
          ${isPremium && !isPremiumUser ? "opacity-60 blur-[1px]" : ""}
        `}
      />

      {/* NAME */}
      <div className="p-3 text-center text-sm font-medium">{meta.name}</div>
    </div>
  );
}
