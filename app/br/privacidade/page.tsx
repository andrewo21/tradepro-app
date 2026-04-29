import Link from "next/link";

export default function PrivacidadeBR() {
  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <Link href="/br" className="text-sm text-green-600 hover:underline mb-8 inline-block">← Voltar ao Início</Link>
        <h1 className="text-3xl font-semibold mb-2">Política de Privacidade</h1>
        <p className="text-sm text-neutral-500 mb-10">Última atualização: 29 de abril de 2025</p>
        <div className="space-y-8 text-sm leading-relaxed text-neutral-700">
          <section><h2 className="text-lg font-semibold text-neutral-900 mb-2">1. Informações que Coletamos</h2>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Dados do currículo</strong> — nome, contato, histórico profissional, habilidades e formação que você insere na plataforma.</li>
              <li><strong>Dados de pagamento</strong> — processados integralmente pela Stripe. A TradePro não armazena dados de cartão.</li>
              <li><strong>E-mail</strong> — caso se cadastre para receber novidades ou envie uma mensagem de contato.</li>
            </ul>
          </section>
          <section><h2 className="text-lg font-semibold text-neutral-900 mb-2">2. Uso das Informações</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Para gerar seu currículo ou carta de apresentação em PDF.</li>
              <li>Para verificar e cumprir sua compra.</li>
              <li>Para responder solicitações de suporte.</li>
              <li>Para enviar atualizações do produto, caso você tenha optado por recebê-las.</li>
            </ul>
          </section>
          <section><h2 className="text-lg font-semibold text-neutral-900 mb-2">3. LGPD — Lei Geral de Proteção de Dados</h2><p>Em conformidade com a Lei nº 13.709/2018, você tem o direito de acessar, corrigir ou solicitar a exclusão de seus dados pessoais a qualquer momento. Para exercer esses direitos, entre em contato: <a href="mailto:andrew@tradeprotech.ai" className="text-green-600 hover:underline">andrew@tradeprotech.ai</a>. Responderemos em até 15 dias úteis.</p></section>
          <section><h2 className="text-lg font-semibold text-neutral-900 mb-2">4. Não Vendemos seus Dados</h2><p>A TradePro Technologies não vende, aluga ou compartilha suas informações pessoais com terceiros para fins de marketing.</p></section>
          <section><h2 className="text-lg font-semibold text-neutral-900 mb-2">5. Serviços de Terceiros</h2>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Stripe</strong> — processamento de pagamentos.</li>
              <li><strong>OpenAI</strong> — recursos de escrita assistida por IA.</li>
              <li><strong>Vercel</strong> — hospedagem e infraestrutura.</li>
            </ul>
          </section>
          <section><h2 className="text-lg font-semibold text-neutral-900 mb-2">6. Contato do Encarregado (DPO)</h2><p>Responsável pela proteção de dados: <a href="mailto:andrew@tradeprotech.ai" className="text-green-600 hover:underline">andrew@tradeprotech.ai</a></p></section>
        </div>
      </div>
    </div>
  );
}
