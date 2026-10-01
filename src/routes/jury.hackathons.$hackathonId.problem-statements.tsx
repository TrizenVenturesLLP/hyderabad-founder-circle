import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronRight, Eye, FilePlus2, Plus, Send } from "lucide-react";
import { AppSelect } from "@/components/AppSelect";
import { FormField, FormSection, SegmentedControl, formFieldClass } from "@/components/FormLayout";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProblemStatementFacts } from "@/components/hackathon/ProblemStatementFacts";
import { JuryPageHeader } from "@/components/jury/JuryPageHeader";
import {
  JuryBadge,
  JuryButton,
  JuryFilterSelect,
  JuryTable,
  JuryTableMessage,
  JuryToolbar,
} from "@/components/jury/JuryTable";
import {
  createJuryProblemStatement,
  getJuryProblemStatements,
  type JuryProblemStatement,
} from "@/lib/jury-api";

export const Route = createFileRoute("/jury/hackathons/$hackathonId/problem-statements")({
  component: JuryProblemStatementsPage,
});

const domainLabels: Record<string, string> = {
  "ui-ux": "UI/UX",
  "web-dev": "Web Development",
  "vibe-coding": "Vibe Coding",
  "agentic-ai": "Agentic AI",
};

const emptyForm = {
  domainId: "ui-ux",
  title: "",
  industry: "",
  scope: "",
  platform: "",
  difficulty: "Intermediate",
  description: "",
  deliverablesText: "",
};

const difficulties = ["Beginner", "Intermediate", "Advanced"] as const;
const fieldClass = formFieldClass;

function StatusBadge({ status }: { status: JuryProblemStatement["status"] }) {
  if (status === "pending_approval") return <JuryBadge tone="amber">Pending approval</JuryBadge>;
  if (status === "rejected") return <JuryBadge tone="red">Rejected</JuryBadge>;
  return <JuryBadge tone="green">Live</JuryBadge>;
}

function JuryProblemStatementsPage() {
  const { hackathonId } = Route.useParams();
  const [statements, setStatements] = useState<JuryProblemStatement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [domainFilter, setDomainFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewing, setViewing] = useState<JuryProblemStatement | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const load = useCallback(async () => {
    try {
      const data = await getJuryProblemStatements(hackathonId);
      setStatements(data.statements);
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load problem statements.");
    } finally {
      setLoading(false);
    }
  }, [hackathonId]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return statements.filter((statement) => {
      if (domainFilter !== "all" && statement.domainId !== domainFilter) return false;
      if (statusFilter !== "all" && statement.status !== statusFilter) return false;
      if (!query) return true;
      return [
        statement.id,
        statement.title,
        statement.description,
        statement.category,
        statement.industry,
        statement.platform,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [domainFilter, search, statements, statusFilter]);

  const liveCount = statements.filter((statement) => statement.status === "active").length;
  const pendingCount = statements.filter(
    (statement) => statement.status === "pending_approval",
  ).length;
  const deliverableCount = form.deliverablesText.split("\n").filter((line) => line.trim()).length;

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      const result = await createJuryProblemStatement(hackathonId, {
        domainId: form.domainId,
        title: form.title,
        category: form.industry,
        difficulty: form.difficulty,
        industry: form.industry,
        scope: form.scope,
        platform: form.platform,
        description: form.description,
        deliverables: form.deliverablesText
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean),
      });
      setForm(emptyForm);
      setFormOpen(false);
      setNotice(
        `${result.statement.id} was sent to the Super Admin for approval. It will go live once approved.`,
      );
      await load();
    } catch (cause) {
      setFormError(cause instanceof Error ? cause.message : "Could not create problem statement.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section>
      <JuryPageHeader
        title="Problem Statements"
        description="Statements you propose are reviewed by the Super Admin and go live only after approval."
        actions={
          <JuryButton
            variant="primary"
            size="md"
            onClick={() => {
              setFormError("");
              setFormOpen(true);
            }}
          >
            <Plus className="size-4" /> Propose statement
          </JuryButton>
        }
      />

      {notice ? (
        <p
          role="status"
          className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
        >
          {notice}
        </p>
      ) : null}
      {error ? (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </p>
      ) : null}

      <JuryToolbar
        search={search}
        onSearchChange={setSearch}
        placeholder="Search ID, title, or keyword"
        summary={`${liveCount} live${pendingCount ? ` · ${pendingCount} awaiting approval` : ""}`}
      >
        <JuryFilterSelect
          label="Filter by domain"
          value={domainFilter}
          onChange={setDomainFilter}
          options={[
            { value: "all", label: "All domains" },
            ...Object.entries(domainLabels).map(([value, label]) => ({ value, label })),
          ]}
        />
        <JuryFilterSelect
          label="Filter by status"
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: "all", label: "All statuses" },
            { value: "active", label: "Live" },
            { value: "pending_approval", label: "Pending approval" },
            { value: "rejected", label: "Rejected" },
          ]}
        />
      </JuryToolbar>

      <JuryTable
        minWidth={960}
        columns={[
          { label: "ID" },
          { label: "Title" },
          { label: "Industry" },
          { label: "Domain" },
          { label: "Difficulty" },
          { label: "Status" },
          { label: "Added by" },
          { label: "Action", className: "text-right" },
        ]}
      >
        {loading ? (
          <JuryTableMessage colSpan={8}>Loading statements…</JuryTableMessage>
        ) : !filtered.length ? (
          <JuryTableMessage colSpan={8}>
            {statements.length ? "No statements match your search." : "No statements yet."}
          </JuryTableMessage>
        ) : (
          filtered.map((statement) => (
            <tr key={statement.id} className="hover:bg-(--color-background-alt)/60">
              <td className="px-4 py-3 font-mono text-xs font-semibold whitespace-nowrap text-(--brand-accent)">
                {statement.id}
              </td>
              <td className="max-w-[320px] px-4 py-3">
                <p className="truncate font-medium">{statement.title}</p>
                <p className="truncate text-xs text-(--color-text-muted)">
                  {statement.platform || statement.description}
                </p>
              </td>
              <td className="max-w-[160px] truncate px-4 py-3 text-xs whitespace-nowrap text-(--color-text-secondary)">
                {statement.industry || "—"}
              </td>
              <td className="px-4 py-3 text-xs whitespace-nowrap text-(--color-text-secondary)">
                {domainLabels[statement.domainId] || statement.domainId}
              </td>
              <td className="px-4 py-3 text-xs whitespace-nowrap text-(--color-text-secondary)">
                {statement.difficulty}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={statement.status} />
              </td>
              <td className="px-4 py-3 text-xs whitespace-nowrap text-(--color-text-secondary)">
                {statement.createdByMe ? "You" : statement.createdBy?.name || "Administrator"}
              </td>
              <td className="px-4 py-3 text-right">
                <JuryButton onClick={() => setViewing(statement)}>
                  <Eye className="size-3.5" /> View
                </JuryButton>
              </td>
            </tr>
          ))
        )}
      </JuryTable>

      <Dialog open={Boolean(viewing)} onOpenChange={(open) => !open && setViewing(null)}>
        <DialogContent className="max-h-[90dvh] max-w-2xl overflow-y-auto sm:rounded-2xl">
          {viewing ? (
            <>
              <DialogHeader>
                <p className="font-mono text-xs font-semibold text-(--brand-accent)">
                  {viewing.id} · {domainLabels[viewing.domainId] || viewing.domainId}
                </p>
                <DialogTitle className="text-xl">{viewing.title}</DialogTitle>
                <DialogDescription>
                  {viewing.difficulty} · Added by{" "}
                  {viewing.createdByMe ? "you" : viewing.createdBy?.name || "Administrator"} on{" "}
                  {new Date(viewing.createdAt).toLocaleDateString()}
                </DialogDescription>
              </DialogHeader>
              <div>
                <StatusBadge status={viewing.status} />
              </div>
              {viewing.status === "rejected" && viewing.rejectionReason ? (
                <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                  Rejection reason: {viewing.rejectionReason}
                </p>
              ) : null}
              <ProblemStatementFacts
                industry={viewing.industry}
                scope={viewing.scope}
                platform={viewing.platform}
                description={viewing.description}
              />
              {viewing.deliverables?.length ? (
                <div>
                  <h3 className="text-sm font-semibold">Deliverables</h3>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-(--color-text-secondary)">
                    {viewing.deliverables.map((item, index) => (
                      <li key={`${viewing.id}-${index}`}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="flex max-h-[92dvh] max-w-2xl flex-col gap-0 overflow-hidden rounded-2xl p-0">
          <div className="border-b border-(--color-border) px-5 pt-5 pb-4 sm:px-7">
            <DialogHeader className="text-left">
              <div className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-(--brand-accent-soft) text-(--brand-accent)">
                  <FilePlus2 className="size-5" />
                </span>
                <div className="space-y-1">
                  <DialogTitle className="font-(family-name:--font-brand) text-xl">
                    Propose a Problem Statement
                  </DialogTitle>
                  <DialogDescription>
                    Hidden from teams until the Super Admin approves it.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <ol className="mt-4 flex flex-wrap items-center gap-1.5 text-[11px] font-semibold">
              {["You submit", "Pending approval", "Super Admin approves", "Live for teams"].map(
                (step, index, steps) => (
                  <li key={step} className="flex items-center gap-1.5">
                    <span
                      className={
                        index === 0
                          ? "rounded-full bg-(--brand-accent) px-2.5 py-1 text-white"
                          : "rounded-full bg-(--color-background-alt) px-2.5 py-1 text-(--color-text-secondary)"
                      }
                    >
                      {step}
                    </span>
                    {index < steps.length - 1 ? (
                      <ChevronRight className="size-3.5 text-(--color-text-muted)" />
                    ) : null}
                  </li>
                ),
              )}
            </ol>
          </div>

          <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5 sm:px-7">
              <FormSection title="Basics">
                <FormField label="Title" htmlFor="ps-title" counter={`${form.title.length}/200`}>
                  <input
                    id="ps-title"
                    required
                    maxLength={200}
                    value={form.title}
                    onChange={(event) => setForm({ ...form, title: event.target.value })}
                    placeholder="e.g. Smart queue management for clinics"
                    className={fieldClass}
                  />
                </FormField>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Industry" htmlFor="ps-industry">
                    <input
                      id="ps-industry"
                      required
                      maxLength={120}
                      value={form.industry}
                      onChange={(event) => setForm({ ...form, industry: event.target.value })}
                      placeholder="e.g. Healthcare, FinTech"
                      className={fieldClass}
                    />
                  </FormField>
                  <FormField label="Platform / Tech" htmlFor="ps-platform">
                    <input
                      id="ps-platform"
                      required
                      maxLength={200}
                      value={form.platform}
                      onChange={(event) => setForm({ ...form, platform: event.target.value })}
                      placeholder="e.g. Web, React, Node.js"
                      className={fieldClass}
                    />
                  </FormField>
                </div>
              </FormSection>

              <FormSection title="Classification">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Domain" htmlFor="ps-domain">
                    <AppSelect
                      id="ps-domain"
                      value={form.domainId}
                      onValueChange={(domainId) => setForm({ ...form, domainId })}
                      options={Object.entries(domainLabels).map(([value, label]) => ({
                        value,
                        label,
                      }))}
                    />
                  </FormField>
                  <FormField label="Difficulty">
                    <SegmentedControl
                      ariaLabel="Difficulty"
                      value={form.difficulty}
                      onChange={(difficulty) => setForm({ ...form, difficulty })}
                      options={difficulties}
                    />
                  </FormField>
                </div>
              </FormSection>

              <FormSection title="Details">
                <FormField
                  label="Scope"
                  htmlFor="ps-scope"
                  hint="What is in and out of scope for this problem."
                  counter={`${form.scope.length}/3000`}
                >
                  <textarea
                    id="ps-scope"
                    required
                    maxLength={3000}
                    rows={3}
                    value={form.scope}
                    onChange={(event) => setForm({ ...form, scope: event.target.value })}
                    className={`${fieldClass} resize-y`}
                  />
                </FormField>
                <FormField
                  label="Description"
                  htmlFor="ps-description"
                  hint="Explain the problem, who it affects, and any constraints."
                  counter={`${form.description.length}/10000`}
                >
                  <textarea
                    id="ps-description"
                    required
                    maxLength={10000}
                    rows={6}
                    value={form.description}
                    onChange={(event) => setForm({ ...form, description: event.target.value })}
                    className={`${fieldClass} resize-y`}
                  />
                </FormField>
                <FormField
                  label="Deliverables"
                  htmlFor="ps-deliverables"
                  optional
                  hint="One deliverable per line."
                  counter={deliverableCount ? `${deliverableCount} listed` : undefined}
                >
                  <textarea
                    id="ps-deliverables"
                    rows={4}
                    value={form.deliverablesText}
                    onChange={(event) => setForm({ ...form, deliverablesText: event.target.value })}
                    placeholder={"Working prototype\nPitch deck\nDemo video"}
                    className={`${fieldClass} resize-y`}
                  />
                </FormField>
              </FormSection>

              {formError ? (
                <p
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
                >
                  {formError}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-(--color-border) bg-(--color-background-alt) px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
              <p className="text-xs text-(--color-text-muted)">
                You can track its status in the table.
              </p>
              <div className="flex justify-end gap-2">
                <JuryButton size="md" onClick={() => setFormOpen(false)}>
                  Cancel
                </JuryButton>
                <JuryButton type="submit" variant="primary" size="md" disabled={saving}>
                  <Send className="size-4" />
                  {saving ? "Submitting…" : "Submit for approval"}
                </JuryButton>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
