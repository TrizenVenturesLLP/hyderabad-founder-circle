import { type ButtonHTMLAttributes } from "react";
import { CheckCircle2, Hourglass } from "lucide-react";
import type { Meetup } from "@/lib/events";
import { isMeetupCompleted, isRsvpOpen } from "@/lib/events";
import { useRsvp } from "@/components/rsvp/rsvp-context";
import { cn } from "@/lib/utils";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  event?: Meetup;
};

export function RsvpButton({
  event,
  className,
  children,
  onClick,
  ...props
}: Props) {
  const { openRsvp } = useRsvp();
  const closed = event ? !isRsvpOpen(event) : false;

  if (closed) {
    const completed = Boolean(event && isMeetupCompleted(event));
    const label = completed ? "Completed" : "Coming soon";
    const Icon = completed ? CheckCircle2 : Hourglass;
    return (
      <button
        type="button"
        disabled
        className={cn(
          className,
          "cursor-not-allowed gap-1.5 opacity-70 shadow-none hover:opacity-70",
        )}
        {...props}
      >
        <Icon className="size-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
        {label}
      </button>
    );
  }

  return (
    <button
      type="button"
      className={cn(className)}
      onClick={(e) => {
        onClick?.(e);
        openRsvp(event);
      }}
      {...props}
    >
      {children ?? "Register / RSVP"}
    </button>
  );
}
