"use client";

export default function Footer() {
  return (
    <footer
      className="w-full bg-neutral-900 text-neutral-400 text-xs py-8 px-4 border-t border-neutral-700 relative"
      style={{
        height: "300px",
      }}
    >
      <div className="max-w-6xl mx-auto relative">
        <div
          style={{
            position: "absolute",
            left: "40%",
            top: "40px",
            transform: "translateX(-27%)",
          }}
        >
          <img
            src="/brand/Tradepro-logo.svg"
            alt="TradePro Technologies"
            width={400}
            height={225}
            style={{ display: "block" }}
          />
        </div>

        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "250px",
            transform: "translateX(-48%)",
            textAlign: "center",
            width: "100%",
          }}
        >
          <span className="text-neutral-500">
            © {new Date().getFullYear()} TradePro Technologies. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}
