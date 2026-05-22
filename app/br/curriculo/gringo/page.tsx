export const dynamic = "force-dynamic";

import dynamic from "next/dynamic";

// Skip SSR entirely — GringoWriter subscribes to Zustand persist stores
// (useBrResumeStore, useResumeStore) which return different snapshots on
// server vs client, causing React #418 hydration crashes.
const GringoWriter = dynamic(() => import("@/components/assistant/GringoWriter"), {
  ssr: false,
  loading: () => null,
});

export const metadata = { title: "Gringo — Seu Escritor de Currículo IA" };

export default function GringoPage() {
  return (
    <GringoWriter
      locale="pt-BR"
      previewHref="/br/curriculo/preview"
    />
  );
}
