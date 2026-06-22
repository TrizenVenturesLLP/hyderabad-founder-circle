import { Link } from "@tanstack/react-router";
import { useState } from "react";

const nav = [
  { to: "/events", label: "Events" },
  { to: "/community", label: "Community" },
  { to: "/stories", label: "Stories" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link to="/" className="group flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-primary" aria-hidden />
          <span className="font-display text-[17px] tracking-tight text-foreground">
            Hyderabad Founders Network
          </span>
        </Link>
        <nav className="hidden items-center gap-7 md:flex">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground" }}
            >
              {n.label}
            </Link>
          ))}
          <Link
            to="/community"
            className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Join the Community
          </Link>
        </nav>
        <button
          aria-label="Menu"
          className="md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          <div className="space-y-1.5">
            <span className="block h-px w-6 bg-foreground" />
            <span className="block h-px w-6 bg-foreground" />
            <span className="block h-px w-6 bg-foreground" />
          </div>
        </button>
      </div>
      {open && (
        <div className="border-t border-border/60 md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-4">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="rounded-md px-2 py-2 text-foreground hover:bg-muted"
                onClick={() => setOpen(false)}
              >
                {n.label}
              </Link>
            ))}
            <Link
              to="/community"
              className="mt-2 rounded-full bg-primary px-4 py-2.5 text-center text-sm font-medium text-primary-foreground"
              onClick={() => setOpen(false)}
            >
              Join the Community
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
