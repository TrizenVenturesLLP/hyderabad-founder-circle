import { adminAuthHeaders } from "./admin-auth";
import type { ProblemStatement } from "./hackathon";
import { getHackathonStudentToken } from "./hackathon-storage";

const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

async function hackathonFetch<T>(path: string, payload: Record<string, unknown>): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error("Registration service is unavailable. Please try again shortly.");
  }

  const responseText = await response.text();

  let data: { error?: unknown; message?: unknown; code?: unknown } = {};

  try {
    data = JSON.parse(responseText) as {
      error?: unknown;
      message?: unknown;
      code?: unknown;
    };
  } catch {
    // Keep the raw response below when the backend does not return JSON.
  }

  if (!response.ok) {
    const message =
      typeof data?.error === "string"
        ? data.error
        : typeof data?.message === "string"
          ? data.message
          : responseText.trim() || `Request failed with status ${response.status}.`;

    throw new HackathonApiError(message, typeof data?.code === "string" ? data.code : undefined);
  }

  return (data || {}) as T;
}

export class HackathonApiError extends Error {
  code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = "HackathonApiError";
    this.code = code;
  }
}

export type HackathonTeamMemberPayload = {
  full_name: string;
  email: string;
  phone: string;
  role?: "lead" | "member";
};

export type HackathonRegistrationPayload = {
  team_name: string;
  lead_name: string;
  email: string;
  phone: string;
  members: HackathonTeamMemberPayload[];
};

export function registerHackathonStudent(payload: HackathonRegistrationPayload) {
  return hackathonFetch<{ ok?: boolean; message?: string; confirmationSent?: boolean }>(
    "/api/hackathon/register",
    payload,
  );
}

export function validateHackathonPasswordLink(token: string) {
  return hackathonFetch<{
    email: string;
    name: string;
    teamName: string;
    hasPassword: boolean;
  }>("/api/hackathon/password/validate", { token });
}

export function setHackathonPassword(payload: { token: string; password: string }) {
  return hackathonFetch<{ message: string; email: string }>("/api/hackathon/password/set", payload);
}

export function requestHackathonPasswordLink(email: string) {
  return hackathonFetch<{ message: string }>("/api/hackathon/password/request-link", { email });
}

export function loginHackathonStudent(payload: { email: string; password: string }) {
  return hackathonFetch<{
    ok?: boolean;
    message?: string;
    token: string;
    profile?: {
      name: string;
      email: string;
      phone: string;
      role: "lead" | "member";
    };
    team?: HackathonRegisteredUser;
  }>("/api/hackathon/login", payload);
}

async function participantCertificateFetch<T>(path: string): Promise<T> {
  const token = getHackathonStudentToken();
  if (!token) throw new Error("Please sign in again to access your certificate.");

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    throw new Error("Certificate service is unavailable. Please try again shortly.");
  }

  const responseText = await response.text();
  let data: { message?: unknown; error?: unknown } = {};
  try {
    data = JSON.parse(responseText) as { message?: unknown; error?: unknown };
  } catch {
    // Preserve non-JSON server errors in the message below.
  }
  if (!response.ok) {
    const message =
      typeof data.message === "string"
        ? data.message
        : typeof data.error === "string"
          ? data.error
          : responseText.trim() || `Request failed with status ${response.status}.`;
    throw new Error(message);
  }
  return data as T;
}

export type ParticipantCertificate = {
  participantName: string;
  teamName: string;
  certificateType: "participation";
  status: "pending" | "generated" | "failed";
  generatedAt: string | null;
};

export function getParticipantHackathonCertificate(hackathonId: string) {
  return participantCertificateFetch<{ certificate: ParticipantCertificate }>(
    `/api/hackathons/${encodeURIComponent(hackathonId)}/certificate`,
  );
}

export function getParticipantCertificateUrl(hackathonId: string, download = false) {
  return participantCertificateFetch<{ url: string; expiresIn: number }>(
    `/api/hackathons/${encodeURIComponent(hackathonId)}/certificate/download${download ? "?download=1" : ""}`,
  );
}

export type ParticipantRound2Certificate = {
  participantName: string;
  teamName: string;
  round: 2;
  generatedAt: string | null;
};

export function getParticipantRound2Certificate(hackathonId: string) {
  return participantCertificateFetch<{ certificate: ParticipantRound2Certificate | null }>(
    `/api/hackathons/${encodeURIComponent(hackathonId)}/round-2-certificate`,
  );
}

export function getParticipantRound2CertificateUrl(hackathonId: string, download = false) {
  return participantCertificateFetch<{ url: string; expiresIn: number }>(
    `/api/hackathons/${encodeURIComponent(hackathonId)}/round-2-certificate/download${download ? "?download=1" : ""}`,
  );
}

export type HackathonRoundResult = {
  round: number;
  status: "pending" | "qualified" | "disqualified";
  nextRound: number | null;
};

export type HackathonProblemProposal = {
  id: string;
  title: string;
  domainId: string;
  status: "pending_approval" | "active" | "rejected";
  rejectionReason: string;
  createdAt: string;
};

export type HackathonProposalSlots = { limit: number; approved: number };

type HackathonProposalState = {
  problemProposal?: HackathonProblemProposal | null;
  proposalSlots?: HackathonProposalSlots;
};

export function getHackathonUserDetails(payload: { email: string; phone: string }) {
  return hackathonFetch<
    {
      message?: string;
      user?: HackathonRegisteredUser;
      /** Only present once the admin has published the round's results. */
      roundResult?: HackathonRoundResult | null;
    } & HackathonProposalState
  >("/api/hackathon/user", payload);
}

export function proposeHackathonProblemStatement(payload: {
  email: string;
  phone: string;
  domainId: string;
  title: string;
  description: string;
  industry?: string;
  platform?: string;
}) {
  return hackathonFetch<{ message: string } & HackathonProposalState>(
    "/api/hackathon/problem-proposals",
    payload,
  );
}

export function addHackathonTeamMember(payload: {
  email: string;
  phone: string;
  member: HackathonTeamMemberPayload;
}) {
  return hackathonFetch<{
    message: string;
    invitationSent: boolean;
    user?: HackathonRegisteredUser;
  }>("/api/hackathon/team/members", payload);
}

export function resendHackathonTeamInvitation(payload: {
  email: string;
  phone: string;
  member_email: string;
}) {
  return hackathonFetch<{
    message: string;
    invitationSent: boolean;
  }>("/api/hackathon/team/members/invite", payload);
}

export function updateHackathonTeamMember(payload: {
  email: string;
  phone: string;
  target_email: string;
  member: HackathonTeamMemberPayload;
}) {
  return hackathonFetch<{
    message: string;
    user?: HackathonRegisteredUser;
  }>("/api/hackathon/team/members/update", payload);
}

export function confirmHackathonProblem(payload: {
  email: string;
  phone: string;
  problem_statement_id: string;
}) {
  return hackathonFetch<{ message?: string; user?: HackathonRegisteredUser }>(
    "/api/hackathon/confirm-problem",
    payload,
  );
}

export type HackathonRegisteredUser = {
  _id: string;
  team_name: string;
  lead_name: string;
  email: string;
  phone: string;
  problem_statement_id: string | null;
  members: HackathonTeamMemberPayload[];

  submission?: {
    github_repo: string | null;
    description: string | null;
    ppt_url: string | null;
    video_url: string | null;
    submitted_at: string | null;
  };
  evaluation?: HackathonEvaluation | null;

  createdAt: string;
  updatedAt: string;
};

export type HackathonEvaluationScores = {
  problem_understanding: number;
  innovation_creativity: number;
  technical_implementation: number;
  functionality_execution: number;
  communication_presentation: number;
};

export type HackathonEvaluation = {
  scores: HackathonEvaluationScores;
  comments: string;
  evaluated_at: string | null;
};

export async function saveHackathonEvaluation(
  id: string,
  evaluation: { scores: HackathonEvaluationScores; comments: string },
) {
  const response = await fetch(`${API_BASE}/api/hackathon/users/${id}/evaluation`, {
    method: "PATCH",
    headers: adminAuthHeaders(),
    body: JSON.stringify(evaluation),
  });
  const responseText = await response.text();
  let data: { message?: string; user?: HackathonRegisteredUser } = {};

  try {
    data = JSON.parse(responseText);
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(
      data.message || responseText.trim() || `Request failed with status ${response.status}.`,
    );
  }

  return data;
}

export async function getHackathonRegisteredUsers() {
  const response = await fetch(`${API_BASE}/api/hackathon/users`, {
    method: "GET",
    headers: adminAuthHeaders(),
  });

  const responseText = await response.text();

  let data: {
    users?: HackathonRegisteredUser[];
    message?: string;
  } = {};

  try {
    data = JSON.parse(responseText);
  } catch {
    // Keep the raw response below when the backend does not return JSON.
  }

  if (!response.ok) {
    throw new Error(
      data.message || responseText.trim() || `Request failed with status ${response.status}.`,
    );
  }

  return data;
}

/* =========================
    HACKATHON PROJECT SUBMISSION
    ========================= */

export type HackathonSubmissionPayload = {
  email: string;
  phone: string;
  github_repo: string;
  description: string;
  ppt: File;
  video_url: string;
};

export async function submitHackathonProject(payload: HackathonSubmissionPayload) {
  let response: Response;

  try {
    const formData = new FormData();

    formData.append("email", payload.email);
    formData.append("phone", payload.phone);
    formData.append("github_repo", payload.github_repo);
    formData.append("description", payload.description);
    formData.append("ppt", payload.ppt);
    formData.append("video_url", payload.video_url);

    response = await fetch(`${API_BASE}/api/hackathon/submit`, {
      method: "POST",
      body: formData,
    });
  } catch {
    throw new Error("Submission service is unavailable. Please try again shortly.");
  }

  const responseText = await response.text();

  let data: {
    message?: string;
    error?: string;
    user?: HackathonRegisteredUser;
  } = {};

  try {
    data = JSON.parse(responseText);
  } catch {
    // Keep the raw response below when the backend does not return JSON.
  }

  if (!response.ok) {
    throw new Error(
      data.message ||
        data.error ||
        responseText.trim() ||
        `Request failed with status ${response.status}.`,
    );
  }

  return data;
}

export async function suspendHackathonUser(id: string) {
  const response = await fetch(`${API_BASE}/api/hackathon/users/${id}/suspend`, {
    method: "PATCH",
    headers: adminAuthHeaders(),
  });

  const responseText = await response.text();

  let data: { message?: string } = {};

  try {
    data = JSON.parse(responseText);
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(
      data.message || responseText.trim() || `Request failed with status ${response.status}.`,
    );
  }

  return data;
}

export async function activateHackathonUser(id: string) {
  const response = await fetch(`${API_BASE}/api/hackathon/users/${id}/activate`, {
    method: "PATCH",
    headers: adminAuthHeaders(),
  });

  const responseText = await response.text();

  let data: { message?: string } = {};

  try {
    data = JSON.parse(responseText);
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(
      data.message || responseText.trim() || `Request failed with status ${response.status}.`,
    );
  }

  return data;
}

export async function removeHackathonUser(id: string) {
  const response = await fetch(`${API_BASE}/api/hackathon/users/${id}`, {
    method: "DELETE",
    headers: adminAuthHeaders(),
  });

  const responseText = await response.text();

  let data: { message?: string } = {};

  try {
    data = JSON.parse(responseText);
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(
      data.message || responseText.trim() || `Request failed with status ${response.status}.`,
    );
  }

  return data;
}
export async function getHackathonReleaseTimer() {
  const response = await fetch(`${API_BASE}/api/hackathon/release-timer`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(responseText.trim() || `Request failed with status ${response.status}.`);
  }

  return JSON.parse(responseText);
}

export async function saveHackathonReleaseTimer(releaseAt: string) {
  const response = await fetch(`${API_BASE}/api/hackathon/release-timer`, {
    method: "PUT",
    headers: adminAuthHeaders(),
    body: JSON.stringify({ releaseAt }),
  });

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(responseText.trim() || `Request failed with status ${response.status}.`);
  }

  return JSON.parse(responseText);
}

export async function clearHackathonReleaseTimer() {
  const response = await fetch(`${API_BASE}/api/hackathon/release-timer`, {
    method: "DELETE",
    headers: adminAuthHeaders(),
  });

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(responseText.trim() || `Request failed with status ${response.status}.`);
  }

  return JSON.parse(responseText);
}

export async function getHackathonProblemStatements() {
  const response = await fetch(`${API_BASE}/api/hackathon/problem-statements`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(responseText.trim() || `Request failed with status ${response.status}.`);
  }

  return JSON.parse(responseText);
}

export async function getAdminHackathonProblemStatements(hackathonId: string) {
  const response = await fetch(
    `${API_BASE}/api/admin/hackathons/${encodeURIComponent(hackathonId)}/problem-statements`,
    { headers: adminAuthHeaders() },
  );
  const responseText = await response.text();
  let data: {
    error?: string;
    claimLimit?: number;
    teamProposalLimit?: number;
    statements?: (ProblemStatement & {
      createdBy: { name: string } | null;
      claimedBy?: { name: string; email?: string } | null;
      proposedByTeam?: { team_name: string; lead_name?: string } | null;
      confirmedTeams?: { team_name: string; lead_name?: string }[];
    })[];
  } = {};
  try {
    data = JSON.parse(responseText);
  } catch {
    data = {};
  }
  if (!response.ok) {
    throw new Error(
      data.error || responseText.trim() || `Request failed with status ${response.status}.`,
    );
  }
  return data;
}

export async function saveHackathonProblemStatement(statement: {
  id?: string;
  domainId: string;
  domainIds: string[];
  title: string;
  category: string;
  difficulty: string;
  organization?: string;
  contactInfo: string;
  industry?: string;
  scope?: string;
  platform?: string;
  description: string;
  deliverables: string[];
}) {
  const response = await fetch(`${API_BASE}/api/hackathon/problem-statements`, {
    method: "POST",
    headers: adminAuthHeaders(),
    body: JSON.stringify(statement),
  });

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(responseText.trim() || `Request failed with status ${response.status}.`);
  }

  return JSON.parse(responseText);
}

export async function bulkAddHackathonProblemStatements(
  statements: {
    domainId: string;
    domainIds: string[];
    title: string;
    description: string;
    difficulty: string;
    organization?: string;
    contactInfo?: string;
    industry?: string;
    scope?: string;
    platform?: string;
  }[],
) {
  const response = await fetch(`${API_BASE}/api/hackathon/problem-statements/bulk`, {
    method: "POST",
    headers: adminAuthHeaders(),
    body: JSON.stringify({ statements }),
  });
  const responseText = await response.text();
  let data: { message?: string; statements?: unknown[] } = {};
  try {
    data = JSON.parse(responseText);
  } catch {
    data = {};
  }
  if (!response.ok) {
    throw new Error(
      data.message || responseText.trim() || `Request failed with status ${response.status}.`,
    );
  }
  return data;
}

export async function clearHackathonProblemStatements() {
  const response = await fetch(`${API_BASE}/api/hackathon/problem-statements`, {
    method: "DELETE",
    headers: adminAuthHeaders(),
  });
  const responseText = await response.text();
  if (!response.ok) {
    throw new Error(responseText.trim() || `Request failed with status ${response.status}.`);
  }
  return JSON.parse(responseText);
}

export async function deleteHackathonProblemStatement(id: string) {
  const response = await fetch(
    `${API_BASE}/api/hackathon/problem-statements/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      headers: adminAuthHeaders(),
    },
  );

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(responseText.trim() || `Request failed with status ${response.status}.`);
  }

  return JSON.parse(responseText);
}

export async function fetchAdminHackathonSubmission(fileUrl: string) {
  const response = await fetch(`${API_BASE}${fileUrl}`, {
    headers: adminAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error((await response.text()) || `Request failed with status ${response.status}.`);
  }
  return URL.createObjectURL(await response.blob());
}
