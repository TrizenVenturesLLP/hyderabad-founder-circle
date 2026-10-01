import { useEffect, useMemo, useState } from "react";
import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import { ClipboardPenLine, FileText, Info, LogOut, Menu, Trophy, X } from "lucide-react";
import { AppSelect } from "@/components/AppSelect";
import { JuryBrandLink } from "@/components/jury/JuryBrandLink";
import { JuryWorkspaceContext } from "@/components/jury/JuryWorkspaceContext";
import { clearJuryToken, getJuryToken } from "@/lib/jury-auth";
import { getJuryHackathons, getJuryMe, type JuryHackathon, type JuryUser } from "@/lib/jury-api";

const publicJuryPaths = new Set(["/jury/invitation", "/jury/signup", "/jury/login"]);

const sections = [
  {
    segment: "overview",
    to: "/jury/hackathons/$hackathonId/overview" as const,
    label: "Overview",
    icon: Info,
  },
  {
    segment: "problem-statements",
    to: "/jury/hackathons/$hackathonId/problem-statements" as const,
    label: "Problem Statements",
    icon: FileText,
  },
  {
    segment: "teams",
    to: "/jury/hackathons/$hackathonId/teams" as const,
    label: "Teams / Submissions",
    icon: ClipboardPenLine,
  },
  {
    segment: "leaderboard",
    to: "/jury/hackathons/$hackathonId/leaderboard" as const,
    label: "Leaderboard",
    icon: Trophy,
  },
];

function statusDotClass(status: string) {
  const key = status.toLowerCase();
  if (key === "active" || key === "live" || key === "open") return "bg-emerald-500";
  if (key === "upcoming" || key === "draft") return "bg-amber-400";
  return "bg-(--color-text-muted)";
}

export const Route = createFileRoute("/jury")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    if (publicJuryPaths.has(location.pathname)) return;
    if (!getJuryToken()) throw redirect({ to: "/jury/login" });
    try {
      await getJuryMe();
    } catch {
      clearJuryToken();
      throw redirect({ to: "/jury/login" });
    }
  },
  component: JuryLayout,
});

function JuryLayout() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  if (publicJuryPaths.has(pathname)) {
    return (
      <main id="main-content" className="min-h-dvh min-w-0 overflow-x-clip bg-(--color-background)">
        <Outlet />
      </main>
    );
  }
  return <JuryWorkspaceLayout pathname={pathname} />;
}

function JuryWorkspaceLayout({ pathname }: { pathname: string }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<JuryUser | null>(null);
  const [hackathons, setHackathons] = useState<JuryHackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileOpen]);

  useEffect(() => {
    void Promise.all([getJuryMe(), getJuryHackathons()])
      .then(([me, data]) => {
        setUser(me.user);
        setHackathons(data.items);
      })
      .catch((cause) => {
        if (!getJuryToken()) {
          void navigate({ to: "/jury/login", replace: true });
          return;
        }
        setError(cause instanceof Error ? cause.message : "Could not load your Jury workspace.");
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const [, , routeSegment, hackathonId = "", activeSegment = ""] = pathname.split("/");
  const inHackathon = routeSegment === "hackathons" && Boolean(hackathonId);
  const currentHackathon = useMemo(
    () =>
      inHackathon
        ? hackathons.find((item) => item.slug === hackathonId || item.id === hackathonId) || null
        : null,
    [hackathonId, hackathons, inHackathon],
  );
  const workspace = useMemo(
    () => ({ user, hackathons, currentHackathon, loading, error }),
    [currentHackathon, error, hackathons, loading, user],
  );

  const assignedHackathon = currentHackathon || hackathons[0] || null;
  const pendingCount = assignedHackathon?.pendingEvaluations ?? 0;
  const initials =
    user?.name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("") || "J";

  function switchHackathon(slug: string) {
    const section = sections.find((item) => item.segment === activeSegment) || sections[0];
    setMobileOpen(false);
    void navigate({ to: section.to, params: { hackathonId: slug } });
  }

  function logout() {
    clearJuryToken();
    void navigate({ to: "/jury/login", replace: true });
  }

  return (
    <JuryWorkspaceContext.Provider value={workspace}>
      <div className="min-h-dvh bg-(--color-background-alt) text-foreground lg:flex">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-(--color-border) bg-white/90 px-4 backdrop-blur-md lg:hidden">
          <JuryBrandLink subtitle="Jury" />
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            aria-controls="jury-sidebar"
            className="flex size-10 shrink-0 items-center justify-center rounded-xl text-foreground transition-colors hover:bg-(--color-background-alt)"
          >
            <Menu className="size-5" strokeWidth={1.75} />
          </button>
        </header>

        <div
          aria-hidden
          onClick={() => setMobileOpen(false)}
          className={`fixed inset-0 z-40 bg-[rgba(15,23,42,0.35)] backdrop-blur-[2px] transition-opacity duration-300 lg:hidden ${mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        />

        <aside
          id="jury-sidebar"
          aria-label="Jury sidebar"
          className={`fixed inset-y-0 right-0 z-50 flex w-[280px] max-w-[85vw] flex-col border-l border-(--color-border) bg-white transition-[transform,visibility] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:visible lg:right-auto lg:left-0 lg:w-[280px] lg:max-w-none lg:translate-x-0 lg:border-r lg:border-l-0 lg:shadow-none ${mobileOpen ? "visible translate-x-0 shadow-(--shadow-large)" : "invisible translate-x-full"}`}
        >
          <div className="flex items-center gap-2.5 px-4 pt-5 pb-3">
            <JuryBrandLink
              subtitle="Jury"
              className="flex-1"
              onNavigate={() => setMobileOpen(false)}
            />
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              className="shrink-0 rounded-lg p-1.5 text-(--color-text-muted) transition-colors hover:bg-(--color-background-alt) hover:text-foreground lg:hidden"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="mx-3 rounded-2xl border border-(--color-border) bg-(--color-surface-soft) p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[10.5px] font-semibold tracking-[0.08em] text-(--brand-accent) uppercase">
                Assigned
              </p>
              {assignedHackathon?.status ? (
                <span className="inline-flex items-center gap-1 text-[10.5px] font-medium text-(--color-text-secondary) capitalize">
                  <span
                    className={`size-1.5 rounded-full ${statusDotClass(assignedHackathon.status)}`}
                    aria-hidden
                  />
                  {assignedHackathon.status}
                </span>
              ) : null}
            </div>
            {hackathons.length > 1 ? (
              <AppSelect
                ariaLabel="Select Hackathon"
                value={currentHackathon?.slug || ""}
                onValueChange={switchHackathon}
                placeholder="Select a Hackathon"
                size="sm"
                className="mt-2"
                options={hackathons.map((item) => ({ value: item.slug, label: item.name }))}
              />
            ) : (
              <p className="mt-1 truncate text-[13.5px] font-semibold text-foreground">
                {loading ? "Loading…" : assignedHackathon?.name || "No assigned hackathon"}
              </p>
            )}
          </div>

          <nav
            aria-label="Jury navigation"
            className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-3"
          >
            <p className="mb-1.5 px-3 text-[11px] font-semibold tracking-[0.08em] text-(--brand-accent) uppercase">
              Judging
            </p>
            {sections.map(({ segment, to, label, icon: Icon }) => {
              const targetId = currentHackathon?.slug || hackathons[0]?.slug;
              const showPending = segment === "teams" && pendingCount > 0;
              const iconTile = (active: boolean) =>
                `inline-flex size-7 shrink-0 items-center justify-center rounded-lg transition-colors ${active ? "bg-(--brand-accent) text-white shadow-[0_6px_16px_-8px_var(--brand-accent)]" : "bg-(--color-background-alt) text-(--color-text-secondary) group-hover:bg-(--brand-accent-soft) group-hover:text-(--brand-accent)"}`;
              const rowClass = (active: boolean, disabled = false) =>
                `group relative flex w-full items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-[13px] font-medium ${disabled ? "cursor-not-allowed text-(--color-text-muted) opacity-60" : active ? "bg-(--brand-accent-soft) text-(--brand-primary)" : "text-(--color-text-secondary) transition-colors hover:bg-(--color-background-alt) hover:text-foreground"}`;
              const pendingBadge = showPending ? (
                <span
                  title={`${pendingCount} still to score`}
                  className="ml-auto inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 px-1.5 text-[10.5px] font-semibold text-amber-800 tabular-nums"
                >
                  <span className="sr-only">{pendingCount} still to score</span>
                  <span aria-hidden>{pendingCount}</span>
                </span>
              ) : null;
              if (!targetId) {
                return (
                  <span key={segment} aria-disabled="true" className={rowClass(false, true)}>
                    <span className={iconTile(false)}>
                      <Icon className="size-3.5" strokeWidth={1.75} />
                    </span>
                    <span className="min-w-0 flex-1 truncate">{label}</span>
                  </span>
                );
              }
              const active = inHackathon && activeSegment === segment;
              return (
                <Link
                  key={segment}
                  to={to}
                  params={{ hackathonId: targetId }}
                  onClick={() => setMobileOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={rowClass(active)}
                >
                  {active ? (
                    <span
                      className="absolute top-1.5 bottom-1.5 left-0 w-[3px] rounded-full bg-(--brand-accent)"
                      aria-hidden
                    />
                  ) : null}
                  <span className={iconTile(active)}>
                    <Icon className="size-3.5" strokeWidth={1.75} />
                  </span>
                  <span className="min-w-0 flex-1 truncate">{label}</span>
                  {pendingBadge}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-(--color-border) p-3">
            {user ? (
              <div className="flex items-center gap-2.5 px-2 py-1.5">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--brand-accent),var(--brand-primary))] text-[11px] font-semibold text-white">
                  {initials}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium">{user.name}</p>
                  <p className="truncate text-[11px] text-(--color-text-muted)" title={user.email}>
                    {user.email}
                  </p>
                </div>
              </div>
            ) : null}
            <button
              type="button"
              onClick={logout}
              className="mt-0.5 inline-flex w-full items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-[13px] font-medium text-(--color-text-secondary) transition-colors hover:bg-red-50 hover:text-red-700"
            >
              <LogOut className="size-3.5" strokeWidth={1.75} /> Sign out
            </button>
          </div>
        </aside>
        <main id="main-content" className="min-w-0 flex-1 p-4 sm:p-6 lg:ml-[280px] lg:p-8">
          <div className="mx-auto max-w-screen-2xl">
            <Outlet />
          </div>
        </main>
      </div>
    </JuryWorkspaceContext.Provider>
  );
}
