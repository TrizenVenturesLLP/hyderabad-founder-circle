import { useEffect, useRef, useState } from "react";

type Options = IntersectionObserverInit & {
  /** Once visible, stay visible and stop observing. Default true. */
  once?: boolean;
};

export function useInView<T extends HTMLElement = HTMLDivElement>(
  options: Options = {},
) {
  const { once = true, threshold = 0.14, rootMargin = "0px 0px -10% 0px", ...rest } =
    options;
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      setInView(true);
      return;
    }

    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          cancelAnimationFrame(frame);
          frame = requestAnimationFrame(() => setInView(true));
          if (once) observer.unobserve(el);
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold, rootMargin, ...rest },
    );

    observer.observe(el);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [once, threshold, rootMargin]);

  return { ref, inView };
}
