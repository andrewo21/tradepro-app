"use client";

type WatermarkProps = {
  show: boolean; // ⭐ NEW — replaces premiumUnlocked
};

export default function Watermark({ show }: WatermarkProps) {
  if (!show) return null; // ⭐ Only show when explicitly told to

  return (
    <div
      className="
        absolute inset-0 pointer-events-none select-none
        flex items-center justify-center
      "
      style={{
        zIndex: 0, // ⭐ Behind template content
      }}
    >
      <div
        className="text-[48px] font-bold tracking-widest text-neutral-700 whitespace-nowrap"
        style={{
          transform: "rotate(-35deg)",
          opacity: 0.12,
        }}
      >
        TRADEPRO — PREMIUM REMOVES WATERMARK
      </div>
    </div>
  );
}
