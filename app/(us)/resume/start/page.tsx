import GringoWriter from "@/components/assistant/GringoWriter";

export const metadata = { title: "CV-1 — Your AI Resume Writer" };

export default function CV1StartPage() {
  return (
    <GringoWriter
      locale="en"
      previewHref="/resume/preview"
    />
  );
}
