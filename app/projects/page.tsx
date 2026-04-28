"use client";

import { useState } from "react";
import { useProjectStore, createProject, parseValue, formatValue, type Project } from "@/app/store/useProjectStore";
import { useRouter } from "next/navigation";
import Link from "next/link";

const PROJECT_TYPES = [
  "Ground-Up Construction",
  "Renovation",
  "Tenant Improvement",
  "Preconstruction",
  "Design-Build",
  "Fit-Out",
  "Site Work",
  "Other",
];

function ProjectCard({
  project,
  onEdit,
  onDelete,
}: {
  project: Project;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm hover:shadow-md transition">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <h3 className="text-lg font-bold text-neutral-900">{project.projectName || "Untitled Project"}</h3>
          <p className="text-sm text-neutral-500">{project.location} {project.clientOwner ? `· ${project.clientOwner}` : ""}</p>
        </div>
        <span className="flex-shrink-0 text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-1 rounded">
          {project.projectType}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-neutral-50 rounded-lg p-3 text-center">
          <p className="text-xs text-neutral-500 mb-0.5">Contract Value</p>
          <p className="font-bold text-neutral-900 text-sm">{project.contractValue || "—"}</p>
        </div>
        <div className="bg-neutral-50 rounded-lg p-3 text-center">
          <p className="text-xs text-neutral-500 mb-0.5">Square Footage</p>
          <p className="font-bold text-neutral-900 text-sm">{project.squareFootage || "—"}</p>
        </div>
        <div className="bg-neutral-50 rounded-lg p-3 text-center">
          <p className="text-xs text-neutral-500 mb-0.5">Duration</p>
          <p className="font-bold text-neutral-900 text-sm text-center">
            {project.startDate && project.endDate ? `${project.startDate} – ${project.endDate}` : project.startDate || "—"}
          </p>
        </div>
      </div>

      {project.scope && (
        <p className="text-sm text-neutral-600 line-clamp-2 mb-4">{project.scope}</p>
      )}

      <div className="flex gap-2">
        <button onClick={onEdit} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">
          Edit
        </button>
        <button onClick={onDelete} className="px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition">
          Remove
        </button>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const { portfolio, projects, addProject, removeProject, setPortfolioField } = useProjectStore();
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const totalValue = projects.reduce((sum, p) => sum + parseValue(p.contractValue), 0);
  const totalProjects = projects.length;

  function handleAddNew() {
    setEditingProject(createProject());
    setShowForm(true);
  }

  function handleEdit(project: Project) {
    setEditingProject({ ...project });
    setShowForm(true);
  }

  function handleSave(project: Project) {
    const existing = projects.find((p) => p.id === project.id);
    if (existing) {
      useProjectStore.getState().updateProject(project.id, project);
    } else {
      addProject(project);
    }
    setShowForm(false);
    setEditingProject(null);
  }

  async function handleExportPDF() {
    setLoading(true);
    try {
      const res = await fetch("/api/export/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "project-list", portfolio, projects }),
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Project-Portfolio.pdf";
      a.click();
    } catch {
      alert("PDF export failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (showForm && editingProject) {
    return (
      <ProjectForm
        project={editingProject}
        onSave={handleSave}
        onCancel={() => { setShowForm(false); setEditingProject(null); }}
      />
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">

      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Project Portfolio Builder</h1>
          <p className="text-neutral-500 mt-1">Build a professional portfolio of your construction projects.</p>
        </div>
        <div className="flex gap-3">
          {projects.length > 0 && (
            <button
              onClick={handleExportPDF}
              disabled={loading}
              className="px-5 py-2.5 bg-neutral-900 text-white rounded-lg font-semibold hover:bg-neutral-800 disabled:opacity-50 transition"
            >
              {loading ? "Generating PDF..." : "Export Portfolio PDF"}
            </button>
          )}
          <button
            onClick={handleAddNew}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            + Add Project
          </button>
        </div>
      </div>

      {/* Portfolio info bar */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6 mb-8">
        <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-4">Your Portfolio Info</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Full Name" value={portfolio.name} onChange={e => setPortfolioField("name", e.target.value)} />
          <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Title (e.g. Site Superintendent)" value={portfolio.title} onChange={e => setPortfolioField("title", e.target.value)} />
          <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Phone" value={portfolio.phone} onChange={e => setPortfolioField("phone", e.target.value)} />
          <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Email" value={portfolio.email} onChange={e => setPortfolioField("email", e.target.value)} />
          <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Location (City, State)" value={portfolio.location} onChange={e => setPortfolioField("location", e.target.value)} />
          <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Years of Experience" value={portfolio.yearsExperience} onChange={e => setPortfolioField("yearsExperience", e.target.value)} />
          <textarea className="border rounded-lg px-3 py-2 text-sm sm:col-span-2 lg:col-span-3 h-20 resize-none" placeholder="Professional summary (2-3 sentences)" value={portfolio.bio} onChange={e => setPortfolioField("bio", e.target.value)} />
        </div>
      </div>

      {/* Stats */}
      {totalProjects > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-blue-900 text-white rounded-xl p-5 text-center">
            <p className="text-3xl font-bold">{formatValue(totalValue)}</p>
            <p className="text-blue-200 text-sm mt-1">Total Portfolio Value</p>
          </div>
          <div className="bg-neutral-800 text-white rounded-xl p-5 text-center">
            <p className="text-3xl font-bold">{totalProjects}</p>
            <p className="text-neutral-400 text-sm mt-1">Projects Listed</p>
          </div>
          <div className="bg-neutral-700 text-white rounded-xl p-5 text-center col-span-2 sm:col-span-1">
            <p className="text-3xl font-bold">{portfolio.yearsExperience || "—"}</p>
            <p className="text-neutral-400 text-sm mt-1">Years Experience</p>
          </div>
        </div>
      )}

      {/* Project grid */}
      {projects.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-neutral-200 rounded-xl">
          <p className="text-neutral-400 text-lg mb-2">No projects yet</p>
          <p className="text-neutral-400 text-sm mb-6">Add your first project to start building your portfolio.</p>
          <button onClick={handleAddNew} className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">
            + Add First Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={() => handleEdit(project)}
              onDelete={() => removeProject(project.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Project Form ──────────────────────────────────────────────────────────────

function ProjectForm({
  project,
  onSave,
  onCancel,
}: {
  project: Project;
  onSave: (p: Project) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Project>(project);

  function set(field: keyof Project, value: any) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function setHighlight(index: number, value: string) {
    const highlights = [...form.highlights];
    highlights[index] = value;
    setForm((prev) => ({ ...prev, highlights }));
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onCancel} className="text-neutral-500 hover:text-neutral-800 text-sm">← Back</button>
        <h1 className="text-2xl font-bold text-neutral-900">
          {project.projectName ? `Edit: ${project.projectName}` : "Add New Project"}
        </h1>
      </div>

      <div className="space-y-6">

        {/* Basic info */}
        <section className="bg-white border border-neutral-200 rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-neutral-700 uppercase text-xs tracking-wide">Project Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">Project Name</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="e.g. Federal Courthouse Façade Replacement" value={form.projectName} onChange={e => set("projectName", e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="City, State" value={form.location} onChange={e => set("location", e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Client / Owner</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="e.g. City of White Plains" value={form.clientOwner} onChange={e => set("clientOwner", e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Your Role / Title</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="e.g. Project Manager, Superintendent" value={form.yourRole} onChange={e => set("yourRole", e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Project Type</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm bg-white" value={form.projectType} onChange={e => set("projectType", e.target.value)}>
                {PROJECT_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </section>

        {/* Metrics */}
        <section className="bg-white border border-neutral-200 rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-neutral-700 uppercase text-xs tracking-wide">Project Metrics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="e.g. Sep 2014" value={form.startDate} onChange={e => set("startDate", e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="e.g. Dec 2016 or Present" value={form.endDate} onChange={e => set("endDate", e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Contract Value</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="e.g. $30MM or $30,000,000" value={form.contractValue} onChange={e => set("contractValue", e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Square Footage</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="e.g. 500,000 SF" value={form.squareFootage} onChange={e => set("squareFootage", e.target.value)} />
            </div>
          </div>
        </section>

        {/* Scope & Highlights */}
        <section className="bg-white border border-neutral-200 rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-neutral-700 uppercase text-xs tracking-wide">Scope & Highlights</h2>
          <div>
            <label className="block text-sm font-medium mb-1">Project Scope</label>
            <textarea className="w-full border rounded-lg px-3 py-2 text-sm h-28 resize-none" placeholder="Describe what was built, renovated, or managed..." value={form.scope} onChange={e => set("scope", e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Key Highlights (up to 3)</label>
            <div className="space-y-2">
              {[0, 1, 2].map(i => (
                <input
                  key={i}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder={`Highlight ${i + 1} — e.g. Delivered 3 weeks ahead of schedule`}
                  value={form.highlights[i] || ""}
                  onChange={e => setHighlight(i, e.target.value)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-6 py-3 border border-neutral-300 rounded-lg text-sm font-medium hover:bg-neutral-50 transition">
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Save Project
          </button>
        </div>
      </div>
    </div>
  );
}
