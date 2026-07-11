import { createFileRoute } from "@tanstack/react-router";
import { links } from "@/lib/links";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Hyderabad Founders Network" },
      {
        name: "description",
        content:
          "How the Hyderabad Founders Network community handles the little data we collect.",
      },
      { property: "og:title", content: "Privacy Policy — Hyderabad Founders Network" },
      { property: "og:url", content: "/privacy" },
    ],
    links: [{ rel: "canonical", href: "/privacy" }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16 md:py-24">
      <p className="text-xs uppercase tracking-wider text-primary">Privacy</p>
      <h1 className="mt-2 font-display text-4xl text-foreground md:text-5xl">
        Privacy Policy
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Last updated: 11 July 2026
      </p>

      <div className="prose mt-8 max-w-none text-muted-foreground">
        <p>
          The Hyderabad Founders Network ("we", "the community") is a peer
          community that organises monthly founder meetups in Hyderabad. This
          page describes what we collect and how we use it.
        </p>

        <h2 className="mt-8 font-display text-2xl text-foreground">What we collect</h2>
        <ul className="mt-3 space-y-2">
          <li>
            <strong className="text-foreground">Contact form:</strong> your name,
            email and message. We use it only to reply to you.
          </li>
          <li>
            <strong className="text-foreground">RSVPs:</strong> handled by our
            external event tool (Luma / Google Forms). Their privacy policy
            applies to those submissions.
          </li>
          <li>
            <strong className="text-foreground">Community group:</strong> if you
            join our WhatsApp / Telegram group, that platform's terms apply.
          </li>
        </ul>

        <h2 className="mt-8 font-display text-2xl text-foreground">What we don't do</h2>
        <ul className="mt-3 space-y-2">
          <li>We don't sell your data.</li>
          <li>We don't share your email with sponsors or partners.</li>
          <li>We don't run advertising or third-party tracking pixels.</li>
        </ul>

        <h2 className="mt-8 font-display text-2xl text-foreground">Analytics</h2>
        <p className="mt-3">
          We may use privacy-friendly, cookie-free analytics to count anonymous
          page views. No personal profiles are built.
        </p>

        <h2 className="mt-8 font-display text-2xl text-foreground">Questions or requests</h2>
        <p className="mt-3">
          To ask a question, request a copy of your data, or ask us to delete
          your details, email{" "}
          <a
            className="text-foreground underline-offset-4 hover:underline"
            href={`mailto:${links.email}`}
          >
            {links.email}
          </a>
          .
        </p>
      </div>
    </div>
  );
}
