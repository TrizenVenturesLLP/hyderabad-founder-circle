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
  ClipboardList,
  LogOut,
  Menu,
  MessageSquareText,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
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

function AdminLayout() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { admin } = Route.useRouteContext() as {
    admin?: {
      email: string;
      name: string;
      role?: string;
      organization?: { name: string } | null;
    };
  };
  const [mobileOpen, setMobileOpen] = useState(false);
  const isPlatform = admin?.role === "platform_admin";
  const loginPath = isPlatform ? "/admin-login" : "/org-login";

  const nav = useMemo(() => {
    const base = [
      { to: "/admin/registrations", label: "Registrations", icon: Users },
      { to: "/admin/events", label: "Events", icon: CalendarDays },
    ] as const;
    if (isPlatform) {
      return [
        ...base,
        {
          to: "/admin/applications",
          label: "Applications",
          icon: ClipboardList,
        },
        {
          to: "/admin/contacts",
          label: "Contacts",
          icon: MessageSquareText,
        },
      ] as const;
    }
    return base;
  }, [isPlatform]);

  function logout() {
    clearAdminToken();
    void navigate({ to: loginPath });
  }

  const currentLabel =
    nav.find((n) => pathname.startsWith(n.to))?.label ?? "Dashboard";

  const displayName = admin?.name?.trim() || "Admin";
  const workspaceLabel = isPlatform
    ? "Platform"
    : admin?.organization?.name || "Organization";
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
          className="fixed inset-0 z-40 bg-[oklch(0.2_0.02_50_/_0.4)] lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-dvh w-[248px] shrink-0 flex-col border-r border-[var(--color-border)] bg-white transition-transform duration-200",
          "lg:static lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex items-center gap-3 border-b border-[var(--color-border)] px-4 py-4">
          <BrandLogo className="size-8 shrink-0" />
          <div className="min-w-0 flex-1">
            <p
              className="truncate text-[13px] font-semibold tracking-tight text-foreground"
              style={{ fontFamily: "var(--font-brand)" }}
            >
              {workspaceLabel}
            </p>
            <p className="text-[11px] text-[var(--color-text-muted)]">
              {isPlatform ? "Admin console" : "Organization dashboard"}
            </p>
          </div>
          <button
            type="button"
            className="shrink-0 p-1 text-[var(--color-text-muted)] hover:text-foreground lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="size-4" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-4">
          <p className="mb-2 px-2.5 text-[10px] font-semibold tracking-[0.08em] text-[var(--color-text-muted)] uppercase">
            Manage
          </p>
          {nav.map(({ to, label, icon: Icon }) => {
            const active = pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-2.5 px-2.5 py-2 text-[13px] font-medium transition-colors",
                  active
                    ? "bg-[var(--brand-primary)] text-white"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-background-alt)] hover:text-foreground",
                )}
              >
                <Icon
                  className={cn(
                    "size-4 shrink-0",
                    active ? "opacity-95" : "opacity-70",
                  )}
                  strokeWidth={1.75}
                />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-[var(--color-border)] p-3">
          <div className="mb-2 flex items-center gap-2.5 px-1 py-1">
            <span className="flex size-8 shrink-0 items-center justify-center bg-[var(--brand-primary)] text-[11px] font-semibold text-white">
              {initials || "A"}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-medium text-foreground">
                {displayName}
              </p>
              <p className="truncate text-[11px] text-[var(--color-text-muted)]">
                {admin?.email}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-2.5 px-2.5 py-2 text-[13px] font-medium text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-background-alt)] hover:text-foreground"
          >
            <LogOut className="size-4 shrink-0 opacity-70" strokeWidth={1.75} />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex shrink-0 items-center gap-3 border-b border-[var(--color-border)] bg-white px-4 py-3 lg:px-6">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="shrink-0 border border-[var(--color-border)] bg-[var(--color-background-alt)] p-2 text-foreground lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="size-4" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-[var(--color-text-muted)]">
              {workspaceLabel}
            </p>
            <p className="truncate text-[14px] font-semibold text-foreground">
              {currentLabel}
            </p>
          </div>
        </header>

        <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
