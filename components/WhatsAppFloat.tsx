"use client";

import { usePathname } from "next/navigation";

const WA_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_BR || "";
const WA_MESSAGE = encodeURIComponent("Olá! Gostaria de criar meu currículo profissional com a TradePro. Pode me ajudar?");
const WA_URL = WA_NUMBER ? `https://wa.me/${WA_NUMBER}?text=${WA_MESSAGE}` : "#";

// Pages where the float would overlap the chat send button or builder inputs
const HIDDEN_PATHS = [
  "/br/curriculo/gringo",
  "/br/curriculo/modelo",
];

export default function WhatsAppFloat() {
  const pathname = usePathname();
  if (!WA_NUMBER) return null;
  if (HIDDEN_PATHS.some(p => pathname?.startsWith(p))) return null;

  return (
    <a
      href={WA_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Fale conosco pelo WhatsApp"
      className="fixed bottom-6 right-5 z-50 flex items-center gap-2 group"
    >
      {/* Tooltip */}
      <span className="hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-900 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
        Fale conosco no WhatsApp
      </span>

      {/* Button */}
      <div className="relative w-14 h-14 flex items-center justify-center rounded-full shadow-xl"
        style={{ backgroundColor: "#25D366" }}>
        {/* Pulse ring */}
        <span className="absolute inset-0 rounded-full animate-ping opacity-30" style={{ backgroundColor: "#25D366" }} />
        {/* WhatsApp SVG */}
        <svg viewBox="0 0 32 32" className="w-8 h-8" fill="white" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 2C8.268 2 2 8.268 2 16c0 2.444.658 4.733 1.805 6.7L2 30l7.5-1.775A13.93 13.93 0 0 0 16 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 25.5a11.43 11.43 0 0 1-5.82-1.593l-.418-.247-4.453 1.053 1.09-4.322-.274-.44A11.432 11.432 0 0 1 4.5 16C4.5 9.649 9.649 4.5 16 4.5S27.5 9.649 27.5 16 22.351 27.5 16 27.5zm6.29-8.47c-.345-.173-2.04-1.005-2.355-1.12-.315-.115-.545-.172-.774.173-.23.345-.89 1.12-1.09 1.348-.2.23-.4.258-.745.086-.345-.172-1.457-.537-2.775-1.713-1.025-.916-1.717-2.047-1.917-2.392-.2-.345-.021-.532.15-.703.154-.154.345-.4.518-.6.172-.2.23-.345.345-.575.115-.23.057-.43-.029-.603-.086-.172-.774-1.866-1.06-2.555-.28-.67-.564-.58-.774-.59-.2-.01-.43-.012-.66-.012-.23 0-.603.086-.918.43-.315.345-1.205 1.177-1.205 2.869s1.233 3.328 1.405 3.557c.172.23 2.427 3.71 5.88 5.204.822.355 1.463.567 1.963.725.824.263 1.575.226 2.168.137.66-.099 2.04-.834 2.327-1.638.287-.805.287-1.494.2-1.638-.085-.143-.315-.23-.66-.4z"/>
        </svg>
      </div>
    </a>
  );
}
