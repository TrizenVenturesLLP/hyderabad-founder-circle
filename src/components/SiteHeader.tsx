import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { links } from "@/lib/links";
import { BrandLogo } from "@/components/BrandLogo";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

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
    let ticking = false;
    const update = () => {
      const next = window.scrollY > 8;
      setScrolled((prev) => (prev === next ? prev : next));
      ticking = false;
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-[background-color,border-color,box-shadow] duration-300",
        scrolled
          ? "border-[var(--color-border)] bg-[var(--color-background)]/95 shadow-[var(--shadow-small)] backdrop-blur-md"
          : "border-[var(--color-border)] bg-[var(--color-background)]/90 backdrop-blur-sm",
      )}
    >
      <div className="page-container flex h-[64px] items-center justify-between md:h-[68px]">
        <Link
          to="/"
          className="group flex items-center gap-2.5"
          onClick={() => setOpen(false)}
        >
          <BrandLogo className="h-9 w-9 transition-transform duration-200 group-hover:scale-105" />
          <span className="font-display text-[17px] tracking-tight text-foreground transition-colors duration-200 group-hover:text-[var(--brand-accent)] md:text-[18px]">
            Trizen Community
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="rounded-full px-3.5 py-2 text-[14px] font-medium text-[var(--color-text-secondary)] transition-colors duration-200 hover:text-foreground lg:px-4 lg:text-[15px]"
              activeProps={{
                className:
                  "rounded-full px-3.5 py-2 text-[14px] font-semibold text-foreground transition-colors duration-200 lg:px-4 lg:text-[15px]",
              }}
            >
              {n.label}
            </Link>
          ))}
          <a
            href={links.community}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary ml-3"
          >
            Join the Community
          </a>
        </nav>

        <button
          type="button"
          aria-label="Open menu"
          aria-expanded={open}
          aria-controls="mobile-nav"
          className="relative flex h-11 w-11 items-center justify-center rounded-full transition-colors duration-200 hover:bg-[var(--brand-primary-soft)] md:hidden"
          onClick={() => setOpen(true)}
        >
          <Menu className="h-5 w-5 text-foreground" strokeWidth={1.75} />
        </button>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          id="mobile-nav"
          side="right"
          className="z-[60] inset-0 flex h-dvh w-full max-w-none flex-col gap-0 border-0 bg-[var(--color-background)] p-0 text-foreground shadow-none sm:max-w-none"
        >
          <SheetHeader className="flex flex-row items-center gap-2.5 border-b border-[var(--color-border)] px-6 py-5 pr-14 text-left">
            <BrandLogo className="h-8 w-8" />
            <SheetTitle className="truncate font-display text-[17px] font-normal tracking-tight text-foreground sm:text-[18px]">
              Trizen Community
            </SheetTitle>
            <SheetDescription className="sr-only">
              Site navigation links
            </SheetDescription>
          </SheetHeader>

          <nav className="flex flex-1 flex-col justify-center px-6 py-10">
            <ul className="divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
              {nav.map((n) => (
                <li key={n.to}>
                  <Link
                    to={n.to}
                    className="flex items-center justify-between py-5 font-display text-[1.5rem] leading-none tracking-tight text-foreground/75 transition-colors duration-200 hover:text-foreground"
                    activeProps={{
                      className:
                        "flex items-center justify-between py-5 font-display text-[1.5rem] leading-none tracking-tight text-foreground transition-colors duration-200",
                    }}
                    onClick={() => setOpen(false)}
                  >
                    {n.label}
                    <span
                      className="text-sm text-[var(--color-text-muted)]"
                      aria-hidden
                    >
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="border-t border-[var(--color-border)] px-6 pt-5 pb-[max(1.75rem,env(safe-area-inset-bottom))]">
            <a
              href={links.community}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full"
              onClick={() => setOpen(false)}
            >
              Join the Community
            </a>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
