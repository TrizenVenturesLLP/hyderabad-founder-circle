import { Link } from "@tanstack/react-router";
import { links } from "@/lib/links";
import { BrandLogo } from "@/components/BrandLogo";

const navLinks = [
  { to: "/community", label: "Community Guidelines" },
  { to: "/stories", label: "Stories" },
  { to: "/events", label: "Upcoming Events" },
  { to: "/about", label: "Partners" },
  { to: "/contact", label: "Contact" },
] as const;

const linkClassName =
  "inline-block whitespace-nowrap text-[14px] text-[var(--color-text-secondary)] transition-colors duration-200 hover:text-[var(--brand-accent)]";

const labelClassName =
  "text-[12px] font-medium tracking-[0.06em] text-[var(--brand-accent)]";

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
                  Hyderabad Founders Network
                </span>
              </span>
            </Link>
            <p className="mt-3 max-w-[36ch] text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
              An initiative of{" "}
              <a
                href={links.sponsor.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground underline-offset-4 transition-colors duration-200 hover:text-[var(--brand-accent)] hover:underline"
              >
                Trizen Ventures
              </a>
              .
            </p>
          </div>

          <div className="lg:col-span-3">
            <p className={labelClassName}>Community Links</p>
            <ul className="mt-3 space-y-2">
              {navLinks.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className={linkClassName}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="min-w-0 lg:col-span-3">
            <p className={labelClassName}>Email</p>
            <ul className="mt-3 space-y-2">
              <li>
                <a
                  href={`mailto:${links.email}`}
                  className="inline-block whitespace-nowrap text-[14px] text-[var(--color-text-secondary)] transition-colors duration-200 hover:text-[var(--brand-accent)]"
                >
                  {links.email}
                </a>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <p className={labelClassName}>Social Links</p>
            <ul className="mt-3 space-y-2">
              <li>
                <a
                  href={links.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClassName}
                >
                  LinkedIn
                </a>
              </li>
              <li>
                <a
                  href={links.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClassName}
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href={links.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClassName}
                >
                  Twitter
                </a>
              </li>
              <li>
                <a
                  href={links.community}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClassName}
                >
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--color-border)] bg-[var(--color-background-alt)]">
        <div className="page-container flex flex-col gap-2 py-3.5 text-[13px] text-[var(--color-text-secondary)] md:flex-row md:items-center md:justify-between md:py-4">
          <p>
            © {new Date().getFullYear()} Trizen Community
          </p>
          <nav
            aria-label="Legal"
            className="flex flex-wrap items-center gap-y-1 text-[13px]"
          >
            <Link
              to="/privacy"
              className="transition-colors duration-200 hover:text-[var(--brand-accent)]"
            >
              Privacy
            </Link>
            <span className="whitespace-pre text-[var(--color-border-strong)]">
              {" · "}
            </span>
            <Link
              to="/terms"
              className="transition-colors duration-200 hover:text-[var(--brand-accent)]"
            >
              Terms
            </Link>
            <span className="whitespace-pre text-[var(--color-border-strong)]">
              {" · "}
            </span>
            <span>Made in Hyderabad</span>
          </nav>
        </div>
      </div>
    </footer>
  );
}
