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
    admin: AdminSessionUser;
  };
}

export async function orgLogin(email: string, password: string) {
  const res = await fetch(`${API_BASE}/api/admin/auth/org-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Login failed");
  return data as {
    token: string;
    admin: AdminSessionUser;
  };
}

export async function submitOrgApplication(payload: {
  organizationName: string;
  email: string;
  contactName?: string;
  phone?: string;
  website?: string;
  message?: string;
}) {
  const res = await fetch(`${API_BASE}/api/org-applications`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Could not submit application");
  return data as { ok: boolean; id: string; message?: string };
}

export async function fetchOrgApplications(status?: string) {
  const qs = status ? `?status=${encodeURIComponent(status)}` : "";
  return adminFetch<{ items: OrgApplicationItem[]; total: number }>(
    `/api/admin/org-applications${qs}`,
  );
}

export async function approveOrgApplication(id: string) {
  return adminFetch<{
    ok: boolean;
    credentials: {
      email: string;
      temporaryPassword: string;
      loginPath: string;
    };
  }>(`/api/admin/org-applications/${id}/approve`, { method: "POST" });
}

export async function rejectOrgApplication(id: string, reason?: string) {
  return adminFetch<{ ok: boolean }>(`/api/admin/org-applications/${id}/reject`, {
    method: "POST",
    body: JSON.stringify({ reason: reason || "" }),
  });
}

export type OrgApplicationItem = {
  _id: string;
  organizationName: string;
  contactName: string;
  email: string;
  phone?: string;
  website?: string;
  message?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  rejectionReason?: string;
};

export async function adminMe() {
  if (!getAdminToken()) throw new Error("UNAUTHORIZED");
  return adminFetch<{ admin: AdminSessionUser }>("/api/admin/auth/me");
}

export async function fetchAdminRsvps(params?: {
  eventSlug?: string;
  q?: string;
  organizationId?: string;
}) {
  const search = new URLSearchParams();
  if (params?.eventSlug) search.set("eventSlug", params.eventSlug);
  if (params?.q) search.set("q", params.q);
  if (params?.organizationId) search.set("organizationId", params.organizationId);
  const qs = search.toString();
  return adminFetch<{
    items: AdminRsvp[];
    events: { slug: string; title: string; count: number }[];
    total: number;
  }>(`/api/admin/rsvps${qs ? `?${qs}` : ""}`);
}

export async function fetchAdminContacts(q?: string) {
  const qs = q ? `?q=${encodeURIComponent(q)}` : "";
  return adminFetch<{ items: AdminContact[]; total: number }>(`/api/admin/contacts${qs}`);
}

export async function fetchAdminOrganizations() {
  return adminFetch<{ items: AdminOrganization[] }>("/api/admin/events/organizations");
}

export async function fetchAdminEvents(organizationId?: string) {
  const qs = organizationId ? `?organizationId=${encodeURIComponent(organizationId)}` : "";
  return adminFetch<{ items: AdminEvent[]; total: number }>(`/api/admin/events${qs}`);
}

export async function uploadAdminPaymentQr(file: File) {
  const body = new FormData();
  body.append("qr", file);
  return adminFetch<{ key: string }>("/api/admin/events/payment-qr-upload", {
    method: "POST",
    body,
  });
}

export async function createAdminEvent(payload: Partial<AdminEvent>) {
  return adminFetch<{ item: AdminEvent }>("/api/admin/events", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateAdminEvent(id: string, payload: Partial<AdminEvent>) {
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

export async function updateAdminRsvpPaymentStatus(
  id: string,
  status: "paid" | "unpaid" | "failed" | "pending_review",
) {
  return adminFetch<{ item: AdminRsvp }>(`/api/admin/rsvps/${id}/payment-status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
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

export type AdminSessionUser = {
  id: string;
  email: string;
  name: string;
  role: "platform_admin" | "org_admin";
  organizationId?: string | null;
  organization?: AdminOrganization | null;
};

export type AdminOrganization = {
  id: string;
  name: string;
  slug: string;
  type?: string;
};

export type AdminPaymentMethod = {
  type: "razorpay" | "upi_qr" | "upi_id" | "payment_link" | "qiyu" | "other";
  enabled?: boolean;
  label?: string;
  upiId?: string;
  paymentNumber?: string;
  paymentLink?: string;
  qrImageUrl?: string;
  razorpayKeyId?: string;
  qiyuMerchantId?: string;
  qiyuApiKey?: string;
  instructions?: string;
};

export type AdminPaymentConfig = {
  enabled?: boolean;
  amountInr?: number;
  currency?: string;
  methods?: AdminPaymentMethod[];
};

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

export type AdminHackathonInvitation = {
  _id: string;
  email: string;
  inviteeName?: string;
  status: "pending" | "accepted" | "revoked" | "expired";
  expiresAt: string;
  createdAt: string;
  acceptedAt?: string | null;
  revokedAt?: string | null;
  lastSentAt: string;
  deliveryStatus: "sent" | "failed";
  resendCount: number;
  acceptedBy?: { name: string; email: string } | null;
};

export type AdminHackathonJuryMember = {
  id: string;
  userId: string;
  name: string;
  email: string;
  status: "active" | "revoked";
  accountStatus: "active" | "disabled";
  joinedAt: string;
  teamsEvaluated: number;
  teamsPending: number;
  completionPercent: number;
};

function adminHackathonPath(hackathonId: string) {
  return `/api/admin/hackathons/${encodeURIComponent(hackathonId)}`;
}

export function fetchAdminHackathonInvitations(hackathonId: string) {
  return adminFetch<{ items: AdminHackathonInvitation[]; total: number }>(
    `${adminHackathonPath(hackathonId)}/jury-invitations`,
  );
}

export function createAdminHackathonInvitation(
  hackathonId: string,
  payload: { email: string; name?: string },
) {
  return adminFetch<{
    invitation: Pick<
      AdminHackathonInvitation,
      "email" | "status" | "expiresAt" | "lastSentAt" | "deliveryStatus"
    > & { id: string; sentAt: string };
    emailSent: boolean;
  }>(`${adminHackathonPath(hackathonId)}/jury-invitations`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function resendAdminHackathonInvitation(hackathonId: string, invitationId: string) {
  return adminFetch<{ emailSent: boolean }>(
    `${adminHackathonPath(hackathonId)}/jury-invitations/${encodeURIComponent(invitationId)}/resend`,
    { method: "POST", body: JSON.stringify({}) },
  );
}

export function revokeAdminHackathonInvitation(hackathonId: string, invitationId: string) {
  return adminFetch<{ ok: boolean; status: string }>(
    `${adminHackathonPath(hackathonId)}/jury-invitations/${encodeURIComponent(invitationId)}/revoke`,
    { method: "POST", body: JSON.stringify({}) },
  );
}

export function fetchAdminHackathonJuryMembers(hackathonId: string) {
  return adminFetch<{ items: AdminHackathonJuryMember[]; total: number; teamCount: number }>(
    `${adminHackathonPath(hackathonId)}/jury-members`,
  );
}

export function revokeAdminHackathonJuryMember(hackathonId: string, membershipId: string) {
  return adminFetch<{ ok: boolean; accountDisabled?: boolean }>(
    `${adminHackathonPath(hackathonId)}/jury-members/${encodeURIComponent(membershipId)}`,
    { method: "DELETE" },
  );
}

export type AdminHackathonLeaderboardEntry = {
  teamId: string;
  teamName: string;
  leadName: string;
  problemStatementId: string;
  problemStatementTitle: string;
  domainId: string;
  submittedEvaluations: number;
  totalJuryMembers: number;
  averageScore: number | null;
  highestScore: number | null;
  lowestScore: number | null;
  rank: number | null;
};

export type AdminHackathonLeaderboard = {
  requiredEvaluations: number;
  totalJuryMembers: number;
  teamCount: number;
  rankedCount: number;
  items: AdminHackathonLeaderboardEntry[];
};

export function fetchAdminHackathonLeaderboard(hackathonId: string) {
  return adminFetch<AdminHackathonLeaderboard>(`${adminHackathonPath(hackathonId)}/leaderboard`);
}

export type AdminHackathonEvaluation = {
  _id: string;
  status: "draft" | "submitted" | "pending";
  totalScore: number;
  comments: string;
  criteriaScores: { criterionId: string; score: number }[];
  submittedAt: string | null;
  juryMemberId: { name: string; email: string };
  teamId: {
    _id: string;
    team_name: string;
    lead_name: string;
    problem_statement_id: string | null;
  };
};

export function fetchAdminHackathonEvaluations(hackathonId: string) {
  return adminFetch<{
    items: AdminHackathonEvaluation[];
    total: number;
    teamCount: number;
    assignedJuryCount: number;
    submittedCount: number;
    pendingCount: number;
    rubric: { id: string; name: string; maxMarks: number; order: number }[];
  }>(`${adminHackathonPath(hackathonId)}/evaluations`);
}

export function reopenAdminHackathonEvaluation(hackathonId: string, evaluationId: string) {
  return adminFetch<{ evaluation: AdminHackathonEvaluation }>(
    `${adminHackathonPath(hackathonId)}/evaluations/${encodeURIComponent(evaluationId)}/reopen`,
    { method: "POST", body: JSON.stringify({}) },
  );
}

export function reviewAdminHackathonProblemStatement(
  hackathonId: string,
  statementId: string,
  payload: { action: "approve" | "reject"; reason?: string },
) {
  return adminFetch<{
    statement: {
      id: string;
      status: "active" | "rejected";
      reviewedAt: string;
      rejectionReason: string;
      createdBy: { name: string } | null;
    };
  }>(
    `${adminHackathonPath(hackathonId)}/problem-statements/${encodeURIComponent(statementId)}/approval`,
    { method: "PATCH", body: JSON.stringify(payload) },
  );
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
  gtmChallenges?: string[];
  leaveWith?: string[];
  industry: string;
  lookingFor?: string[];
  offerCommunity?: string[];
  wantToMeet?: string[];
  canHelpWith?: string;
  biggestChallenge?: string;
  joinWhatsapp?: boolean;
  subscribeUpdates?: boolean;
  questions?: string;
  heardAboutEvent: string;
  heardAboutEventOther: string;
  guests?: Array<{
    name: string;
    phone: string;
    email: string;
  }>;
  createdAt: string;
  payment?: {
    status?: string;
    amountInr?: number;
    amountPaise?: number;
    currency?: string;
    method?: string;
    provider?: string;
    proofUrl?: string;
    note?: string;
    ticketId?: string;
    ticketLabel?: string;
    memberCount?: number;
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
  organizationId?: string;
  organization?: AdminOrganization | null;
  payment?: AdminPaymentConfig;
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

export type AdminAnalyticsSummary = {
  days: number;
  since: string;
  visitors: {
    pageviews: number;
    uniqueSessions: number;
  };
  funnel: Array<{
    name: string;
    label: string;
    count: number;
    sessions: number;
  }>;
  topPaths: Array<{ path: string; views: number }>;
  topEvents: Array<{ slug: string; views: number }>;
};

export async function fetchAdminAnalytics(days = 7, eventSlug?: string) {
  const params = new URLSearchParams({ days: String(days) });
  if (eventSlug) params.set("eventSlug", eventSlug);
  return adminFetch<AdminAnalyticsSummary>(`/api/admin/analytics/summary?${params.toString()}`);
}
