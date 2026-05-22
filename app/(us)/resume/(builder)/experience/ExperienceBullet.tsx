"use client";

// ExperienceBullet — a plain textarea for entering bullet points.
// The wizard owns all data; the assistant only chats.

import { useState } from "react";
import { X } from "lucide-react";

interface ExperienceBulletProps {
  jobId:       string;
  jobTitle:    string;
  company:     string;
  index:       number;
  value:       string;
  type:        "responsibility" | "achievement";
  placeholder?: string;
  onChange:    (value: string) => void;
  onRemove:    () => void;
}

export default function ExperienceBullet({
  jobId: _jobId, jobTitle: _jobTitle, company: _company, index: _index,
  value, type: _type, placeholder, onChange, onRemove,
}: ExperienceBulletProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="space-y-1">
      <div className="relative flex items-start gap-2">
        <textarea
          spellCheck
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          rows={2}
          className={`flex-1 rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1 transition-colors ${
            focused
              ? "border-blue-400 ring-blue-300"
              : "border-neutral-300"
          }`}
        />
        <button
          type="button"
          onClick={onRemove}
          className="mt-1 flex-shrink-0 p-1 text-neutral-400 hover:text-red-500 transition-colors"
          title="Remove"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
