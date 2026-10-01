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
            "fixed inset-y-0 left-0 z-50 flex h-dvh w-[248px] max-w-[85vw] shrink-0 flex-col border-r border-(--color-border) bg-white transition-[transform,visibility] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
            "lg:visible lg:static lg:w-[232px] lg:max-w-none lg:translate-x-0 lg:shadow-none",
            mobileOpen
              ? "visible translate-x-0 shadow-(--shadow-large)"
              : "invisible -translate-x-full",
          )}
        >
          <div className="flex h-15 shrink-0 items-center gap-2.5 border-b border-(--color-border) px-4">
            <Link to="/" className="group flex min-w-0 flex-1 items-center gap-2.5">
              <BrandLogo className="size-8 shrink-0" />
              <span className="flex min-w-0 flex-col leading-tight">
                <span
                  className="truncate text-[14px] font-semibold tracking-tight text-foreground transition-colors group-hover:text-(--brand-accent)"
                  style={{ fontFamily: "var(--font-brand)" }}
                >
                  Trizen Community
                </span>
                <span className="flex items-center gap-1.5 truncate text-[10.5px] font-medium text-(--color-text-muted)">
                  <span className="size-1.5 shrink-0 rounded-full bg-emerald-500" aria-hidden />
                  <span className="truncate">{isPlatform ? consoleLabel : workspaceLabel}</span>
                </span>
              </span>
            </Link>
            <button
              type="button"
              className="inline-flex size-8 shrink-0 items-center justify-center text-(--color-text-muted) transition-colors hover:bg-(--color-background-alt) hover:text-foreground lg:hidden"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <X className="size-4.5" />
            </button>
          </div>

          <nav
            aria-label="Admin"
            className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-2.5 py-4 [scrollbar-width:thin]"
          >
            {navGroups.map((group) => (
              <div key={group.label} className="flex flex-col gap-0.5">
                <p className="mb-1 px-2.5 text-[10.5px] font-semibold tracking-[0.08em] text-(--color-text-muted) uppercase">
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
                        "relative flex h-9 items-center gap-2.5 px-2.5 text-[13px] font-medium transition-colors duration-150",
                        active
                          ? "bg-(--brand-accent-soft) font-semibold text-(--brand-primary)"
                          : "text-(--color-text-secondary) hover:bg-(--color-background-alt) hover:text-foreground",
                      )}
                    >
                      {active ? (
                        <span
                          className="absolute inset-y-1.5 left-0 w-[3px] bg-(--brand-accent)"
                          aria-hidden
                        />
                      ) : null}
                      <Icon
                        className={cn(
                          "size-4 shrink-0",
                          active ? "text-(--brand-accent)" : "text-(--color-text-muted)",
                        )}
                        strokeWidth={1.9}
                      />
                      <span className="truncate">{label}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>

          <div className="shrink-0 border-t border-(--color-border) p-2.5">
            <div className="flex items-center gap-2.5 px-1.5 py-1">
              <span className="flex size-8 shrink-0 items-center justify-center bg-(--brand-primary) text-[11.5px] font-semibold text-white">
                {initials || "A"}
              </span>
              <div className="min-w-0 flex-1 leading-tight">
                <p className="truncate text-[12.5px] font-semibold text-foreground">
                  {displayName}
                </p>
                <p className="truncate text-[11px] text-(--color-text-muted)" title={admin?.email}>
                  {admin?.email}
                </p>
              </div>
              <button
                type="button"
                onClick={logout}
                aria-label="Sign out"
                title="Sign out"
                className="inline-flex size-8 shrink-0 items-center justify-center text-(--color-text-muted) transition-colors hover:bg-red-50 hover:text-red-700"
              >
                <LogOut className="size-4" strokeWidth={1.9} />
              </button>
            </div>
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
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="-ml-1.5 flex size-9 shrink-0 items-center justify-center text-foreground transition-colors hover:bg-(--color-background-alt) lg:hidden"
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              aria-controls="admin-sidebar"
            >
              <Menu className="size-5" strokeWidth={1.75} />
            </button>
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
              className="btn-secondary group/cta min-h-9! gap-1.5 px-4! text-[12.5px]!"
            >
              <ExternalLink className="size-3.5" strokeWidth={1.75} aria-hidden />
              <span className="hidden sm:inline">View site</span>
            </a>
          </header>

          <div className="relative min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain">
            <Outlet />
          </div>
        </div>
      </div>
    </AdminShellContext.Provider>
  );
}
