import type { Metadata } from "next";
import { ReactNode } from "react";
import HeaderBR from "@/components/HeaderBR";

export const metadata: Metadata = {
  title: {
    default: "TradePro Brasil — Currículo Profissional para a Área de Serviços",
    template: "%s | TradePro Brasil",
  },
  description:
    "Construa um currículo profissional em português, feito para eletricistas, encanadores, técnicos, estudantes e outros profissionais. Pagamento único, sem mensalidade.",
  openGraph: {
    type: "website",
    siteName: "TradePro Technologies Brasil",
    title: "TradePro Brasil — Currículo Profissional para a Área de Serviços",
    description:
      "Construa um currículo profissional em português, feito para eletricistas, encanadores, técnicos, estudantes e outros profissionais. Pagamento único, sem mensalidade.",
    url: "https://tradeprotech.ai/br",
    locale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title: "TradePro Brasil — Currículo Profissional",
    description: "Pagamento único em reais. Currículo profissional para quem trabalha de verdade.",
  },
};

export default function BrazilLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <HeaderBR />
      {children}
    </>
  );
}
