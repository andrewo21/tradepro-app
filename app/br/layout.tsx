import { ReactNode } from "react";
import HeaderBR from "@/components/HeaderBR";

export const metadata = {
  title: "TradePro Technologies Brasil",
  description: "Criador de currículo profissional para a construção civil e indústria.",
};

export default function BrazilLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <HeaderBR />
      {children}
    </>
  );
}
