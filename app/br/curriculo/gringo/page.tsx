export const dynamic = "force-dynamic";

import GringoWriter from "@/components/assistant/GringoWriter";

export const metadata = { title: "Gringo — Seu Escritor de Currículo IA" };

export default function GringoPage() {
  return (
    <GringoWriter
      locale="pt-BR"
      previewHref="/br/curriculo/preview"
    />
  );
}
