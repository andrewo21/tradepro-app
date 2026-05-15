import RingoWriter from "@/components/assistant/RingoWriter";

export const metadata = { title: "CV-1 — Your AI Resume Writer" };

export default function CV1StartPage() {
  return (
    <RingoWriter
      locale="en"
      previewHref="/resume/preview"
    />
  );
}
