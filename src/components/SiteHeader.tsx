import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { links } from "@/lib/links";
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
        "sticky top-0 z-40 border-b transition-[background-color,border-color,backdrop-filter] duration-300",
        scrolled
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
          <span className="max-w-[12rem] truncate font-display text-[17px] tracking-tight text-foreground transition-colors duration-200 group-hover:text-primary sm:max-w-none sm:text-[18px]">
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
          <a
            href={links.community}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-3 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-[opacity,transform] duration-200 hover:opacity-95 active:scale-[0.98] lg:ml-4"
          >
            Join the Community
          </a>
        </nav>

        <button
          type="button"
          aria-label="Open menu"
          aria-expanded={open}
          aria-controls="mobile-nav"
          className="relative flex h-11 w-11 items-center justify-center rounded-full transition-colors duration-200 hover:bg-muted md:hidden"
          onClick={() => setOpen(true)}
        >
          <Menu className="h-5 w-5 text-foreground" strokeWidth={1.75} />
        </button>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          id="mobile-nav"
          side="right"
          className="z-[60] inset-0 flex h-dvh w-full max-w-none flex-col gap-0 border-0 bg-background p-0 text-foreground shadow-none sm:max-w-none"
        >
          <SheetHeader className="flex flex-row items-center gap-2.5 border-b border-border/70 px-6 py-5 pr-14 text-left">
            <span
              className="inline-block h-2 w-2 shrink-0 rounded-full bg-primary"
              aria-hidden
            />
            <SheetTitle className="truncate font-display text-[17px] font-normal tracking-tight text-foreground sm:text-[18px]">
              Hyderabad Founders Network
            </SheetTitle>
            <SheetDescription className="sr-only">
              Site navigation links
            </SheetDescription>
          </SheetHeader>

          <nav className="flex flex-1 flex-col justify-center px-6 py-10">
            <ul className="divide-y divide-border/70 border-y border-border/70">
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
                      className="text-sm text-muted-foreground/50"
                      aria-hidden
                    >
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="border-t border-border/70 px-6 pt-5 pb-[max(1.75rem,env(safe-area-inset-bottom))]">
            <a
              href={links.community}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-full bg-primary px-5 py-3.5 text-center text-sm font-medium text-primary-foreground transition-opacity duration-200 hover:opacity-90"
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
