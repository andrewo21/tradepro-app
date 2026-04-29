import { ReactNode } from "react";
import Header from "@/components/Header";

// This layout wraps all US-facing pages and provides the US header.
// Brazil pages (/br/*) use their own layout with HeaderBR instead.
export default function USLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <div suppressHydrationWarning>
        <Header />
      </div>
      {children}
    </>
  );
}
