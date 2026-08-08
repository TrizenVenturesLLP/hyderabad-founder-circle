import { ArrowUpRight, ExternalLink } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { links } from "@/lib/links";
import { trizenProducts, type TrizenProduct } from "@/lib/trizen-products";
import { useInView } from "@/hooks/use-in-view";
import { cn } from "@/lib/utils";

const scrollRevealOpts = {
  once: true,
  threshold: 0.14,
  rootMargin: "0px 0px -10% 0px",
} as const;

const AUTOPLAY_MS = 4200;

type Props = {
  eyebrow?: string;
  title?: string;
  description?: string;
  /** Softer presentation for homepage awareness (never louder than RSVP). */
  tone?: "default" | "quiet";
  showVisitCta?: boolean;
  showInitiativeLine?: boolean;
  className?: string;
  /** Use landing-page section rhythm (homepage). */
  spacious?: boolean;
  /** Limit cards (e.g. About can pass 3; default all). */
  limit?: number;
};

function ProductCard({ product }: { product: TrizenProduct }) {
  const Icon = product.icon;

  return (
    <div className="trizen-product-card group flex h-full flex-col overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card)] transition-[border-color,box-shadow] duration-300 hover:border-[color-mix(in_oklab,var(--brand-accent)_28%,var(--color-border))] hover:shadow-[var(--shadow-card-hover)]">
      <div className="relative aspect-[16/10] shrink-0 overflow-hidden bg-[var(--color-background-warm)]">
        {product.image ? (
          <img
            src={product.image}
            alt={`${product.name} preview`}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <div
            className="absolute inset-0 flex items-end p-4"
            style={{ background: product.soft }}
          >
            <span
              className="flex size-11 items-center justify-center rounded-xl text-white shadow-sm"
              style={{ background: product.accent }}
            >
              <Icon className="size-5" strokeWidth={1.75} />
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <p className="text-[11px] font-medium tracking-[0.06em] text-[var(--brand-accent)]">
          {product.category}
        </p>
        <h3 className="mt-1.5 font-display text-[1.08rem] tracking-tight text-foreground">
          {product.name}
        </h3>
        <p className="mt-2 flex-1 text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
          {product.desc}
        </p>
        <p className="mt-2 text-[11px] text-[var(--color-text-muted)]">
          {product.tagline}
        </p>
        <a
          href={product.href}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1 text-[13px] font-semibold text-[var(--brand-accent)] transition-colors hover:text-[var(--brand-accent-hover)]"
        >
          {product.cta}
          <ArrowUpRight
            className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            strokeWidth={2}
          />
        </a>
      </div>
    </div>
  );
}

export function TrizenProductsSection({
  eyebrow = "From Trizen Ventures",
  title = "Continue your journey with Trizen",
  description = "Products and community initiatives from the company behind this meetup.",
  tone = "default",
  showVisitCta = true,
  showInitiativeLine = true,
  className,
  spacious = false,
  limit,
}: Props) {
  const { ref, inView } = useInView<HTMLElement>(scrollRevealOpts);
  const products =
    limit != null ? trizenProducts.slice(0, limit) : trizenProducts;

  const scrollerRef = useRef<HTMLUListElement>(null);
  const activeRef = useRef(0);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const reduceMotionRef = useRef(false);

  useEffect(() => {
    reduceMotionRef.current =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const mq = window.matchMedia("(max-width: 767px)");
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  const scrollToIndex = (index: number, behavior: ScrollBehavior = "smooth") => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const card = scroller.children[index] as HTMLElement | undefined;
    if (!card) return;
    scroller.scrollTo({
      left: card.offsetLeft,
      behavior: reduceMotionRef.current ? "auto" : behavior,
    });
  };

  useEffect(() => {
    if (!isMobile) return;
    const scroller = scrollerRef.current;
    if (!scroller) return;

    let ticking = false;
    const updateActive = () => {
      ticking = false;
      const width = scroller.clientWidth;
      if (!width) return;
      const nearest = Math.round(scroller.scrollLeft / width);
      const clamped = Math.max(0, Math.min(products.length - 1, nearest));
      setActive((prev) => (prev === clamped ? prev : clamped));
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(updateActive);
    };

    scroller.addEventListener("scroll", onScroll, { passive: true });
    updateActive();
    return () => scroller.removeEventListener("scroll", onScroll);
  }, [products.length, isMobile]);

  useEffect(() => {
    if (
      !isMobile ||
      !inView ||
      paused ||
      products.length < 2 ||
      reduceMotionRef.current
    ) {
      return;
    }

    const id = window.setInterval(() => {
      const next = (activeRef.current + 1) % products.length;
      scrollToIndex(next);
    }, AUTOPLAY_MS);

    return () => window.clearInterval(id);
  }, [inView, paused, products.length, isMobile]);

  return (
    <section
      ref={ref}
      aria-labelledby="trizen-products-heading"
      className={cn(
        "border-b border-[var(--color-border)]",
        spacious ? "section-space" : "py-12 md:py-16",
        "bg-[var(--color-background)]",
        className,
      )}
    >
      <div className="page-container">
        <div
          className={cn(
            "reveal-up flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
            inView && "is-visible",
          )}
        >
          <div className="max-w-2xl">
            <p className="text-[12px] font-medium tracking-[0.06em] text-[var(--brand-accent)]">
              {eyebrow}
            </p>
            <h2
              id="trizen-products-heading"
              className={cn(
                "mt-3 font-display tracking-[-0.03em] text-foreground",
                tone === "quiet"
                  ? "text-[clamp(1.55rem,2.6vw,2.1rem)]"
                  : "text-[clamp(1.5rem,2.5vw,2rem)]",
              )}
            >
              {title}
            </h2>
            <p className="mt-2 max-w-xl text-[14px] leading-[1.65] text-[var(--color-text-secondary)]">
              {description}
            </p>
          </div>
          {showVisitCta ? (
            <a
              href={links.sponsor.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary shrink-0 gap-1.5"
            >
              Visit Trizen
              <ExternalLink className="size-3.5" strokeWidth={1.75} />
            </a>
          ) : null}
        </div>

        {/* Desktop / laptop: multi-card row */}
        <ul
          className={cn(
            "mt-8 hidden list-none items-stretch gap-4 md:grid md:grid-cols-2 lg:grid-cols-3 lg:gap-5",
            "stagger-in",
            inView && "is-visible",
          )}
        >
          {products.map((product) => (
            <li key={product.name} className="h-full">
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      </div>

      {/* Mobile: one card at a time */}
      <div
        className={cn(
          "reveal-up mt-8 md:hidden",
          inView && "is-visible",
        )}
        style={{ transitionDelay: inView ? "80ms" : undefined }}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => {
          window.setTimeout(() => setPaused(false), 5000);
        }}
      >
        <div className="page-container">
          <ul
            ref={scrollerRef}
            className="flex list-none snap-x snap-mandatory overflow-x-auto scroll-smooth pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            aria-label="Trizen products"
          >
            {products.map((product) => (
              <li
                key={product.name}
                className="w-full min-w-full shrink-0 snap-start snap-always"
              >
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        </div>

        {products.length > 1 ? (
          <div
            className="mt-5 flex items-center justify-center gap-2"
            role="tablist"
            aria-label="Product slides"
          >
            {products.map((product, i) => (
              <button
                key={product.name}
                type="button"
                role="tab"
                aria-selected={active === i}
                aria-label={`Show ${product.name}`}
                className={cn(
                  "h-2 rounded-full transition-[width,background-color] duration-300",
                  active === i
                    ? "w-6 bg-[var(--brand-accent)]"
                    : "w-2 bg-[var(--color-border-strong)] hover:bg-[var(--color-text-muted)]",
                )}
                onClick={() => {
                  setPaused(true);
                  setActive(i);
                  scrollToIndex(i);
                }}
              />
            ))}
          </div>
        ) : null}
      </div>

      {showInitiativeLine ? (
        <div className="page-container">
          <p
            className={cn(
              "reveal-up mt-8 text-center text-[13px] text-[var(--color-text-muted)]",
              inView && "is-visible",
            )}
            style={{ transitionDelay: inView ? "220ms" : undefined }}
          >
            An initiative of{" "}
            <a
              href={links.sponsor.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Trizen Ventures
            </a>
            .
          </p>
        </div>
      ) : null}
    </section>
  );
}
