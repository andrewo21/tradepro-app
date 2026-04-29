import Link from "next/link";

export default function TermosBR() {
  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <Link href="/br" className="text-sm text-green-600 hover:underline mb-8 inline-block">← Voltar ao Início</Link>
        <h1 className="text-3xl font-semibold mb-2">Termos de Uso</h1>
        <p className="text-sm text-neutral-500 mb-10">Última atualização: 29 de abril de 2025</p>
        <div className="space-y-8 text-sm leading-relaxed text-neutral-700">
          <section><h2 className="text-lg font-semibold text-neutral-900 mb-2">1. Aceitação dos Termos</h2><p>Ao acessar ou utilizar os serviços da TradePro Technologies em tradeprotech.com.br, você concorda com estes Termos de Uso. Se não concordar, não utilize o serviço.</p></section>
          <section><h2 className="text-lg font-semibold text-neutral-900 mb-2">2. Descrição do Serviço</h2><p>A TradePro Technologies oferece um criador de currículo digital e gerador de carta de apresentação desenvolvido para profissionais da construção civil e indústrias técnicas. O acesso às ferramentas é concedido por sessão, mediante compra única.</p></section>
          <section><h2 className="text-lg font-semibold text-neutral-900 mb-2">3. Compras e Pagamento</h2><p>Todos os pagamentos são processados com segurança pela Stripe. Aceitamos cartão de crédito, PIX e parcelamento. Cada compra concede acesso a uma sessão com até dois (2) downloads em PDF por ferramenta adquirida. Após atingir o limite de downloads, o acesso à sessão expira e uma nova compra é necessária.</p></section>
          <section><h2 className="text-lg font-semibold text-neutral-900 mb-2">4. Política de Reembolso</h2><p>Consulte nossa <Link href="/br/reembolso" className="text-green-600 hover:underline">Política de Reembolso</Link> para mais detalhes. Em caso de problema técnico verificado, entre em contato conosco em até 48 horas após a compra.</p></section>
          <section><h2 className="text-lg font-semibold text-neutral-900 mb-2">5. Conteúdo do Usuário</h2><p>Você mantém total propriedade sobre as informações pessoais e profissionais inseridas na plataforma. A TradePro não vende, compartilha ou utiliza seus dados pessoais para fins que não sejam a geração do seu documento.</p></section>
          <section><h2 className="text-lg font-semibold text-neutral-900 mb-2">6. Conteúdo Gerado por IA</h2><p>A TradePro utiliza inteligência artificial para auxiliar na redação de currículos e cartas de apresentação. Todo conteúdo gerado pela IA é um ponto de partida e deve ser revisado pelo usuário antes do uso. A TradePro não garante resultados de emprego.</p></section>
          <section><h2 className="text-lg font-semibold text-neutral-900 mb-2">7. Lei Aplicável</h2><p>Estes termos são regidos pela legislação brasileira, incluindo o Código de Defesa do Consumidor (Lei nº 8.078/90) e a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018).</p></section>
          <section><h2 className="text-lg font-semibold text-neutral-900 mb-2">8. Contato</h2><p>Dúvidas sobre estes termos? Entre em contato: <a href="mailto:andrew@tradeprotech.ai" className="text-green-600 hover:underline">andrew@tradeprotech.ai</a></p></section>
        </div>
      </div>
    </div>
  );
}
