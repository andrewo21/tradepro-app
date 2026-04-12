export const metadata = {
  title: "PDF",
};

export default function PDFRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
