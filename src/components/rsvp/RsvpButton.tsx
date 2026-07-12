import { type ButtonHTMLAttributes } from "react";
import type { Meetup } from "@/lib/events";
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
