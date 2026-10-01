import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { JuryBrandLink } from "@/components/jury/JuryBrandLink";
import { acceptJuryInvitation, getJuryMe, validateJuryInvitation } from "@/lib/jury-api";
import { clearJuryToken, getJuryToken } from "@/lib/jury-auth";

export const Route = createFileRoute("/jury/invitation")({
  component: JuryInvitationPage,
});

type InvitationPreview = {
  emailHint: string;
  expiresAt: string;
  hackathon: { name: string; slug: string };
};

function tokenFromFragment() {
  return new URLSearchParams(window.location.hash.slice(1)).get("token") || "";
}

function JuryInvitationPage() {
  const navigate = useNavigate();
  const [token, setToken] = useState("");
  const [preview, setPreview] = useState<InvitationPreview | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const invitationToken = tokenFromFragment();
    setToken(invitationToken);
    if (!invitationToken) {
      setError("Invitation link is missing its token. Open the complete link from your email.");
      setLoading(false);
      return;
    }
    void validateJuryInvitation(invitationToken)
      .then(setPreview)
      .catch((cause) =>
        setError(cause instanceof Error ? cause.message : "Invitation is unavailable."),
      )
      .finally(() => setLoading(false));

    if (getJuryToken()) {
      void getJuryMe()
        .then(({ user }) => setUserEmail(user.email))
        .catch(() => clearJuryToken());
    }
  }, []);

  async function accept() {
    setAccepting(true);
    setError("");
    try {
      await acceptJuryInvitation(token);
      await navigate({ to: "/jury", replace: true });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not accept invitation.");
    } finally {
      setAccepting(false);
    }
  }

  const fragment = `token=${encodeURIComponent(token)}`;
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-(--color-background-alt) px-4 py-10">
      <JuryBrandLink subtitle="Jury portal" />
      <section className="w-full max-w-lg rounded-2xl border border-(--color-border) bg-white p-6 shadow-(--shadow-small) sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-accent)]">
          Hackathon Jury
        </p>
        <h1 className="mt-2 font-display text-2xl font-semibold">Jury invitation</h1>
        {loading ? (
          <p className="mt-5 text-sm text-[var(--color-text-secondary)]">Checking invitation…</p>
        ) : null}
        {preview ? (
          <>
            <p className="mt-5 text-sm leading-relaxed text-[var(--color-text-secondary)]">
              You are invited to evaluate teams for{" "}
              <strong className="text-foreground">{preview.hackathon.name}</strong>.
            </p>
            <p className="mt-2 text-xs text-[var(--color-text-muted)]">
              Invitation sent to {preview.emailHint}. Expires{" "}
              {new Date(preview.expiresAt).toLocaleString()}.
            </p>
            {userEmail ? (
              <>
                <p className="mt-5 text-sm">
                  Signed in as <strong>{userEmail}</strong>
                </p>
                <button
                  type="button"
                  disabled={accepting}
                  onClick={() => void accept()}
                  className="btn-primary mt-5 w-full justify-center disabled:opacity-60"
                >
                  {accepting ? "Accepting…" : "Accept invitation"}
                </button>
              </>
            ) : (
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Link to="/jury/signup" hash={fragment} className="btn-primary justify-center">
                  Create Jury account
                </Link>
                <Link
                  to="/jury/login"
                  hash={fragment}
                  className="inline-flex items-center justify-center border border-[var(--color-border)] px-4 py-2 text-sm font-semibold hover:bg-[var(--color-background-alt)]"
                >
                  Sign in
                </Link>
              </div>
            )}
          </>
        ) : null}
        {error ? (
          <p
            role="alert"
            className="mt-5 border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {error}
          </p>
        ) : null}
        <p className="mt-6 text-xs text-[var(--color-text-muted)]">
          Need help?{" "}
          <a className="underline" href="mailto:community@trizenventures.com">
            community@trizenventures.com
          </a>
        </p>
      </section>
    </div>
  );
}
