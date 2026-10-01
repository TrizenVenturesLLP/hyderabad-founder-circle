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
  ChevronRight,
  ClipboardList,
  ExternalLink,
  LogOut,
  Menu,
  MessageSquareText,
  BarChart3,
  Users,
  X,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { adminMe } from "@/lib/admin-api";
import { clearAdminToken, getAdminToken } from "@/lib/admin-auth";
import { BrandLogo } from "@/components/BrandLogo";
import { AdminShellContext } from "@/components/admin/AdminShellContext";
import { cn } from "@/lib/utils";

type NavItem = {
  to:
    | "/admin/events"
    | "/admin/registrations"
    | "/admin/analytics"
    | "/admin/hackathons"
    | "/admin/applications"
    | "/admin/contacts";
  label: string;
  icon: LucideIcon;
};
type NavGroup = { label: string; items: NavItem[] };

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

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  const isPlatform = admin?.role === "platform_admin";
  const loginPath = isPlatform ? "/admin-login" : "/org-login";

  const navGroups = useMemo((): NavGroup[] => {
    const events: NavItem[] = [
      { to: "/admin/events", label: "Events", icon: CalendarDays },
      { to: "/admin/registrations", label: "Registrations", icon: Users },
      { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    ];
    if (!isPlatform) return [{ label: "Manage", items: events }];
    return [
      { label: "Events", items: events },
      {
        label: "Programs",
        items: [{ to: "/admin/hackathons", label: "Hackathons", icon: Trophy }],
      },
      {
        label: "Community",
        items: [
          { to: "/admin/applications", label: "Applications", icon: ClipboardList },
          { to: "/admin/contacts", label: "Contacts", icon: MessageSquareText },
        ],
      },
    ];
  }, [isPlatform]);
  const nav = navGroups.flatMap((group) => group.items);

  function logout() {
    clearAdminToken();
    void navigate({ to: loginPath });
  }

  const currentLabel = nav.find((n) => pathname.startsWith(n.to))?.label ?? "Dashboard";

  const displayName = admin?.name?.trim() || "Admin";
  const workspaceLabel = isPlatform
    ? "Platform workspace"
    : admin?.organization?.name || "Organization";
  const consoleLabel = isPlatform ? "Admin console" : "Organization dashboard";
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || "")
    .join("");

  return (
    <AdminShellContext.Provider
      value={{ workspaceLabel: isPlatform ? consoleLabel : workspaceLabel }}
    >
      <div className="admin-shell flex h-dvh overflow-hidden bg-(--color-background-alt)">
        <div
          aria-hidden
          onClick={() => setMobileOpen(false)}
          className={cn(
            "fixed inset-0 z-40 bg-[rgba(15,23,42,0.35)] backdrop-blur-[2px] transition-opacity duration-300 lg:hidden",
            mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        />

        <aside
          id="admin-sidebar"
          className={cn(
            "fixed inset-y-0 right-0 z-50 flex h-dvh w-[280px] max-w-[85vw] shrink-0 flex-col border-l border-(--color-border) bg-white transition-[transform,visibility] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
            "lg:visible lg:static lg:w-[260px] lg:max-w-none lg:translate-x-0 lg:border-r lg:border-l-0 lg:shadow-none",
            mobileOpen
              ? "visible translate-x-0 shadow-(--shadow-large)"
              : "invisible translate-x-full",
          )}
        >
          <div className="flex items-center gap-2.5 px-5 pt-5 pb-4">
            <Link to="/" className="group flex min-w-0 flex-1 items-center gap-2.5">
              <BrandLogo className="h-9 w-9 shrink-0 transition-transform duration-200 group-hover:scale-105" />
              <span className="flex min-w-0 flex-col leading-tight">
                <span
                  className="truncate text-[15px] font-semibold tracking-tight text-foreground transition-colors group-hover:text-(--brand-accent)"
                  style={{ fontFamily: "var(--font-brand)" }}
                >
                  Trizen Community
                </span>
                <span className="truncate text-[10.5px] font-medium text-(--color-text-muted)">
                  {consoleLabel}
                </span>
              </span>
            </Link>
            <button
              type="button"
              className="shrink-0 rounded-lg p-1.5 text-(--color-text-muted) transition-colors hover:bg-(--color-background-alt) hover:text-foreground lg:hidden"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="mx-4 mb-2 flex items-center gap-2 rounded-xl border border-(--color-border) bg-(--color-surface-soft) px-3 py-2">
            <span className="size-1.5 shrink-0 rounded-full bg-emerald-500" aria-hidden />
            <span className="truncate text-[12px] font-medium text-(--color-text-secondary)">
              {workspaceLabel}
            </span>
          </div>

          <nav className="flex flex-1 flex-col gap-5 overflow-y-auto px-3 py-3">
            {navGroups.map((group) => (
              <div key={group.label} className="flex flex-col gap-1">
                <p className="mb-1 px-3 text-[11px] font-semibold tracking-[0.08em] text-(--brand-accent) uppercase">
                  {group.label}
                </p>
                {group.items.map(({ to, label, icon: Icon }) => {
                  const active = pathname.startsWith(to);
                  return (
                    <Link
                      key={to}
                      to={to}
                      onClick={() => setMobileOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-xl px-3 py-2 text-[13.5px] font-medium transition-colors duration-200",
                        active
                          ? "bg-(--brand-accent-soft) text-(--brand-primary)"
                          : "text-(--color-text-secondary) hover:bg-(--color-background-alt) hover:text-foreground",
                      )}
                    >
                      {active ? (
                        <span
                          className="absolute top-2 bottom-2 left-0 w-[3px] rounded-full bg-(--brand-accent)"
                          aria-hidden
                        />
                      ) : null}
                      <span
                        className={cn(
                          "inline-flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors duration-200",
                          active
                            ? "bg-(--brand-accent) text-white shadow-[0_6px_16px_-8px_var(--brand-accent)]"
                            : "bg-(--color-background-alt) text-(--color-text-secondary) group-hover:bg-(--brand-accent-soft) group-hover:text-(--brand-accent)",
                        )}
                      >
                        <Icon className="size-4" strokeWidth={1.75} />
                      </span>
                      {label}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>

          <div className="border-t border-(--color-border) p-3">
            <div className="mb-1 flex items-center gap-2.5 rounded-xl px-2 py-2">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--brand-accent),var(--brand-primary))] text-[12px] font-semibold text-white">
                {initials || "A"}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-foreground">{displayName}</p>
                <p className="truncate text-[11.5px] text-(--color-text-muted)">{admin?.email}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[13.5px] font-medium text-(--color-text-secondary) transition-colors hover:bg-red-50 hover:text-red-700"
            >
              <LogOut className="size-4 shrink-0" strokeWidth={1.75} />
              Sign out
            </button>
          </div>
        </aside>

        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden
            style={{
              background:
                "radial-gradient(ellipse 70% 45% at 90% 0%, color-mix(in oklab, var(--brand-accent) 9%, transparent) 0%, transparent 60%), radial-gradient(ellipse 45% 35% at 0% 100%, color-mix(in oklab, var(--brand-primary) 5%, transparent) 0%, transparent 55%)",
            }}
          />

          <header className="relative z-10 flex h-15 shrink-0 items-center gap-3 border-b border-(--color-border)/80 bg-white/80 px-4 backdrop-blur-md lg:px-8">
            <nav
              aria-label="Breadcrumb"
              className="flex min-w-0 flex-1 items-center gap-1.5 text-[13px]"
            >
              <span className="hidden truncate text-(--color-text-muted) sm:inline">
                {consoleLabel}
              </span>
              <ChevronRight
                className="hidden size-3.5 shrink-0 text-(--color-text-muted) sm:inline"
                aria-hidden
              />
              <span className="truncate font-semibold text-foreground">{currentLabel}</span>
            </nav>
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="btn-secondary group/cta min-h-9! gap-1.5 rounded-full! px-4! text-[12.5px]!"
            >
              <ExternalLink className="size-3.5" strokeWidth={1.75} aria-hidden />
              <span className="hidden sm:inline">View site</span>
            </a>
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="flex size-10 shrink-0 items-center justify-center rounded-xl text-foreground transition-colors hover:bg-(--color-background-alt) lg:hidden"
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              aria-controls="admin-sidebar"
            >
              <Menu className="size-5" strokeWidth={1.75} />
            </button>
          </header>

          <div className="relative min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain">
            <Outlet />
          </div>
        </div>
      </div>
    </AdminShellContext.Provider>
  );
}
