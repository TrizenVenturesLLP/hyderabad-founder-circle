export const HEARD_ABOUT_EVENT_OPTIONS = [
  "Trizen Community",
  "ExtraHand",
  "NanoSpace Coworking",
  "Samriddhi Anveshana",
  "Bestverse",
  "LinkedINspire",
  "LinkedIn",
  "Instagram",
  "WhatsApp",
  "Other",
] as const;

export type HeardAboutEventOption = (typeof HEARD_ABOUT_EVENT_OPTIONS)[number];

export const HEARD_ABOUT_OTHER_LABEL = "Other";
