import {
  isMeetupCompleted,
  meetupCoverImage,
  meetupCoverObjectClass,
  type Meetup,
} from "@/lib/events";

export type CommunityCard = {
  id: string;
  name: string;
  slug: string;
  eventCount: number;
  upcomingCount: number;
  cover: string;
  coverObject: string;
};

export function buildCommunityCards(
  organizations: { id: string; name: string; slug: string }[],
  events: Meetup[],
): CommunityCard[] {
  const fromApi = organizations.length > 0 ? organizations : [];
  const fromEvents = Array.from(
    new Map(
      events
        .filter((e) => e.organization?.slug)
        .map((e) => [
          e.organization!.slug,
          {
            id: e.organization!.id,
            name: e.organization!.name,
            slug: e.organization!.slug,
          },
        ]),
    ).values(),
  );

  const merged = new Map<string, { id: string; name: string; slug: string }>();
  for (const org of [...fromApi, ...fromEvents]) {
    if (!org.slug) continue;
    merged.set(org.slug, org);
  }

  return Array.from(merged.values())
    .map((org) => {
      const orgEvents = events.filter((e) => e.organization?.slug === org.slug);
      const upcoming = orgEvents.filter((e) => !isMeetupCompleted(e)).length;
      const coverEvent = orgEvents.find((e) => !isMeetupCompleted(e)) || orgEvents[0];
      return {
        ...org,
        eventCount: orgEvents.length,
        upcomingCount: upcoming,
        cover: coverEvent ? meetupCoverImage(coverEvent) : "/july-2026-1.jpeg",
        coverObject: coverEvent ? meetupCoverObjectClass(coverEvent) : "object-[50%_42%]",
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}
