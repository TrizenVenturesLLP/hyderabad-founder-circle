import { Link } from "@tanstack/react-router";
import { links } from "@/lib/links";
import { BrandLogo } from "@/components/BrandLogo";

const linkClassName =
  "inline-block whitespace-nowrap text-[14px] text-[var(--color-text-secondary)] transition-colors duration-200 hover:text-[var(--brand-accent)]";

const labelClassName = "text-[12px] font-medium tracking-[0.06em] text-[var(--brand-accent)]";

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)]">
      <div className="page-container py-10 md:py-14">
        <div className="grid gap-8 sm:grid-cols-2 sm:gap-8 lg:grid-cols-12 lg:gap-x-8">
          <div className="sm:col-span-2 lg:col-span-4">
            <Link to="/" className="group inline-flex items-center gap-2.5">
              <BrandLogo className="h-8 w-8 shrink-0 transition-transform duration-200 group-hover:scale-105" />
              <span className="flex min-w-0 flex-col leading-tight">
                <span
                  className="text-[16px] font-semibold tracking-tight text-[var(--color-text-primary)] transition-colors duration-200 group-hover:text-[var(--brand-accent)] md:text-[17px]"
                  style={{ fontFamily: "var(--font-brand)" }}
                >
                  Trizen Community
                </span>
                <span className="text-[10.5px] font-medium text-[var(--color-text-muted)]">
                  Event hosting platform
                </span>
              </span>
            </Link>
            <p className="mt-3 max-w-[38ch] text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
              Discover events from communities across Hyderabad. Register per event — no public
              attendee account required.
            </p>
          </div>

          <div className="lg:col-span-2">
            <p className={labelClassName}>Explore</p>
            <ul className="mt-3 space-y-2">
              <li>
                <Link to="/events" className={linkClassName}>
                  Events
                </Link>
              </li>
              <li>
                <Link to="/communities" className={linkClassName}>
                  Communities
                </Link>
              </li>
              <li>
                <Link to="/host" className={linkClassName}>
                  Host an Event
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <p className={labelClassName}>Account</p>
            <ul className="mt-3 space-y-2">
              <li>
                <Link to="/org-login" className={linkClassName}>
                  Organizer Login
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <p className={labelClassName}>Company</p>
            <ul className="mt-3 space-y-2">
              <li>
                <Link to="/about" className={linkClassName}>
                  About
                </Link>
              </li>
              <li>
                <Link to="/contact" className={linkClassName}>
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <p className={labelClassName}>Legal</p>
            <ul className="mt-3 space-y-2">
              <li>
                <Link to="/privacy" className={linkClassName}>
                  Privacy
                </Link>
              </li>
              <li>
                <Link to="/terms" className={linkClassName}>
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-[var(--color-border)] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[13px] text-[var(--color-text-secondary)]">
            © {new Date().getFullYear()} Trizen Community · Made in Hyderabad
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <a
              href={links.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClassName}
            >
              LinkedIn
            </a>
            <a
              href={links.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClassName}
            >
              Instagram
            </a>
            <a href={`mailto:${links.email}`} className={linkClassName}>
              {links.email}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
