"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { useBrResumeStore } from "@/app/store/useBrResumeStore";
import { getOrCreateUserId } from "@/lib/userId";
import Link from "next/link";

interface Resume { id: string; title: string; locale: string; updated_at: string; }
interface Profile { nome: string; sobrenome: string; telefone: string; cidade: string; estado: string; }

export default function MeusCurriculosPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <MeusCurriculosContent />;
}

function MeusCurriculosContent() {
  const router = useRouter();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile>({ nome: "", sobrenome: "", telefone: "", cidade: "", estado: "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [exportingId, setExportingId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const setField = useBrResumeStore((s: any) => s.setField);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenu(null);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) { setLoading(false); return; }
    sb.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.replace("/br/login"); return; }
      setUser(session.user);
      const meta = session.user.user_metadata || {};
      setProfile({
        nome: meta.nome || meta.firstName || "",
        sobrenome: meta.sobrenome || meta.lastName || "",
        telefone: meta.telefone || meta.phone || "",
        cidade: meta.cidade || "",
        estado: meta.estado || "",
      });
      const res = await fetch("/api/resume/list", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const json = await res.json();
      setResumes((json.resumes || []).filter((r: Resume) => r.locale === "pt-BR"));
      setLoading(false);
    });
  }, [router]);

  async function handleSaveProfile() {
    const sb = getSupabase();
    if (!sb) return;
    setSaving(true);
    await sb.auth.updateUser({ data: profile });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  async function getSession() {
    const sb = getSupabase();
    if (!sb) return null;
    const { data: { session } } = await sb.auth.getSession();
    return session;
  }

  async function handleRename(id: string) {
    if (!renameValue.trim()) return;
    const session = await getSession();
    if (!session) return;
    await fetch("/api/resume/delete", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ id, title: renameValue.trim() }),
    });
    setResumes(prev => prev.map(r => r.id === id ? { ...r, title: renameValue.trim() } : r));
    setRenamingId(null); setOpenMenu(null);
  }

  async function handleDelete(id: string) {
    const session = await getSession();
    if (!session) return;
    setDeletingId(id);
    await fetch(`/api/resume/delete?id=${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${session.access_token}` } });
    setResumes(prev => prev.filter(r => r.id !== id));
    setDeletingId(null); setOpenMenu(null);
  }

  async function handleExport(id: string) {
    const session = await getSession();
    if (!session) return;
    setExportingId(id);
    try {
      const res = await fetch(`/api/resume/load?id=${id}`, { headers: { Authorization: `Bearer ${session.access_token}` } });
      const json = await res.json();
      if (!json.resume?.data) return;
      const d = json.resume.data;
      const BR_TO_PDF: Record<string, string> = {
        "br-moderno-azul":"modern-blue","br-clasico-profissional":"standard-classic",
        "br-verde-tecnico":"sidebar-green","br-simples-direto":"standard-contemporary",
        "br-executivo-verde":"executive-classic","br-construcao-bold":"modern-elite",
        "br-tecnico-moderno":"basic-two-column","br-premium-dourado":"executive-luxe","br-minimalista-br":"modern-professional",
      };
      const p = d.personalInfo || {};
      const pdfPayload = {
        type: "resume", locale: "pt-BR",
        selectedTemplate: BR_TO_PDF[d.selectedTemplate] || "standard-contemporary",
        name: `${p.nome || ""} ${p.sobrenome || ""}`.trim(),
        title: p.tituloProfissional || "",
        photo: p.foto || undefined,
        contact: { phone: p.telefone || p.whatsapp || "", email: p.email || "", location: `${p.cidade || ""}${p.cidade && p.estado ? ", " : ""}${p.estado || ""}`, linkedin: p.linkedin || "" },
        summary: d.resumoProfissional || "",
        skills: [...(d.habilidadesTecnicas || d.habilidades || []).map((h: any) => h.text || h)].filter(Boolean),
        softSkills: (d.habilidadesComportamentais || []).map((h: any) => h.text || h).filter(Boolean),
        experience: (d.experiencia || []).map((exp: any) => ({
          jobTitle: exp.cargo || "", company: exp.empresa || "", city: exp.cidade || "", state: exp.estado || "",
          startDate: exp.dataInicio || "", endDate: exp.dataFim || "", roleSummary: exp.roleSummary || "",
          responsibilities: (exp.responsabilidades || []).map((r: any) => r.text || r).filter(Boolean), achievements: [],
        })),
        education: (d.formacao || []).map((f: any) => ({ school: f.instituicao || "", degree: f.curso || "" })),
        certifications: [...(d.cursosCertificacoes || []).filter((c: any) => c.nome).map((c: any) => c.nome), ...(d.idiomas || []).map((i: any) => `Idioma: ${i.text || i}`).filter(Boolean)],
      };
      const pdfRes = await fetch("/api/export/pdf", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(pdfPayload) });
      if (!pdfRes.ok) return;
      const blob = await pdfRes.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url;
      const resume = resumes.find(r => r.id === id);
      a.download = `${(resume?.title || "Curriculo").replace(/\s+/g, "-")}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } finally { setExportingId(null); setOpenMenu(null); }
  }

  async function loadResume(id: string) {
    const sb = getSupabase();
    if (!sb) return;
    const { data: { session } } = await sb.auth.getSession();
    if (!session) return;

    const res = await fetch(`/api/resume/load?id=${id}`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    const json = await res.json();
    if (!json.resume?.data) return;

    // Restore entitlement — saved resume = proof of purchase
    const userId = getOrCreateUserId();
    await fetch("/api/resume/grant-access", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ userId }),
    });

    const d = json.resume.data;
    Object.keys(d).forEach(k => setField(k, d[k]));
    setField("showWatermark", false);

    router.push("/br/curriculo/pessoal");
  }

  async function handleSignOut() {
    const sb = getSupabase();
    if (!sb) return;
    await sb.auth.signOut();
    router.replace("/br");
  }

  const mostRecent = resumes[0];

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-green-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-10">
      <div className="max-w-2xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-neutral-900">Minha Conta</h1>
          <button onClick={handleSignOut} className="text-sm text-red-600 hover:text-red-800 transition">
            Sair
          </button>
        </div>

        {/* Resume CTA */}
        <div className="rounded-2xl p-6 text-white" style={{ backgroundColor: "#166534" }}>
          {mostRecent ? (
            <div>
              <p className="text-green-200 text-sm mb-1">
                Atualizado em: {new Date(mostRecent.updated_at).toLocaleDateString("pt-BR", { day: "numeric", month: "short", year: "numeric" })}
              </p>
              <p className="font-semibold text-lg mb-4">{mostRecent.title}</p>
              <button onClick={() => loadResume(mostRecent.id)}
                className="px-6 py-2.5 bg-white text-green-800 rounded-lg font-semibold text-sm hover:bg-green-50 transition">
                Continuar com seu Currículo →
              </button>
            </div>
          ) : (
            <div>
              <p className="font-semibold text-lg mb-2">Você ainda não criou um currículo.</p>
              <Link href="/br/curriculo"
                className="inline-block px-6 py-2.5 bg-white text-green-800 rounded-lg font-semibold text-sm hover:bg-green-50 transition">
                Criar meu Currículo →
              </Link>
            </div>
          )}
        </div>

        {/* Saved Resumes */}
        {resumes.length > 0 && (
          <div className="bg-white border border-neutral-200 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-neutral-900">Currículos Salvos</h2>
              <Link href="/br/curriculo" className="text-sm text-green-700 hover:text-green-900">+ Novo Currículo</Link>
            </div>
            <div className="space-y-2" ref={menuRef}>
              {resumes.map(r => (
                <div key={r.id} className="relative flex items-center gap-2 px-4 py-3 bg-neutral-50 hover:bg-green-50 border border-neutral-200 hover:border-green-400 rounded-xl transition group">
                  {renamingId === r.id ? (
                    <div className="flex-1 flex gap-2">
                      <input autoFocus type="text" value={renameValue} onChange={e => setRenameValue(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") handleRename(r.id); if (e.key === "Escape") { setRenamingId(null); setOpenMenu(null); } }}
                        className="flex-1 border border-green-500 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-600" />
                      <button onClick={() => handleRename(r.id)} className="px-3 py-1 bg-green-700 text-white rounded text-xs font-medium hover:bg-green-800">Salvar</button>
                      <button onClick={() => setRenamingId(null)} className="px-3 py-1 bg-neutral-200 rounded text-xs hover:bg-neutral-300">Cancelar</button>
                    </div>
                  ) : (
                    <button onClick={() => loadResume(r.id)} className="flex-1 text-left">
                      <p className="font-medium text-sm text-neutral-900">{r.title}</p>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        Atualizado em {new Date(r.updated_at).toLocaleDateString("pt-BR", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </button>
                  )}
                  {renamingId !== r.id && (
                    <button onClick={e => { e.stopPropagation(); setOpenMenu(openMenu === r.id ? null : r.id); }}
                      className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-200 text-neutral-500 hover:text-neutral-800 transition opacity-0 group-hover:opacity-100">
                      ···
                    </button>
                  )}
                  {openMenu === r.id && (
                    <div className="absolute right-2 top-12 z-20 bg-white border border-neutral-200 rounded-xl shadow-lg py-1 w-44">
                      <button onClick={() => { setRenamingId(r.id); setRenameValue(r.title); setOpenMenu(null); }}
                        className="w-full text-left px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2">
                        <span>✏️</span> Renomear
                      </button>
                      <button onClick={() => handleExport(r.id)} disabled={exportingId === r.id}
                        className="w-full text-left px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2 disabled:opacity-50">
                        <span>⬇️</span> {exportingId === r.id ? "Exportando…" : "Exportar PDF"}
                      </button>
                      <div className="border-t border-neutral-100 my-1" />
                      <button onClick={() => { if (confirm(`Excluir "${r.title}"? Esta ação não pode ser desfeita.`)) handleDelete(r.id); }}
                        disabled={deletingId === r.id}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 disabled:opacity-50">
                        <span>🗑️</span> {deletingId === r.id ? "Excluindo…" : "Excluir"}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Account Info */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-6">
          <h2 className="font-semibold text-neutral-900 mb-5">Informações da Conta</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">Nome</label>
              <input type="text" value={profile.nome}
                onChange={e => setProfile(p => ({ ...p, nome: e.target.value }))}
                className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600" />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">Sobrenome</label>
              <input type="text" value={profile.sobrenome}
                onChange={e => setProfile(p => ({ ...p, sobrenome: e.target.value }))}
                className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600" />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">E-mail</label>
              <input type="email" value={user?.email || ""} disabled
                className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm bg-neutral-50 text-neutral-400 cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">Telefone / WhatsApp</label>
              <input type="tel" value={profile.telefone}
                onChange={e => setProfile(p => ({ ...p, telefone: e.target.value }))}
                placeholder="(11) 99999-9999"
                className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600" />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">Cidade</label>
              <input type="text" value={profile.cidade}
                onChange={e => setProfile(p => ({ ...p, cidade: e.target.value }))}
                placeholder="São Paulo"
                className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600" />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">Estado</label>
              <input type="text" value={profile.estado}
                onChange={e => setProfile(p => ({ ...p, estado: e.target.value }))}
                placeholder="SP"
                className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600" />
            </div>
          </div>
          <button onClick={handleSaveProfile} disabled={saving}
            className="px-5 py-2 bg-green-700 text-white rounded-lg text-sm font-medium hover:bg-green-800 transition disabled:opacity-60">
            {saving ? "Salvando…" : saved ? "✓ Salvo" : "Salvar Perfil"}
          </button>
        </div>

        {/* WhatsApp help */}
        {process.env.NEXT_PUBLIC_WHATSAPP_BR && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: "#25D366" }}>
              <svg viewBox="0 0 32 32" className="w-6 h-6" fill="white">
                <path d="M16 2C8.268 2 2 8.268 2 16c0 2.444.658 4.733 1.805 6.7L2 30l7.5-1.775A13.93 13.93 0 0 0 16 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 25.5a11.43 11.43 0 0 1-5.82-1.593l-.418-.247-4.453 1.053 1.09-4.322-.274-.44A11.432 11.432 0 0 1 4.5 16C4.5 9.649 9.649 4.5 16 4.5S27.5 9.649 27.5 16 22.351 27.5 16 27.5zm6.29-8.47c-.345-.173-2.04-1.005-2.355-1.12-.315-.115-.545-.172-.774.173-.23.345-.89 1.12-1.09 1.348-.2.23-.4.258-.745.086-.345-.172-1.457-.537-2.775-1.713-1.025-.916-1.717-2.047-1.917-2.392-.2-.345-.021-.532.15-.703.154-.154.345-.4.518-.6.172-.2.23-.345.345-.575.115-.23.057-.43-.029-.603-.086-.172-.774-1.866-1.06-2.555-.28-.67-.564-.58-.774-.59-.2-.01-.43-.012-.66-.012-.23 0-.603.086-.918.43-.315.345-1.205 1.177-1.205 2.869s1.233 3.328 1.405 3.557c.172.23 2.427 3.71 5.88 5.204.822.355 1.463.567 1.963.725.824.263 1.575.226 2.168.137.66-.099 2.04-.834 2.327-1.638.287-.805.287-1.494.2-1.638-.085-.143-.315-.23-.66-.4z"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-green-900">Precisa de ajuda?</p>
              <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_BR}?text=${encodeURIComponent("Olá! Preciso de ajuda com meu currículo na TradePro.")}`}
                target="_blank" rel="noopener noreferrer"
                className="text-xs text-green-700 hover:text-green-900 underline">
                Fale conosco pelo WhatsApp →
              </a>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
