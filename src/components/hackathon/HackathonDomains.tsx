import { useState } from "react";
import { Bot, Cpu, Globe, Palette, Terminal } from "lucide-react";
import type { HackathonDomain } from "@/lib/hackathon";

interface HackathonDomainsProps {
  domains: HackathonDomain[];
}

const DOMAIN_ICONS: Record<string, React.ElementType> = {
  "ui-ux": Palette,
  "web-dev": Globe,
  "vibe-coding": Terminal,
  "agentic-ai": Bot,
};

export function HackathonDomains({ domains }: HackathonDomainsProps) {
  const [selectedDomainId, setSelectedDomainId] = useState<string>(domains[0]?.id || "ui-ux");

  const activeDomain = domains.find((d) => d.id === selectedDomainId) || domains[0];

  return (
    <section id="domains" className="py-14 md:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center">
          <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            Official Competition Tracks
          </span>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            4 Competition Domains
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Choose a track below to explore the competition domains and their focus areas.
          </p>
        </div>

        {/* 4 Domain Navigation Tabs */}
        <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {domains.map((domain) => {
            const isSelected = domain.id === selectedDomainId;
            const Icon = DOMAIN_ICONS[domain.id] || Cpu;
            return (
              <button
                key={domain.id}
                type="button"
                onClick={() => {
                  setSelectedDomainId(domain.id);
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
                </div>

                <div className="mt-3">
                  <p className="font-display text-base font-bold text-foreground">
                    {domain.shortName}
                  </p>
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
                <h3 className="text-xl font-bold text-foreground sm:text-2xl">
                  {activeDomain.name}
                </h3>
                <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                  {activeDomain.description}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
