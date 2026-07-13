import { type ButtonHTMLAttributes } from "react";
import type { Meetup } from "@/lib/events";
import { isRsvpOpen } from "@/lib/events";
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
  const comingSoon = event ? !isRsvpOpen(event) : false;

  if (comingSoon) {
    return (
      <button
        type="button"
        disabled
        className={cn(
          className,
          "cursor-not-allowed opacity-70 shadow-none hover:opacity-70",
        )}
        {...props}
      >
        Coming soon
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
