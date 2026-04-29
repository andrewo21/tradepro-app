import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Preços TradePro Brasil — Pagamento Único, Sem Mensalidade",
  description:
    "Escolha seu plano TradePro Brasil. Pagamento único em reais, sem assinatura. Currículos profissionais para quem trabalha de verdade e quer um documento limpo e profissional.",
  openGraph: {
    title: "Preços TradePro Brasil — Pagamento Único, Sem Mensalidade",
    description: "Pagamento único em reais. Sem assinatura. Aceitamos PIX.",
    url: "https://tradeprotech.ai/br/precos",
    locale: "pt_BR",
  },
};

export default function PrecosLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
