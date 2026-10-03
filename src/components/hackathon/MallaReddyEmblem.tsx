import mallaReddyEmblem from "@/assets/mallareddy-emblem.png";
import { cn } from "@/lib/utils";

export function MallaReddyEmblem({ className }: { className?: string }) {
  return (
    <img
      src={mallaReddyEmblem}
      alt="Malla Reddy logo"
      width={256}
      height={214}
      loading="lazy"
      decoding="async"
      className={cn("inline-block h-10 w-auto shrink-0 object-contain", className)}
    />
  );
}
