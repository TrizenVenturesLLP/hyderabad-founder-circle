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
  "text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--brand-accent)]";

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)]">
      <div className="page-container py-8 md:py-10">
        <div className="grid gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-12 lg:gap-x-8">
          <div className="sm:col-span-2 lg:col-span-4">
            <Link to="/" className="group inline-flex items-center gap-2.5">
              <BrandLogo className="h-8 w-8 transition-transform duration-200 group-hover:scale-105" />
              <span className="font-display text-[17px] font-semibold leading-tight tracking-tight text-[var(--color-text-primary)] md:text-[18px]">
                Trizen Community
              </span>
            </Link>
            <p className="mt-2.5 max-w-[40ch] text-[13px] leading-[1.55] text-[var(--color-text-secondary)]">
              Hyderabad Founders Network.
              <br />
              An initiative of Trizen Ventures.
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

      <div className="border-t border-white/10 bg-black">
        <div className="page-container flex flex-col gap-2 py-3.5 text-[13px] text-white/65 md:flex-row md:items-center md:justify-between md:py-4">
          <p className="text-white/70">
            © {new Date().getFullYear()} Trizen Community. An initiative of{" "}
            <a
              href={links.sponsor.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-white transition-colors duration-200 hover:text-[var(--brand-accent)]"
            >
              Trizen Ventures
            </a>
            .
          </p>
          <nav
            aria-label="Legal"
            className="flex flex-wrap items-center gap-y-1 text-[13px]"
          >
            <Link
              to="/privacy"
              className="transition-colors duration-200 hover:text-white"
            >
              Privacy
            </Link>
            <span className="whitespace-pre text-white/30">{" · "}</span>
            <Link
              to="/terms"
              className="transition-colors duration-200 hover:text-white"
            >
              Terms
            </Link>
            <span className="whitespace-pre text-white/30">{" · "}</span>
            <span>Made in Hyderabad</span>
            <span className="whitespace-pre text-white/30">{" · "}</span>
            <span>चाय & code</span>
          </nav>
        </div>
      </div>
    </footer>
  );
}
