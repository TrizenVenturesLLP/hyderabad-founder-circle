import shripujaPhoto from "@/assets/Shripuja-Siddamsetty.jpeg";
import katlaPhoto from "@/assets/Katla-Charitavya.jpeg";
import prasadPhoto from "@/assets/Prasad-Anumula.jpeg";
import sreeKeerthanaPhoto from "@/assets/Sree-Keerthana-Gorty.jpg";
import raffiShaikPhoto from "@/assets/Raffi-Shaik.jpg";

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

export type EventSpeaker = {
  name: string;
  role: string;
  org?: string;
  badge?: string;
  bio: string;
  linkedin?: string;
  website?: string;
  photo?: string;
  photoPosition?: string;
  photoPaddingBottom?: string;
};

export type Meetup = {
  slug: string;
  title: string;
  dateISO: string;
  dateLabel: string;
  /** When false, public pages hide the calendar date until it is locked in. */
  dateConfirmed?: boolean;
  time: string;
  venue: string;
  space?: string;
  area?: string;
  address?: string;
  mapsUrl?: string;
  mapsEmbedUrl?: string;
  city: string;
  seats?: number;
  format: "Offline" | "Online" | "Hybrid";
  status: "open" | "coming-soon" | "completed";
  blurb: string;
  hosts?: CommunityHost[];
  guestFounder?: GuestFounder;
  speakers?: EventSpeaker[];
  organization?: {
    id: string;
    name: string;
    slug: string;
    type?: string;
  } | null;
  payment?: {
    enabled?: boolean;
    amountInr?: number;
    currency?: string;
    checkoutMode?: "razorpay" | "manual";
    hasRazorpay?: boolean;
    hasManualMethods?: boolean;
    methods?: {
      type: string;
      label?: string;
      upiId?: string;
      paymentNumber?: string;
      paymentLink?: string;
      qrImageUrl?: string;
      instructions?: string;
    }[];
  };
};

const API_BASE =
  (import.meta as ImportMeta & { env: Record<string, string> }).env
    .VITE_API_URL || "http://localhost:4000";

/** Resolve known speaker photo keys / names to bundled assets. */
const SPEAKER_PHOTO_MAP: Record<string, string> = {
  "Shripuja-Siddamsetty": shripujaPhoto,
  "Katla-Charitavya": katlaPhoto,
  "Prasad-Anumula": prasadPhoto,
  "Sree-Keerthana-Gorty": sreeKeerthanaPhoto,
  "Dr. Shripuja Siddamsetty": shripujaPhoto,
  "Katla Charitavya": katlaPhoto,
  "Prasad Anumula": prasadPhoto,
  "Sree Keerthana Gorty": sreeKeerthanaPhoto,
  "Raffi-Shaik": raffiShaikPhoto,
  "Raffi Shaik": raffiShaikPhoto,
};

export const nanoSpaceVenue = {
  time: "10:30 AM – 1:00 PM",
  venue: "NanoSpace Coworking",
  space: "Nanakramguda Branch",
  area: "Nanakramguda",
  address: "NanoSpace Coworking, Nanakramguda, Hyderabad, Telangana",
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=NanoSpace+Coworking+Nanakramguda+Branch+Hyderabad",
  mapsEmbedUrl:
    "https://www.google.com/maps?q=NanoSpace+Coworking+Nanakramguda+Branch+Hyderabad&output=embed",
  city: "Hyderabad",
  seats: 50,
  format: "Offline" as const,
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

/** Fallback if API is unavailable. */
export const fallbackMeetups: Meetup[] = [
  {
    slug: "hyderabad-founders-network-july",
    title: "Hyderabad Founders Network – July",
    dateISO: "2026-07-18",
    dateLabel: "Saturday, 18 July 2026",
    dateConfirmed: true,
    ...venueDefaults,
    status: "completed",
    blurb:
      "The monthly roundtable. Show up, share what you're building, find your people.",
    speakers: [
      {
        name: "Prasad Anumula",
        role: "Founder & CEO, Risk Guard Enterprise Solutions",
        bio: "Driving enterprise resilience through risk management, governance, and innovation.",
        photo: prasadPhoto,
        photoPosition: "center top",
        photoPaddingBottom: "22%",
        linkedin: "https://www.linkedin.com/in/prasad-anumula/",
      },
      {
        name: "Dr. Shripuja Siddamsetty",
        role: "Founder, Calm Mind Wellness & Barefoot Learning Experience",
        bio: "Empowering well-being, fostering growth, and building better workplaces.",
        photo: shripujaPhoto,
        linkedin:
          "https://www.linkedin.com/in/dr-shripuja-siddamsetty-m-phil-ph-d-scholar-973342a2",
      },
      {
        name: "Katla Charitavya",
        role: "Founder and Career Counselor, Yatrivese Edutours",
        bio: "Empowering founders to build, scale, and succeed globally.",
        photo: katlaPhoto,
        photoPosition: "center 18%",
        photoPaddingBottom: "12%",
        website: "https://yatriverse.in/",
      },
    ],
  },
  {
    slug: "hyderabad-founders-network-september",
    title: "Hyderabad Founders Network – September",
    dateISO: "2026-09-05",
    dateLabel: "Saturday, 5 September 2026",
    dateConfirmed: true,
    ...nanoSpaceVenue,
    status: "open",
    blurb:
      "Building a stronger founder community in Hyderabad. Connect · Learn · Collaborate · Grow.",
    speakers: [
      {
        name: "Sree Keerthana Gorty",
        role: "Senior Business Analyst, Rockwell Automation",
        org: "Top 1% Topmate Mentor · Creator of KrunchyAITalks",
        badge: "Featured Speaker",
        bio: "12+ years in the software industry. Session: AI, Talent & the Future of Work — 30-minute talk + audience Q&A. Focus: AI · Careers · Technology · Mentoring.",
        photo: sreeKeerthanaPhoto,
        linkedin: "https://www.linkedin.com/in/sreekeerthanagorty/",
      },
      {
        name: "Raffi Shaik",
        role: "Founder & CEO, NanoSpace",
        org: "Lawyer · Author · Entrepreneur",
        badge: "Behind the Build",
        bio: "Lawyer, author and entrepreneur behind NanoSpace. Session: Behind the Build — Founder Story — 20-minute talk on the real founder journey. Focus: Coworking · Scaling · Challenges · Lessons.",
        photo: raffiShaikPhoto,
        linkedin: "https://www.linkedin.com/company/nanospace-coworking/",
        website: "https://nanospace.in/",
      },
    ],
  },
  {
    slug: "band-explorers-vybe",
    title: "Band Explorers Vybe — The Corporate Music Break",
    dateISO: "2026-09-19",
    dateLabel: "Saturday, 19 September 2026",
    dateConfirmed: true,
    time: "6:00 PM – 9:00 PM",
    venue: "NanoSpace Coworking",
    space: "Vijaya Krishna Towers",
    area: "Nanakramguda",
    address: "Vijaya Krishna Towers, Nanakramguda, Hyderabad, Telangana",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Vijaya+Krishna+Towers+Nanakramguda+Hyderabad",
    mapsEmbedUrl:
      "https://www.google.com/maps?q=Vijaya+Krishna+Towers+Nanakramguda+Hyderabad&output=embed",
    city: "Hyderabad",
    seats: 80,
    format: "Offline" as const,
    status: "open",
    blurb:
      "Live music · Unwind · Connect. Up to 10 members can pitch their problem statements (2 minutes each). Timings 6:00 PM – 9:00 PM at NanoSpace. No snacks. Marketing partner: Trizen Community. Entry ₹599.",
    speakers: [],
    hosts: [
      {
        name: "Fun Fusion @Work",
        role: "Event partner",
        startup: "Corporate music & community experiences",
        linkedin: "",
      },
      {
        name: "NanoSpace Coworking",
        role: "Host venue",
        startup: "Nanakramguda, Hyderabad",
        linkedin: "https://www.linkedin.com/company/nanospace-coworking/",
      },
    ],
    organization: {
      id: "nanospace",
      name: "NanoSpace",
      slug: "nanospace",
    },
    payment: {
      enabled: true,
      amountInr: 599,
      currency: "INR",
      methods: [
        {
          type: "upi_id",
          label: "PhonePe / Google Pay",
          paymentNumber: "9666696790",
          instructions:
            "Pay ₹599 via PhonePe or Google Pay to 9666696790. For queries call +91 8247579912. No snacks included.",
        },
      ],
    },
  },
];

/** @deprecated Prefer getMeetups() — kept for gradual migration. */
export const meetups = fallbackMeetups;

const meetupSlugAliases: Record<string, string> = {
  "founders-open-house": "hyderabad-founders-network-july",
  "founders-open-house-aug": "hyderabad-founders-network-august",
  "founders-open-house-sep": "hyderabad-founders-network-september",
};

function resolveSpeakerPhoto(speaker: EventSpeaker): EventSpeaker {
  const key = speaker.photo || speaker.name;
  const mapped = key ? SPEAKER_PHOTO_MAP[key] : undefined;
  if (mapped) return { ...speaker, photo: mapped };
  if (speaker.photo?.startsWith("http") || speaker.photo?.startsWith("/")) {
    return speaker;
  }
  return { ...speaker, photo: mapped || speaker.photo };
}

export function mapApiEventToMeetup(raw: Record<string, unknown>): Meetup {
  const speakers = Array.isArray(raw.speakers)
    ? (raw.speakers as EventSpeaker[]).map(resolveSpeakerPhoto)
    : undefined;

  const guest = raw.guestFounder as GuestFounder | undefined;
  const hasGuest = guest?.name;

  return {
    slug: String(raw.slug || ""),
    title: String(raw.title || ""),
    dateISO: String(raw.dateISO || ""),
    dateLabel: String(raw.dateLabel || ""),
    dateConfirmed: raw.dateConfirmed === true,
    time: String(raw.time || ""),
    venue: String(raw.venue || ""),
    space: raw.space ? String(raw.space) : undefined,
    area: raw.area ? String(raw.area) : undefined,
    address: raw.address ? String(raw.address) : undefined,
    mapsUrl: raw.mapsUrl ? String(raw.mapsUrl) : undefined,
    mapsEmbedUrl: raw.mapsEmbedUrl ? String(raw.mapsEmbedUrl) : undefined,
    city: String(raw.city || "Hyderabad"),
    seats: typeof raw.seats === "number" ? raw.seats : undefined,
    format: (raw.format as Meetup["format"]) || "Offline",
    status: (raw.status as Meetup["status"]) || "open",
    blurb: String(raw.blurb || ""),
    hosts: Array.isArray(raw.hosts) ? (raw.hosts as CommunityHost[]) : undefined,
    guestFounder: hasGuest ? guest : undefined,
    speakers,
    organization: (raw.organization as Meetup["organization"]) || null,
    payment: (raw.payment as Meetup["payment"]) || undefined,
  };
}

let meetupsCache: Meetup[] | null = null;
let meetupsCacheAt = 0;
const CACHE_MS = 30_000;

export async function getMeetups(options?: {
  force?: boolean;
  organizationSlug?: string;
}): Promise<Meetup[]> {
  const now = Date.now();
  const orgSlug = options?.organizationSlug || "";
  if (
    !options?.force &&
    !orgSlug &&
    meetupsCache &&
    now - meetupsCacheAt < CACHE_MS
  ) {
    return meetupsCache;
  }

  try {
    const qs = orgSlug
      ? `?organizationSlug=${encodeURIComponent(orgSlug)}`
      : "";
    const res = await fetch(`${API_BASE}/api/events${qs}`);
    if (!res.ok) throw new Error("events fetch failed");
    const data = (await res.json()) as { items?: Record<string, unknown>[] };
    const items = (data.items || []).map(mapApiEventToMeetup);
    if (items.length > 0) {
      if (!orgSlug) {
        meetupsCache = items;
        meetupsCacheAt = now;
      }
      return items;
    }
  } catch {
    // fall through to local fallback
  }

  if (!orgSlug) {
    meetupsCache = fallbackMeetups;
    meetupsCacheAt = now;
    return fallbackMeetups;
  }
  return fallbackMeetups.filter(
    (m) => m.organization?.slug === orgSlug || !m.organization,
  );
}

export async function getEventOrganizations(): Promise<
  { id: string; name: string; slug: string }[]
> {
  try {
    const res = await fetch(`${API_BASE}/api/events/meta/organizations`);
    if (!res.ok) return [];
    const data = (await res.json()) as {
      items?: { id: string; name: string; slug: string }[];
    };
    return data.items || [];
  } catch {
    return [];
  }
}

export async function getMeetupBySlug(slug: string): Promise<Meetup | null> {
  const canonical = meetupSlugAliases[slug] ?? slug;
  const all = await getMeetups();
  return all.find((m) => m.slug === canonical) ?? null;
}

export function findMeetupBySlug(slug: string) {
  const canonical = meetupSlugAliases[slug] ?? slug;
  const list = meetupsCache ?? fallbackMeetups;
  return list.find((m) => m.slug === canonical) ?? null;
}

export function getNextMeetup(list?: Meetup[]) {
  const source = list ?? meetupsCache ?? fallbackMeetups;
  return (
    source.find((m) => isRsvpOpen(m)) ??
    source.find((m) => !isMeetupCompleted(m)) ??
    source[0]
  );
}

/** Sync fallback for modules that still expect a static next meetup. */
export const nextMeetup =
  fallbackMeetups.find((m) => m.status === "open") ?? fallbackMeetups[0];

export const DATE_TBC_LABEL = "Date to be confirmed";
export const DATE_TBC_HEADLINE = "TO BE CONFIRMED";

export function isMeetupDateConfirmed(meetup: Pick<Meetup, "dateConfirmed" | "status">) {
  if (meetup.status === "completed") return true;
  return meetup.dateConfirmed === true;
}

export function meetupDateLabel(meetup: Meetup) {
  return isMeetupDateConfirmed(meetup) ? meetup.dateLabel : DATE_TBC_LABEL;
}

/** True when the event date has ended (end of day, Asia/Kolkata). */
export function isMeetupPast(meetup: Meetup) {
  if (!isMeetupDateConfirmed(meetup) || !meetup.dateISO) return false;
  const end = new Date(`${meetup.dateISO}T23:59:59+05:30`);
  return Number.isFinite(end.getTime()) && Date.now() > end.getTime();
}

/** Explicitly completed, or past its date. */
export function isMeetupCompleted(meetup: Meetup) {
  return meetup.status === "completed" || isMeetupPast(meetup);
}

export function isRsvpOpen(meetup: Meetup) {
  return meetup.status === "open" && !isMeetupPast(meetup);
}

export function meetupStatusLabel(meetup: Meetup) {
  if (isMeetupCompleted(meetup)) return "Completed";
  if (meetup.status === "coming-soon") return "Coming soon";
  return "Open";
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

export function invalidateMeetupsCache() {
  meetupsCache = null;
  meetupsCacheAt = 0;
}
