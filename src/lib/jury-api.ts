import { clearJuryToken, juryAuthHeaders, setJuryToken } from "./jury-auth";

const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

type ApiError = { error?: string; message?: string };

async function request<T>(path: string, init: RequestInit = {}, authenticated = true): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        ...(authenticated ? juryAuthHeaders() : { "Content-Type": "application/json" }),
        ...(init.headers || {}),
      },
    });
  } catch {
    throw new Error("Jury service is unavailable. Please try again shortly.");
  }
  const text = await response.text();
  let data: (T & ApiError) | ApiError = {};
  try {
    data = JSON.parse(text);
  } catch {
    data = {};
  }
  if (response.status === 401 && authenticated) clearJuryToken();
  if (!response.ok) {
    const message =
      (data as ApiError).error ||
      (data as ApiError).message ||
      text ||
      `Request failed (${response.status}).`;
    throw new Error(message);
  }
  return data as T;
}

function post<T>(path: string, body: unknown, authenticated = true) {
  return request<T>(path, { method: "POST", body: JSON.stringify(body) }, authenticated);
}

export type JuryUser = { id: string; name: string; email: string };
export type JuryHackathon = {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  teamCount: number;
  statementCount: number;
  evaluatedCount: number;
  pendingEvaluations: number;
};
export type JuryCriterion = {
  id: string;
  name: string;
  description: string;
  maxMarks: number;
  order: number;
  active: boolean;
};
export type JuryTeam = {
  id: string;
  teamName: string;
  members: string[];
  problemStatementId: string | null;
  submission: {
    description: string;
    githubRepo: string;
    videoUrl: string;
    submittedAt: string | null;
    hasFile: boolean;
  };
  evaluationStatus?: "pending" | "draft" | "submitted";
  totalScore?: number | null;
};
export type JuryEvaluation = {
  _id: string;
  criteriaScores: { criterionId: string; score: number }[];
  totalScore: number;
  comments: string;
  status: "draft" | "submitted";
  submittedAt: string | null;
};

export type JuryLeaderboardEntry = {
  teamId: string;
  teamName: string;
  submittedEvaluations: number;
  totalJuryMembers: number;
  averageScore: number | null;
  rank: number | null;
};

export function validateJuryInvitation(token: string) {
  return post<{
    status: string;
    emailHint: string;
    expiresAt: string;
    hackathon: { name: string; slug: string };
  }>("/api/jury/invitations/validate", { token }, false);
}

export async function signupJury(token: string, name: string, password: string) {
  const result = await post<{ token: string; user: JuryUser }>(
    "/api/jury/auth/signup",
    { token, name, password },
    false,
  );
  setJuryToken(result.token);
  return result;
}

export async function loginJury(email: string, password: string) {
  const result = await post<{ token: string; user: JuryUser }>(
    "/api/jury/auth/login",
    { email, password },
    false,
  );
  setJuryToken(result.token);
  return result;
}

export function acceptJuryInvitation(token: string) {
  return post<{ membership: { id: string; hackathonId: string; status: string } }>(
    "/api/jury/invitations/accept",
    { token },
  );
}

export function getJuryMe() {
  return request<{ user: JuryUser }>("/api/jury/auth/me");
}

export function getJuryHackathons() {
  return request<{ items: JuryHackathon[] }>("/api/jury/hackathons");
}

export function getJuryHackathon(hackathonId: string) {
  return request<{ hackathon: JuryHackathon & { rubric: JuryCriterion[] } }>(
    `/api/jury/hackathons/${encodeURIComponent(hackathonId)}`,
  );
}

export function getJuryLeaderboard(hackathonId: string) {
  return request<{ items: JuryLeaderboardEntry[]; requiredEvaluations?: number }>(
    `/api/jury/hackathons/${encodeURIComponent(hackathonId)}/leaderboard`,
  );
}

export type JuryProblemStatementStatus = "pending_approval" | "active" | "rejected";

export type JuryProblemStatement = {
  id: string;
  domainId: string;
  domainIds?: string[];
  title: string;
  category: string;
  difficulty: string;
  industry?: string;
  scope?: string;
  platform?: string;
  description: string;
  deliverables: string[];
  status: JuryProblemStatementStatus;
  rejectionReason?: string;
  reviewedAt?: string | null;
  createdBy: { _id: string; name: string } | null;
  createdByMe: boolean;
  createdAt: string;
};

export function getJuryProblemStatements(hackathonId: string) {
  return request<{ statements: JuryProblemStatement[] }>(
    `/api/jury/hackathons/${encodeURIComponent(hackathonId)}/problem-statements`,
  );
}

export function createJuryProblemStatement(
  hackathonId: string,
  body: {
    domainId: string;
    title: string;
    category: string;
    difficulty: string;
    industry: string;
    scope: string;
    platform: string;
    description: string;
    deliverables: string[];
  },
) {
  return post<{ statement: { id: string } }>(
    `/api/jury/hackathons/${encodeURIComponent(hackathonId)}/problem-statements`,
    body,
  );
}

export function getJuryTeams(hackathonId: string) {
  return request<{ items: JuryTeam[] }>(
    `/api/jury/hackathons/${encodeURIComponent(hackathonId)}/teams`,
  );
}

export function getJuryTeam(hackathonId: string, teamId: string) {
  return request<{
    team: JuryTeam;
    problemStatement: {
      id: string;
      domainId: string;
      domainIds?: string[];
      title: string;
      category: string;
      difficulty: string;
      industry?: string;
      scope?: string;
      platform?: string;
      description: string;
      deliverables: string[];
    } | null;
  }>(`/api/jury/hackathons/${encodeURIComponent(hackathonId)}/teams/${encodeURIComponent(teamId)}`);
}

export async function getJurySubmissionFile(hackathonId: string, teamId: string) {
  const response = await fetch(
    `${API_BASE}/api/jury/hackathons/${encodeURIComponent(hackathonId)}/teams/${encodeURIComponent(teamId)}/submission`,
    {
      headers: juryAuthHeaders(),
    },
  );
  if (response.status === 401) clearJuryToken();
  if (!response.ok) throw new Error((await response.text()) || "Could not load submission file.");
  return URL.createObjectURL(await response.blob());
}

export type JurySubmissionViewLink = {
  url: string;
  filename: string;
  contentType: string;
};

export async function getJurySubmissionViewLink(
  hackathonId: string,
  teamId: string,
): Promise<JurySubmissionViewLink> {
  const data = await post<{ path: string; filename: string; contentType: string }>(
    `/api/jury/hackathons/${encodeURIComponent(hackathonId)}/teams/${encodeURIComponent(teamId)}/submission/view-link`,
    {},
  );
  return {
    url: new URL(`${API_BASE}${data.path}`, window.location.origin).toString(),
    filename: data.filename,
    contentType: data.contentType,
  };
}

export function getJuryEvaluation(hackathonId: string, teamId: string) {
  return request<{ evaluation: JuryEvaluation | null; rubric: JuryCriterion[] }>(
    `/api/jury/hackathons/${encodeURIComponent(hackathonId)}/teams/${encodeURIComponent(teamId)}/evaluation`,
  );
}

export function saveJuryEvaluationDraft(
  hackathonId: string,
  teamId: string,
  body: {
    criteriaScores: Record<string, number>;
    comments: string;
    status: "draft";
  },
) {
  return request<{ evaluation: JuryEvaluation }>(
    `/api/jury/hackathons/${encodeURIComponent(hackathonId)}/teams/${encodeURIComponent(teamId)}/evaluation`,
    {
      method: "PUT",
      body: JSON.stringify(body),
    },
  );
}

export function submitJuryEvaluation(
  hackathonId: string,
  teamId: string,
  body: { criteriaScores?: Record<string, number>; comments?: string } = {},
) {
  return post<{ evaluation: JuryEvaluation }>(
    `/api/jury/hackathons/${encodeURIComponent(hackathonId)}/teams/${encodeURIComponent(teamId)}/evaluation/submit`,
    body,
  );
}
