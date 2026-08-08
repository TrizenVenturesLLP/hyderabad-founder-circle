import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BadgeStudio } from "@/components/badge/BadgeStudio";
import {
  getMeetupBySlug,
  getNextMeetup,
  getMeetups,
  type Meetup,
} from "@/lib/events";

type BadgeSearch = {
  event?: string;
  name?: string;
};

export const Route = createFileRoute("/badge")({
  validateSearch: (search: Record<string, unknown>): BadgeSearch => ({
    event: typeof search.event === "string" ? search.event : undefined,
    name: typeof search.name === "string" ? search.name : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Create your badge — Hyderabad Founders Network" },
      {
        name: "description",
        content:
          "Create a shareable attendance badge for Hyderabad Founders Network. Photo stays on your device.",
      },
      {
        property: "og:title",
        content: "Create your badge — Hyderabad Founders Network",
      },
    ],
    links: [{ rel: "canonical", href: "/badge" }],
  }),
  component: BadgePage,
});

function BadgePage() {
  const { event: eventSlug, name } = Route.useSearch();
  const [meetup, setMeetup] = useState<Meetup | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        if (eventSlug) {
          const found = await getMeetupBySlug(eventSlug);
          if (!cancelled) setMeetup(found);
        } else {
          const all = await getMeetups();
          if (!cancelled) setMeetup(getNextMeetup(all) ?? all[0] ?? null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [eventSlug]);

  return (
    <div className="min-h-[70vh] bg-[var(--color-background)]">
      <div className="page-container py-10 md:py-14">
        <nav className="text-[12px] text-[var(--color-text-secondary)]">
          <Link
            to="/events"
            className="transition-colors hover:text-foreground"
          >
            Events
          </Link>
          <span className="mx-1.5 text-[var(--color-border-strong)]" aria-hidden>
            /
          </span>
          <span className="text-foreground/80">Badge studio</span>
        </nav>

        <header className="mt-6 max-w-2xl">
          <p className="text-[12px] font-medium tracking-[0.06em] text-[var(--brand-accent)]">
            Hyderabad Founders Network
          </p>
          <h1 className="mt-2.5 font-display text-[clamp(1.7rem,3vw,2.25rem)] leading-[1.12] tracking-[-0.03em] text-foreground">
            Create your badge
          </h1>
          <p className="mt-3 max-w-xl text-[14.5px] leading-relaxed text-[var(--color-text-secondary)]">
            Add your photo and name, download the badge, and share that
            you&apos;re attending
            {meetup ? ` ${meetup.title}` : ""}.
          </p>
        </header>

        <div className="mt-10 md:mt-12">
          {loading ? (
            <p className="text-sm text-[var(--color-text-muted)]">
              Loading event…
            </p>
          ) : meetup ? (
            <BadgeStudio
              meetup={meetup}
              initialName={name ? decodeURIComponent(name) : ""}
            />
          ) : (
            <p className="text-sm text-[var(--color-text-secondary)]">
              We couldn&apos;t find that event.{" "}
              <Link
                to="/events"
                className="font-medium text-[var(--brand-accent)] underline-offset-4 hover:underline"
              >
                Browse events
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
