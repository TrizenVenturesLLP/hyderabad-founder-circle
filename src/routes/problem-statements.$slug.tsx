import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Copy,
  Check,
  Layers,
  Sparkles,
  ShieldAlert,
  Share2,
  ChevronRight,
  Boxes,
  Cpu,
  Target,
} from "lucide-react";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { fetchProblemStatementBySlug, type ProblemStatement } from "@/lib/api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/problem-statements/$slug")({
  component: ProblemStatementDetailPage,
});

function ProblemStatementDetailPage() {
  const { slug } = Route.useParams();
  const [statement, setStatement] = useState<ProblemStatement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const item = await fetchProblemStatementBySlug(slug);
        if (!cancelled) {
          setStatement(item);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Problem statement not found.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    void loadData();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const copyUrl = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-background-alt)] text-foreground">
      <SiteHeader />

      <main className="page-container flex-1 py-8 md:py-12">
        {/* Breadcrumb Navigation */}
        <div className="mb-6 flex flex-wrap items-center gap-2 text-xs font-medium text-[var(--color-text-muted)]">
          <Link to="/problem-statements" className="hover:text-[var(--brand-primary)]">
            Problem Statements
          </Link>
          <ChevronRight className="size-3.5 opacity-60" />
          <span className="truncate text-foreground font-semibold">
            {statement ? statement.slug.toUpperCase() : slug}
          </span>
        </div>

        {/* Back Link */}
        <div className="mb-6">
          <Link
            to="/problem-statements"
            className="inline-flex items-center gap-2 text-xs font-bold text-[var(--brand-primary)] hover:underline"
          >
            <ArrowLeft className="size-4" />
            Back to all problem statements
          </Link>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="mx-auto max-w-4xl space-y-6 rounded-3xl border border-[var(--color-border)] bg-white p-8">
            <div className="h-6 w-32 animate-pulse rounded bg-slate-200" />
            <div className="h-10 w-3/4 animate-pulse rounded bg-slate-200" />
            <div className="h-24 w-full animate-pulse rounded bg-slate-100" />
            <div className="h-40 w-full animate-pulse rounded bg-slate-100" />
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="mx-auto my-12 max-w-lg rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <ShieldAlert className="mx-auto size-12 text-red-500" />
            <h2 className="mt-3 text-lg font-bold text-red-900">Problem Statement Not Found</h2>
            <p className="mt-1 text-sm text-red-700">{error}</p>
            <Link
              to="/problem-statements"
              className="mt-5 inline-block rounded-xl bg-red-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-red-700"
            >
              Return to problem statements list
            </Link>
          </div>
        )}

        {/* Main Details View */}
        {!loading && !error && statement && (
          <article className="mx-auto max-w-4xl rounded-3xl border border-[var(--color-border)] bg-white p-6 shadow-sm md:p-10">
            {/* Header badges */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] pb-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-xl bg-indigo-50 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-indigo-700 border border-indigo-100">
                  {statement.slug.toUpperCase()}
                </span>
                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-semibold",
                    statement.difficulty?.toLowerCase() === "advanced"
                      ? "bg-purple-100 text-purple-700 border border-purple-200"
                      : statement.difficulty?.toLowerCase() === "intermediate"
                        ? "bg-blue-100 text-blue-700 border border-blue-200"
                        : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                  )}
                >
                  Difficulty: {statement.difficulty || "Advanced"}
                </span>
              </div>

              <button
                type="button"
                onClick={copyUrl}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--color-border)] bg-slate-50 px-3.5 py-1.5 text-xs font-semibold text-[var(--color-text-secondary)] transition-colors hover:bg-slate-100 hover:text-foreground"
              >
                {copied ? (
                  <>
                    <Check className="size-4 text-emerald-600" />
                    <span className="text-emerald-600">Link Copied</span>
                  </>
                ) : (
                  <>
                    <Share2 className="size-4" />
                    <span>Share Challenge</span>
                  </>
                )}
              </button>
            </div>

            {/* Title */}
            <h1 className="mt-6 font-display text-2xl font-extrabold text-foreground sm:text-3xl md:text-4xl">
              {statement.title}
            </h1>

            {/* Key Metadata Cards */}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {statement.organization && (
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-xs font-medium text-[var(--color-text-muted)]">
                    <Building2 className="size-4 text-indigo-500" />
                    <span>Organization</span>
                  </div>
                  <p className="mt-1 text-sm font-bold text-foreground">
                    {statement.organization}
                    {statement.department ? ` (${statement.department})` : ""}
                  </p>
                </div>
              )}

              {statement.targetDomain && (
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-xs font-medium text-[var(--color-text-muted)]">
                    <Layers className="size-4 text-purple-500" />
                    <span>Target Domain</span>
                  </div>
                  <p className="mt-1 text-sm font-bold text-foreground">{statement.targetDomain}</p>
                </div>
              )}

              {statement.industry && (
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-xs font-medium text-[var(--color-text-muted)]">
                    <Target className="size-4 text-amber-500" />
                    <span>Industry</span>
                  </div>
                  <p className="mt-1 text-sm font-bold text-foreground">{statement.industry}</p>
                </div>
              )}

              {statement.scope && (
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-xs font-medium text-[var(--color-text-muted)]">
                    <Boxes className="size-4 text-emerald-500" />
                    <span>Scope</span>
                  </div>
                  <p className="mt-1 text-sm font-bold text-foreground">{statement.scope}</p>
                </div>
              )}

              {statement.platformTech && (
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:col-span-2">
                  <div className="flex items-center gap-2 text-xs font-medium text-[var(--color-text-muted)]">
                    <Cpu className="size-4 text-blue-500" />
                    <span>Platform / Tech Stack</span>
                  </div>
                  <p className="mt-1 text-sm font-bold text-foreground">{statement.platformTech}</p>
                </div>
              )}
            </div>

            {/* Problem Statement Description */}
            <div className="mt-8 border-t border-[var(--color-border)] pt-8">
              <h2 className="text-lg font-bold text-foreground">Problem Description</h2>
              <div className="mt-4 whitespace-pre-line text-sm leading-relaxed text-slate-700">
                {statement.description}
              </div>
            </div>

            {/* Key Deliverables */}
            {statement.keyDeliverables && statement.keyDeliverables.length > 0 && (
              <div className="mt-8 border-t border-[var(--color-border)] pt-8">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-5 text-emerald-600" />
                  <h2 className="text-lg font-bold text-foreground">
                    Key Deliverables ({statement.keyDeliverables.length})
                  </h2>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {statement.keyDeliverables.map((deliv, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3.5 transition-colors hover:bg-slate-100/80"
                    >
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-[11px] font-bold text-white">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-semibold leading-snug text-slate-800">{deliv}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--color-border)] pt-6">
              <Link
                to="/problem-statements"
                className="inline-flex items-center gap-2 text-xs font-bold text-[var(--brand-primary)] hover:underline"
              >
                <ArrowLeft className="size-4" />
                Browse more problem statements
              </Link>

              <button
                type="button"
                onClick={copyUrl}
                className="btn-primary gap-2 !rounded-xl !px-5 !py-2.5 !text-xs"
              >
                <Share2 className="size-4" />
                <span>Share this problem statement</span>
              </button>
            </div>
          </article>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
