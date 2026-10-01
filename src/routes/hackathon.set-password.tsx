import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, KeyRound, Loader2, Lock, Mail } from "lucide-react";
import {
  requestHackathonPasswordLink,
  setHackathonPassword,
  validateHackathonPasswordLink,
} from "@/lib/hackathon-api";

export const Route = createFileRoute("/hackathon/set-password")({
  component: HackathonSetPasswordPage,
});

type LinkState =
  | { status: "checking" }
  | { status: "invalid"; message: string }
  | { status: "ready"; email: string; name: string; teamName: string; hasPassword: boolean };

function readTokenFromHash() {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.hash.replace(/^#/, "")).get("token") || "";
}

function HackathonSetPasswordPage() {
  const navigate = useNavigate();
  const [token, setToken] = useState("");
  const [link, setLink] = useState<LinkState>({ status: "checking" });
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [resendEmail, setResendEmail] = useState("");
  const [resendStatus, setResendStatus] = useState<{
    tone: "success" | "error";
    text: string;
  } | null>(null);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const value = readTokenFromHash();
    setToken(value);
    if (!value) {
      setLink({ status: "invalid", message: "This link is missing its security token." });
      return;
    }

    let cancelled = false;
    validateHackathonPasswordLink(value)
      .then((result) => {
        if (!cancelled) setLink({ status: "ready", ...result });
      })
      .catch((cause) => {
        if (!cancelled) {
          setLink({
            status: "invalid",
            message:
              cause instanceof Error ? cause.message : "This link is invalid or has expired.",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await setHackathonPassword({ token, password });
      window.history.replaceState(null, "", window.location.pathname);
      void navigate({
        to: `/hackathon/register?mode=login&passwordSet=1&email=${encodeURIComponent(result.email)}`,
        replace: true,
      });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not set your password.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResendStatus(null);
    const email = resendEmail.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setResendStatus({ tone: "error", text: "Please enter a valid email address." });
      return;
    }

    setIsResending(true);
    try {
      const response = await requestHackathonPasswordLink(email);
      setResendStatus({ tone: "success", text: response.message });
    } catch (cause) {
      setResendStatus({
        tone: "error",
        text: cause instanceof Error ? cause.message : "Could not send the link.",
      });
    } finally {
      setIsResending(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background px-4 py-6 sm:px-6">
      <Link
        to="/hackathon"
        className="inline-flex h-9 w-fit items-center gap-1.5 border border-border bg-card px-3 text-[13px] font-semibold text-foreground transition-colors hover:border-primary/40 hover:text-primary"
      >
        <ArrowLeft className="size-4" />
        Back to Hackathon
      </Link>

      <main className="flex flex-1 items-center justify-center py-8">
        <div className="w-full max-w-[360px]">
          <p className="text-[10.5px] font-semibold uppercase tracking-wider text-primary">
            AI HACK X MRDU 2026
          </p>
          <h1 className="mt-1 font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Set your password
          </h1>

          {link.status === "checking" && (
            <p className="mt-6 flex items-center gap-2 text-[13px] text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Checking your link...
            </p>
          )}

          {link.status === "ready" && (
            <>
              <p className="mt-1 text-[13px] leading-5 text-muted-foreground">
                {link.name ? `Hi ${link.name}, ` : ""}
                {link.hasPassword ? "choose a new password" : "create a password"} for{" "}
                <strong className="font-semibold text-foreground">{link.email}</strong>
                {link.teamName ? ` (team ${link.teamName})` : ""}.
              </p>

              <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
                <PasswordField
                  label="New password"
                  value={password}
                  onChange={setPassword}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                />
                <PasswordField
                  label="Confirm password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                />

                {error && (
                  <p className="border border-destructive/20 bg-destructive/5 px-3 py-2 text-[13px] text-destructive">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex h-10 w-full items-center justify-center gap-2 bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-95 disabled:cursor-wait disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="size-4" />
                  )}
                  {isSubmitting ? "Saving..." : "Set password"}
                </button>
              </form>
            </>
          )}

          {link.status === "invalid" && (
            <>
              <p className="mt-3 border border-amber-300 bg-amber-50 px-3 py-2 text-[13px] leading-5 text-amber-900">
                {link.message}
              </p>

              <form onSubmit={handleResend} className="mt-5 space-y-3">
                <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                  <KeyRound className="size-4 text-primary" /> Get a new link
                </p>
                <label className="block text-xs font-semibold text-foreground">
                  Email address
                  <span className="relative mt-1 block">
                    <Mail className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="email"
                      value={resendEmail}
                      onChange={(event) => setResendEmail(event.target.value)}
                      placeholder="Enter your registered email"
                      autoComplete="email"
                      className="h-9 w-full border border-border bg-background pl-8 pr-3 text-[13px] font-normal outline-none transition focus:border-primary"
                    />
                  </span>
                </label>
                {resendStatus && (
                  <p
                    className={`text-[12.5px] leading-5 ${
                      resendStatus.tone === "success" ? "text-emerald-700" : "text-destructive"
                    }`}
                  >
                    {resendStatus.text}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={isResending}
                  className="h-10 w-full bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-95 disabled:cursor-wait disabled:opacity-70"
                >
                  {isResending ? "Sending..." : "Email me a new link"}
                </button>
              </form>
            </>
          )}

          <p className="mt-5 text-center text-[13px] text-muted-foreground">
            Already set your password?{" "}
            <Link to="/hackathon/login" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  autoComplete,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  placeholder: string;
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <label className="block text-xs font-semibold text-foreground">
      {label}
      <span className="relative mt-1 block">
        <Lock className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          placeholder={placeholder}
          minLength={8}
          maxLength={128}
          className="h-9 w-full border border-border bg-background pl-8 pr-9 text-[13px] font-normal outline-none transition focus:border-primary"
        />
        <button
          type="button"
          onClick={() => setShowPassword((current) => !current)}
          aria-label={showPassword ? "Hide password" : "Show password"}
          aria-pressed={showPassword}
          className="absolute right-1 top-1/2 inline-flex size-7 -translate-y-1/2 items-center justify-center text-muted-foreground transition hover:text-foreground"
        >
          {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
        </button>
      </span>
    </label>
  );
}
