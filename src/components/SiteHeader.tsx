import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/events", label: "Events" },
  { to: "/community", label: "Community" },
  { to: "/stories", label: "Stories" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-[background-color,border-color,backdrop-filter] duration-300",
        scrolled || open
          ? "border-border/70 bg-background/88 backdrop-blur-xl"
          : "border-border/40 bg-background/72 backdrop-blur-md",
      )}
    >
      <div className="mx-auto flex h-[68px] max-w-[1200px] items-center justify-between px-4 sm:px-6 md:h-[72px] md:px-8">
        <Link
          to="/"
          className="group flex items-center gap-2.5"
          onClick={() => setOpen(false)}
        >
          <span
            className="inline-block h-2.5 w-2.5 rounded-full bg-primary transition-transform duration-300 group-hover:scale-125"
            aria-hidden
          />
          <span className="font-display text-[18px] tracking-tight text-foreground transition-colors duration-200 group-hover:text-primary">
            Hyderabad Founders Network
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 md:flex lg:gap-1">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="relative px-3.5 py-2 text-sm text-muted-foreground transition-colors duration-200 after:absolute after:inset-x-3.5 after:bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-primary after:transition-transform after:duration-300 after:ease-out hover:text-foreground hover:after:scale-x-100 lg:px-4"
              activeProps={{
                className:
                  "relative px-3.5 py-2 text-sm font-medium text-foreground transition-colors duration-200 after:absolute after:inset-x-3.5 after:bottom-1 after:h-px after:origin-left after:scale-x-100 after:bg-primary after:transition-transform after:duration-300 after:ease-out lg:px-4",
              }}
            >
              {n.label}
            </Link>
          ))}
          <Link
            to="/community"
            className="ml-3 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-[opacity,transform] duration-200 hover:opacity-95 active:scale-[0.98] lg:ml-4"
          >
            Join the Community
          </Link>
        </nav>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="relative flex h-11 w-11 items-center justify-center rounded-full transition-colors duration-200 hover:bg-muted md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">{open ? "Close" : "Menu"}</span>
          <span className="relative block h-3.5 w-5">
            <span
              className={cn(
                "absolute left-0 block h-px w-5 bg-foreground transition-all duration-300 ease-out",
                open ? "top-1.5 rotate-45" : "top-0",
              )}
            />
            <span
              className={cn(
                "absolute left-0 top-1.5 block h-px w-5 bg-foreground transition-all duration-300 ease-out",
                open ? "opacity-0" : "opacity-100",
              )}
            />
            <span
              className={cn(
                "absolute left-0 block h-px w-5 bg-foreground transition-all duration-300 ease-out",
                open ? "top-1.5 -rotate-45" : "top-3",
              )}
            />
          </span>
        </button>
      </div>

      <div
        className={cn(
          "overflow-hidden border-t border-border/60 transition-[max-height,opacity] duration-300 ease-out md:hidden",
          open ? "max-h-96 opacity-100" : "max-h-0 border-transparent opacity-0",
        )}
      >
        <div className="mx-auto flex max-w-[1200px] flex-col gap-0.5 px-4 py-3 sm:px-6">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="rounded-lg px-3 py-3 text-sm text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground"
              activeProps={{
                className:
                  "rounded-lg bg-secondary/60 px-3 py-3 text-sm font-medium text-foreground transition-colors duration-200",
              }}
              onClick={() => setOpen(false)}
            >
              {n.label}
            </Link>
          ))}
          <Link
            to="/community"
            className="mt-2 rounded-full bg-primary px-4 py-3 text-center text-sm font-medium text-primary-foreground transition-opacity duration-200 hover:opacity-90"
            onClick={() => setOpen(false)}
          >
            Join the Community
          </Link>
        </div>
      </div>
    </header>
  );
}
