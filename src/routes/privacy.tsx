import { createFileRoute, Link } from "@tanstack/react-router";
import { links } from "@/lib/links";
import { useInView } from "@/hooks/use-in-view";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Hyderabad Founders Network" },
      {
        name: "description",
        content:
          "How the Hyderabad Founders Network community handles the little data we collect.",
      },
      {
        property: "og:title",
        content: "Privacy Policy — Hyderabad Founders Network",
      },
      { property: "og:url", content: "/privacy" },
    ],
    links: [{ rel: "canonical", href: "/privacy" }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
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
          <span className="text-foreground/80">Privacy</span>
        </nav>

        <header className="mt-5 max-w-3xl border-b border-[var(--color-border)] pb-5">
          <p className="text-[12px] font-medium tracking-[0.06em] text-[var(--brand-accent)]">
            Privacy
          </p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
            <h1 className="font-display text-[clamp(1.85rem,3.2vw,2.4rem)] leading-[1.1] tracking-[-0.03em] text-foreground">
              Privacy Policy
            </h1>
            <p className="pb-1 text-[13px] text-[var(--color-text-muted)]">
              Last updated: 11 July 2026
            </p>
          </div>
          <p className="mt-3 max-w-3xl text-[16px] leading-[1.65] text-[var(--color-text-secondary)]">
            The Hyderabad Founders Network (&quot;we&quot;, &quot;the
            community&quot;) organises monthly founder meetups in Hyderabad.
            This page describes what we collect and how we use it.
          </p>
        </header>

        <div className="mt-2 max-w-3xl">
          <section className="border-b border-[var(--color-border)] py-5">
            <h2 className="font-display text-[1.35rem] tracking-tight text-foreground">
              What we collect
            </h2>
            <ul className="mt-3 space-y-2.5 text-[16px] leading-[1.65] text-[var(--color-text-secondary)]">
              <li>
                <span className="font-medium text-foreground">Contact form:</span>{" "}
                your name, email, and message. We use it only to reply to you.
              </li>
              <li>
                <span className="font-medium text-foreground">RSVPs:</span> name,
                email, phone, LinkedIn, and related registration details needed
                to confirm your seat and process the ₹49 registration fee via
                Razorpay. Payment card details are handled by Razorpay — we do
                not store them.
              </li>
              <li>
                <span className="font-medium text-foreground">
                  Community group:
                </span>{" "}
                if you join our WhatsApp community, that platform&apos;s terms
                and privacy policy apply.
              </li>
              <li>
                <span className="font-medium text-foreground">Badge studio:</span>{" "}
                photos you upload for badges are processed in your browser and
                are not uploaded to our servers.
              </li>
            </ul>
          </section>

          <section className="border-b border-[var(--color-border)] py-5">
            <h2 className="font-display text-[1.35rem] tracking-tight text-foreground">
              What we don&apos;t do
            </h2>
            <ul className="mt-3 space-y-2 text-[16px] leading-[1.65] text-[var(--color-text-secondary)]">
              <li>We don&apos;t sell your data.</li>
              <li>We don&apos;t share your email with sponsors or partners.</li>
              <li>We don&apos;t run advertising or third-party tracking pixels.</li>
            </ul>
          </section>

          <section className="border-b border-[var(--color-border)] py-5">
            <h2 className="font-display text-[1.35rem] tracking-tight text-foreground">
              Analytics
            </h2>
            <p className="mt-3 text-[16px] leading-[1.65] text-[var(--color-text-secondary)]">
              We may use privacy-friendly, cookie-free analytics to count
              anonymous page views. No personal profiles are built.
            </p>
          </section>

          <section className="border-b border-[var(--color-border)] py-5">
            <h2 className="font-display text-[1.35rem] tracking-tight text-foreground">
              Questions or requests
            </h2>
            <p className="mt-3 text-[16px] leading-[1.65] text-[var(--color-text-secondary)]">
              To ask a question, request a copy of your data, or ask us to
              delete your details, email{" "}
              <a
                className="font-medium text-[var(--brand-accent)] underline-offset-4 hover:underline"
                href={`mailto:${links.email}`}
              >
                {links.email}
              </a>
              .
            </p>
          </section>

          <p className="pt-5 text-[14px] text-[var(--color-text-muted)]">
            Also see our{" "}
            <Link
              to="/terms"
              className="font-medium text-[var(--brand-accent)] underline-offset-4 hover:underline"
            >
              Terms of Use
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
