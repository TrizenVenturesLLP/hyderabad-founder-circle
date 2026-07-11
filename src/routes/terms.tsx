import { createFileRoute } from "@tanstack/react-router";
import { links } from "@/lib/links";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Use — Hyderabad Founders Network" },
      {
        name: "description",
        content:
          "The simple ground rules for using this website and attending our community meetups.",
      },
      { property: "og:title", content: "Terms of Use — Hyderabad Founders Network" },
      { property: "og:url", content: "/terms" },
    ],
    links: [{ rel: "canonical", href: "/terms" }],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16 md:py-24">
      <p className="text-xs uppercase tracking-wider text-primary">Terms</p>
      <h1 className="mt-2 font-display text-4xl text-foreground md:text-5xl">
        Terms of Use
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Last updated: 11 July 2026
      </p>

      <div className="prose mt-8 max-w-none text-muted-foreground">
        <h2 className="mt-8 font-display text-2xl text-foreground">Using this site</h2>
        <p className="mt-3">
          This website is a community resource for the Hyderabad Founders
          Network. Content is provided as-is, with no warranty. We may update
          event details, member listings and copy at any time.
        </p>

        <h2 className="mt-8 font-display text-2xl text-foreground">Community conduct</h2>
        <p className="mt-3">
          By attending a meetup or joining the community group you agree to our
          community guidelines: respect, no hard-selling, confidentiality and
          inclusion. Organisers may remove anyone who breaks them.
        </p>

        <h2 className="mt-8 font-display text-2xl text-foreground">Sponsors</h2>
        <p className="mt-3">
          The community is supported by {links.sponsor.name} and partner spaces.
          Sponsors do not control the agenda or the room.
        </p>

        <h2 className="mt-8 font-display text-2xl text-foreground">Contact</h2>
        <p className="mt-3">
          Questions?{" "}
          <a
            className="text-foreground underline-offset-4 hover:underline"
            href={`mailto:${links.email}`}
          >
            {links.email}
          </a>
        </p>
      </div>
    </div>
  );
}
