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
  label?: string;
};

export type AudienceItem = {
  title: string;
  desc: string;
};

export type TakeawayItem = {
  title: string;
  body: string;
};

export type FaqItem = {
  q: string;
  a: string;
};

export type EventAudienceContent = {
  heading: string;
  intro: string;
  items: AudienceItem[];
};

export type EventTakeawaysContent = {
  heading: string;
  intro: string;
  items: TakeawayItem[];
};

export type EventCtaContent = {
  label: string;
  heading: string;
  body: string;
};

export type EventPageOverrides = {
  hero?: EventHeroContent;
  why?: EventWhyContent;
  audience?: EventAudienceContent;
  takeaways?: EventTakeawaysContent;
  faqs?: FaqItem[];
  cta?: EventCtaContent;
  agenda?: AgendaItem[];
  agendaHeading?: string;
  agendaSubheading?: string;
  collaborativeHosts?: CollaborativeHost[];
  partnerTiers?: PartnerTier[];
  speakersHeading?: string;
  speakersSubheading?: string;
  excludeRoles?: string[];
  metaOrganizer?: string;
  hideRefreshmentsAmenity?: boolean;
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
      audienceLine: "30+ Founders · Builders · Operators · Mentors · Entrepreneurs",
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
  "band-explorers-vybe": {
    hero: {
      brandTitle: "Band Explorers Vybe",
      subtitle: "The Corporate Music Break",
      headline: "Live music. Unwind. Connect.",
      tagline: "An evening of live music and good company.",
      audienceLine: "Working professionals · Music lovers · Creative teams · Community members",
      positioning: "Hosted at NanoSpace Coworking · Nanakramguda",
    },
    why: {
      label: "Why this evening?",
      headline: "A corporate music break — not a networking meetup.",
      paragraphs: [
        "Band Explorers Vybe is an evening music experience at NanoSpace for people who want to unwind after work, enjoy a live set, and hang out in a relaxed room.",
        "Tickets: ₹299 for 1 member or ₹549 for 2 members. No snacks are provided. Hosted by NanoSpace · Marketing partner: Trizen Community · Supporting partner: ExtraHand.",
      ],
      closingLine: "Come for the music. Stay for the vibe.",
    },
    audience: {
      heading: "Built for people who want a music break.",
      intro:
        "This is a corporate music evening — open to professionals, creatives, and anyone who wants live music with room to connect.",
      items: [
        {
          title: "Working professionals",
          desc: "Unwind after work with live music and a change of pace.",
        },
        {
          title: "Music lovers",
          desc: "Enjoy the Band Explorers set in an intimate coworking venue.",
        },
        {
          title: "Creative & corporate teams",
          desc: "Bring colleagues for an evening of music and conversation.",
        },
        {
          title: "Community members",
          desc: "Meet people beyond your usual circle in a relaxed setting.",
        },
        {
          title: "Friends & plus-ones",
          desc: "Grab the 2-member ticket and come together.",
        },
        {
          title: "Anyone looking for a night out",
          desc: "No founder gate — if live music sounds good, you’re welcome.",
        },
      ],
    },
    takeaways: {
      heading: "What the evening is about",
      intro: "Music first. Good company second. That’s it.",
      items: [
        {
          title: "Live music to unwind",
          body: "Settle into the Band Explorers set and reset after the work week.",
        },
        {
          title: "A break from the usual",
          body: "Conversations happen naturally around music — not a formal room.",
        },
        {
          title: "New people, same city",
          body: "Meet professionals and community members you wouldn’t normally cross paths with.",
        },
        {
          title: "An evening at NanoSpace",
          body: "A focused 6–9 PM session at Vijaya Krishna Towers, Nanakramguda.",
        },
        {
          title: "Clear entry",
          body: "₹299 for 1 member or ₹549 for 2 members. No snacks. Come ready for music.",
        },
      ],
    },
    faqs: [
      {
        q: "Is this a Hyderabad Founders Network meetup?",
        a: "No. Band Explorers Vybe is a corporate music evening hosted at NanoSpace — live band, not a founder meetup.",
      },
      {
        q: "Who should attend?",
        a: "Working professionals, music lovers, creative teams, community members, and anyone who wants a live music night. Founder status is not required.",
      },
      {
        q: "What is the entry fee?",
        a: "₹299 for 1 member, or ₹549 for 2 members. Registration needs name, email, and mobile, then payment.",
      },
      {
        q: "What are the timings?",
        a: "Saturday, 3 October 2026 · 6:00 PM – 9:00 PM at NanoSpace Coworking, Nanakramguda.",
      },
      {
        q: "Will there be food or snacks?",
        a: "No. This evening does not include snacks or refreshments.",
      },
      {
        q: "What should I expect?",
        a: "Doors, a live Band Explorers set, and time to hang out. It’s a music night — come to listen and enjoy.",
      },
    ],
    cta: {
      label: "Evening",
      heading: "Ready for a corporate music break?",
      body: "Register for Band Explorers Vybe at NanoSpace — live music from 6–9 PM.",
    },
    agenda: [
      {
        time: "6:00 PM",
        title: "Doors open & welcome",
        desc: "Check in at Vijaya Krishna Towers, Nanakramguda.",
      },
      {
        time: "6:15 – 8:30 PM",
        title: "Live music",
        desc: "Band Explorers set — settle in, listen, unwind.",
      },
      {
        time: "8:30 – 9:00 PM",
        title: "Hang out & close",
        desc: "Stick around for a bit after the set. No snacks — music and people only.",
      },
    ],
    agendaHeading: "Evening timeline · 6:00 PM – 9:00 PM",
    agendaSubheading: "Live music and good company — no snacks.",
    collaborativeHosts: [
      {
        name: "NanoSpace Coworking",
        href: "https://nanospace.in/",
        logo: nanospaceLogo,
      },
      {
        name: "Band Explorers",
        desc: "Organised by",
      },
    ],
    partnerTiers: [
      {
        label: "Hosted by",
        partners: [
          {
            name: "NanoSpace Coworking",
            logo: nanospaceLogo,
            href: "https://nanospace.in/",
          },
        ],
      },
      {
        label: "Marketing partner",
        partners: [
          {
            name: "Trizen Community",
            logo: trizenLogo,
            logoSquare: true,
            href: "https://trizenventures.com/",
          },
        ],
      },
      {
        label: "Supporting partner",
        partners: [
          {
            name: "ExtraHand",
            logo: extrahandLogo,
            logoSquare: true,
            href: "https://extrahand.in/",
          },
        ],
      },
    ],
    speakersHeading: "The evening",
    speakersSubheading: "Live Music · Unwind · Connect",
    metaOrganizer: "NanoSpace Coworking",
    hideRefreshmentsAmenity: true,
  },
};

export function getEventPageContent(meetup: Meetup) {
  const overrides = EVENT_OVERRIDES[meetup.slug] ?? {};
  return {
    hero: overrides.hero ?? null,
    why: overrides.why ?? null,
    audience: overrides.audience ?? null,
    takeaways: overrides.takeaways ?? null,
    faqs: overrides.faqs ?? null,
    cta: overrides.cta ?? null,
    agenda: overrides.agenda ?? defaultAgenda,
    agendaHeading: overrides.agendaHeading ?? "About two hours",
    agendaSubheading:
      overrides.agendaSubheading ?? "Structured enough to be useful — open enough to talk.",
    collaborativeHosts: overrides.collaborativeHosts ?? [],
    partnerTiers: overrides.partnerTiers ?? [],
    speakersHeading: overrides.speakersHeading ?? "Meet our speakers",
    speakersSubheading:
      overrides.speakersSubheading ??
      "Industry leaders, founders, and innovators sharing insights from the work.",
    excludeRoles: overrides.excludeRoles ?? [],
    metaOrganizer:
      overrides.metaOrganizer ?? meetup.organization?.name ?? "Hyderabad Founders Network",
    hideRefreshmentsAmenity: overrides.hideRefreshmentsAmenity === true,
  };
}

export function getEventRoles(allRoles: readonly string[], meetup: Meetup) {
  const { excludeRoles } = getEventPageContent(meetup);
  if (excludeRoles.length === 0) return [...allRoles];
  const blocked = new Set(excludeRoles);
  return allRoles.filter((role) => !blocked.has(role));
}
