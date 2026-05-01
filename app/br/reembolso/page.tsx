import Link from "next/link";

export default function ReembolsoBR() {
  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900 flex flex-col">
      <main className="flex-1 w-full">
        <div className="max-w-3xl mx-auto px-4 py-16">

          <Link href="/br" className="text-sm text-green-600 hover:underline mb-8 inline-block">← Voltar ao Início</Link>

          <h1 className="text-3xl font-semibold mb-2">Política de Reembolso</h1>
          <p className="text-sm text-neutral-500 mb-10">Última atualização: Maio de 2026</p>

          <div className="space-y-8 text-sm leading-relaxed text-neutral-700">

            <section>
              <p>A TradePro oferece um serviço digital de criação de currículos com entrega imediata. Como o produto é entregue de forma instantânea e não pode ser devolvido, todas as vendas são consideradas definitivas após a entrega bem-sucedida do serviço.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-neutral-900 mb-3">Reembolsos São Concedidos Apenas Nestes Casos</h2>
              <ul className="space-y-2">
                <li className="flex items-start gap-2"><span className="text-green-600 flex-shrink-0 mt-0.5">•</span><span>Você foi cobrado duas vezes pela mesma compra</span></li>
                <li className="flex items-start gap-2"><span className="text-green-600 flex-shrink-0 mt-0.5">•</span><span>O produto não foi gerado devido a um erro técnico do nosso lado</span></li>
                <li className="flex items-start gap-2"><span className="text-green-600 flex-shrink-0 mt-0.5">•</span><span>Você foi cobrado mas não recebeu acesso ao serviço</span></li>
              </ul>
              <p className="mt-3 text-neutral-600">Se algum desses casos se aplicar, entre em contato conosco em até 7 dias e resolveremos rapidamente.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-neutral-900 mb-3">Situações Sem Direito a Reembolso</h2>
              <p className="mb-3">Não oferecemos reembolso para:</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2"><span className="text-neutral-400 flex-shrink-0 mt-0.5">•</span><span>Currículos já gerados e entregues</span></li>
                <li className="flex items-start gap-2"><span className="text-neutral-400 flex-shrink-0 mt-0.5">•</span><span>Insatisfação com estilo ou conteúdo após a entrega</span></li>
                <li className="flex items-start gap-2"><span className="text-neutral-400 flex-shrink-0 mt-0.5">•</span><span>Compras acidentais</span></li>
                <li className="flex items-start gap-2"><span className="text-neutral-400 flex-shrink-0 mt-0.5">•</span><span>Mudança de opinião após a entrega do produto</span></li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-neutral-900 mb-2">Nota sobre a Lei Brasileira (CDC)</h2>
              <p>De acordo com o Código de Defesa do Consumidor (CDC), o direito de arrependimento de 7 dias aplica-se a assinaturas e produtos físicos adquiridos fora do estabelecimento comercial. A TradePro é um serviço digital de entrega instantânea e pagamento único — portanto, essa regra não se aplica ao nosso modelo de serviço.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-neutral-900 mb-2">Precisa de Ajuda?</h2>
              <p>Se você acredita que se enquadra em um caso de reembolso, entre em contato: <a href="mailto:support@tradepro.tools" className="text-green-600 hover:underline">support@tradepro.tools</a></p>
              <p className="mt-1 text-neutral-500">Estamos aqui para ajudar.</p>
            </section>

          </div>
        </div>
      </main>
    </div>
  );
}
