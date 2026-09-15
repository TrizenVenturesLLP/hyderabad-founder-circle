import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useInView } from "@/hooks/use-in-view";
import { buildCommunityCards } from "@/lib/communities";
import { getEventOrganizations, getMeetups } from "@/lib/events";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/communities/")({
  loader: async () => {
    const [meetups, organizations] = await Promise.all([getMeetups(), getEventOrganizations()]);
    return {
      communities: buildCommunityCards(organizations, meetups),
    };
  },
  head: () => {
    const siteUrl = "https://community.trizenventures.com";
    const title = "Communities — Trizen Community";
    const desc =
      "Browse communities and organizers hosting events on Trizen Community in Hyderabad.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: `${siteUrl}/communities` },
      ],
      links: [{ rel: "canonical", href: `${siteUrl}/communities` }],
    };
  },
  component: CommunitiesIndexPage,
});

function CommunitiesIndexPage() {
  const { communities } = Route.useLoaderData();
  const { ref, inView } = useInView<HTMLElement>({ once: true, threshold: 0.12 });

  return (
    <div className="bg-[var(--color-background)]">
      <header className="border-b border-[var(--color-border)]">
        <div className="page-container py-10 md:py-12">
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--brand-accent)]">
            Communities
          </p>
          <h1 className="mt-2.5 max-w-[16ch] font-display text-[clamp(1.85rem,3.5vw,2.5rem)] font-semibold leading-[1.1] tracking-[-0.03em] text-foreground">
            Communities &amp; organizers
          </h1>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-[var(--color-text-secondary)]">
            Discover who hosts on Trizen Community and browse their events.
          </p>
        </div>
      </header>

      <section ref={ref} className="section-space">
        <div className="page-container">
          {communities.length === 0 ? (
            <p className="text-[14px] text-[var(--color-text-secondary)]">
              No communities listed yet.
            </p>
          ) : (
            <ul
              className={cn(
                "stagger-in grid list-none gap-4 sm:grid-cols-2 lg:grid-cols-3",
                inView && "is-visible",
              )}
            >
              {communities.map((org) => (
                <li key={org.slug}>
                  <Link
                    to="/communities/$slug"
                    params={{ slug: org.slug }}
                    className="group flex h-full flex-col overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)] transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-1 hover:border-[var(--color-border-strong)] hover:shadow-[0_12px_28px_-18px_rgba(15,23,42,0.22)]"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-[var(--color-background-alt)]">
                      <img
                        src={org.cover}
                        alt=""
                        className={cn(
                          "size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]",
                          org.coverObject,
                        )}
                        loading="lazy"
                        aria-hidden
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-4 md:p-5">
                      <h2 className="font-display text-[1.1rem] tracking-tight text-foreground group-hover:text-[var(--brand-accent)]">
                        {org.name}
                      </h2>
                      <p className="mt-1.5 text-[13px] text-[var(--color-text-secondary)]">
                        {org.eventCount === 0
                          ? "No events listed yet"
                          : org.upcomingCount > 0
                            ? `${org.upcomingCount} upcoming · ${org.eventCount} total`
                            : `${org.eventCount} event${org.eventCount === 1 ? "" : "s"}`}
                      </p>
                      <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--brand-accent)]">
                        View community
                        <ArrowRight
                          className="size-3.5 transition-transform group-hover:translate-x-0.5"
                          strokeWidth={1.75}
                        />
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
