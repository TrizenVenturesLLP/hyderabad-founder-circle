
## Hyderabad Founders Network — community site

A community-owned site for a monthly founders meetup in Hyderabad. Sponsored quietly by **Trizen Ventures** (shown as supporter, never as the hero). Static build; RSVPs link out to an external tool (Luma / Google Form — you can swap the URL anytime).

## Pages & routes

```text
/                     Home — community overview + next meetup peek
/events               All meetups (next 3 dates + recurring event detail block)
/events/founders-open-house   Detailed event landing (date, who/what, agenda, FAQ, RSVP)
/community            Who's in it + how to join (WhatsApp/Telegram link)
/stories              Founder stories + event photos + ecosystem resources
/about                Mission, community-first framing, partners, sponsor credit
/contact              Contact form (mailto for now) + Community Guidelines
```

Shared header nav + footer. One primary CTA per page (Home → "Join the Community"; Event → "RSVP").

## Visual direction

Warm, candid, peer-to-peer — like a sunlit Hyderabad rooftop roundtable, not an accelerator brochure. Warm accent (terracotta / saffron) on a paper-neutral base. Editorial type pairing. Real-people event photos (generated) over stock. "Every 3rd Saturday" used as a recurring visual drumbeat. Sponsor line: a single small "Venue & resources supported by Trizen Ventures" in the footer.

## Content blocks (per page)

- **Home**: hero (name + one-line value prop + "Join the Community"), who it's for, outcomes (trust networks / mentors / peer learning / collaboration), next meetup card, partner logo strip, 2–3 founder story teasers, footer.
- **Events**: "Next 3 meetups" list (3rd Sat each month), then the recurring event detail (basics above fold, who/what, agenda, hosts, social proof, FAQ, RSVP).
- **Community**: community-led vs company-supported explainer, sample member profiles (name, role, startup, open-to tags), "Request to join" → WhatsApp link.
- **Stories**: 3–4 short founder takeaways, event photo grid, resource links (T-Hub, WE Hub, eChai, coworking).
- **About**: mission, community-first clarification, partner logos, small sponsor credit.
- **Contact**: name/email/message (mailto submit), Community Guidelines accordion.

## Technical notes

- TanStack Start route files per page; head() metadata per route (unique title/description/og); Event JSON-LD on the event page; relative canonical/og:url.
- Tailwind v4 tokens in `src/styles.css` (warm accent + neutrals, editorial type pair via `<link>` in `__root.tsx`).
- All images generated (real-people event scenes, member portraits) — lazy-loaded, sized.
- RSVP + WhatsApp + sponsor URLs centralized in `src/lib/links.ts` so you swap them in one place.
- No backend; no Lovable Cloud. Fully responsive, mobile-first.

## Out of scope (per your choice)

- No DB-stored registrations/members; RSVPs go to your external form.
- No CMS — content lives in typed TS files (easy to edit, no infra).
- No analytics wiring yet (can add GA later).

## What I need from you to proceed

- RSVP URL (Luma/Google Form) — placeholder `#` until you share it.
- WhatsApp/Telegram/Slack invite link — placeholder until shared.
- Partner logos — I'll use neutral placeholder marks for T-Hub / WE Hub / eChai until you provide real assets.
