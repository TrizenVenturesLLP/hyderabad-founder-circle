import { useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Eye, EyeOff, LockKeyhole, ShieldCheck } from "lucide-react";
import { JuryBrandLink } from "@/components/jury/JuryBrandLink";
import { acceptJuryInvitation, loginJury } from "@/lib/jury-api";

export const Route = createFileRoute("/jury/login")({
  component: JuryLoginPage,
});

function readInvitationToken() {
  return new URLSearchParams(window.location.hash.slice(1)).get("token") || "";
}

function JuryLoginPage() {
  const navigate = useNavigate();
  const [token] = useState(readInvitationToken);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await loginJury(email, password);
      if (token) await acceptJuryInvitation(token);
      await navigate({ to: "/jury", replace: true });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Sign in failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="flex min-h-dvh items-center justify-center px-4 py-10 sm:py-14"
      style={{
        background:
          "radial-gradient(ellipse 70% 50% at 15% 0%, color-mix(in oklab, var(--brand-accent) 10%, transparent) 0%, transparent 60%), radial-gradient(ellipse 60% 45% at 100% 100%, color-mix(in oklab, var(--brand-primary) 7%, transparent) 0%, transparent 55%), var(--color-background-alt)",
      }}
    >
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-(--color-border) bg-white shadow-[0_24px_70px_-40px_rgba(15,23,42,0.45)] md:grid-cols-[0.9fr_1.1fr]">
        <section className="relative flex flex-col justify-between overflow-hidden bg-(--brand-primary) p-6 text-white sm:p-9">
          <div
            className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-(--brand-accent) opacity-30 blur-3xl"
            aria-hidden
          />
          <div className="relative">
            <JuryBrandLink tone="dark" subtitle="Jury portal" />
            <span className="mt-10 inline-flex size-11 items-center justify-center rounded-xl border border-white/15 bg-white/10">
              <ShieldCheck className="size-5" />
            </span>
            <h1 className="mt-5 max-w-sm font-display text-3xl font-semibold leading-tight">
              Evaluate with clarity.
            </h1>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/75">
              Sign in to review assigned teams, submissions, and your evaluation progress.
            </p>
          </div>
          <p className="relative mt-10 text-xs text-white/60">
            Jury accounts are created from an administrator invitation.
          </p>
        </section>

        <section className="flex items-center px-6 py-8 sm:px-10 sm:py-10">
          <form onSubmit={submit} className="mx-auto w-full max-w-md">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-accent)]">
              Jury portal
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold text-foreground">Sign in</h2>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              Use the email address associated with your Jury invitation.
            </p>
            {token ? (
              <p className="mt-4 border-l-2 border-[var(--brand-accent)] bg-[var(--color-background-alt)] px-3 py-2 text-xs text-[var(--color-text-secondary)]">
                Your invitation will be accepted after successful sign in.
              </p>
            ) : null}
            <label className="mt-6 block text-sm font-medium">
              Email address
              <input
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-1.5 h-11 w-full rounded-xl border border-(--color-border) bg-white px-3.5 outline-none transition focus:border-(--brand-accent) focus:ring-4 focus:ring-(--brand-accent)/12"
                autoComplete="username"
              />
            </label>
            <label className="mt-4 block text-sm font-medium">
              Password
              <span className="relative mt-1.5 block">
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-11 w-full rounded-xl border border-(--color-border) bg-white py-2 pr-11 pl-3.5 outline-none transition focus:border-(--brand-accent) focus:ring-4 focus:ring-(--brand-accent)/12"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  title={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center text-[var(--color-text-muted)] hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </span>
            </label>
            {error ? (
              <p
                role="alert"
                className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
              >
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary mt-6 h-11 w-full justify-center gap-2 disabled:opacity-60"
            >
              <LockKeyhole className="size-4" />
              {loading ? "Signing in…" : "Sign in to Jury workspace"}
              {!loading ? <ArrowRight className="size-4" /> : null}
            </button>
            {token ? (
              <p className="mt-4 text-xs text-[var(--color-text-secondary)]">
                Need to create your invited account? Return to the invitation email link.
              </p>
            ) : null}
          </form>
        </section>
      </div>
    </div>
  );
}
