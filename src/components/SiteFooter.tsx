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

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-[oklch(0.19_0.02_55)] text-[oklch(0.93_0.01_80)]">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_0%,color-mix(in_oklab,var(--terracotta)_18%,transparent),transparent_55%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_100%_100%,color-mix(in_oklab,var(--saffron)_8%,transparent),transparent_45%)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-[1200px] px-4 py-12 sm:px-6 md:px-8 md:py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-10">
          <div className="sm:col-span-2 lg:col-span-4">
            <Link to="/" className="group inline-flex items-center gap-2.5">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full bg-primary transition-transform duration-300 group-hover:scale-125"
                aria-hidden
              />
              <span className="font-display text-[18px] tracking-tight text-[oklch(0.96_0.01_80)]">
                Hyderabad Founders Network
              </span>
            </Link>
            <p className="mt-3.5 max-w-sm text-[0.9375rem] leading-relaxed text-[oklch(0.72_0.02_70)]">
              A community of founders, operators and aspiring entrepreneurs in Hyderabad.
              Meeting the 3rd Saturday of every month.
            </p>
          </div>

          <div className="lg:col-span-2 lg:col-start-6">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[oklch(0.62_0.03_55)]">
              Community
            </p>
            <ul className="mt-4 space-y-3">
              {communityLinks.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-[0.9375rem] text-[oklch(0.88_0.01_80)] transition-colors hover:text-primary"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[oklch(0.62_0.03_55)]">
              More
            </p>
            <ul className="mt-4 space-y-3">
              {moreLinks.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-[0.9375rem] text-[oklch(0.88_0.01_80)] transition-colors hover:text-primary"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href={`mailto:${links.email}`}
                  className="text-[0.9375rem] text-[oklch(0.88_0.01_80)] transition-colors hover:text-primary"
                >
                  {links.email}
                </a>
              </li>
            </ul>
          </div>

          <div className="sm:col-span-2 lg:col-span-3 lg:border-l lg:border-[oklch(1_0_0/0.1)] lg:pl-10 xl:pl-12 ml-10">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[oklch(0.62_0.03_55)]">
              Supported by
            </p>
            <p className="mt-4 text-[0.9375rem] leading-relaxed text-[oklch(0.72_0.02_70)]">
              Venue & resources supported by{" "}
              <a
                href={links.sponsor.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[oklch(0.95_0.01_80)] underline-offset-4 transition-colors hover:text-primary hover:underline"
              >
                {links.sponsor.name}
              </a>
              . The community is owned and led by its members.
            </p>
          </div>
        </div>
      </div>

      <div className="relative border-t border-[oklch(1_0_0/0.1)]">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-3 px-4 py-4 text-[13px] text-[oklch(0.62_0.02_70)] sm:flex-row sm:items-center sm:justify-between sm:px-6 md:px-8">
          <p>© {new Date().getFullYear()} Hyderabad Founders Network. Community-owned.</p>
          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link
              to="/privacy"
              className="transition-colors hover:text-[oklch(0.93_0.01_80)]"
            >
              Privacy
            </Link>
            <Link
              to="/terms"
              className="transition-colors hover:text-[oklch(0.93_0.01_80)]"
            >
              Terms
            </Link>
            <span
              aria-hidden
              className="hidden h-3 w-px bg-[oklch(1_0_0/0.14)] sm:block"
            />
            <span>Made in Hyderabad · चाय & code</span>
          </nav>
        </div>
      </div>
    </footer>
  );
}
