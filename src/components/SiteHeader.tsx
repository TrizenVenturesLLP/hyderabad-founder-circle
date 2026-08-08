import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { links } from "@/lib/links";
import { BrandLogo } from "@/components/BrandLogo";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
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

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <>
      <BrandLogo
        className={cn(
          "shrink-0 transition-transform duration-200 group-hover:scale-105",
          compact ? "h-8 w-8" : "h-9 w-9",
        )}
      />
      <span className="flex min-w-0 flex-col leading-tight">
        <span
          className={cn(
            "font-semibold tracking-tight text-foreground transition-colors duration-200 group-hover:text-[var(--brand-accent)]",
            compact ? "text-[15px]" : "text-[15px] md:text-[16px]",
          )}
          style={{ fontFamily: "var(--font-brand)" }}
        >
          Trizen Community
        </span>
        <span
          className={cn(
            "truncate font-medium text-[var(--color-text-muted)]",
            compact ? "text-[9.5px]" : "text-[9.5px] md:text-[10.5px]",
          )}
        >
          Hyderabad Founders Network
        </span>
      </span>
    </>
  );
}

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
          ? "border-[var(--color-border)] bg-white/90 shadow-[var(--shadow-small)] backdrop-blur-md"
          : "border-transparent bg-white/80 backdrop-blur-sm",
      )}
    >
      <div className="page-container flex h-[64px] items-center justify-between md:h-[68px]">
        <Link
          to="/"
          className="group flex min-w-0 items-center gap-2.5"
          onClick={() => setOpen(false)}
        >
          <BrandMark />
        </Link>

        <nav className="hidden items-center gap-0.5 md:flex">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="group/nav relative px-3.5 py-2 text-[14px] font-medium text-[var(--color-text-secondary)] transition-colors duration-250 hover:text-foreground lg:px-4 lg:text-[14.5px]"
              activeProps={{
                className:
                  "group/nav relative px-3.5 py-2 text-[14px] font-semibold text-foreground transition-colors duration-250 lg:px-4 lg:text-[14.5px] [&_.nav-underline]:scale-x-100",
              }}
            >
              {n.label}
              <span
                className="nav-underline pointer-events-none absolute inset-x-3.5 bottom-1 h-px origin-left scale-x-0 bg-[var(--brand-accent)] transition-transform duration-300 ease-out group-hover/nav:scale-x-100 lg:inset-x-4"
                aria-hidden
              />
            </Link>
          ))}
          <a
            href={links.community}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary ml-3 gap-1.5 !min-h-9 !px-3.5 !text-[12.5px]"
          >
            <WhatsAppIcon className="size-3.5" />
            Join the Community
          </a>
        </nav>

        <button
          type="button"
          aria-label="Open menu"
          aria-expanded={open}
          aria-controls="mobile-nav"
          className="relative flex h-11 w-11 items-center justify-center transition-colors duration-200 hover:bg-[var(--brand-primary-soft)] md:hidden"
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
            <div className="group flex min-w-0 items-center gap-2.5">
              <BrandMark compact />
            </div>
            <SheetTitle className="sr-only">Trizen Community</SheetTitle>
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
                    className="group flex items-center justify-between py-5 font-display text-[1.5rem] leading-none tracking-tight text-foreground/75 transition-colors duration-200 hover:text-foreground"
                    activeProps={{
                      className:
                        "group flex items-center justify-between py-5 font-display text-[1.5rem] leading-none tracking-tight text-foreground transition-colors duration-200",
                    }}
                    onClick={() => setOpen(false)}
                  >
                    {n.label}
                    <span
                      className="translate-x-0 text-sm text-[var(--color-text-muted)] transition-transform duration-250 group-hover:translate-x-1"
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
              className="btn-primary w-full gap-2 !min-h-11 !text-[13.5px]"
              onClick={() => setOpen(false)}
            >
              <WhatsAppIcon className="size-4" />
              Join the Community
            </a>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
