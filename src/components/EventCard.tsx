import { Link } from "@tanstack/react-router";
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  Hourglass,
  MapPin,
  Ticket,
} from "lucide-react";
import { RsvpButton } from "@/components/rsvp/RsvpButton";
import {
  DATE_TBC_LABEL,
  isMeetupCompleted,
  isMeetupDateConfirmed,
  isRsvpOpen,
  meetupCoverImage,
  meetupCoverObjectClass,
  meetupDateLabel,
  meetupStatusLabel,
  type Meetup,
} from "@/lib/events";
import { cn } from "@/lib/utils";

function statusMeta(meetup: Meetup) {
  if (isRsvpOpen(meetup)) {
    return {
      label: "Open",
      tone: "bg-[var(--brand-accent)] text-white",
      Icon: Ticket,
    };
  }
  if (isMeetupCompleted(meetup)) {
    return {
      label: meetupStatusLabel(meetup),
      tone: "bg-black/55 text-white",
      Icon: CheckCircle2,
    };
  }
  return {
    label: meetupStatusLabel(meetup),
    tone: "bg-black/55 text-white",
    Icon: Hourglass,
  };
}

export function EventCard({
  meetup,
  className,
}: {
  meetup: Meetup;
  className?: string;
}) {
  const confirmed = isMeetupDateConfirmed(meetup);
  const day = confirmed ? new Date(meetup.dateISO + "T12:00:00") : null;
  const dayNum = day?.getDate();
  const monthShort = day
    ?.toLocaleDateString("en-IN", { month: "short" })
    .toUpperCase();
  const weekday = day?.toLocaleDateString("en-IN", { weekday: "short" });
  const { label, tone, Icon } = statusMeta(meetup);
  const cover = meetupCoverImage(meetup);
  const open = isRsvpOpen(meetup);

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)] transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-[var(--color-border-strong)]",
        className,
      )}
    >
      <Link
        to="/events/$slug"
        params={{ slug: meetup.slug }}
        className="relative block aspect-[4/3] overflow-hidden bg-[var(--color-background-alt)]"
      >
        <img
          src={cover}
          alt=""
          width={800}
          height={600}
          loading="lazy"
          decoding="async"
          className={cn(
            "size-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]",
            meetupCoverObjectClass(meetup),
          )}
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-[linear-gradient(to_top,rgba(8,10,24,0.72)_0%,rgba(8,10,24,0.15)_42%,transparent_68%)]"
          aria-hidden
        />

        <span
          className={cn(
            "absolute left-3 top-3 inline-flex items-center gap-1 px-2 py-1 text-[10px] font-semibold tracking-[0.06em]",
            tone,
          )}
        >
          <Icon className="size-3" strokeWidth={2} aria-hidden />
          {label}
        </span>

        <div className="absolute inset-x-0 bottom-0 p-3.5 md:p-4">
          {meetup.organization?.name ? (
            <p className="text-[11px] font-medium tracking-[0.04em] text-white/75">
              {meetup.organization.name}
            </p>
          ) : null}
          <h3 className="mt-1 line-clamp-2 font-display text-[1.05rem] leading-snug tracking-tight text-white md:text-[1.12rem]">
            {meetup.title}
          </h3>
          <p className="mt-1.5 text-[12px] font-medium text-white/85">
            {confirmed
              ? `${weekday} · ${dayNum} ${monthShort}`
              : DATE_TBC_LABEL}
          </p>
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4 md:px-4 md:pb-4 md:pt-3.5">
        <div className="space-y-1.5 text-[13px] text-[var(--color-text-secondary)]">
          <p className="inline-flex min-w-0 items-center gap-1.5">
            <Clock
              className="size-3.5 shrink-0 text-[var(--brand-accent)]"
              strokeWidth={1.75}
              aria-hidden
            />
            <span className="truncate">{meetup.time}</span>
          </p>
          <p className="inline-flex min-w-0 items-center gap-1.5">
            <MapPin
              className="size-3.5 shrink-0 text-[var(--brand-accent)]"
              strokeWidth={1.75}
              aria-hidden
            />
            <span className="line-clamp-1">
              {meetup.venue}
              {meetup.area ? ` · ${meetup.area}` : `, ${meetup.city}`}
            </span>
          </p>
        </div>

        <div className="mt-auto flex items-center gap-2 pt-1">
          <Link
            to="/events/$slug"
            params={{ slug: meetup.slug }}
            className={cn(
              "btn-secondary min-w-0 flex-1 justify-center !min-h-10 !px-3 !text-[13px]",
              !open && "flex-none",
            )}
          >
            {open ? "Details" : "View event"}
          </Link>
          {open ? (
            <RsvpButton
              event={meetup}
              className="btn-primary min-w-0 flex-1 justify-center gap-1.5 !min-h-10 !px-3 !text-[13px]"
            >
              <CalendarCheck
                className="size-3.5"
                strokeWidth={1.75}
                aria-hidden
              />
              RSVP
            </RsvpButton>
          ) : null}
        </div>

        <p className="sr-only">{meetupDateLabel(meetup)}</p>
      </div>
    </article>
  );
}
