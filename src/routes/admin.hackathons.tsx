import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ExternalLink,
  Plus,
  Pencil,
  Trash2,
  Search,
  RotateCcw,
  X,
  FileText,
  Upload,
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { AdminPageHeader, AdminPanel } from "@/components/admin/AdminPageChrome";
import {
  getAllProblemStatements,
  addProblemStatement,
  updateProblemStatement,
  deleteProblemStatement,
  bulkAddProblemStatements,
  clearAllProblemStatements,
  resetProblemStatementsToStarter,
  subscribeToHackathonData,
  getHackathonDetails,
} from "@/lib/hackathon-storage";
import type { ProblemDifficulty, ProblemStatement } from "@/lib/hackathon";

export const Route = createFileRoute("/admin/hackathons")({
  component: AdminHackathonsPage,
  head: () => ({
    meta: [{ title: "AI Hack x MRDU — Admin Problem Statements" }],
  }),
});

interface FormState {
  id?: string;
  domainId: string;
  title: string;
  category: string;
  difficulty: ProblemDifficulty;
  description: string;
  deliverablesText: string;
}

const emptyForm: FormState = {
  domainId: "ui-ux",
  title: "",
  category: "",
  difficulty: "Intermediate",
  description: "",
  deliverablesText: "",
};

function AdminHackathonsPage() {
  const details = getHackathonDetails();
  const domains = details.domains;

  const [statements, setStatements] = useState<ProblemStatement[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string>("ui-ux");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");

  // Single Add / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormState>(emptyForm);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Bulk Add Modal
  const [isBulkModalOpen, setIsBulkModalOpen] = useState<boolean>(false);
  const [bulkText, setBulkText] = useState<string>("");
  const [bulkDomain, setBulkDomain] = useState<string>("ui-ux");
  const [bulkDifficulty, setBulkDifficulty] = useState<ProblemDifficulty>("Intermediate");

  useEffect(() => {
    function load() {
      setStatements(getAllProblemStatements());
    }
    load();
    const unsubscribe = subscribeToHackathonData(load);
    return () => unsubscribe();
  }, []);

  const domainStatements = useMemo(() => {
    return statements.filter((s) => s.domainId === selectedDomain);
  }, [statements, selectedDomain]);

  const filteredStatements = useMemo(() => {
    return domainStatements.filter((item) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesDifficulty =
        difficultyFilter === "all" || item.difficulty.toLowerCase() === difficultyFilter.toLowerCase();

      return matchesSearch && matchesDifficulty;
    });
  }, [domainStatements, searchQuery, difficultyFilter]);

  function handleOpenCreate() {
    setEditingId(null);
    setFormData({
      ...emptyForm,
      domainId: selectedDomain,
    });
    setIsModalOpen(true);
  }

  function handleOpenEdit(item: ProblemStatement) {
    setEditingId(item.id);
    setFormData({
      id: item.id,
      domainId: item.domainId,
      title: item.title,
      category: item.category || "",
      difficulty: item.difficulty,
      description: item.description,
      deliverablesText: (item.deliverables || []).join("\n"),
    });
    setIsModalOpen(true);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!formData.description.trim()) {
      toast.error("Description is required");
      return;
    }

    const deliverables = formData.deliverablesText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    if (editingId) {
      const updated = updateProblemStatement({
        id: editingId,
        domainId: formData.domainId,
        title: formData.title,
        category: formData.category || "General",
        difficulty: formData.difficulty,
        description: formData.description,
        deliverables,
      });
      if (updated) {
        toast.success(`Problem statement ${editingId} updated`);
        setIsModalOpen(false);
      } else {
        toast.error("Failed to update statement");
      }
    } else {
      const created = addProblemStatement({
        id: formData.id,
        domainId: formData.domainId,
        title: formData.title,
        category: formData.category || "General",
        difficulty: formData.difficulty,
        description: formData.description,
        deliverables,
      });
      toast.success(`Created problem statement ${created.id}`);
      setIsModalOpen(false);
    }
  }

  function handleBulkImport(e: React.FormEvent) {
    e.preventDefault();
    if (!bulkText.trim()) {
      toast.error("Please enter at least one problem statement");
      return;
    }

    const rawBlocks = bulkText
      .split(/\n\s*\n/)
      .map((b) => b.trim())
      .filter(Boolean);

    const parsedItems: { domainId: string; title: string; description: string; difficulty: ProblemDifficulty }[] = [];

    for (const block of rawBlocks) {
      const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
      if (lines.length === 0) continue;
      const title = lines[0].replace(/^(\d+[\.\)]|\-|\*)\s*/, "");
      const description = lines.slice(1).join(" ") || title;
      parsedItems.push({
        domainId: bulkDomain,
        title,
        description,
        difficulty: bulkDifficulty,
      });
    }

    if (parsedItems.length === 0) {
      toast.error("Could not parse problem statements");
      return;
    }

    const added = bulkAddProblemStatements(parsedItems);
    toast.success(`Successfully imported ${added.length} problem statements into ${bulkDomain}`);
    setIsBulkModalOpen(false);
    setBulkText("");
  }

  function handleDelete(id: string) {
    const success = deleteProblemStatement(id);
    if (success) {
      toast.success(`Deleted statement ${id}`);
      setDeleteConfirmId(null);
    } else {
      toast.error("Could not delete statement");
    }
  }

  function handleReset() {
    if (window.confirm("Reset problem statements to the starter set? This will replace current entries.")) {
      resetProblemStatementsToStarter();
      toast.success("Problem statements reset to starter templates");
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <AdminPageHeader
        title="AI HACK X MRDU — Problem Statements"
        description="Add and manage live challenge problem statements for the 4 competition tracks."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/hackathon"
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted"
            >
              <ExternalLink className="size-3.5" />
              View Public Page
            </Link>
            <button
              type="button"
              onClick={() => {
                setBulkDomain(selectedDomain);
                setIsBulkModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted"
            >
              <Upload className="size-3.5" />
              Bulk Add
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-2.5 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted"
              title="Reset to starter seeds"
            >
              <RotateCcw className="size-3.5" />
              Reset
            </button>
            <button
              type="button"
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-95"
            >
              <Plus className="size-3.5" />
              Add Statement
            </button>
          </div>
        }
      />

      {/* Domain Selection Tabs (4 Tracks) */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        {domains.map((domain) => {
          const isSelected = domain.id === selectedDomain;
          const count = statements.filter((s) => s.domainId === domain.id).length;
          return (
            <button
              key={domain.id}
              type="button"
              onClick={() => {
                setSelectedDomain(domain.id);
                setSearchQuery("");
              }}
              className={`flex items-center justify-between rounded-xl border p-3.5 text-left transition-all ${
                isSelected
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border bg-white hover:border-border-strong hover:bg-muted/30"
              }`}
            >
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Track
                </p>
                <p className="font-semibold text-sm text-foreground">{domain.name}</p>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                  isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter and Search Panel */}
      <AdminPanel className="rounded-xl p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, title, keyword, or category..."
              className="w-full rounded-lg border border-border bg-white py-2 pl-9 pr-8 text-xs text-foreground focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="rounded-lg border border-border bg-white px-3 py-2 text-xs font-medium text-foreground focus:border-primary focus:outline-hidden"
            >
              <option value="all">All Difficulties</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>
      </AdminPanel>

      {/* Problem Statements Table */}
      <AdminPanel className="overflow-hidden rounded-xl">
        <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-foreground">
              {domains.find((d) => d.id === selectedDomain)?.name}
            </span>
            <span className="text-xs text-muted-foreground">
              ({filteredStatements.length} challenges)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              <Plus className="size-3.5" />
              Add Challenge
            </button>
          </div>
        </div>

        {filteredStatements.length > 0 ? (
          <div className="divide-y divide-border overflow-x-auto">
            {filteredStatements.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-3 p-4 transition-colors hover:bg-muted/30 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded bg-primary/10 px-2 py-0.5 font-mono text-xs font-bold text-primary">
                      {item.id}
                    </span>
                    <span className="rounded bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                      {item.difficulty}
                    </span>
                    {item.category && (
                      <span className="rounded bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                        {item.category}
                      </span>
                    )}
                  </div>

                  <h3 className="mt-2 text-sm font-bold text-foreground">{item.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>

                  {item.deliverables && item.deliverables.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {item.deliverables.map((d, i) => (
                        <span
                          key={i}
                          className="rounded-md border border-border bg-card px-2 py-0.5 text-[11px] text-muted-foreground"
                        >
                          • {d}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-1.5 sm:self-start">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(item)}
                    className="inline-flex items-center gap-1 rounded-md border border-border bg-white px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
                  >
                    <Pencil className="size-3" />
                    Edit
                  </button>

                  {deleteConfirmId === item.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="rounded-md bg-destructive px-2.5 py-1.5 text-xs font-semibold text-destructive-foreground hover:opacity-90"
                      >
                        Confirm
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(null)}
                        className="rounded-md border border-border bg-white px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(item.id)}
                      className="inline-flex items-center gap-1 rounded-md border border-border bg-white px-2.5 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="size-3" />
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-muted-foreground">
            No problem statements found in this track. Click "Add Statement" or "Bulk Add" to create challenges.
          </div>
        )}
      </AdminPanel>

      {/* Create / Edit Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-white p-6 shadow-large">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-display text-base font-bold text-foreground">
                {editingId ? `Edit Problem Statement: ${editingId}` : "Add New Problem Statement"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-foreground">Domain Track</label>
                  <select
                    value={formData.domainId}
                    onChange={(e) => setFormData({ ...formData, domainId: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-hidden"
                  >
                    {domains.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground">
                    Custom ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.id || ""}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    placeholder="e.g. UX-01, WEB-01 (auto if blank)"
                    className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-foreground">Sub-Category / Topic</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g. Mobile UX, Full Stack, LLM Agents"
                    className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground">Difficulty Level</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) =>
                      setFormData({ ...formData, difficulty: e.target.value as ProblemDifficulty })
                    }
                    className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-hidden"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground">Problem Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Clear challenge title"
                  className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground">
                  Description & Context *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detail the technical challenge, scope, and objectives..."
                  className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground">
                  Key Deliverables (One per line)
                </label>
                <textarea
                  rows={3}
                  value={formData.deliverablesText}
                  onChange={(e) => setFormData({ ...formData, deliverablesText: e.target.value })}
                  placeholder="Working prototype repo and deployment&#10;Architecture design doc&#10;Live demonstration"
                  className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-hidden font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-border bg-white px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-95"
                >
                  {editingId ? "Save Changes" : "Create Statement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Add Modal Dialog */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-white p-6 shadow-large">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-display text-base font-bold text-foreground">
                Bulk Add Problem Statements
              </h3>
              <button
                type="button"
                onClick={() => setIsBulkModalOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleBulkImport} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-foreground">Target Domain Track</label>
                  <select
                    value={bulkDomain}
                    onChange={(e) => setBulkDomain(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-hidden"
                  >
                    {domains.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground">Default Difficulty</label>
                  <select
                    value={bulkDifficulty}
                    onChange={(e) => setBulkDifficulty(e.target.value as ProblemDifficulty)}
                    className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-hidden"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground">
                  Paste Problem Statements (Separated by empty lines)
                </label>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  First line of each block becomes the Title, subsequent lines become the Description.
                </p>
                <textarea
                  required
                  rows={8}
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  placeholder={`1. Smart Dashboard Design\nCreate an intuitive analytics interface for IoT telemetry.\n\n2. Design System Tokens\nBuild an accessible color and typography system.`}
                  className="mt-2 w-full rounded-lg border border-border bg-white p-3 text-xs text-foreground focus:border-primary focus:outline-hidden font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => setIsBulkModalOpen(false)}
                  className="rounded-lg border border-border bg-white px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-95"
                >
                  Import Problem Statements
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
