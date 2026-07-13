import type { Meetup } from "@/lib/events";

const API_BASE =
  (import.meta as ImportMeta & { env: Record<string, string> }).env
    .VITE_API_URL || "http://localhost:4000";

export type RsvpPayload = {
  name: string;
  email: string;
  phone: string;
  countryCode: string;
  linkedin: string;
  role: string;
  company: string;
  startupStage: string;
  gtmChallenges: string[];
  leaveWith: string[];
  industry: string;
  lookingFor: string[];
  canHelpWith?: string;
  biggestChallenge?: string;
  joinWhatsapp?: boolean;
  subscribeUpdates?: boolean;
  questions?: string;
  event: Pick<
    Meetup,
    "slug" | "title" | "dateISO" | "dateLabel" | "time" | "venue" | "city" | "format"
  >;
};

export async function submitRsvp(payload: RsvpPayload) {
  const res = await fetch(`${API_BASE}/api/rsvp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = (await res.json().catch(() => ({}))) as {
    error?: string;
    message?: string;
  };

  if (!res.ok) {
    throw new Error(data.error || "Could not submit RSVP.");
  }

  return data;
}

export type ContactPayload = {
  name: string;
  email: string;
  message: string;
};

export async function submitContact(payload: ContactPayload) {
  const res = await fetch(`${API_BASE}/api/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = (await res.json().catch(() => ({}))) as {
    error?: string;
    message?: string;
    id?: string;
  };

  if (!res.ok) {
    throw new Error(data.error || "Could not send message.");
  }

  return data;
}
