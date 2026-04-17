export const dynamic = "force-static";
export const runtime = "nodejs";

export default function PDFLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        margin: 0,
        padding: 0,
        background: "white",
        color: "black",
      }}
    >
      {/* HIDE MENU IN PDF ONLY */}
      <style>
        {`
          .menu-ui-only {
            display: none !important;
          }
        `}
      </style>

      {children}
    </div>
  );
}
