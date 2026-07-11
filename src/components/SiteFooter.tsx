import { Link } from "@tanstack/react-router";
import { links } from "@/lib/links";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/60">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-primary" aria-hidden />
            <span className="font-display text-base text-foreground">
              Hyderabad Founders Network
            </span>
          </div>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            A community of founders, operators and aspiring entrepreneurs in Hyderabad.
            Meeting the 3rd Saturday of every month.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Community</p>
            <Link to="/events" className="block hover:text-primary">Events</Link>
            <Link to="/community" className="block hover:text-primary">Members</Link>
            <Link to="/stories" className="block hover:text-primary">Stories</Link>
          </div>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">More</p>
            <Link to="/about" className="block hover:text-primary">About & Partners</Link>
            <Link to="/contact" className="block hover:text-primary">Contact</Link>
            <a href={`mailto:${links.email}`} className="block hover:text-primary">{links.email}</a>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          <p className="text-xs uppercase tracking-wider">Supported by</p>
          <p className="mt-2">
            Venue & resources supported by{" "}
            <a href={links.sponsor.url} className="text-foreground underline-offset-4 hover:underline">
              {links.sponsor.name}
            </a>
            . The community is owned and led by its members.
          </p>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-3 px-5 py-5 text-xs text-muted-foreground md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} Hyderabad Founders Network. Community-owned.</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link to="/terms" className="hover:text-foreground">Terms</Link>
            <span>Made in Hyderabad · चाय & code</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
