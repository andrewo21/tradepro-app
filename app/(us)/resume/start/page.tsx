export const dynamic = "force-dynamic";

import dynamic from "next/dynamic";

// Skip SSR entirely — GringoWriter subscribes to Zustand persist stores
// which return different snapshots on server vs client, causing React #418.
const GringoWriter = dynamic(() => import("@/components/assistant/GringoWriter"), {
  ssr: false,
  loading: () => null,
});

export const metadata = { title: "CV-1 — Your AI Resume Writer" };

export default function CV1StartPage() {
  return (
    <GringoWriter
      locale="en"
      previewHref="/resume/preview"
    />
  );
}
