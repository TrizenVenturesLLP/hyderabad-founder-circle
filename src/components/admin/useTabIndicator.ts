import { useLayoutEffect, useState, type CSSProperties } from "react";

type IndicatorPosition = { left: number; width: number };

// Remembered per tab group so the indicator can glide from the previous tab
// even when switching tabs remounts the page (separate routes).
const lastPositions = new Map<string, IndicatorPosition>();

function toStyle(position: IndicatorPosition, animate: boolean): CSSProperties {
  return {
    width: position.width,
    transform: `translateX(${position.left}px)`,
    opacity: 1,
    transition: animate ? undefined : "none",
  };
}

export function useTabIndicator<T extends HTMLElement = HTMLDivElement>(
  groupKey: string,
  activeKey: string,
) {
  const [container, containerRef] = useState<T | null>(null);
  const [indicatorStyle, setIndicatorStyle] = useState<CSSProperties>(() => {
    const last = lastPositions.get(groupKey);
    return last ? toStyle(last, false) : { opacity: 0, transition: "none" };
  });

  useLayoutEffect(() => {
    if (!container) return;
    const element: HTMLElement = container;

    function measure(animate: boolean) {
      const active = element.querySelector<HTMLElement>(
        `[data-tab-key="${CSS.escape(activeKey)}"]`,
      );
      if (!active) return;
      const next = { left: active.offsetLeft, width: active.offsetWidth };
      const hadPrevious = lastPositions.has(groupKey);
      lastPositions.set(groupKey, next);
      setIndicatorStyle(toStyle(next, animate && hadPrevious));
    }

    const frame = requestAnimationFrame(() => measure(true));

    let skipFirstResize = true;
    const observer = new ResizeObserver(() => {
      if (skipFirstResize) {
        skipFirstResize = false;
        return;
      }
      measure(false);
    });
    observer.observe(element);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [container, groupKey, activeKey]);

  return { containerRef, indicatorStyle };
}

export const tabIndicatorClass =
  "pointer-events-none absolute bottom-0 left-0 h-0.5 bg-(--brand-accent) transition-[transform,width,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none";
