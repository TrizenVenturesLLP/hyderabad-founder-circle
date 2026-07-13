export type Meetup = {
  slug: string;
  title: string;
  dateISO: string; // e.g. 2026-07-18
  dateLabel: string; // "Saturday, 18 July 2026"
  time: string; // "11:00 AM – 1:00 PM IST"
  venue: string;
  space?: string;
  address?: string;
  mapsUrl?: string;
  city: string;
  seats?: number;
  format: "Offline" | "Online" | "Hybrid";
  blurb: string;
};

// The recurring "3rd Saturday" rhythm. Easy to edit each month.
export const meetups: Meetup[] = [
  {
    slug: "founders-open-house",
    title: "Founders Open House — July",
    dateISO: "2026-07-18",
    dateLabel: "Saturday, 18 July 2026",
    time: "11:00 AM – 1:00 PM IST",
    venue: "DraperU India",
    space: "5th floor event space",
    address:
      "DraperU India (Formerly Draper Startup House Hyderabad), Rajiv Gandhi Nagar, Gachibowli, Hyderabad, Telangana 500032",
    mapsUrl:
      "https://maps.app.goo.gl/KTRvgep4y9ciSCjSA?g_st=com.microsoft.skype.teams.extshare",
    city: "Hyderabad",
    seats: 40,
    format: "Offline",
    blurb:
      "The monthly roundtable. Show up, share what you're building, find your people.",
  },
  {
    slug: "founders-open-house-aug",
    title: "Founders Open House — August",
    dateISO: "2026-08-15",
    dateLabel: "Saturday, 15 August 2026",
    time: "5:00 – 8:00 PM IST",
    venue: "T-Hub, Phase 2, Madhapur",
    city: "Hyderabad",
    format: "Offline",
    blurb: "Same room. Same energy. New conversations.",
  },
  {
    slug: "founders-open-house-sep",
    title: "Founders Open House — September",
    dateISO: "2026-09-19",
    dateLabel: "Saturday, 19 September 2026",
    time: "5:00 – 8:00 PM IST",
    venue: "T-Hub, Phase 2, Madhapur",
    city: "Hyderabad",
    format: "Offline",
    blurb: "Themed session: going from first 10 to first 100 customers.",
  },
];

export const nextMeetup = meetups[0];

export function meetupLocationLabel(meetup: Meetup) {
  if (meetup.space) return `${meetup.venue} · ${meetup.space}`;
  return meetup.venue;
}

export function meetupMapsUrl(meetup: Meetup) {
  if (meetup.mapsUrl) return meetup.mapsUrl;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${meetup.address ?? meetup.venue} ${meetup.city}`,
  )}`;
}

export function meetupSeatsLabel(meetup: Meetup) {
  if (typeof meetup.seats === "number") return String(meetup.seats);
  return "Limited";
}
