import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Search,
  Filter,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Building2,
  Layers,
  ArrowRight,
  Copy,
  Check,
  RotateCcw,
  Boxes,
  Compass,
  Cpu,
  ShieldAlert,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { fetchProblemStatements, type ProblemStatement } from "@/lib/api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/problem-statements/")({
  head: () => ({
    meta: [
      { title: "Problem Statements | Trizen Community" },
      {
        name: "description",
        content:
          "Explore 70+ hackathon and innovation problem statements across Agentic AI, FinTech, E-commerce, Cloud, Security, and Enterprise Tech.",
      },
    ],
  }),
  component: ProblemStatementsCatalogPage,
});

function ProblemStatementsCatalogPage() {
  const [statements, setStatements] = useState<ProblemStatement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDomain, setSelectedDomain] = useState<string>("all");
  const [selectedOrg, setSelectedOrg] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");

  // Expandable cards state
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchProblemStatements();
        if (!cancelled) {
          setStatements(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load problem statements.");
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
  }, []);

  // Compute unique domains and organizations for filter dropdowns
  const { domains, organizations, difficulties } = useMemo(() => {
    const domainSet = new Set<string>();
    const orgSet = new Set<string>();
    const diffSet = new Set<string>();

    statements.forEach((item) => {
      if (item.targetDomain) {
        item.targetDomain.split(",").forEach((d) => {
          const trimmed = d.trim();
          if (trimmed) domainSet.add(trimmed);
        });
      }
      if (item.organization?.trim()) orgSet.add(item.organization.trim());
      if (item.difficulty?.trim()) diffSet.add(item.difficulty.trim());
    });

    return {
      domains: Array.from(domainSet).sort(),
      organizations: Array.from(orgSet).sort(),
      difficulties: Array.from(diffSet).sort(),
    };
  }, [statements]);

  // Filtered problem statements
  const filteredStatements = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return statements.filter((item) => {
      // Domain filter
      if (selectedDomain !== "all") {
        const itemDomains = (item.targetDomain || "").split(",").map((d) => d.trim().toLowerCase());
        if (!itemDomains.includes(selectedDomain.toLowerCase())) return false;
      }

      // Org filter
      if (selectedOrg !== "all") {
        if ((item.organization || "").toLowerCase() !== selectedOrg.toLowerCase()) return false;
      }

      // Difficulty filter
      if (selectedDifficulty !== "all") {
        if ((item.difficulty || "").toLowerCase() !== selectedDifficulty.toLowerCase()) return false;
      }

      // Search query filter
      if (q) {
        const inTitle = item.title?.toLowerCase().includes(q);
        const inDesc = item.description?.toLowerCase().includes(q);
        const inSlug = item.slug?.toLowerCase().includes(q);
        const inDomain = item.targetDomain?.toLowerCase().includes(q);
        const inOrg = item.organization?.toLowerCase().includes(q);
        const inTech = item.platformTech?.toLowerCase().includes(q);
        const inIndustry = item.industry?.toLowerCase().includes(q);

        if (!inTitle && !inDesc && !inSlug && !inDomain && !inOrg && !inTech && !inIndustry) {
          return false;
        }
      }

      return true;
    });
  }, [statements, searchQuery, selectedDomain, selectedOrg, selectedDifficulty]);

  const toggleExpand = (id: string) => {
    setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyShareLink = (slug: string, id: string) => {
    const url = `${window.location.origin}/problem-statements/${slug}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedDomain("all");
    setSelectedOrg("all");
    setSelectedDifficulty("all");
  };

  const hasActiveFilters =
    searchQuery || selectedDomain !== "all" || selectedOrg !== "all" || selectedDifficulty !== "all";

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-background-alt)] text-foreground">
      <SiteHeader />

      {/* Hero Header */}
      <section className="relative overflow-hidden border-b border-[var(--color-border)] bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 py-16 text-white md:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(99,102,241,0.15),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(168,85,247,0.1),transparent_60%)]" />
        
        <div className="page-container relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-indigo-300 backdrop-blur-md">
              <Sparkles className="size-3.5" />
              <span>INNOVATION CHALLENGES & HACKATHONS</span>
            </div>

            <h1 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
              Problem Statements
            </h1>

            <p className="mt-4 text-base text-slate-300 sm:text-lg">
              Explore all real-world challenge statements designed for developers, builders, and innovative teams.
              Solve critical industry problems and showcase your engineering capability.
            </p>

            {/* Stat Pills */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md">
                <Boxes className="size-4 text-indigo-400" />
                <span className="text-sm font-semibold text-white">{statements.length || 74} Statements</span>
              </div>
              <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md">
                <Compass className="size-4 text-purple-400" />
                <span className="text-sm font-semibold text-white">{domains.length} Domains</span>
              </div>
              {organizations.length > 0 && (
                <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md">
                  <Building2 className="size-4 text-amber-400" />
                  <span className="text-sm font-semibold text-white">{organizations.length} Organizations</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="page-container flex-1 py-10">
        {/* Filters and Search Bar Container */}
        <div className="mb-8 space-y-4 rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, domain, org, tech stack, or deliverables..."
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background-alt)] py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-[var(--brand-primary)] focus:bg-white focus:ring-2 focus:ring-[var(--brand-primary)]/20"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[var(--color-text-muted)] hover:text-foreground"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Filter Dropdowns */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:w-auto">
              {/* Domain Filter */}
              <div className="relative">
                <select
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-[var(--color-border)] bg-[var(--color-background-alt)] py-2.5 pl-3.5 pr-8 text-xs font-medium text-foreground outline-none transition-all focus:border-[var(--brand-primary)]"
                >
                  <option value="all">All Domains ({domains.length})</option>
                  {domains.map((domain) => (
                    <option key={domain} value={domain}>
                      {domain}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
              </div>

              {/* Organization Filter */}
              <div className="relative">
                <select
                  value={selectedOrg}
                  onChange={(e) => setSelectedOrg(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-[var(--color-border)] bg-[var(--color-background-alt)] py-2.5 pl-3.5 pr-8 text-xs font-medium text-foreground outline-none transition-all focus:border-[var(--brand-primary)]"
                >
                  <option value="all">All Organizations ({organizations.length})</option>
                  {organizations.map((org) => (
                    <option key={org} value={org}>
                      {org}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
              </div>

              {/* Difficulty Filter */}
              <div className="relative">
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-[var(--color-border)] bg-[var(--color-background-alt)] py-2.5 pl-3.5 pr-8 text-xs font-medium text-foreground outline-none transition-all focus:border-[var(--brand-primary)]"
                >
                  <option value="all">All Difficulties</option>
                  {difficulties.map((diff) => (
                    <option key={diff} value={diff}>
                      {diff}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
              </div>
            </div>
          </div>

          {/* Filter Bar Active Summary & Reset */}
          {hasActiveFilters && (
            <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-3 text-xs">
              <span className="text-[var(--color-text-muted)]">
                Showing <strong className="text-foreground">{filteredStatements.length}</strong> of{" "}
                {statements.length} problem statements
              </span>
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1.5 font-semibold text-[var(--brand-primary)] hover:underline"
              >
                <RotateCcw className="size-3.5" />
                Reset all filters
              </button>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-[320px] animate-pulse rounded-2xl border border-[var(--color-border)] bg-white p-6"
              >
                <div className="h-5 w-24 rounded bg-slate-200" />
                <div className="mt-4 h-6 w-3/4 rounded bg-slate-200" />
                <div className="mt-2 h-4 w-full rounded bg-slate-100" />
                <div className="mt-2 h-4 w-2/3 rounded bg-slate-100" />
                <div className="mt-6 h-12 w-full rounded bg-slate-100" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="mx-auto my-12 max-w-lg rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <ShieldAlert className="mx-auto size-10 text-red-500" />
            <h3 className="mt-3 text-base font-bold text-red-900">Failed to load statements</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty Search Results */}
        {!loading && !error && filteredStatements.length === 0 && (
          <div className="my-16 rounded-3xl border border-[var(--color-border)] bg-white py-16 text-center shadow-sm">
            <Filter className="mx-auto size-12 text-[var(--color-text-muted)] opacity-50" />
            <h3 className="mt-4 text-lg font-bold text-foreground">No matching problem statements found</h3>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Try adjusting your search keywords or clearing active filters.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-5 rounded-xl bg-[var(--brand-primary)] px-5 py-2.5 text-xs font-semibold text-white shadow hover:opacity-90"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Problem Statements Grid */}
        {!loading && !error && filteredStatements.length > 0 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredStatements.map((item) => {
              const isExpanded = !!expandedCards[item._id];
              const isCopied = copiedId === item._id;
              const hasDeliverables = item.keyDeliverables && item.keyDeliverables.length > 0;

              return (
                <div
                  key={item._id}
                  className="group relative flex flex-col justify-between rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-indigo-200"
                >
                  <div>
                    {/* Top Badges */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="inline-flex items-center rounded-lg bg-indigo-50 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-indigo-700 border border-indigo-100">
                        {item.slug.toUpperCase()}
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                          item.difficulty?.toLowerCase() === "advanced"
                            ? "bg-purple-100 text-purple-700 border border-purple-200"
                            : item.difficulty?.toLowerCase() === "intermediate"
                              ? "bg-blue-100 text-blue-700 border border-blue-200"
                              : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                        )}
                      >
                        {item.difficulty || "Advanced"}
                      </span>
                    </div>

                    {/* Title */}
                    <h2 className="mt-3.5 font-display text-lg font-bold leading-snug text-foreground transition-colors group-hover:text-[var(--brand-primary)]">
                      <Link to="/problem-statements/$slug" params={{ slug: item.slug }} className="hover:underline">
                        {item.title}
                      </Link>
                    </h2>

                    {/* Org / Department Info if present */}
                    {(item.organization || item.department) && (
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] font-medium">
                        <Building2 className="size-3.5 shrink-0 text-slate-400" />
                        <span className="truncate">
                          {item.organization || "Custom"}
                          {item.department ? ` · ${item.department}` : ""}
                        </span>
                      </div>
                    )}

                    {/* Target Domain Tag */}
                    {item.targetDomain && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {item.targetDomain.split(",").map((d) => (
                          <span
                            key={d}
                            className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700"
                          >
                            <Layers className="size-3 text-slate-500" />
                            {d.trim()}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Description preview */}
                    <p className="mt-3.5 line-clamp-3 text-xs leading-relaxed text-[var(--color-text-secondary)]">
                      {item.description}
                    </p>

                    {/* Key Deliverables Accordion */}
                    {hasDeliverables && (
                      <div className="mt-4 border-t border-slate-100 pt-3">
                        <button
                          type="button"
                          onClick={() => toggleExpand(item._id)}
                          className="flex w-full items-center justify-between py-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                        >
                          <span className="inline-flex items-center gap-1.5">
                            <CheckCircle2 className="size-3.5" />
                            Key Deliverables ({item.keyDeliverables?.length})
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="size-3.5" />
                          ) : (
                            <ChevronDown className="size-3.5" />
                          )}
                        </button>

                        {isExpanded && (
                          <ul className="mt-2.5 space-y-1.5 text-[11.5px] text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                            {item.keyDeliverables?.map((deliv, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="mt-1 flex size-1.5 shrink-0 rounded-full bg-indigo-500" />
                                <span>{deliv}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Action Footer */}
                  <div className="mt-5 flex items-center justify-between border-t border-[var(--color-border)] pt-4">
                    <button
                      type="button"
                      onClick={() => copyShareLink(item.slug, item._id)}
                      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-[var(--color-text-muted)] transition-colors hover:bg-slate-100 hover:text-foreground"
                      title="Copy link to this problem statement"
                    >
                      {isCopied ? (
                        <>
                          <Check className="size-3.5 text-emerald-600" />
                          <span className="text-emerald-600">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="size-3.5" />
                          <span>Share</span>
                        </>
                      )}
                    </button>

                    <Link
                      to="/problem-statements/$slug"
                      params={{ slug: item.slug }}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--brand-primary)] transition-all hover:gap-2"
                    >
                      <span>View Details</span>
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
