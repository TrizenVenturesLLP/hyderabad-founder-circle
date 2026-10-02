import { createFileRoute } from "@tanstack/react-router";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  Eye,
  EyeOff,
  Filter,
  RotateCcw,
  Sparkles,
  Building2,
  Layers,
  AlertTriangle,
  Loader2,
  Boxes,
  CheckCircle2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  fetchAdminProblemStatements,
  createAdminProblemStatement,
  updateAdminProblemStatement,
  deleteAdminProblemStatement,
  type ProblemStatement,
} from "@/lib/admin-api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/problem-statements")({
  component: AdminProblemStatementsPage,
});

type FormState = {
  id?: string;
  title: string;
  slug: string;
  organization: string;
  department: string;
  targetDomain: string;
  difficulty: string;
  industry: string;
  scope: string;
  platformTech: string;
  description: string;
  keyDeliverablesText: string;
  published: boolean;
  sortOrder: number;
};

const initialFormState: FormState = {
  title: "",
  slug: "",
  organization: "",
  department: "",
  targetDomain: "",
  difficulty: "Advanced",
  industry: "",
  scope: "",
  platformTech: "",
  description: "",
  keyDeliverablesText: "",
  published: true,
  sortOrder: 0,
};

function AdminProblemStatementsPage() {
  const [items, setItems] = useState<ProblemStatement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("all");
  const [publishedFilter, setPublishedFilter] = useState("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<ProblemStatement | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toggle loading map
  const [togglingMap, setTogglingMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    void loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAdminProblemStatements();
      setItems(res.problemStatements || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load problem statements.");
    } finally {
      setLoading(false);
    }
  }

  // Unique domains
  const domains = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      if (item.targetDomain) {
        item.targetDomain.split(",").forEach((d) => {
          const t = d.trim();
          if (t) set.add(t);
        });
      }
    });
    return Array.from(set).sort();
  }, [items]);

  // Filtered items
  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return items.filter((item) => {
      if (publishedFilter === "published" && !item.published) return false;
      if (publishedFilter === "draft" && item.published) return false;

      if (selectedDomain !== "all") {
        const itemDomains = (item.targetDomain || "").split(",").map((d) => d.trim().toLowerCase());
        if (!itemDomains.includes(selectedDomain.toLowerCase())) return false;
      }

      if (q) {
        const inTitle = item.title.toLowerCase().includes(q);
        const inSlug = item.slug.toLowerCase().includes(q);
        const inOrg = (item.organization || "").toLowerCase().includes(q);
        const inDomain = (item.targetDomain || "").toLowerCase().includes(q);
        const inDesc = item.description.toLowerCase().includes(q);

        if (!inTitle && !inSlug && !inOrg && !inDomain && !inDesc) {
          return false;
        }
      }

      return true;
    });
  }, [items, searchQuery, selectedDomain, publishedFilter]);

  const publishedCount = useMemo(() => items.filter((i) => i.published).length, [items]);
  const draftCount = items.length - publishedCount;

  // Open modal for edit
  const openEditModal = (item: ProblemStatement) => {
    setFormState({
      id: item._id,
      title: item.title,
      slug: item.slug,
      organization: item.organization || "",
      department: item.department || "",
      targetDomain: item.targetDomain || "",
      difficulty: item.difficulty || "Advanced",
      industry: item.industry || "",
      scope: item.scope || "",
      platformTech: item.platformTech || "",
      description: item.description,
      keyDeliverablesText: (item.keyDeliverables || []).join("\n"),
      published: item.published !== false,
      sortOrder: item.sortOrder || 0,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  // Open modal for create
  const openCreateModal = () => {
    setFormState(initialFormState);
    setFormError(null);
    setIsModalOpen(true);
  };

  // Save Problem Statement
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.title.trim() || !formState.description.trim()) {
      setFormError("Title and Description are required.");
      return;
    }

    setIsSaving(true);
    setFormError(null);

    const deliverables = formState.keyDeliverablesText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const payload: Partial<ProblemStatement> = {
      title: formState.title.trim(),
      slug: formState.slug.trim(),
      organization: formState.organization.trim(),
      department: formState.department.trim(),
      targetDomain: formState.targetDomain.trim(),
      difficulty: formState.difficulty.trim(),
      industry: formState.industry.trim(),
      scope: formState.scope.trim(),
      platformTech: formState.platformTech.trim(),
      description: formState.description.trim(),
      keyDeliverables: deliverables,
      published: formState.published,
      sortOrder: Number(formState.sortOrder) || 0,
    };

    try {
      if (formState.id) {
        // Edit
        const res = await updateAdminProblemStatement(formState.id, payload);
        setItems((prev) =>
          prev.map((item) => (item._id === formState.id ? res.problemStatement : item))
        );
      } else {
        // Create
        const res = await createAdminProblemStatement(payload);
        setItems((prev) => [res.problemStatement, ...prev]);
      }
      setIsModalOpen(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save problem statement.");
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle Visibility directly
  const handleTogglePublished = async (item: ProblemStatement) => {
    setTogglingMap((prev) => ({ ...prev, [item._id]: true }));
    try {
      const res = await updateAdminProblemStatement(item._id, {
        published: !item.published,
      });
      setItems((prev) =>
        prev.map((i) => (i._id === item._id ? { ...i, published: res.problemStatement.published } : i))
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update visibility.");
    } finally {
      setTogglingMap((prev) => ({ ...prev, [item._id]: false }));
    }
  };

  // Confirm Delete
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteAdminProblemStatement(deleteTarget._id);
      setItems((prev) => prev.filter((i) => i._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete problem statement.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-[var(--color-background-alt)] p-4 md:p-8">
      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
            Problem Statements Management
          </h1>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            Manage all {items.length} problem statements shown on the public catalog.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--brand-primary)] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:opacity-90"
        >
          <Plus className="size-4" />
          <span>Add Problem Statement</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-[var(--color-border)] bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-[var(--color-text-muted)]">Total Statements</p>
          <p className="mt-1 text-2xl font-black text-foreground">{items.length}</p>
        </div>
        <div className="rounded-2xl border border-[var(--color-border)] bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-[var(--color-text-muted)]">Published</p>
          <p className="mt-1 text-2xl font-black text-emerald-600">{publishedCount}</p>
        </div>
        <div className="rounded-2xl border border-[var(--color-border)] bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-[var(--color-text-muted)]">Drafts / Hidden</p>
          <p className="mt-1 text-2xl font-black text-amber-600">{draftCount}</p>
        </div>
        <div className="rounded-2xl border border-[var(--color-border)] bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-[var(--color-text-muted)]">Domains</p>
          <p className="mt-1 text-2xl font-black text-indigo-600">{domains.length}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-[var(--color-border)] bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search problem statements..."
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background-alt)] py-2 pl-9 pr-4 text-xs outline-none focus:border-[var(--brand-primary)]"
          />
        </div>

        {/* Domain Filter */}
        <select
          value={selectedDomain}
          onChange={(e) => setSelectedDomain(e.target.value)}
          className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background-alt)] py-2 px-3 text-xs font-medium text-foreground outline-none focus:border-[var(--brand-primary)]"
        >
          <option value="all">All Domains ({domains.length})</option>
          {domains.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        {/* Published Filter */}
        <select
          value={publishedFilter}
          onChange={(e) => setPublishedFilter(e.target.value)}
          className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background-alt)] py-2 px-3 text-xs font-medium text-foreground outline-none focus:border-[var(--brand-primary)]"
        >
          <option value="all">All Statuses</option>
          <option value="published">Published Only</option>
          <option value="draft">Drafts Only</option>
        </select>
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div className="my-12 flex items-center justify-center gap-3 text-xs text-[var(--color-text-muted)]">
          <Loader2 className="size-5 animate-spin text-[var(--brand-primary)]" />
          <span>Loading problem statements...</span>
        </div>
      )}

      {!loading && error && (
        <div className="my-8 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
          <p className="font-bold">Error: {error}</p>
        </div>
      )}

      {/* Table of Problem Statements */}
      {!loading && !error && (
        <div className="mt-6 flex-1 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[var(--color-border)] bg-slate-50 font-semibold text-[var(--color-text-muted)]">
                <tr>
                  <th className="px-4 py-3">Slug</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Organization</th>
                  <th className="px-4 py-3">Domain</th>
                  <th className="px-4 py-3">Difficulty</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-[var(--color-text-muted)]">
                      No problem statements match your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => {
                    const isToggling = !!togglingMap[item._id];

                    return (
                      <tr key={item._id} className="transition-colors hover:bg-slate-50/60">
                        <td className="px-4 py-3 font-mono font-bold text-indigo-600">
                          {item.slug}
                        </td>
                        <td className="px-4 py-3 font-semibold text-foreground max-w-xs">
                          <div className="truncate" title={item.title}>
                            {item.title}
                          </div>
                          {item.keyDeliverables && item.keyDeliverables.length > 0 && (
                            <span className="text-[10px] font-normal text-[var(--color-text-muted)]">
                              {item.keyDeliverables.length} deliverables
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                          {item.organization || "—"}
                        </td>
                        <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                          <span className="truncate block max-w-[160px]" title={item.targetDomain}>
                            {item.targetDomain || "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              "rounded-md px-2 py-0.5 text-[10px] font-bold",
                              item.difficulty?.toLowerCase() === "advanced"
                                ? "bg-purple-100 text-purple-700"
                                : item.difficulty?.toLowerCase() === "intermediate"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-emerald-100 text-emerald-700"
                            )}
                          >
                            {item.difficulty || "Advanced"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            disabled={isToggling}
                            onClick={() => handleTogglePublished(item)}
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all",
                              item.published
                                ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            )}
                          >
                            {isToggling ? (
                              <Loader2 className="size-3 animate-spin" />
                            ) : item.published ? (
                              <Eye className="size-3" />
                            ) : (
                              <EyeOff className="size-3" />
                            )}
                            <span>{item.published ? "Published" : "Draft"}</span>
                          </button>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => openEditModal(item)}
                              className="rounded-lg p-1.5 text-[var(--color-text-muted)] transition-colors hover:bg-indigo-50 hover:text-[var(--brand-primary)]"
                              title="Edit problem statement"
                            >
                              <Edit className="size-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(item)}
                              className="rounded-lg p-1.5 text-[var(--color-text-muted)] transition-colors hover:bg-red-50 hover:text-red-600"
                              title="Delete problem statement"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit / Create Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-3xl border border-[var(--color-border)] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
              <h2 className="text-base font-bold text-foreground">
                {formState.id ? "Edit Problem Statement" : "Add New Problem Statement"}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-[var(--color-text-muted)] hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleSave} className="mt-4 flex-1 space-y-4 overflow-y-auto pr-1 text-xs">
              <div>
                <label className="block font-semibold text-foreground">Title *</label>
                <input
                  type="text"
                  required
                  value={formState.title}
                  onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                  placeholder="e.g. Autonomous Product Return Resolution Agent"
                  className="mt-1 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background-alt)] p-2.5 outline-none focus:border-[var(--brand-primary)]"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block font-semibold text-foreground">Slug (PS-ID)</label>
                  <input
                    type="text"
                    value={formState.slug}
                    onChange={(e) => setFormState({ ...formState, slug: e.target.value })}
                    placeholder="e.g. ps-01 (leave empty to auto-generate)"
                    className="mt-1 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background-alt)] p-2.5 outline-none focus:border-[var(--brand-primary)]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-foreground">Difficulty</label>
                  <select
                    value={formState.difficulty}
                    onChange={(e) => setFormState({ ...formState, difficulty: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background-alt)] p-2.5 outline-none focus:border-[var(--brand-primary)]"
                  >
                    <option value="Advanced">Advanced</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block font-semibold text-foreground">Organization</label>
                  <input
                    type="text"
                    value={formState.organization}
                    onChange={(e) => setFormState({ ...formState, organization: e.target.value })}
                    placeholder="e.g. Trizen / Company"
                    className="mt-1 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background-alt)] p-2.5 outline-none focus:border-[var(--brand-primary)]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-foreground">Department</label>
                  <input
                    type="text"
                    value={formState.department}
                    onChange={(e) => setFormState({ ...formState, department: e.target.value })}
                    placeholder="e.g. AI Research"
                    className="mt-1 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background-alt)] p-2.5 outline-none focus:border-[var(--brand-primary)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block font-semibold text-foreground">Target Domain</label>
                  <input
                    type="text"
                    value={formState.targetDomain}
                    onChange={(e) => setFormState({ ...formState, targetDomain: e.target.value })}
                    placeholder="e.g. Agentic AI, Web Development, UI/UX"
                    className="mt-1 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background-alt)] p-2.5 outline-none focus:border-[var(--brand-primary)]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-foreground">Industry</label>
                  <input
                    type="text"
                    value={formState.industry}
                    onChange={(e) => setFormState({ ...formState, industry: e.target.value })}
                    placeholder="e.g. E-commerce / Retail"
                    className="mt-1 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background-alt)] p-2.5 outline-none focus:border-[var(--brand-primary)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block font-semibold text-foreground">Scope</label>
                  <input
                    type="text"
                    value={formState.scope}
                    onChange={(e) => setFormState({ ...formState, scope: e.target.value })}
                    placeholder="e.g. Product Returns / Customer Service"
                    className="mt-1 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background-alt)] p-2.5 outline-none focus:border-[var(--brand-primary)]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-foreground">Platform / Tech Stack</label>
                  <input
                    type="text"
                    value={formState.platformTech}
                    onChange={(e) => setFormState({ ...formState, platformTech: e.target.value })}
                    placeholder="e.g. Agentic AI, LLMs, Node.js, Python"
                    className="mt-1 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background-alt)] p-2.5 outline-none focus:border-[var(--brand-primary)]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-foreground">Description *</label>
                <textarea
                  required
                  rows={4}
                  value={formState.description}
                  onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                  placeholder="Comprehensive description of the challenge..."
                  className="mt-1 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background-alt)] p-2.5 outline-none focus:border-[var(--brand-primary)]"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground">
                  Key Deliverables (Enter one per line)
                </label>
                <textarea
                  rows={4}
                  value={formState.keyDeliverablesText}
                  onChange={(e) => setFormState({ ...formState, keyDeliverablesText: e.target.value })}
                  placeholder={"Return-request intake\nPolicy-aware eligibility assessment\nAgent dashboard"}
                  className="mt-1 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background-alt)] p-2.5 outline-none focus:border-[var(--brand-primary)]"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 font-semibold text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState.published}
                    onChange={(e) => setFormState({ ...formState, published: e.target.checked })}
                    className="size-4 rounded border-slate-300 text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]"
                  />
                  <span>Publish immediately to catalog</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 border-t border-[var(--color-border)] pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-[var(--color-border)] px-4 py-2 font-semibold text-[var(--color-text-secondary)] hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand-primary)] px-5 py-2 font-semibold text-white shadow hover:opacity-90 disabled:opacity-50"
                >
                  {isSaving && <Loader2 className="size-3.5 animate-spin" />}
                  <span>{formState.id ? "Update Statement" : "Create Statement"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-[var(--color-border)] bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-red-600">
              <AlertTriangle className="size-6" />
              <h3 className="text-base font-bold text-foreground">Confirm Delete</h3>
            </div>
            <p className="mt-3 text-xs text-[var(--color-text-secondary)]">
              Are you sure you want to delete problem statement{" "}
              <strong className="text-foreground">{deleteTarget.title}</strong> ({deleteTarget.slug})? This action
              cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-xl border border-[var(--color-border)] px-4 py-2 text-xs font-semibold text-[var(--color-text-secondary)] hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDelete}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting && <Loader2 className="size-3.5 animate-spin" />}
                <span>Delete Statement</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
