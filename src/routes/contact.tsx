import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type KeyboardEvent } from "react";
import { ArrowRight, Send } from "lucide-react";
import { toast } from "sonner";
import { submitContact } from "@/lib/api";
import { useInView } from "@/hooks/use-in-view";
import { links } from "@/lib/links";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/contact")({
  head: () => {
    const siteUrl = "https://community.trizenventures.com";
    const title = "Contact — Trizen Community";
    const desc =
      "Get in touch with Trizen Community — host an event, partner with us, or ask a question.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: `${siteUrl}/contact` },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
      ],
      links: [{ rel: "canonical", href: `${siteUrl}/contact` }],
    };
  },
  component: ContactPage,
});

const scrollRevealOpts = {
  once: true,
  threshold: 0.22,
  rootMargin: "0px 0px -16% 0px",
} as const;

const topics = [
  {
    h: "Host an event",
    p: "Apply to publish your community’s meetup, workshop, or experience on the platform.",
  },
  {
    h: "Partnerships",
    p: "Venue, marketing, or community collaborations — tell us what you have in mind.",
  },
  {
    h: "Event support",
    p: "Questions about a registration, payment, or listing you’ve already submitted.",
  },
  {
    h: "General",
    p: "Anything else about Trizen Community — we’re happy to help.",
  },
];

const fieldClass =
  "mt-1.5 w-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-[14px] text-foreground outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-[var(--color-text-muted)] focus:border-[var(--brand-accent)] focus:shadow-[0_0_0_3px_color-mix(in_oklab,var(--brand-accent)_16%,transparent)]";

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--brand-accent)]">
      {children}
    </p>
  );
}

function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const hero = useInView<HTMLElement>({
    once: true,
    threshold: 0.12,
    rootMargin: "0px 0px -8% 0px",
  });
  const form = useInView<HTMLElement>(scrollRevealOpts);
  const topicsReveal = useInView<HTMLElement>(scrollRevealOpts);

  async function sendMessage() {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();
    if (!trimmedName || !trimmedEmail || !trimmedMessage || submitting) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setSubmitting(true);
    try {
      await submitContact({
        name: trimmedName,
        email: trimmedEmail,
        message: trimmedMessage,
      });
      setName("");
      setEmail("");
      setMessage("");
      toast.success("Message sent. We'll get back to you soon.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not send message. Try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key !== "Enter") return;
    const target = e.target as HTMLElement;
    if (target.tagName === "TEXTAREA") return;
    e.preventDefault();
    void sendMessage();
  }

  const canSend =
    !submitting &&
    name.trim().length > 0 &&
    email.trim().length > 0 &&
    message.trim().length > 0;

  return (
    <div className="bg-[var(--color-background)]">
      <header
        ref={hero.ref}
        className="relative isolate overflow-hidden border-b border-[var(--color-border)]"
      >
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            background:
              "radial-gradient(ellipse 65% 50% at 85% 0%, color-mix(in oklab, var(--brand-accent) 11%, transparent), transparent 55%)",
          }}
        />
        <div
          className={cn(
            "page-container reveal-up relative py-12 md:py-16",
            hero.inView && "is-visible",
          )}
        >
          <SectionLabel>Contact</SectionLabel>
          <p
            className="mt-4 text-[clamp(1.2rem,2.5vw,1.45rem)] font-semibold tracking-[-0.03em] text-foreground"
            style={{ fontFamily: "var(--font-brand)" }}
          >
            Trizen Community
          </p>
          <h1 className="mt-2 max-w-[14ch] font-display text-[clamp(1.9rem,4vw,2.6rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-foreground">
            Get in touch.
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-[var(--color-text-secondary)]">
            Hosting, partnerships, or a question about an event — send a note
            and we&apos;ll get back to you.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13.5px]">
            <a
              href={`mailto:${links.email}`}
              className="font-medium text-foreground underline-offset-4 hover:text-[var(--brand-accent)] hover:underline"
            >
              {links.email}
            </a>
            <span className="text-[var(--color-border-strong)]" aria-hidden>
              ·
            </span>
            <a
              href={links.phoneHref}
              className="font-medium text-foreground underline-offset-4 hover:text-[var(--brand-accent)] hover:underline"
            >
              {links.phone}
            </a>
          </div>
        </div>
      </header>

      <section>
        <div className="page-container grid gap-10 py-10 md:grid-cols-12 md:gap-12 md:py-14">
          <div
            ref={form.ref}
            className={cn(
              "reveal-up md:col-span-7",
              form.inView && "is-visible",
            )}
          >
            <SectionLabel>Message</SectionLabel>
            <h2 className="mt-2 font-display text-[clamp(1.25rem,2.2vw,1.5rem)] tracking-tight text-foreground">
              Tell us what you have in mind
            </h2>

            <div
              className="mt-6"
              role="group"
              aria-label="Contact form"
              onKeyDown={onKeyDown}
            >
              <div className="grid gap-4 sm:grid-cols-2 sm:gap-x-4">
                <div>
                  <label
                    className="text-[12px] font-medium text-[var(--color-text-secondary)]"
                    htmlFor="contact-name"
                  >
                    Your name
                  </label>
                  <input
                    id="contact-name"
                    name="contact-name"
                    type="text"
                    required
                    maxLength={100}
                    autoComplete="name"
                    placeholder="Full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label
                    className="text-[12px] font-medium text-[var(--color-text-secondary)]"
                    htmlFor="contact-email"
                  >
                    Email
                  </label>
                  <input
                    id="contact-email"
                    name="contact-email"
                    type="text"
                    inputMode="email"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    required
                    maxLength={255}
                    autoComplete="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={fieldClass}
                  />
                </div>
              </div>

              <div className="mt-4">
                <label
                  className="text-[12px] font-medium text-[var(--color-text-secondary)]"
                  htmlFor="contact-message"
                >
                  Message
                </label>
                <textarea
                  id="contact-message"
                  name="contact-message"
                  required
                  rows={5}
                  maxLength={2000}
                  autoComplete="off"
                  placeholder="Hosting, partnership, event support, or anything else…"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className={cn(fieldClass, "min-h-[8rem] resize-y leading-relaxed")}
                />
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  disabled={!canSend}
                  onClick={() => void sendMessage()}
                  className="btn-primary gap-2 !min-h-11 !px-5 disabled:pointer-events-none disabled:opacity-45"
                >
                  <Send className="size-3.5" strokeWidth={1.75} aria-hidden />
                  {submitting ? "Sending…" : "Send message"}
                </button>
                <Link
                  to="/host"
                  className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-[var(--brand-accent)] hover:underline"
                >
                  Prefer to host?
                  <ArrowRight className="size-3.5" strokeWidth={1.75} />
                </Link>
              </div>
            </div>
          </div>

          <aside
            ref={topicsReveal.ref}
            className={cn(
              "reveal-up md:col-span-5",
              topicsReveal.inView && "is-visible",
            )}
            style={{
              transitionDelay: topicsReveal.inView ? "70ms" : undefined,
            }}
          >
            <div className="md:sticky md:top-24">
              <SectionLabel>What you can reach us about</SectionLabel>
              <h2 className="mt-2 font-display text-[clamp(1.25rem,2.2vw,1.5rem)] tracking-tight text-foreground">
                A few common reasons people write in.
              </h2>
              <ol
                className={cn(
                  "stagger-in-fast mt-5 list-none divide-y divide-[var(--color-border)] border-t border-[var(--color-border)]",
                  topicsReveal.inView && "is-visible",
                )}
              >
                {topics.map((g, i) => (
                  <li key={g.h} className="py-3.5">
                    <div className="flex gap-3">
                      <span
                        className="mt-0.5 font-display text-[0.95rem] tabular-nums text-[var(--brand-accent)]"
                        aria-hidden
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div className="min-w-0">
                        <h3 className="text-[0.95rem] font-semibold tracking-tight text-foreground">
                          {g.h}
                        </h3>
                        <p className="mt-1 text-[13px] leading-[1.55] text-[var(--color-text-secondary)]">
                          {g.p}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
