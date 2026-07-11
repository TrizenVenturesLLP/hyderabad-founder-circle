import { useState } from "react";
import type { Meetup } from "@/lib/events";

function toIcsDate(iso: string, hour: number, minute: number) {
  // iso: YYYY-MM-DD, treat as IST (UTC+5:30) then convert to UTC
  const [y, m, d] = iso.split("-").map(Number);
  const istMs = Date.UTC(y, m - 1, d, hour, minute) - 5.5 * 60 * 60 * 1000;
  const dt = new Date(istMs);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    dt.getUTCFullYear().toString() +
    pad(dt.getUTCMonth() + 1) +
    pad(dt.getUTCDate()) +
    "T" +
    pad(dt.getUTCHours()) +
    pad(dt.getUTCMinutes()) +
    "00Z"
  );
}

function buildIcs(m: Meetup, url: string) {
  const start = toIcsDate(m.dateISO, 17, 0);
  const end = toIcsDate(m.dateISO, 20, 0);
  const now = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Hyderabad Founders Network//EN",
    "BEGIN:VEVENT",
    `UID:${m.slug}@hyderabad-founder-circle.lovable.app`,
    `DTSTAMP:${now}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${m.title}`,
    `DESCRIPTION:${m.blurb}`,
    `LOCATION:${m.venue}, ${m.city}`,
    `URL:${url}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function EventShareBar({ meetup }: { meetup: Meetup }) {
  const [copied, setCopied] = useState(false);
  const url =
    typeof window !== "undefined"
      ? window.location.href
      : `https://hyderabad-founder-circle.lovable.app/events/${meetup.slug}`;
  const text = `${meetup.title} — ${meetup.dateLabel}`;

  const share = [
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
    },
    {
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    },
    {
      label: "X",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
    },
  ];

  const downloadIcs = () => {
    const blob = new Blob([buildIcs(meetup, url)], { type: "text/calendar" });
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = `${meetup.slug}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(href);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  return (
    <div className="mt-6 flex flex-wrap items-center gap-2">
      <button
        onClick={downloadIcs}
        className="rounded-full border border-border bg-card px-4 py-2 text-xs font-medium text-foreground hover:bg-muted"
      >
        Add to calendar
      </button>
      {share.map((s) => (
        <a
          key={s.label}
          href={s.href}
          target="_blank"
          rel="noreferrer"
          aria-label={`Share on ${s.label}`}
          className="rounded-full border border-border bg-card px-4 py-2 text-xs font-medium text-foreground hover:bg-muted"
        >
          {s.label}
        </a>
      ))}
      <button
        onClick={copy}
        className="rounded-full border border-border bg-card px-4 py-2 text-xs font-medium text-foreground hover:bg-muted"
      >
        {copied ? "Link copied" : "Copy link"}
      </button>
    </div>
  );
}
