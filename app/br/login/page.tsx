"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import Link from "next/link";

export default function BrLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;
    sb.auth.getSession().then(({ data }) => {
      if (data.session) router.replace("/br/curriculo");
    });
  }, [router]);

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const sb = getSupabase();
    if (!sb) {
      setError("Autenticação ainda não configurada. Adicione as chaves do Supabase no Vercel.");
      setLoading(false);
      return;
    }
    // Store BR intent so callback page knows where to redirect
    localStorage.setItem("auth_redirect", "/br/meus-curriculos");
    const { error: err } = await sb.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setLoading(false);
    if (err) setError(err.message);
    else setSent(true);
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    setError("");
    const sb = getSupabase();
    if (!sb) {
      setError("Autenticação ainda não configurada.");
      setGoogleLoading(false);
      return;
    }
    const { error: err } = await sb.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/br/meus-curriculos` },
    });
    if (err) { setError(err.message); setGoogleLoading(false); }
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-10 max-w-md w-full text-center">
          <div className="text-4xl mb-4">📧</div>
          <h1 className="text-2xl font-semibold mb-3">Verifique seu e-mail</h1>
          <p className="text-neutral-600 text-sm">
            Enviamos um link mágico para <strong>{email}</strong>.<br />
            Clique nele para entrar — sem senha.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-10 max-w-md w-full">
        <Link href="/br" className="text-sm text-neutral-400 hover:text-neutral-600 mb-6 inline-block">← Voltar ao TradePro</Link>

        <h1 className="text-2xl font-semibold mb-2">Entrar no TradePro</h1>
        <p className="text-sm text-neutral-500 mb-8">
          Salve seu progresso e acesse seu currículo de qualquer dispositivo.
        </p>

        <button
          onClick={handleGoogle}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition text-sm font-medium mb-4 disabled:opacity-60"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {googleLoading ? "Redirecionando…" : "Continuar com Google"}
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-neutral-200" />
          <span className="text-xs text-neutral-400">ou</span>
          <div className="flex-1 h-px bg-neutral-200" />
        </div>

        <form onSubmit={handleMagicLink}>
          <label className="block text-sm font-medium mb-1">E-mail</label>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="voce@email.com"
            className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-green-600"
          />
          {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-green-700 text-white rounded-lg text-sm font-semibold hover:bg-green-800 transition disabled:opacity-60"
          >
            {loading ? "Enviando…" : "Enviar Link Mágico"}
          </button>
        </form>

        <p className="text-xs text-neutral-400 text-center mt-6">
          Sem senha. Enviaremos um link de acesso por e-mail.
        </p>
      </div>
    </div>
  );
}
