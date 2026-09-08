import type { Meetup } from "@/lib/events";
import { getEventPageContent } from "@/lib/event-page-content";

export const DEFAULT_HEARD_ABOUT_EVENT_OPTIONS = [
  "Trizen Community",
  "Other",
] as const;

export type HeardAboutEventOption = string;

export const HEARD_ABOUT_OTHER_LABEL = "Other";

export function getHeardAboutEventOptions(event: Meetup | null | undefined) {
  if (!event) return [...DEFAULT_HEARD_ABOUT_EVENT_OPTIONS];

  const content = getEventPageContent(event);
  const names = [
    event.organization?.name,
    ...(event.hosts ?? []).map((host) => host.name),
    ...content.collaborativeHosts.map((host) => host.name),
    ...content.partnerTiers.flatMap((tier) =>
      tier.partners.map((partner) => partner.name),
    ),
  ].filter((name): name is string => Boolean(name?.trim()));

  const uniqueNames = [...new Set(names)];
  return [...uniqueNames, HEARD_ABOUT_OTHER_LABEL];
}
