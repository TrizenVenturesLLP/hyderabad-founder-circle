import {
  isMeetupDateConfirmed,
  type Meetup,
} from "@/lib/events";

function toIcsDate(iso: string, hour: number, minute: number) {
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

function parseEventHours(time: string) {
  const matches = [...time.matchAll(/(\d{1,2})\s*:\s*(\d{2})\s*(AM|PM)/gi)];
  if (matches.length === 0) {
    return { startHour: 17, startMin: 0, endHour: 20, endMin: 0 };
  }

  const to24 = (h: number, mer: string) => {
    const m = mer.toUpperCase();
    if (m === "AM") return h === 12 ? 0 : h;
    return h === 12 ? 12 : h + 12;
  };

  const startHour = to24(Number(matches[0][1]), matches[0][3]);
  const startMin = Number(matches[0][2]);
  const endHour =
    matches.length > 1
      ? to24(Number(matches[1][1]), matches[1][3])
      : Math.min(23, startHour + 3);
  const endMin = matches.length > 1 ? Number(matches[1][2]) : 0;

  return { startHour, startMin, endHour, endMin };
}

export function buildEventIcs(meetup: Meetup, url: string) {
  const { startHour, startMin, endHour, endMin } = parseEventHours(meetup.time);
  const start = toIcsDate(meetup.dateISO, startHour, startMin);
  const end = toIcsDate(meetup.dateISO, endHour, endMin);
  const now = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
  const desc = String(meetup.blurb || "")
    .replace(/\r?\n/g, "\\n")
    .slice(0, 500);

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Trizen Community//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${meetup.slug}@community.trizenventures.com`,
    `DTSTAMP:${now}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${meetup.title.replace(/,/g, "\\,")}`,
    `DESCRIPTION:${desc}`,
    `LOCATION:${(meetup.address ?? `${meetup.venue}, ${meetup.city}`).replace(/,/g, "\\,")}`,
    `URL:${url}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function downloadEventIcs(meetup: Meetup, url?: string) {
  if (!isMeetupDateConfirmed(meetup)) return;
  const eventUrl =
    url ||
    (typeof window !== "undefined"
      ? window.location.href
      : `https://community.trizenventures.com/events/${meetup.slug}`);
  const blob = new Blob([buildEventIcs(meetup, eventUrl)], {
    type: "text/calendar;charset=utf-8",
  });
  const href = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = href;
  a.download = `${meetup.slug}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(href);
}

export function googleCalendarUrl(meetup: Meetup, url?: string) {
  if (!isMeetupDateConfirmed(meetup)) return "";
  const [y, m, d] = meetup.dateISO.split("-").map(Number);
  const { startHour, startMin, endHour, endMin } = parseEventHours(meetup.time);
  const pad = (n: number) => String(n).padStart(2, "0");
  const stamp = (hour: number, minute: number) =>
    `${y}${pad(m)}${pad(d)}T${pad(hour)}${pad(minute)}00`;
  const eventUrl =
    url ||
    (typeof window !== "undefined"
      ? window.location.href
      : `https://community.trizenventures.com/events/${meetup.slug}`);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: meetup.title,
    dates: `${stamp(startHour, startMin)}/${stamp(endHour, endMin)}`,
    details: [meetup.blurb, eventUrl].filter(Boolean).join("\n\n"),
    location: meetup.address ?? `${meetup.venue}, ${meetup.city}`,
    ctz: "Asia/Kolkata",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
