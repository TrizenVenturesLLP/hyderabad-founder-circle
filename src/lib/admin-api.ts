import { adminAuthHeaders, clearAdminToken, getAdminToken } from "./admin-auth";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

async function adminFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      ...adminAuthHeaders(),
      ...(init?.headers || {}),
    },
  });

  if (res.status === 401) {
    clearAdminToken();
    throw new Error("UNAUTHORIZED");
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || res.statusText || "Request failed");
  }
  return data as T;
}

export async function adminLogin(email: string, password: string) {
  const res = await fetch(`${API_BASE}/api/admin/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Login failed");
  return data as {
    token: string;
    admin: { id: string; email: string; name: string };
  };
}

export async function adminMe() {
  if (!getAdminToken()) throw new Error("UNAUTHORIZED");
  return adminFetch<{ admin: { id: string; email: string; name: string } }>(
    "/api/admin/auth/me",
  );
}

export async function fetchAdminRsvps(params?: {
  eventSlug?: string;
  q?: string;
}) {
  const search = new URLSearchParams();
  if (params?.eventSlug) search.set("eventSlug", params.eventSlug);
  if (params?.q) search.set("q", params.q);
  const qs = search.toString();
  return adminFetch<{
    items: AdminRsvp[];
    events: { slug: string; title: string; count: number }[];
    total: number;
  }>(`/api/admin/rsvps${qs ? `?${qs}` : ""}`);
}

export async function fetchAdminContacts(q?: string) {
  const qs = q ? `?q=${encodeURIComponent(q)}` : "";
  return adminFetch<{ items: AdminContact[]; total: number }>(
    `/api/admin/contacts${qs}`,
  );
}

export async function fetchAdminEvents() {
  return adminFetch<{ items: AdminEvent[]; total: number }>(
    "/api/admin/events",
  );
}

export async function createAdminEvent(payload: Partial<AdminEvent>) {
  return adminFetch<{ item: AdminEvent }>("/api/admin/events", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateAdminEvent(
  id: string,
  payload: Partial<AdminEvent>,
) {
  return adminFetch<{ item: AdminEvent }>(`/api/admin/events/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteAdminEvent(id: string) {
  return adminFetch<{ ok: boolean }>(`/api/admin/events/${id}`, {
    method: "DELETE",
  });
}

export async function deleteAdminRsvp(id: string) {
  return adminFetch<{ ok: boolean }>(`/api/admin/rsvps/${id}`, {
    method: "DELETE",
  });
}

export async function sendReminderEmails(payload: {
  subject: string;
  body: string;
  rsvpIds: string[];
  eventSlug?: string;
  attachments?: {
    filename: string;
    contentType: string;
    content: string;
  }[];
}) {
  return adminFetch<{
    ok: boolean;
    successCount: number;
    failureCount: number;
    results: ReminderSendResult[];
  }>("/api/admin/emails/reminder", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export type ReminderSendResult = {
  email: string;
  name?: string;
  rsvpId?: string;
  status: "sent" | "failed" | string;
  error?: string;
};

export async function fetchEmailHistory() {
  return adminFetch<{ items: EmailHistoryItem[] }>("/api/admin/emails/history");
}

export type AdminRsvp = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  countryCode?: string;
  linkedin: string;
  role: string;
  company: string;
  startupStage: string;
  industry: string;
  createdAt: string;
  payment?: {
    status?: string;
    amountInr?: number;
    amountPaise?: number;
    currency?: string;
    method?: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    paidAt?: string;
  };
  event: {
    slug: string;
    title: string;
    dateISO: string;
    dateLabel: string;
    time: string;
    venue: string;
    city: string;
    format: string;
  };
  emailStats?: {
    sentCount: number;
    failedCount: number;
    lastStatus?: string;
    lastSentAt?: string | null;
  };
};

export type AdminContact = {
  _id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
};

export type AdminSpeaker = {
  name: string;
  role: string;
  org?: string;
  badge?: string;
  bio?: string;
  linkedin?: string;
  website?: string;
  photo?: string;
  photoPosition?: string;
  photoPaddingBottom?: string;
};

export type AdminHost = {
  name: string;
  role?: string;
  startup?: string;
  linkedin?: string;
  photo?: string;
};

export type AdminGuestFounder = {
  name?: string;
  bio?: string;
  photo?: string;
};

export type AdminEvent = {
  _id?: string;
  slug: string;
  title: string;
  dateISO: string;
  dateLabel: string;
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
  speakers?: AdminSpeaker[];
  hosts?: AdminHost[];
  guestFounder?: AdminGuestFounder;
  published?: boolean;
  sortOrder?: number;
};

export type EmailHistoryItem = {
  _id: string;
  subject: string;
  recipientCount: number;
  successCount: number;
  failureCount: number;
  eventSlug?: string;
  createdAt: string;
  sentBy?: string;
};
