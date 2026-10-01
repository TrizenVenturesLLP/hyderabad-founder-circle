import { adminAuthHeaders } from "./admin-auth";
import type { ProblemStatement } from "./hackathon";

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

  let data: { error?: unknown; message?: unknown } = {};

  try {
    data = JSON.parse(responseText) as {
      error?: unknown;
      message?: unknown;
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

    throw new Error(message);
  }

  return (data || {}) as T;
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
  return hackathonFetch<{ ok?: boolean; message?: string }>("/api/hackathon/register", payload);
}

export function loginHackathonStudent(payload: { email: string; phone: string }) {
  return hackathonFetch<{
    ok?: boolean;
    message?: string;
    token?: string;
    profile?: {
      name: string;
      email: string;
      phone: string;
      role: "lead" | "member";
    };
    team?: HackathonRegisteredUser;
  }>("/api/hackathon/login", payload);
}

export function getHackathonUserDetails(payload: { email: string; phone: string }) {
  return hackathonFetch<{ message?: string; user?: HackathonRegisteredUser }>(
    "/api/hackathon/user",
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
    statements?: (ProblemStatement & { createdBy: { name: string } | null })[];
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
  id: string;
  domainId: string;
  title: string;
  category: string;
  difficulty: string;
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
    title: string;
    description: string;
    difficulty: string;
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
