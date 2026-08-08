import { createFileRoute } from "@tanstack/react-router";
import { useState, type KeyboardEvent } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { submitContact } from "@/lib/api";
import { useInView } from "@/hooks/use-in-view";
import { links } from "@/lib/links";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Get in touch — Hyderabad Founders Network" },
      {
        name: "description",
        content:
          "Get in touch with Hyderabad Founders Network organisers — partner, host, share a story, or say hello.",
      },
      {
        property: "og:title",
        content: "Get in touch — Hyderabad Founders Network",
      },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

const scrollRevealOpts = {
  once: true,
  threshold: 0.28,
  rootMargin: "0px 0px -22% 0px",
} as const;

const guidelines = [
  {
    h: "Respect first",
    p: "Treat everyone as a peer. No gatekeeping based on stage, role, or how much you've raised.",
  },
  {
    h: "No hard-selling",
    p: "Don't pitch to the room. Don't DM members with cold sales. Build relationships, not pipelines.",
  },
  {
    h: "Confidentiality",
    p: "What's shared in the room stays in the room. Numbers, struggles, intros — keep them in.",
  },
  {
    h: "Inclusion",
    p: "Open to founders of all backgrounds and stages. Aspiring founders are members too.",
  },
];

const fieldClass =
  "mt-1.5 w-full rounded-none border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-[14px] text-foreground outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-[var(--color-text-muted)] focus:border-[var(--brand-accent)] focus:shadow-[0_0_0_3px_color-mix(in_oklab,var(--brand-accent)_16%,transparent)]";

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
  const guidelinesReveal = useInView<HTMLElement>(scrollRevealOpts);

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
        className="trizen-mesh border-b border-[var(--color-border)]"
      >
        <div
          className={cn(
            "page-container reveal-up pt-8 pb-7 md:pt-10 md:pb-8",
            hero.inView && "is-visible",
          )}
        >
          <p className="text-[12px] font-medium tracking-[0.06em] text-[var(--brand-accent)]">
            Contact
          </p>
          <h1 className="mt-2 max-w-[14ch] font-display text-[clamp(1.9rem,3.8vw,2.6rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-foreground">
            Get in touch.
          </h1>
          <p className="mt-2 max-w-xl text-[14.5px] leading-relaxed text-[var(--color-text-secondary)]">
            Partnering, hosting, sharing a story, or just saying hello — send a
            note and we&apos;ll get back to you.
          </p>
          <div className="mt-3.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-[var(--color-text-secondary)]">
            <a
              href={`mailto:${links.email}`}
              className="font-medium text-foreground underline-offset-4 transition-colors duration-200 hover:text-[var(--brand-accent)] hover:underline"
            >
              {links.email}
            </a>
            <span className="text-[var(--color-border-strong)]" aria-hidden>
              ·
            </span>
            <a
              href={links.phoneHref}
              className="font-medium text-foreground underline-offset-4 transition-colors duration-200 hover:text-[var(--brand-accent)] hover:underline"
            >
              {links.phone}
            </a>
          </div>
          <p className="mt-1.5 max-w-xl text-[12.5px] leading-relaxed text-[var(--color-text-muted)]">
            <a
              href={links.address.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors duration-200 hover:text-[var(--brand-accent)]"
            >
              {links.address.line}
            </a>
          </p>
        </div>
      </header>

      <section>
        <div className="page-container grid gap-8 py-8 md:grid-cols-12 md:gap-10 md:py-9 lg:gap-12">
          <div
            ref={form.ref}
            className={cn(
              "reveal-left md:col-span-7",
              form.inView && "is-visible",
            )}
          >
            <p className="text-[12px] font-medium tracking-[0.06em] text-[var(--brand-accent)]">
              Message
            </p>
            <h2 className="mt-1.5 font-display text-[clamp(1.25rem,2.2vw,1.45rem)] tracking-tight text-foreground">
              Tell us what you have in mind
            </h2>

            {/*
              Not a <form>: posts via fetch to the API.
              Avoids Chrome's "This form is not secure" warning on HTTP (e.g. localhost).
            */}
            <div
              className="mt-5"
              role="group"
              aria-label="Get in touch form"
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
                  rows={4}
                  maxLength={2000}
                  autoComplete="off"
                  placeholder="What would you like to talk about?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className={cn(
                    fieldClass,
                    "min-h-[6.5rem] resize-y leading-relaxed",
                  )}
                />
              </div>

              <div className="mt-5">
                <button
                  type="button"
                  disabled={!canSend}
                  onClick={() => void sendMessage()}
                  className="btn-primary gap-2 !min-h-10 !px-5 !text-[13.5px] disabled:pointer-events-none disabled:opacity-45"
                >
                  <Send className="size-3.5" strokeWidth={1.75} aria-hidden />
                  {submitting ? "Sending…" : "Get in touch"}
                </button>
              </div>
            </div>
          </div>

          <aside
            ref={guidelinesReveal.ref}
            className={cn(
              "reveal-right md:col-span-5",
              guidelinesReveal.inView && "is-visible",
            )}
            style={{
              transitionDelay: guidelinesReveal.inView ? "80ms" : undefined,
            }}
          >
            <div className="md:sticky md:top-24">
              <p className="text-[12px] font-medium tracking-[0.06em] text-[var(--brand-accent)]">
                Community guidelines
              </p>
              <h2 className="mt-1.5 font-display text-[clamp(1.25rem,2.2vw,1.45rem)] tracking-tight text-foreground">
                The rules that keep the room what it is.
              </h2>

              <ol
                className={cn(
                  "stagger-in-fast mt-4 divide-y divide-[var(--color-border)] border-t border-[var(--color-border)]",
                  guidelinesReveal.inView && "is-visible",
                )}
              >
                {guidelines.map((g, i) => (
                  <li key={g.h} className="py-3">
                    <div className="flex gap-3">
                      <span
                        className="mt-0.5 font-display text-[0.95rem] tabular-nums tracking-tight text-[var(--brand-accent)]"
                        aria-hidden
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div className="min-w-0">
                        <h3 className="text-[0.95rem] font-semibold tracking-tight text-foreground">
                          {g.h}
                        </h3>
                        <p className="mt-0.5 text-[13px] leading-[1.55] text-[var(--color-text-secondary)]">
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
