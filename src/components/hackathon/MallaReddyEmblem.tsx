import mallaReddyLogo from "@/assets/mallareddy-logo.png";
import { cn } from "@/lib/utils";

/** Crops the wide Malla Reddy banner (677×100) to just the round emblem on its left edge. */
export function MallaReddyEmblem({ className }: { className?: string }) {
  return (
    <span
      className={cn("inline-block aspect-[1.05] h-10 shrink-0 overflow-hidden bg-white", className)}
    >
      <img
        src={mallaReddyLogo}
        alt="Malla Reddy logo"
        width={677}
        height={100}
        loading="lazy"
        decoding="async"
        className="h-full w-auto max-w-none"
      />
    </span>
  );
}
