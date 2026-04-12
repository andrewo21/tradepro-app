import PDFTemplateClient from "./PDFTemplateClient";

export default async function PDFTemplatePage({
  params,
}: {
  params: Promise<{ template: string }>;
}) {
  const { template } = await params;

  return <PDFTemplateClient templateId={template} />;
}
