import { useState } from "react";
import { CalendarPlus, Check, Link2, Linkedin } from "lucide-react";
import { isMeetupDateConfirmed, type Meetup } from "@/lib/events";
import { googleCalendarUrl } from "@/lib/event-calendar";
import { links } from "@/lib/links";
import { cn } from "@/lib/utils";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.227-8.451L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  );
}

const iconBtnClass =
  "inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] transition-colors duration-200 hover:border-[var(--color-border-strong)] hover:bg-[var(--brand-accent-soft)] hover:text-[var(--brand-accent)]";

export function EventShareBar({
  meetup,
  orientation = "horizontal",
  className,
}: {
  meetup: Meetup;
  orientation?: "horizontal" | "vertical";
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const url =
    typeof window !== "undefined"
      ? window.location.href
      : `https://community.trizenventures.com/events/${meetup.slug}`;
  const calendarHref = isMeetupDateConfirmed(meetup)
    ? googleCalendarUrl(meetup, url)
    : "";

  const share = [
    {
      label: "WhatsApp",
      href: links.community,
      Icon: WhatsAppIcon,
    },
    {
      label: "LinkedIn",
      href: links.linkedin,
      Icon: Linkedin,
    },
    {
      label: "X",
      href: links.twitter,
      Icon: XIcon,
    },
  ];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  const vertical = orientation === "vertical";

  return (
    <div
      className={cn(
        "flex items-center gap-2.5",
        vertical ? "flex-row lg:flex-col" : "flex-wrap",
        className,
      )}
      role="group"
      aria-label="Share and save event"
    >
      {calendarHref ? (
        <a
          href={calendarHref}
          target="_blank"
          rel="noopener noreferrer"
          className={iconBtnClass}
          aria-label="Add to Google Calendar"
          title="Add to Google Calendar"
        >
          <CalendarPlus className="size-3.5" strokeWidth={1.75} aria-hidden />
        </a>
      ) : null}
      {share.map(({ label, href, Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noreferrer"
          aria-label={label}
          title={label}
          className={iconBtnClass}
        >
          <Icon className="size-3.5" aria-hidden />
        </a>
      ))}
      <button
        type="button"
        onClick={copy}
        className={iconBtnClass}
        aria-label={copied ? "Link copied" : "Copy link"}
        title={copied ? "Link copied" : "Copy link"}
      >
        {copied ? (
          <Check
            className="size-3.5 text-[var(--brand-accent)]"
            strokeWidth={1.75}
            aria-hidden
          />
        ) : (
          <Link2 className="size-3.5" strokeWidth={1.75} aria-hidden />
        )}
      </button>
    </div>
  );
}
