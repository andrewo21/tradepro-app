"use client";

import { useState } from "react";
import Link from "next/link";

export default function ContatoBR() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message: `[Brasil] ${message}` }),
      });
      if (res.ok) setSubmitted(true);
      else setError("Algo deu errado. Tente novamente.");
    } catch { setError("Erro de rede. Verifique sua conexão."); }
    finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <Link href="/br" className="text-sm text-green-600 hover:underline mb-8 inline-block">← Voltar ao Início</Link>
        <h1 className="text-3xl font-semibold mb-6 text-center">Contato</h1>
        <p className="text-neutral-700 text-center mb-10">Tem alguma dúvida ou precisa de suporte? Preencha o formulário abaixo e retornaremos em até 24 horas.</p>

        {submitted ? (
          <div className="bg-white border border-green-300 rounded-lg p-10 text-center">
            <div className="text-5xl mb-4">✓</div>
            <h2 className="text-2xl font-semibold text-green-700 mb-3">Obrigado pelo seu contato!</h2>
            <p className="text-neutral-700 text-lg">Um membro da nossa equipe entrará em contato em até 24 horas.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white border border-neutral-300 rounded-lg shadow-sm p-8 space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1">Seu Nome</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)}
                className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" placeholder="João Silva" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Seu E-mail</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" placeholder="voce@exemplo.com" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mensagem</label>
              <textarea required value={message} onChange={e => setMessage(e.target.value)}
                className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm h-32"
                placeholder="Como podemos ajudar?" />
            </div>
            {error && <p className="text-red-600 text-sm text-center">{error}</p>}
            <div className="text-center">
              <button type="submit" disabled={loading}
                className="bg-neutral-900 text-white px-8 py-3 rounded-md text-sm font-semibold hover:bg-neutral-800 disabled:opacity-50">
                {loading ? "Enviando..." : "Enviar Mensagem"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
