import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { submitOrgApplication } from "@/lib/admin-api";

export const Route = createFileRoute("/host")({
  component: HostApplyPage,
  head: () => ({
    meta: [
      { title: "Create organization account — Trizen Community" },
      {
        name: "description",
        content:
          "Create an organization account to host community events. Applications are reviewed before you can publish events.",
      },
    ],
  }),
});

const inputClass =
  "mt-1 w-full border border-[var(--color-border)] bg-white px-3 py-2 text-[13px] outline-none transition-colors focus:border-[var(--brand-accent)]";

function HostApplyPage() {
  const [form, setForm] = useState({
    organizationName: "",
    email: "",
    website: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await submitOrgApplication({
        organizationName: form.organizationName,
        email: form.email,
        contactName: form.organizationName,
        website: form.website,
        message: form.message,
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* Left — form (same auth UI pattern as org login) */}
      <section className="relative flex items-center justify-center bg-[var(--color-background)] px-5 py-10 sm:px-8 lg:px-12">
        <div
          className="pointer-events-none absolute inset-0 opacity-80"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 15% 15%, color-mix(in oklab, var(--brand-accent) 12%, transparent) 0%, transparent 55%), linear-gradient(180deg, var(--color-background) 0%, var(--color-background-alt) 100%)",
          }}
          aria-hidden
        />

        <div className="relative w-full max-w-[380px]">
          <p className="text-[11px] font-medium tracking-[0.08em] text-[var(--brand-accent)] uppercase">
            Organization sign up
          </p>
          <h1 className="mt-1.5 font-display text-[1.45rem] tracking-tight text-foreground">
            Create an organization account
          </h1>
          <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
            Request an account for your organization. After approval, you can
            sign in and publish events.
          </p>

          {done ? (
            <div className="mt-6 border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-start gap-2.5">
                <CheckCircle2
                  className="mt-0.5 size-4 shrink-0 text-emerald-700"
                  aria-hidden
                />
                <div>
                  <p className="text-[13px] font-medium text-emerald-900">
                    Application submitted
                  </p>
                  <p className="mt-1 text-[12.5px] text-emerald-800">
                    We’ll review your request. Once approved, use organization
                    login with your organization email.
                  </p>
                  <Link
                    to="/org-login"
                    className="mt-3 inline-flex text-[13px] font-medium text-[var(--brand-accent)] hover:underline"
                  >
                    Go to organization login →
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="mt-6 space-y-3.5">
              <label className="block">
                <span className="text-[11px] font-semibold text-[var(--color-text-muted)]">
                  Organization name
                </span>
                <input
                  required
                  value={form.organizationName}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      organizationName: e.target.value,
                    }))
                  }
                  className={inputClass}
                  placeholder="e.g. NanoSpace"
                />
              </label>
              <label className="block">
                <span className="text-[11px] font-semibold text-[var(--color-text-muted)]">
                  Organization email
                </span>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                  className={inputClass}
                  placeholder="hello@yourorg.com"
                />
                <span className="mt-1 block text-[11px] text-[var(--color-text-muted)]">
                  This email becomes the login for your organization account.
                </span>
              </label>
              <label className="block">
                <span className="text-[11px] font-semibold text-[var(--color-text-muted)]">
                  Website <span className="font-normal">(optional)</span>
                </span>
                <input
                  value={form.website}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, website: e.target.value }))
                  }
                  className={inputClass}
                  placeholder="https://"
                />
              </label>
              <label className="block">
                <span className="text-[11px] font-semibold text-[var(--color-text-muted)]">
                  About your events{" "}
                  <span className="font-normal">(optional)</span>
                </span>
                <textarea
                  value={form.message}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, message: e.target.value }))
                  }
                  rows={2}
                  className={inputClass}
                  placeholder="What will you host?"
                />
              </label>

              {error ? (
                <p
                  className="border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700"
                  role="alert"
                >
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary mt-1 w-full justify-center text-[13px] disabled:opacity-60"
              >
                {loading ? "Submitting…" : "Request organization account"}
              </button>
            </form>
          )}

          <p className="mt-6 border-t border-[var(--color-border)] pt-5 text-[12.5px] text-[var(--color-text-secondary)]">
            Already have an account?{" "}
            <Link
              to="/org-login"
              className="font-medium text-[var(--brand-accent)] underline-offset-2 hover:underline"
            >
              Organization login
            </Link>
          </p>
        </div>
      </section>

      {/* Right — image panel with Horizon Parkway */}
      <section className="relative isolate flex min-h-[280px] items-end overflow-hidden px-6 py-8 sm:px-10 sm:py-10 lg:min-h-0 lg:items-center lg:px-12 lg:py-12">
        <img
          src="/july-2026-1.jpeg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-[linear-gradient(200deg,oklch(0.18_0.03_50_/_0.9)_0%,oklch(0.16_0.03_40_/_0.92)_100%)]"
          aria-hidden
        />

        <div className="relative max-w-md py-6 lg:py-0">
          <h2 className="font-display text-[1.45rem] font-semibold leading-snug tracking-tight text-white md:text-[1.65rem]">
            Apply once. Host events after approval.
          </h2>
          <p className="mt-3 text-[13px] leading-relaxed text-white/72">
            Submit your organization name and email. We review the request, then
            you sign in and create events. Guests RSVP per event — no public
            signup.
          </p>
          <ol className="mt-5 space-y-1.5 text-[12.5px] text-white/70">
            <li>1. Create organization account request</li>
            <li>2. Wait for approval</li>
            <li>3. Sign in and publish events</li>
          </ol>
          <p className="mt-6 text-[12.5px] text-white/60">
            Already approved?{" "}
            <Link
              to="/org-login"
              className="font-medium text-white underline-offset-4 hover:underline"
            >
              Organization sign in
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
