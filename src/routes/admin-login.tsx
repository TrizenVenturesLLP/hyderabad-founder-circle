import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Lock, Shield } from "lucide-react";
import { useState, type FormEvent } from "react";
import { adminLogin } from "@/lib/admin-api";
import { getAdminToken, setAdminToken } from "@/lib/admin-auth";

export const Route = createFileRoute("/admin-login")({
  ssr: false,
  beforeLoad: () => {
    if (getAdminToken()) {
      throw redirect({ to: "/admin/registrations" });
    }
  },
  component: AdminLoginPage,
  head: () => ({
    meta: [{ title: "Admin Login — Trizen Community" }],
  }),
});

function AdminLoginPage() {
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
      const data = await adminLogin(email.trim(), password);
      setAdminToken(data.token);
      await navigate({ to: "/admin/registrations" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-10">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 20% 10%, #f6ded3 0%, transparent 55%), radial-gradient(ellipse 70% 50% at 90% 90%, #efe5de 0%, transparent 50%), linear-gradient(165deg, #fcfaf7 0%, #f3ece5 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%233b2318' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        }}
      />

      <div className="relative w-full max-w-[420px]">
        <div className="mb-8 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-[var(--brand-primary)] text-white shadow-sm">
            <Shield className="size-5" strokeWidth={1.75} />
          </div>
          <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--brand-accent)]">
            Trizen Community
          </p>
          <h1 className="mt-2 font-display text-3xl tracking-tight text-foreground">
            Admin sign in
          </h1>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            Registrations, contact requests, and events.
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="rounded-[22px] border border-[var(--color-border)] bg-white/90 p-7 shadow-[0_20px_50px_-28px_rgba(59,35,24,0.35)] backdrop-blur-sm"
        >
          <label className="block">
            <span className="text-xs font-semibold text-[var(--color-text-muted)]">
              Email
            </span>
            <input
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@trizenventures.com"
              className="mt-1.5 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background-alt)] px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-[var(--brand-accent)] focus:bg-white"
            />
          </label>

          <div className="mt-4">
            <span className="text-xs font-semibold text-[var(--color-text-muted)]">
              Password
            </span>
            <div className="relative mt-1.5">
              <input
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background-alt)] px-3.5 py-2.5 pr-11 text-sm outline-none transition-colors focus:border-[var(--brand-accent)] focus:bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-lg p-1.5 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-background-warm)] hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="size-4" strokeWidth={1.75} />
                ) : (
                  <Eye className="size-4" strokeWidth={1.75} />
                )}
              </button>
            </div>
          </div>

          {error ? (
            <p
              className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary mt-6 w-full justify-center gap-2 disabled:opacity-60"
          >
            <Lock className="size-3.5" strokeWidth={2} />
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
