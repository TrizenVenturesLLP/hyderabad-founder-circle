import { useState, useMemo } from "react";
import {
  Bot,
  Code2,
  Cpu,
  Filter,
  Globe,
  Layout,
  Palette,
  Search,
  SlidersHorizontal,
  Sparkles,
  Terminal,
  X,
} from "lucide-react";
import { ProblemStatementCard } from "./ProblemStatementCard";
import type { HackathonDomain, ProblemStatement } from "@/lib/hackathon";

interface HackathonDomainsProps {
  domains: HackathonDomain[];
  problemStatements: ProblemStatement[];
}

const DOMAIN_ICONS: Record<string, React.ElementType> = {
  "ui-ux": Palette,
  "web-dev": Globe,
  "vibe-coding": Terminal,
  "agentic-ai": Bot,
};

export function HackathonDomains({ domains, problemStatements }: HackathonDomainsProps) {
  const [selectedDomainId, setSelectedDomainId] = useState<string>(domains[0]?.id || "ui-ux");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");

  const activeDomain = domains.find((d) => d.id === selectedDomainId) || domains[0];

  const domainStatements = useMemo(() => {
    return problemStatements.filter((p) => p.domainId === selectedDomainId);
  }, [problemStatements, selectedDomainId]);

  const filteredStatements = useMemo(() => {
    return domainStatements.filter((item) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesDifficulty =
        selectedDifficulty === "all" || item.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();

      return matchesSearch && matchesDifficulty;
    });
  }, [domainStatements, searchQuery, selectedDifficulty]);

  return (
    <section id="problem-statements" className="py-14 md:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center">
          <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            Official Competition Tracks
          </span>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            4 Challenge Domains & Problem Statements
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Choose a track below to review official problem statements and technical challenges.
          </p>
        </div>

        {/* 4 Domain Navigation Tabs */}
        <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {domains.map((domain) => {
            const isSelected = domain.id === selectedDomainId;
            const Icon = DOMAIN_ICONS[domain.id] || Cpu;
            const count = problemStatements.filter((p) => p.domainId === domain.id).length;

            return (
              <button
                key={domain.id}
                type="button"
                onClick={() => {
                  setSelectedDomainId(domain.id);
                  setSearchQuery("");
                }}
                className={`flex flex-col items-start justify-between rounded-2xl border p-4 text-left transition-all duration-200 ${
                  isSelected
                    ? "border-primary bg-primary/5 shadow-card ring-1 ring-primary"
                    : "border-border bg-card hover:border-border-strong hover:bg-muted/50"
                }`}
              >
                <div className="flex w-full items-center justify-between gap-2">
                  <div
                    className={`flex size-9 items-center justify-center rounded-lg ${
                      isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                    }`}
                  >
                    <Icon className="size-5" />
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {count} Challenges
                  </span>
                </div>

                <div className="mt-3">
                  <p className="font-display text-base font-bold text-foreground">{domain.shortName}</p>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {domain.tagline}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Domain Overview Banner */}
        {activeDomain && (
          <div className="mt-8 rounded-2xl border border-primary/20 bg-primary/5 p-6 backdrop-blur-xs">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                  Active Domain Track
                </span>
                <h3 className="text-xl font-bold text-foreground sm:text-2xl">{activeDomain.name}</h3>
                <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                  {activeDomain.description}
                </p>
              </div>
              <div className="shrink-0 self-start md:self-auto">
                <span className="inline-flex items-center rounded-xl bg-card border border-border px-3.5 py-2 text-xs font-semibold text-foreground shadow-xs">
                  {domainStatements.length} Challenges in Track
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Filter and Search Bar */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search in ${activeDomain?.shortName || "track"} by title, ID, keyword...`}
              className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-9 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Difficulty Dropdown */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="size-4 text-muted-foreground" />
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm font-medium text-foreground focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary"
            >
              <option value="all">All Difficulties</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>

        {/* Results Counter */}
        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Showing {filteredStatements.length} of {domainStatements.length} statements
          </span>
          {(searchQuery || selectedDifficulty !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedDifficulty("all");
              }}
              className="font-medium text-primary hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Problem Statements Grid */}
        {filteredStatements.length > 0 ? (
          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
            {filteredStatements.map((item) => (
              <ProblemStatementCard
                key={item.id}
                statement={item}
                domainName={activeDomain?.name || item.domainId}
              />
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-2xl border border-dashed border-border bg-muted/30 p-10 text-center">
            <Filter className="mx-auto size-8 text-muted-foreground" />
            <h4 className="mt-3 text-base font-bold text-foreground">
              {domainStatements.length === 0
                ? "Problem statements will be released soon"
                : "No matching problem statements"}
            </h4>
            <p className="mt-1 text-sm text-muted-foreground">
              {domainStatements.length === 0
                ? "Organizers are reviewing domain challenges. Add problem statements via Admin Portal."
                : "Try adjusting your search terms or difficulty filter."}
            </p>
            {domainStatements.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedDifficulty("all");
                }}
                className="mt-4 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
              >
                Reset Filters
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
