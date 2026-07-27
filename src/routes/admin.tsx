import {
  Link,
  Outlet,
  createFileRoute,
  redirect,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import {
  CalendarDays,
  LogOut,
  Menu,
  MessageSquareText,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { adminMe } from "@/lib/admin-api";
import { clearAdminToken, getAdminToken } from "@/lib/admin-auth";
import { BrandLogo } from "@/components/BrandLogo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  ssr: false,
  beforeLoad: async () => {
    if (!getAdminToken()) {
      throw redirect({ to: "/admin-login" });
    }
    try {
      const { admin } = await adminMe();
      return { admin };
    } catch {
      clearAdminToken();
      throw redirect({ to: "/admin-login" });
    }
  },
  component: AdminLayout,
});

const nav = [
  { to: "/admin/registrations", label: "Registrations", icon: Users },
  { to: "/admin/contacts", label: "Contact Requests", icon: MessageSquareText },
  { to: "/admin/events", label: "Events", icon: CalendarDays },
] as const;

function AdminLayout() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { admin } = Route.useRouteContext() as {
    admin?: { email: string; name: string };
  };
  const [mobileOpen, setMobileOpen] = useState(false);

  function logout() {
    clearAdminToken();
    void navigate({ to: "/admin-login" });
  }

  const currentLabel =
    nav.find((n) => pathname.startsWith(n.to))?.label ?? "Admin";

  const displayName = admin?.name?.trim() || "Admin";
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || "")
    .join("");

  return (
    <div className="flex h-dvh overflow-hidden bg-[var(--color-background-alt)]">
      {mobileOpen ? (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex h-dvh w-[240px] shrink-0 flex-col bg-[var(--brand-primary)] text-white transition-transform duration-200",
          "lg:static lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0",
        )}
      >
        {/* Brand — wheat */}
        <div className="bg-[var(--color-background)] px-4 py-4">
          <div className="flex items-center gap-3">
            <BrandLogo className="size-8 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-[15px] leading-snug tracking-tight text-[var(--brand-primary)]">
                Trizen Community
              </p>
              <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--brand-accent)]">
                Admin
              </p>
            </div>
            <button
              type="button"
              className="shrink-0 rounded-md p-1 text-[var(--color-text-muted)] hover:text-[var(--brand-primary)] lg:hidden"
              onClick={() => setMobileOpen(false)}
              aria-label="Close sidebar"
            >
              <X className="size-4" />
            </button>
          </div>

          {admin?.email ? (
            <div className="mt-3 flex items-center gap-2.5 border-t border-[var(--color-border)] pt-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--brand-accent)] text-[10px] font-semibold text-white">
                {initials || "A"}
              </span>
              <div className="min-w-0">
                <p className="truncate text-[12px] font-medium text-[var(--brand-primary)]">
                  {displayName}
                </p>
                <p className="truncate text-[10px] text-[var(--color-text-muted)]">
                  {admin.email}
                </p>
              </div>
            </div>
          ) : null}
        </div>

        {/* Nav */}
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-2.5 py-3">
          {nav.map(({ to, label, icon: Icon }) => {
            const active = pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors",
                  active
                    ? "bg-[var(--color-background)] text-[var(--brand-primary)]"
                    : "text-white/70 hover:bg-white/10 hover:text-white",
                )}
              >
                <Icon className="size-4 shrink-0 opacity-80" strokeWidth={1.75} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-2.5 pb-3">
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] font-medium text-white/55 transition-colors hover:bg-white/10 hover:text-white"
          >
            <LogOut className="size-4 shrink-0" strokeWidth={1.75} />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header className="z-30 flex shrink-0 items-center gap-3 border-b border-[var(--color-border)] bg-[var(--color-background-alt)]/95 px-4 py-3 backdrop-blur-md lg:hidden">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--brand-accent)]">
              Admin
            </p>
            <p className="truncate text-sm font-semibold text-foreground">
              {currentLabel}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="shrink-0 rounded-xl border border-[var(--color-border)] bg-white p-2 text-foreground"
            aria-label="Open menu"
          >
            <Menu className="size-4" />
          </button>
        </header>
        <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
