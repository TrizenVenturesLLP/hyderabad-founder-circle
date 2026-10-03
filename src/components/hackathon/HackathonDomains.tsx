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
  const { ref, inView } = useInView<HTMLElement>(scrollRevealOpts);

  return (
    <section ref={ref} id="domains" className="scroll-mt-20 py-9 md:py-11">
      <div className="page-container">
        <div className={cn("reveal-up max-w-2xl", inView && "is-visible")}>
          <p className="text-[11px] font-semibold tracking-[0.08em] text-(--brand-accent) uppercase">
            Official competition tracks
          </p>
          <h2 className="mt-1.5 font-display text-2xl font-bold tracking-[-0.02em] text-foreground sm:text-[1.75rem]">
            {domains.length} competition domains
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-(--color-text-secondary)">
            Every problem statement belongs to one or more of these tracks. Your team picks one
            statement to build.
          </p>
        </div>

        <ul
          className={cn(
            "reveal-up mt-5 grid gap-3 [transition-delay:80ms] sm:grid-cols-2 lg:grid-cols-4",
            inView && "is-visible",
          )}
        >
          {domains.map((domain, index) => {
            const Icon = DOMAIN_ICONS[domain.id] || Cpu;
            return (
              <li
                key={domain.id}
                className={cn(
                  "group relative flex flex-col border border-(--color-border) bg-white p-4 transition-[border-color,box-shadow] duration-200 hover:border-(--brand-accent)/50 hover:shadow-md sm:p-5",
                  "before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:origin-left before:scale-x-0 before:bg-(--brand-accent) before:transition-transform before:duration-300 hover:before:scale-x-100",
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="grid size-10 place-items-center bg-(--brand-accent-soft) text-(--brand-accent) transition-colors duration-200 group-hover:bg-(--brand-accent) group-hover:text-white">
                    <Icon className="size-5" strokeWidth={1.75} />
                  </span>
                  <span className="font-mono text-[11px] font-semibold text-(--color-text-muted)">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                <h3 className="mt-3.5 font-display text-base font-bold text-foreground">
                  {domain.name}
                </h3>
                <p className="mt-1 text-[12.5px] font-medium leading-snug text-(--brand-primary)">
                  {domain.tagline}
                </p>
                <p className="mt-2.5 border-t border-(--color-border) pt-2.5 text-[12.5px] leading-relaxed text-(--color-text-secondary)">
                  {domain.description}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
