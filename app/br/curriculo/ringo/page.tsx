import RingoWriter from "@/components/assistant/RingoWriter";

export const metadata = { title: "Ringo — Seu Escritor de Currículo IA" };

export default function RingoPage() {
  return (
    <RingoWriter
      locale="pt-BR"
      previewHref="/br/curriculo/preview"
    />
  );
}
