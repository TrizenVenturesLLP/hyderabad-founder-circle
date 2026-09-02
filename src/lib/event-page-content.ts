import type { Meetup } from "@/lib/events";
import bestverseLogo from "@/assets/logo-Bestverse.jpeg";
import extrahandLogo from "@/assets/extrahand-logo-icon.webp";
import linkedinspireLogo from "@/assets/linkedinspire-logo.jpg";
import nanospaceLogo from "@/assets/nanospace-logo.jpg";
import samriddhiLogo from "@/assets/samriddhi-anveshana.png";
import trizenLogo from "@/assets/trizen-favico.ico";

export type AgendaItem = {
  time: string;
  title: string;
  desc?: string;
};

export type EventPartner = {
  name: string;
  desc?: string;
  href?: string | null;
  logo?: string;
  logoRounded?: boolean;
  logoSquare?: boolean;
};

export type CollaborativeHost = EventPartner;

export type PartnerTier = {
  label: string;
  partners: EventPartner[];
};

export type EventHeroContent = {
  brandTitle: string;
  subtitle: string;
  headline: string;
  tagline: string;
  audienceLine: string;
  positioning: string;
};

export type EventWhyContent = {
  headline: string;
  paragraphs: string[];
  closingLine: string;
};

export type EventPageOverrides = {
  hero?: EventHeroContent;
  why?: EventWhyContent;
  agenda?: AgendaItem[];
  agendaHeading?: string;
  agendaSubheading?: string;
  collaborativeHosts?: CollaborativeHost[];
  partnerTiers?: PartnerTier[];
  speakersHeading?: string;
  speakersSubheading?: string;
  excludeRoles?: string[];
};

const defaultAgenda: AgendaItem[] = [
  {
    time: "11:00 AM",
    title: "Registration & Welcome",
    desc: "Check in, grab a seat, and settle into the room.",
  },
  {
    time: "11:20 AM",
    title: "Founder Introductions",
    desc: "Meet the people in the room — quick intros, no pitching.",
  },
  {
    time: "11:40 AM",
    title: "Founder Story",
    desc: "A community member shares lessons from building a startup.",
  },
  {
    time: "12:10 PM",
    title: "Roundtable Discussions",
    desc: "Small-group conversations around startup challenges and opportunities.",
  },
  {
    time: "12:40 PM",
    title: "Open Networking",
    desc: "Continue conversations and make meaningful connections.",
  },
  {
    time: "1:00 PM",
    title: "Snacks & Community Conversations",
    desc: "Light refreshments while conversations keep going.",
  },
];

const septemberAgenda: AgendaItem[] = [
  { time: "10:30 – 10:45", title: "Registration & Coffee" },
  {
    time: "10:45 – 11:00",
    title: "Welcome + Community Introduction + Collaborative Hosts",
  },
  {
    time: "11:00 – 11:20",
    title: "Founder Connect — Small Group Introductions",
  },
  {
    time: "11:20 – 11:40",
    title: "Founder Problem & Opportunity Exchange",
  },
  {
    time: "11:40 – 12:10",
    title: "Featured Speaker — AI, Talent & the Future of Work",
  },
  { time: "12:10 – 12:30", title: "Behind the Build — Founder Story" },
  { time: "12:30 – 12:50", title: "Focused Roundtable Discussions" },
  { time: "12:50 – 1:00", title: "Open Networking + Community Closing" },
  { time: "1:00 onwards", title: "Founder Connect / Informal Networking" },
];

const EVENT_OVERRIDES: Record<string, EventPageOverrides> = {
  "hyderabad-founders-network-september": {
    hero: {
      brandTitle: "Hyderabad Founders Network",
      subtitle: "Monthly Community Meetup",
      headline: "Building a stronger founder community in Hyderabad.",
      tagline: "Connect · Learn · Collaborate · Grow",
      audienceLine:
        "30+ Founders · Builders · Operators · Mentors · Entrepreneurs",
      positioning: "",
    },
    why: {
      headline: "Building a startup shouldn't be a solo journey.",
      paragraphs: [
        "Hyderabad Founders Network is a community-led initiative for founders, builders, operators, mentors, investors, professionals and aspiring entrepreneurs — a space to connect meaningfully, learn from real experiences, exchange ideas, and find collaboration opportunities that last beyond one Saturday.",
        "Whether you're building your first startup or scaling your next venture, you'll meet people who understand the journey — and are willing to share experiences, ideas, and support.",
      ],
      closingLine:
        "This is not just another networking event. It's intended to become a long-term founder community.",
    },
    agenda: septemberAgenda,
    agendaHeading: "10:30 AM – 1:00 PM",
    agendaSubheading:
      "Structured enough to be useful — open enough for real founder conversations.",
    collaborativeHosts: [
      {
        name: "Samriddhi Anveshana",
        href: "https://samriddhianveshana.com/",
        logo: samriddhiLogo,
      },
      {
        name: "NanoSpace Coworking",
        href: "https://nanospace.in/",
        logo: nanospaceLogo,
      },
    ],
    partnerTiers: [
      {
        label: "Supported by",
        partners: [
          {
            name: "Trizen Community",
            logo: trizenLogo,
            logoSquare: true,
            href: "https://trizenventures.com/",
          },
          {
            name: "ExtraHand",
            logo: extrahandLogo,
            logoSquare: true,
            href: "https://extrahand.in/",
          },
        ],
      },
      {
        label: "Venue partner",
        partners: [
          {
            name: "NanoSpace Coworking",
            logo: nanospaceLogo,
            href: "https://nanospace.in/",
          },
        ],
      },
      {
        label: "Marketing partners",
        partners: [
          {
            name: "Bestverse",
            logo: bestverseLogo,
            logoRounded: true,
            href: "https://bestverse.in/",
          },
        ],
      },
      {
        label: "Ecosystem partner",
        partners: [
          {
            name: "LinkedINspire",
            logo: linkedinspireLogo,
            href: "https://www.linkedin.com/company/linkedinspiregm/",
          },
        ],
      },
    ],
    speakersHeading: "Featured sessions",
    speakersSubheading:
      "Featured Speaker — AI, Talent & the Future of Work · Behind the Build — Founder Story",
    excludeRoles: ["Student"],
  },
};

export function getEventPageContent(meetup: Meetup) {
  const overrides = EVENT_OVERRIDES[meetup.slug] ?? {};
  return {
    hero: overrides.hero ?? null,
    why: overrides.why ?? null,
    agenda: overrides.agenda ?? defaultAgenda,
    agendaHeading: overrides.agendaHeading ?? "About two hours",
    agendaSubheading:
      overrides.agendaSubheading ??
      "Structured enough to be useful — open enough to talk.",
    collaborativeHosts: overrides.collaborativeHosts ?? [],
    partnerTiers: overrides.partnerTiers ?? [],
    speakersHeading: overrides.speakersHeading ?? "Meet our speakers",
    speakersSubheading:
      overrides.speakersSubheading ??
      "Industry leaders, founders, and innovators sharing insights from the work.",
    excludeRoles: overrides.excludeRoles ?? [],
  };
}

export function getEventRoles(allRoles: readonly string[], meetup: Meetup) {
  const { excludeRoles } = getEventPageContent(meetup);
  if (excludeRoles.length === 0) return [...allRoles];
  const blocked = new Set(excludeRoles);
  return allRoles.filter((role) => !blocked.has(role));
}
