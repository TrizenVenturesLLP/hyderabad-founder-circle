import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { EventCard } from "@/components/EventCard";
import { buildCommunityCards } from "@/lib/communities";
import { getEventOrganizations, getMeetups, isMeetupCompleted } from "@/lib/events";

export const Route = createFileRoute("/communities/$slug")({
  loader: async ({ params }) => {
    const [meetups, organizations] = await Promise.all([getMeetups(), getEventOrganizations()]);
    const communities = buildCommunityCards(organizations, meetups);
    const community = communities.find((c) => c.slug === params.slug);
    if (!community) throw notFound();

    const events = meetups.filter((m) => m.organization?.slug === params.slug);
    const upcoming = events.filter((m) => !isMeetupCompleted(m));
    const past = events.filter((m) => isMeetupCompleted(m));

    return { community, upcoming, past };
  },
  head: ({ loaderData }) => {
    const siteUrl = "https://community.trizenventures.com";
    const name = loaderData?.community?.name || "Community";
    const title = `${name} — Trizen Community`;
    const desc = `Events hosted by ${name} on Trizen Community.`;
    const path = loaderData?.community
      ? `/communities/${loaderData.community.slug}`
      : "/communities";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: `${siteUrl}${path}` },
      ],
      links: [{ rel: "canonical", href: `${siteUrl}${path}` }],
    };
  },
  component: CommunityDetailPage,
});

function CommunityDetailPage() {
  const { community, upcoming, past } = Route.useLoaderData();

  return (
    <div className="bg-[var(--color-background)]">
      <header className="border-b border-[var(--color-border)]">
        <div className="page-container py-8 md:py-10">
          <Link
            to="/communities"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--color-text-secondary)] transition-colors hover:text-[var(--brand-accent)]"
          >
            <ArrowLeft className="size-3.5" strokeWidth={1.75} />
            All communities
          </Link>
          <h1 className="mt-4 font-display text-[clamp(1.85rem,3.5vw,2.5rem)] font-semibold leading-[1.1] tracking-[-0.03em] text-foreground">
            {community.name}
          </h1>
          <p className="mt-2 text-[14.5px] text-[var(--color-text-secondary)]">
            {community.eventCount === 0
              ? "No events listed yet"
              : community.upcomingCount > 0
                ? `${community.upcomingCount} upcoming · ${community.eventCount} total`
                : `${community.eventCount} past event${community.eventCount === 1 ? "" : "s"}`}
          </p>
        </div>
      </header>

      <div className="page-container section-space space-y-10">
        <section>
          <h2 className="font-display text-[1.2rem] tracking-tight text-foreground">Upcoming</h2>
          {upcoming.length > 0 ? (
            <ul className="mt-5 grid list-none gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {upcoming.map((meetup) => (
                <li key={meetup.slug}>
                  <EventCard meetup={meetup} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-[14px] text-[var(--color-text-secondary)]">
              No upcoming events right now.
            </p>
          )}
        </section>

        {past.length > 0 ? (
          <section>
            <h2 className="font-display text-[1.2rem] tracking-tight text-foreground">
              Past events
            </h2>
            <ul className="mt-5 grid list-none gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {past.map((meetup) => (
                <li key={meetup.slug}>
                  <EventCard meetup={meetup} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </div>
  );
}
