import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Lock } from "lucide-react";
import { useState, type FormEvent } from "react";
import { orgLogin } from "@/lib/admin-api";
import { getAdminToken, setAdminToken } from "@/lib/admin-auth";

export const Route = createFileRoute("/org-login")({
  ssr: false,
  beforeLoad: () => {
    if (getAdminToken()) {
      throw redirect({ to: "/admin/registrations" });
    }
  },
  component: OrgLoginPage,
  head: () => ({
    meta: [{ title: "Organization Login — Trizen Community" }],
  }),
});

function OrgLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await orgLogin(email.trim(), password);
      setAdminToken(data.token);
      await navigate({ to: "/admin/events" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* Left — short explainer */}
      <section className="relative isolate flex items-end overflow-hidden px-6 py-8 sm:px-10 sm:py-10 lg:items-center lg:px-12 lg:py-12">
        <img
          src="/july-2026-1.jpeg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-[linear-gradient(160deg,oklch(0.18_0.03_50_/_0.9)_0%,oklch(0.16_0.03_40_/_0.92)_100%)]"
          aria-hidden
        />

        <div className="relative max-w-md py-6 lg:py-0">
          <h1 className="font-display text-[1.45rem] font-semibold leading-snug tracking-tight text-white md:text-[1.65rem]">
            Sign in to manage your organization events.
          </h1>
          <p className="mt-3 text-[13px] leading-relaxed text-white/72">
            For approved organization accounts. Publish meetups, track RSVPs,
            and manage registrations — guests never need an account.
          </p>
          <p className="mt-5 text-[12.5px] text-white/60">
            Need an account?{" "}
            <Link
              to="/host"
              className="font-medium text-white underline-offset-4 hover:underline"
            >
              Create organization account
            </Link>
          </p>
        </div>
      </section>

      {/* Right — login form */}
      <section className="relative flex items-center justify-center bg-[var(--color-background)] px-5 py-10 sm:px-8 lg:px-12">
        <div
          className="pointer-events-none absolute inset-0 opacity-80"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 85% 15%, color-mix(in oklab, var(--brand-accent) 12%, transparent) 0%, transparent 55%), linear-gradient(180deg, var(--color-background) 0%, var(--color-background-alt) 100%)",
          }}
          aria-hidden
        />

        <div className="relative w-full max-w-[380px]">
          <p className="text-[11px] font-medium tracking-[0.08em] text-[var(--brand-accent)] uppercase">
            Organization sign in
          </p>
          <h2 className="mt-1.5 font-display text-[1.45rem] tracking-tight text-foreground">
            Welcome back
          </h2>
          <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
            Use your organization email and password.
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-3.5">
            <label className="block">
              <span className="text-[11px] font-semibold text-[var(--color-text-muted)]">
                Organization email
              </span>
              <input
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hello@yourorg.com"
                className="mt-1 w-full border border-[var(--color-border)] bg-white px-3 py-2 text-[13px] outline-none transition-colors focus:border-[var(--brand-accent)]"
              />
            </label>

            <div>
              <span className="text-[11px] font-semibold text-[var(--color-text-muted)]">
                Password
              </span>
              <div className="relative mt-1">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-[var(--color-border)] bg-white px-3 py-2 pr-10 text-[13px] outline-none transition-colors focus:border-[var(--brand-accent)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute top-1/2 right-2 -translate-y-1/2 p-1.5 text-[var(--color-text-muted)] transition-colors hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="size-3.5" strokeWidth={1.75} />
                  ) : (
                    <Eye className="size-3.5" strokeWidth={1.75} />
                  )}
                </button>
              </div>
            </div>

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
              className="btn-primary mt-1 w-full justify-center gap-2 text-[13px] disabled:opacity-60"
            >
              <Lock className="size-3.5" strokeWidth={2} />
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="mt-6 border-t border-[var(--color-border)] pt-5 text-[12.5px] text-[var(--color-text-secondary)]">
            Need an account?{" "}
            <Link
              to="/host"
              className="font-medium text-[var(--brand-accent)] underline-offset-2 hover:underline"
            >
              Create organization account
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
