import { useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { JuryBrandLink } from "@/components/jury/JuryBrandLink";
import { signupJury } from "@/lib/jury-api";

export const Route = createFileRoute("/jury/signup")({
  component: JurySignupPage,
});

function readInvitationToken() {
  return new URLSearchParams(window.location.hash.slice(1)).get("token") || "";
}

function JurySignupPage() {
  const navigate = useNavigate();
  const [token] = useState(readInvitationToken);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signupJury(token, name, password);
      await navigate({ to: "/jury", replace: true });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not create account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-(--color-background-alt) px-4 py-10">
      <JuryBrandLink subtitle="Jury portal" />
      <form
        onSubmit={submit}
        className="w-full max-w-md rounded-2xl border border-(--color-border) bg-white p-6 shadow-(--shadow-small) sm:p-8"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-accent)]">
          Hackathon Jury
        </p>
        <h1 className="mt-2 font-display text-2xl font-semibold">Create your account</h1>
        {!token ? (
          <p role="alert" className="mt-4 text-sm text-red-700">
            Open this page from a valid Jury invitation.
          </p>
        ) : null}
        <label className="mt-5 block text-sm font-medium">
          Name
          <input
            required
            minLength={2}
            maxLength={120}
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-1.5 w-full border border-[var(--color-border)] px-3 py-2.5"
            autoComplete="name"
          />
        </label>
        <label className="mt-4 block text-sm font-medium">
          Password
          <input
            required
            minLength={8}
            maxLength={128}
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1.5 w-full border border-[var(--color-border)] px-3 py-2.5"
            autoComplete="new-password"
          />
        </label>
        {error ? (
          <p
            role="alert"
            className="mt-4 border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={!token || loading}
          className="btn-primary mt-6 w-full justify-center disabled:opacity-60"
        >
          {loading ? "Creating account…" : "Create account and join"}
        </button>
        <p className="mt-5 text-sm text-[var(--color-text-secondary)]">
          Already have an account?{" "}
          <Link
            to="/jury/login"
            hash={`token=${encodeURIComponent(token)}`}
            className="font-semibold text-[var(--brand-accent)] underline"
          >
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
