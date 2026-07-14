export type CommunityHost = {
  name: string;
  role: string;
  startup: string;
  linkedin: string;
  photo?: string;
};

export type GuestFounder = {
  name: string;
  bio: string;
  photo?: string;
};

export type Meetup = {
  slug: string;
  title: string;
  dateISO: string; // e.g. 2026-07-18
  dateLabel: string; // "Saturday, 18 July 2026"
  time: string; // "11:00 AM – 1:00 PM"
  venue: string;
  space?: string;
  area?: string;
  address?: string;
  mapsUrl?: string;
  mapsEmbedUrl?: string;
  city: string;
  seats?: number;
  format: "Offline" | "Online" | "Hybrid";
  status: "open" | "coming-soon";
  blurb: string;
  hosts?: CommunityHost[];
  guestFounder?: GuestFounder;
};

const venueDefaults = {
  time: "11:00 AM – 1:00 PM",
  venue: "DraperU India",
  space: "5th floor event space",
  area: "Gachibowli",
  address:
    "DraperU India (Formerly Draper Startup House Hyderabad), Rajiv Gandhi Nagar, Gachibowli, Hyderabad, Telangana 500032",
  mapsUrl:
    "https://maps.app.goo.gl/KTRvgep4y9ciSCjSA?g_st=com.microsoft.skype.teams.extshare",
  mapsEmbedUrl:
    "https://www.google.com/maps?q=DraperU+India+Gachibowli+Hyderabad&output=embed",
  city: "Hyderabad",
  seats: 40,
  format: "Offline" as const,
};

// The recurring "3rd Saturday" rhythm. Easy to edit each month.
export const meetups: Meetup[] = [
  {
    slug: "founders-open-house",
    title: "Hyderabad Founders Network – July",
    dateISO: "2026-07-18",
    dateLabel: "Saturday, 18 July 2026",
    ...venueDefaults,
    status: "open",
    blurb:
      "The monthly roundtable. Show up, share what you're building, find your people.",
  },
  {
    slug: "founders-open-house-aug",
    title: "Hyderabad Founders Network – August Community Meetup",
    dateISO: "2026-08-18",
    dateLabel: "Saturday, 18 August 2026",
    ...venueDefaults,
    status: "open",
    blurb:
      "Connect with founders, builders, startup operators, mentors and aspiring entrepreneurs for meaningful conversations and long-term relationships.",
  },
  {
    slug: "founders-open-house-sep",
    title: "Hyderabad Founders Network – September Community Meetup",
    dateISO: "2026-09-19",
    dateLabel: "Saturday, 19 September 2026",
    ...venueDefaults,
    status: "coming-soon",
    blurb: "Themed session: going from first 10 to first 100 customers.",
  },
];

export const nextMeetup = meetups[0];

export function isRsvpOpen(meetup: Meetup) {
  return meetup.status === "open";
}

export function meetupLocationLabel(meetup: Meetup) {
  if (meetup.space) return `${meetup.venue} · ${meetup.space}`;
  return meetup.venue;
}

export function meetupVenueLine(meetup: Meetup) {
  const area = meetup.area ?? "Gachibowli";
  return `${meetup.venue}, ${area}, ${meetup.city}`;
}

export function meetupMapsUrl(meetup: Meetup) {
  if (meetup.mapsUrl) return meetup.mapsUrl;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${meetup.address ?? meetup.venue} ${meetup.city}`,
  )}`;
}

export function meetupMapsEmbedUrl(meetup: Meetup) {
  if (meetup.mapsEmbedUrl) return meetup.mapsEmbedUrl;
  return `https://www.google.com/maps?q=${encodeURIComponent(
    `${meetup.address ?? meetup.venue} ${meetup.city}`,
  )}&output=embed`;
}

export function meetupSeatsLabel(meetup: Meetup) {
  if (typeof meetup.seats === "number") return String(meetup.seats);
  return "Limited";
}
