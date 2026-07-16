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
  Mail,
  Menu,
  MessageSquareText,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { adminMe } from "@/lib/admin-api";
import { clearAdminToken, getAdminToken } from "@/lib/admin-auth";
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

  return (
    <div className="flex min-h-dvh bg-[var(--color-background-alt)]">
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
          "fixed inset-y-0 left-0 z-50 flex h-dvh w-[260px] shrink-0 flex-col border-r border-white/10 bg-[var(--brand-primary)] text-white transition-transform duration-200 lg:sticky lg:top-0 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="border-b border-white/10 px-5 py-5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/55">
                Trizen Community
              </p>
              <p className="mt-1 font-display text-lg tracking-tight">Admin</p>
            </div>
            <button
              type="button"
              className="rounded-lg p-1.5 text-white/60 hover:bg-white/10 hover:text-white lg:hidden"
              onClick={() => setMobileOpen(false)}
              aria-label="Close sidebar"
            >
              <X className="size-4" />
            </button>
          </div>
          {admin?.email ? (
            <p className="mt-3 truncate rounded-lg bg-white/8 px-2.5 py-1.5 text-xs text-white/65">
              {admin.email}
            </p>
          ) : null}
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
          {nav.map(({ to, label, icon: Icon }) => {
            const active = pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-white/15 text-white shadow-sm"
                    : "text-white/70 hover:bg-white/10 hover:text-white",
                )}
              >
                <Icon className="size-4 shrink-0" strokeWidth={1.75} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-3">
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            <LogOut className="size-4" strokeWidth={1.75} />
            Sign out
          </button>
          <p className="mt-2 flex items-center gap-1.5 px-3 text-[11px] text-white/40">
            <Mail className="size-3" />
            Reminder emails via Registrations
          </p>
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-[var(--color-border)] bg-[var(--color-background-alt)]/90 px-4 py-3 backdrop-blur-md lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-xl border border-[var(--color-border)] bg-white p-2 text-foreground"
            aria-label="Open menu"
          >
            <Menu className="size-4" />
          </button>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--brand-accent)]">
              Admin
            </p>
            <p className="text-sm font-semibold text-foreground">{currentLabel}</p>
          </div>
        </header>
        <div className="min-w-0 flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
