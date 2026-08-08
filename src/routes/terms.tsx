import { createFileRoute, Link } from "@tanstack/react-router";
import { links } from "@/lib/links";
import { useInView } from "@/hooks/use-in-view";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Use — Hyderabad Founders Network" },
      {
        name: "description",
        content:
          "The simple ground rules for using this website and attending our community meetups.",
      },
      {
        property: "og:title",
        content: "Terms of Use — Hyderabad Founders Network",
      },
      { property: "og:url", content: "/terms" },
    ],
    links: [{ rel: "canonical", href: "/terms" }],
  }),
  component: TermsPage,
});

function TermsPage() {
  const page = useInView<HTMLElement>({
    once: true,
    threshold: 0.08,
    rootMargin: "0px 0px -6% 0px",
  });

  return (
    <div className="bg-[var(--color-background)]">
      <div
        ref={page.ref}
        className={cn(
          "page-container reveal-up py-8 md:py-10",
          page.inView && "is-visible",
        )}
      >
        <nav className="text-[13px] text-[var(--color-text-secondary)]">
          <Link to="/" className="transition-colors hover:text-foreground">
            Home
          </Link>
          <span className="mx-1.5 text-[var(--color-border-strong)]" aria-hidden>
            /
          </span>
          <span className="text-foreground/80">Terms</span>
        </nav>

        <header className="mt-5 max-w-3xl border-b border-[var(--color-border)] pb-5">
          <p className="text-[12px] font-medium tracking-[0.06em] text-[var(--brand-accent)]">
            Terms
          </p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
            <h1 className="font-display text-[clamp(1.85rem,3.2vw,2.4rem)] leading-[1.1] tracking-[-0.03em] text-foreground">
              Terms of Use
            </h1>
            <p className="pb-1 text-[13px] text-[var(--color-text-muted)]">
              Last updated: 11 July 2026
            </p>
          </div>
          <p className="mt-3 max-w-3xl text-[16px] leading-[1.65] text-[var(--color-text-secondary)]">
            Simple ground rules for using this website and attending Hyderabad
            Founders Network meetups.
          </p>
        </header>

        <div className="mt-2 max-w-3xl">
          <section className="border-b border-[var(--color-border)] py-5">
            <h2 className="font-display text-[1.35rem] tracking-tight text-foreground">
              Using this site
            </h2>
            <p className="mt-3 text-[16px] leading-[1.65] text-[var(--color-text-secondary)]">
              This website is a community resource for the Hyderabad Founders
              Network. Content is provided as-is, with no warranty. We may
              update event details, member listings, and copy at any time.
            </p>
          </section>

          <section className="border-b border-[var(--color-border)] py-5">
            <h2 className="font-display text-[1.35rem] tracking-tight text-foreground">
              Registration & payments
            </h2>
            <p className="mt-3 text-[16px] leading-[1.65] text-[var(--color-text-secondary)]">
              Meetup registration may require a small fee paid through Razorpay.
              Registration is personal to you and seats are limited. Refunds,
              if any, are handled case-by-case by the organisers.
            </p>
          </section>

          <section className="border-b border-[var(--color-border)] py-5">
            <h2 className="font-display text-[1.35rem] tracking-tight text-foreground">
              Community conduct
            </h2>
            <p className="mt-3 text-[16px] leading-[1.65] text-[var(--color-text-secondary)]">
              By attending a meetup or joining the community group you agree to
              our community guidelines: respect, no hard-selling,
              confidentiality, and inclusion. Organisers may remove anyone who
              breaks them.
            </p>
          </section>

          <section className="border-b border-[var(--color-border)] py-5">
            <h2 className="font-display text-[1.35rem] tracking-tight text-foreground">
              Sponsors
            </h2>
            <p className="mt-3 text-[16px] leading-[1.65] text-[var(--color-text-secondary)]">
              The community is supported by {links.sponsor.name} and partner
              spaces. Sponsors do not control the agenda or the room.
            </p>
          </section>

          <section className="border-b border-[var(--color-border)] py-5">
            <h2 className="font-display text-[1.35rem] tracking-tight text-foreground">
              Contact
            </h2>
            <p className="mt-3 text-[16px] leading-[1.65] text-[var(--color-text-secondary)]">
              Questions?{" "}
              <a
                className="font-medium text-[var(--brand-accent)] underline-offset-4 hover:underline"
                href={`mailto:${links.email}`}
              >
                {links.email}
              </a>
            </p>
          </section>

          <p className="pt-5 text-[14px] text-[var(--color-text-muted)]">
            Also see our{" "}
            <Link
              to="/privacy"
              className="font-medium text-[var(--brand-accent)] underline-offset-4 hover:underline"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
