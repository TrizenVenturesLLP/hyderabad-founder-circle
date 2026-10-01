import { useState } from "react";
import { Bot, Cpu, Globe, Palette, Terminal } from "lucide-react";
import type { HackathonDomain } from "@/lib/hackathon";
import { useInView } from "@/hooks/use-in-view";
import { cn } from "@/lib/utils";

interface HackathonDomainsProps {
  domains: HackathonDomain[];
}

const scrollRevealOpts = {
  once: true,
  threshold: 0.12,
  rootMargin: "0px 0px -8% 0px",
} as const;

const DOMAIN_ICONS: Record<string, React.ElementType> = {
  "ui-ux": Palette,
  "web-dev": Globe,
  "vibe-coding": Terminal,
  "agentic-ai": Bot,
};

export function HackathonDomains({ domains }: HackathonDomainsProps) {
  const [selectedDomainId, setSelectedDomainId] = useState<string>(domains[0]?.id || "ui-ux");

  const activeDomain = domains.find((d) => d.id === selectedDomainId) || domains[0];
  const ActiveIcon = (activeDomain && DOMAIN_ICONS[activeDomain.id]) || Cpu;
  const activeIndex = Math.max(
    0,
    domains.findIndex((d) => d.id === activeDomain?.id),
  );
  const { ref, inView } = useInView<HTMLElement>(scrollRevealOpts);

  return (
    <section ref={ref} id="domains" className="scroll-mt-20 py-9 md:py-11">
      <div className="page-container">
        <div className={cn("reveal-up max-w-2xl", inView && "is-visible")}>
          <p className="text-[11px] font-semibold tracking-[0.08em] text-(--brand-accent) uppercase">
            Official competition tracks
          </p>
          <h2 className="mt-1.5 font-display text-2xl font-bold tracking-[-0.02em] text-foreground sm:text-[1.75rem]">
            4 competition domains
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-(--color-text-secondary)">
            Choose a track below to explore the competition domains and their focus areas.
          </p>
        </div>

        <div
          className={cn(
            "reveal-up mt-5 grid grid-cols-2 gap-2.5 [transition-delay:80ms] lg:grid-cols-4",
            inView && "is-visible",
          )}
          role="tablist"
        >
          {domains.map((domain, index) => {
            const isSelected = domain.id === activeDomain?.id;
            const Icon = DOMAIN_ICONS[domain.id] || Cpu;
            return (
              <button
                key={domain.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                aria-controls="domain-panel"
                onClick={() => setSelectedDomainId(domain.id)}
                className={cn(
                  "group relative flex flex-col items-start rounded-md border p-3 text-left transition-colors duration-200 sm:p-3.5",
                  isSelected
                    ? "border-(--brand-accent) bg-(--brand-accent-soft)"
                    : "border-(--color-border) bg-white hover:border-(--brand-accent)/40",
                )}
              >
                <div className="flex w-full items-center justify-between">
                  <span
                    className={cn(
                      "grid size-8 place-items-center rounded-md transition-colors",
                      isSelected
                        ? "bg-(--brand-accent) text-white"
                        : "bg-(--color-background-alt) text-(--color-text-secondary) group-hover:bg-(--brand-accent-soft) group-hover:text-(--brand-accent)",
                    )}
                  >
                    <Icon className="size-4" strokeWidth={1.75} />
                  </span>
                  <span className="font-mono text-[10.5px] font-semibold text-(--color-text-muted)">
                    0{index + 1}
                  </span>
                </div>
                <p
                  className={cn(
                    "mt-2.5 font-display text-sm font-bold",
                    isSelected ? "text-(--brand-primary)" : "text-foreground",
                  )}
                >
                  {domain.shortName}
                </p>
                <p className="mt-0.5 line-clamp-2 text-[11.5px] leading-snug text-(--color-text-secondary)">
                  {domain.tagline}
                </p>
              </button>
            );
          })}
        </div>

        {activeDomain && (
          <div className={cn("reveal-up mt-3 [transition-delay:160ms]", inView && "is-visible")}>
            <div
              id="domain-panel"
              role="tabpanel"
              key={activeDomain.id}
              className="hero-reveal flex flex-col gap-3.5 rounded-md border border-(--color-border) bg-white p-4 sm:flex-row sm:items-start sm:p-5"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-md bg-(--brand-primary) text-white">
                <ActiveIcon className="size-5" strokeWidth={1.75} />
              </span>
              <div className="min-w-0">
                <p className="text-[10.5px] font-semibold tracking-[0.08em] text-(--brand-accent) uppercase">
                  Track {activeIndex + 1} of {domains.length}
                </p>
                <h3 className="mt-0.5 font-display text-base font-bold text-foreground sm:text-lg">
                  {activeDomain.name}
                </h3>
                <p className="mt-1 max-w-3xl text-sm leading-relaxed text-(--color-text-secondary)">
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
