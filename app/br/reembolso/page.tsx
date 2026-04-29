import Link from "next/link";

export default function ReembolsoBR() {
  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <Link href="/br" className="text-sm text-green-600 hover:underline mb-8 inline-block">← Voltar ao Início</Link>
        <h1 className="text-3xl font-semibold mb-2">Política de Reembolso</h1>
        <p className="text-sm text-neutral-500 mb-10">Última atualização: 29 de abril de 2025</p>
        <div className="space-y-8 text-sm leading-relaxed text-neutral-700">
          <section><h2 className="text-lg font-semibold text-neutral-900 mb-2">Produto Digital</h2><p>A TradePro Technologies comercializa serviços digitais — criadores de currículo e carta de apresentação — cujo acesso é concedido imediatamente após a compra. Por se tratar de conteúdo digital entregue instantaneamente, as vendas são geralmente finais.</p></section>
          <section><h2 className="text-lg font-semibold text-neutral-900 mb-2">Direitos do Consumidor (CDC)</h2><p>Em conformidade com o Código de Defesa do Consumidor (Lei nº 8.078/90), o consumidor que realizar compra fora de estabelecimento comercial (pela internet) tem o direito de arrependimento em até 7 (sete) dias corridos, exceto quando o produto digital já tiver sido acessado ou utilizado.</p></section>
          <section><h2 className="text-lg font-semibold text-neutral-900 mb-2">Quando Realizamos Reembolso</h2>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li><strong>Falha técnica verificada</strong> — você foi cobrado mas não conseguiu acessar a ferramenta por erro comprovado do nosso lado.</li>
              <li><strong>Cobrança duplicada</strong> — você foi cobrado mais de uma vez pela mesma sessão.</li>
              <li><strong>Direito de arrependimento</strong> — solicitado em até 7 dias após a compra, desde que nenhum PDF tenha sido baixado.</li>
            </ul>
          </section>
          <section><h2 className="text-lg font-semibold text-neutral-900 mb-2">Quando Não Realizamos Reembolso</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Você acessou a ferramenta e baixou um ou mais PDFs.</li>
              <li>Mudança de opinião após o acesso.</li>
              <li>Insatisfação com sugestões da IA (são pontos de partida, não resultados garantidos).</li>
            </ul>
          </section>
          <section><h2 className="text-lg font-semibold text-neutral-900 mb-2">Como Solicitar Reembolso</h2><p>Envie um e-mail para <a href="mailto:andrew@tradeprotech.ai" className="text-green-600 hover:underline">andrew@tradeprotech.ai</a> em até 48 horas após a compra com: seu nome, e-mail usado no pagamento, data e valor da cobrança, e uma breve descrição do problema. Retornaremos em até 2 dias úteis. Reembolsos aprovados são devolvidos ao método de pagamento original em até 10 dias úteis.</p></section>
        </div>
      </div>
    </div>
  );
}
