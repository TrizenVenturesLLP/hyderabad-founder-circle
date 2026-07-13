import { Link } from "@tanstack/react-router";
import { links } from "@/lib/links";

const communityLinks = [
  { to: "/events", label: "Events" },
  { to: "/community", label: "Members" },
  { to: "/stories", label: "Stories" },
] as const;

const moreLinks = [
  { to: "/about", label: "About & Partners" },
  { to: "/contact", label: "Contact" },
] as const;

const linkClassName =
  "inline-block text-[13px] text-[oklch(0.88_0.012_80)] transition-[color,transform] duration-200 ease-out hover:translate-x-0.5 hover:text-primary md:text-[14px]";

const labelClassName =
  "text-[10px] font-medium uppercase tracking-[0.14em] text-[oklch(0.68_0.025_55)] md:text-[11px]";

export function SiteFooter() {
  return (
    <footer className="bg-[oklch(0.19_0.02_55)] text-[oklch(0.93_0.01_80)]">
      <div className="mx-auto max-w-[1240px] px-5 py-12 sm:px-6 md:px-8 md:py-14">
        <div className="grid gap-9 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-9 lg:grid-cols-12 lg:gap-x-12 xl:gap-x-14">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-5">
            <Link
              to="/"
              className="group inline-flex items-center gap-2"
            >
              <span
                className="mt-0.5 inline-block h-2 w-2 shrink-0 rounded-full bg-primary transition-transform duration-200 group-hover:scale-110"
                aria-hidden
              />
              <span className="font-display text-[18px] font-semibold leading-tight tracking-tight text-[oklch(0.97_0.01_80)] md:text-[20px]">
                Hyderabad Founders Network
              </span>
            </Link>
            <p className="mt-3 max-w-[36ch] text-[13px] leading-[1.6] text-[oklch(0.74_0.02_70)] md:text-[14px]">
              A community of founders, operators and aspiring entrepreneurs in
              Hyderabad. Meeting the 3rd Saturday of every month.
            </p>
          </div>

          {/* Community */}
          <div className="lg:col-span-2">
            <p className={labelClassName}>Community</p>
            <ul className="mt-4 space-y-2.5 md:mt-5">
              {communityLinks.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className={linkClassName}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* More */}
          <div className="lg:col-span-2">
            <p className={labelClassName}>More</p>
            <ul className="mt-4 space-y-2.5 md:mt-5">
              {moreLinks.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className={linkClassName}>
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href={`mailto:${links.email}`}
                  className={`${linkClassName} break-all`}
                >
                  {links.email}
                </a>
              </li>
            </ul>
          </div>

          {/* Supported by */}
          <div className="sm:col-span-2 lg:col-span-3">
            <p className={labelClassName}>Supported by</p>
            <p className="mt-4 max-w-[38ch] text-[13px] leading-[1.6] text-[oklch(0.74_0.02_70)] md:mt-5 md:text-[14px]">
              Venue & resources supported by{" "}
              <a
                href={links.sponsor.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[oklch(0.96_0.01_80)] transition-colors duration-200 hover:text-primary"
              >
                {links.sponsor.name}
              </a>
              . The community is owned and led by its members.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[oklch(1_0_0/0.1)]">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-2.5 px-5 py-4 text-[12px] text-[oklch(0.66_0.02_70)] sm:px-6 md:flex-row md:items-center md:justify-between md:px-8 md:py-5 md:text-[13px]">
          <p>© {new Date().getFullYear()} Hyderabad Founders Network. Community-owned.</p>
          <nav
            aria-label="Legal"
            className="flex flex-wrap items-center text-[12px] md:text-[13px]"
          >
            <Link
              to="/privacy"
              className="transition-colors duration-200 hover:text-[oklch(0.93_0.01_80)]"
            >
              Privacy
            </Link>
            <span className="whitespace-pre text-[oklch(1_0_0/0.22)]">
              {" · "}
            </span>
            <Link
              to="/terms"
              className="transition-colors duration-200 hover:text-[oklch(0.93_0.01_80)]"
            >
              Terms
            </Link>
            <span className="whitespace-pre text-[oklch(1_0_0/0.22)]">
              {" · "}
            </span>
            <span>Made in Hyderabad</span>
            <span className="whitespace-pre text-[oklch(1_0_0/0.22)]">
              {" · "}
            </span>
            <span>चाय & code</span>
          </nav>
        </div>
      </div>
    </footer>
  );
}
