import { useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { JuryBrandLink } from "@/components/jury/JuryBrandLink";
import { acceptJuryInvitation, loginJury } from "@/lib/jury-api";

export const Route = createFileRoute("/jury/login")({
  component: JuryLoginPage,
});

const juryResponsibilities = [
  "Accept the invitation from your email and create your Jury account.",
  "Sign in to see the teams assigned to your hackathon.",
  "Review each team's problem statement and submission.",
  "Score every team against the rubric and submit your evaluation.",
];

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
    <div className="min-h-dvh bg-background lg:grid lg:h-dvh lg:grid-cols-2 lg:overflow-hidden">
      <aside className="relative overflow-hidden bg-(--brand-primary) text-white lg:h-dvh">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 100% 0%, color-mix(in oklab, var(--brand-accent) 35%, transparent) 0%, transparent 60%)",
          }}
        />

        <div className="relative flex h-full flex-col px-5 py-5 sm:px-8 lg:px-10 lg:py-8">
          <div className="flex items-center justify-between gap-3">
            <JuryBrandLink tone="dark" subtitle="Jury portal" className="w-fit" reloadDocument />
            <Link
              to="/"
              reloadDocument
              className="inline-flex h-9 shrink-0 items-center gap-1.5 border border-white/20 bg-white/5 px-3 text-[13px] font-semibold text-white transition-colors hover:bg-white/10"
            >
              <ArrowLeft className="size-4" />
              Back to home
            </Link>
          </div>

          <div className="mt-6 lg:mt-auto">
            <span className="inline-flex border border-white/20 bg-white/10 px-2 py-0.5 text-[10.5px] font-semibold tracking-wider uppercase">
              Jury portal
            </span>
            <h2 className="mt-3 font-display text-2xl font-bold tracking-tight sm:text-3xl">
              Evaluate with clarity.
            </h2>
            <p className="mt-2 max-w-md text-[13px] leading-5 text-white/70">
              Review assigned teams, open their submissions, and track your evaluation progress in
              one place.
            </p>
          </div>

          <div className="mt-6 hidden border-t border-white/15 pt-5 lg:block">
            <p className="text-[10.5px] font-semibold tracking-wider text-white/55 uppercase">
              How it works
            </p>
            <ol className="mt-3 space-y-2.5">
              {juryResponsibilities.map((item, index) => (
                <li key={item} className="flex items-start gap-2.5 text-[13px] text-white/85">
                  <span className="flex size-5 shrink-0 items-center justify-center bg-white/10 text-[11px] font-semibold">
                    {index + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ol>
          </div>

          <p className="mt-6 hidden text-[12px] text-white/60 lg:mt-auto lg:block lg:pt-6">
            Jury accounts are created from an administrator invitation.
          </p>
        </div>
      </aside>

      <main className="flex justify-center px-4 py-8 sm:px-8 lg:h-dvh lg:overflow-y-auto lg:py-8">
        <div className="my-auto w-full max-w-[340px]">
          <p className="text-[10.5px] font-semibold tracking-wider text-primary uppercase">
            Jury sign in
          </p>
          <h1 className="mt-1 font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Welcome back
          </h1>
          <p className="mt-1 text-[13px] leading-5 text-muted-foreground">
            Use the email address your Jury invitation was sent to.
          </p>

          {token ? (
            <p className="mt-4 border-l-2 border-primary bg-primary/5 px-3 py-2 text-[12.5px] leading-5 text-foreground">
              Your invitation will be accepted after you sign in.
            </p>
          ) : null}

          <form onSubmit={submit} className="mt-5 space-y-3.5">
            <label className="block text-xs font-semibold text-foreground">
              Email address
              <span className="relative mt-1 block">
                <Mail className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Enter your invited email"
                  autoComplete="username"
                  autoFocus
                  className="h-9 w-full border border-border bg-background pr-3 pl-8 text-[13px] font-normal outline-none transition focus:border-primary"
                />
              </span>
            </label>

            <label className="block text-xs font-semibold text-foreground">
              Password
              <span className="relative mt-1 block">
                <LockKeyhole className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="h-9 w-full border border-border bg-background pr-9 pl-8 text-[13px] font-normal outline-none transition focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="absolute top-1/2 right-1 inline-flex size-7 -translate-y-1/2 items-center justify-center text-muted-foreground transition hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                </button>
              </span>
            </label>

            {error ? (
              <p
                role="alert"
                className="border border-destructive/20 bg-destructive/5 px-3 py-2 text-[13px] text-destructive"
              >
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="h-10 w-full bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-95 disabled:cursor-wait disabled:opacity-70"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-5 border-t border-border pt-4 text-[12px] leading-5 text-muted-foreground">
            {token
              ? "New to the Jury portal? Open the link in your invitation email to create your account first."
              : "Don't have an account? Ask the hackathon administrator to send you a Jury invitation."}
          </p>
        </div>
      </main>
    </div>
  );
}
