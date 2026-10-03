import {
  POSTER_DOMAINS,
  POSTER_HACKATHON_DETAILS,
  STARTER_PROBLEM_STATEMENTS,
} from "./hackathon-data";
import type {
  HackathonDetails,
  HackathonDomain,
  HackathonReleaseTimer,
  HackathonStudentProfile,
  ProblemStatement,
} from "./hackathon";

const STORAGE_KEY_STATEMENTS = "trizen_hackathon_problem_statements";
const STORAGE_KEY_DETAILS = "trizen_hackathon_details";
const STORAGE_KEY_RELEASE_TIMER = "trizen_hackathon_release_timer";
const STORAGE_KEY_SELECTED_STATEMENT = "trizen_hackathon_selected_statement";
const STORAGE_KEY_STUDENT_PROFILE = "trizen_hackathon_student_profile";
const CHANGE_EVENT_NAME = "trizen_hackathon_data_change";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function getHackathonDetails(): HackathonDetails {
  if (!isBrowser()) return POSTER_HACKATHON_DETAILS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DETAILS);
    if (!raw) return POSTER_HACKATHON_DETAILS;
    const parsed = JSON.parse(raw) as Partial<HackathonDetails>;
    return {
      ...POSTER_HACKATHON_DETAILS,
      ...parsed,
      venue: {
        ...POSTER_HACKATHON_DETAILS.venue,
        ...(parsed.venue || {}),
      },
      domains: POSTER_DOMAINS,
    };
  } catch {
    return POSTER_HACKATHON_DETAILS;
  }
}

export function saveHackathonDetails(details: Partial<HackathonDetails>): HackathonDetails {
  const current = getHackathonDetails();
  const updated: HackathonDetails = {
    ...current,
    ...details,
    venue: {
      ...current.venue,
      ...(details.venue || {}),
    },
    domains: POSTER_DOMAINS,
  };
  if (isBrowser()) {
    try {
      localStorage.setItem(STORAGE_KEY_DETAILS, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent(CHANGE_EVENT_NAME));
    } catch (err) {
      console.error("Failed to save hackathon details", err);
    }
  }
  return updated;
}

export function getHackathonReleaseTimer(): HackathonReleaseTimer {
  if (!isBrowser()) return { releaseAt: null };
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RELEASE_TIMER);
    if (!raw) return { releaseAt: null };
    const parsed = JSON.parse(raw) as Partial<HackathonReleaseTimer>;
    return { releaseAt: typeof parsed.releaseAt === "string" ? parsed.releaseAt : null };
  } catch {
    return { releaseAt: null };
  }
}

export function saveHackathonReleaseTimer(releaseAt: string | null): HackathonReleaseTimer {
  const timer = { releaseAt } satisfies HackathonReleaseTimer;
  if (isBrowser()) {
    try {
      localStorage.setItem(STORAGE_KEY_RELEASE_TIMER, JSON.stringify(timer));
      window.dispatchEvent(new CustomEvent(CHANGE_EVENT_NAME));
    } catch (err) {
      console.error("Failed to save hackathon release timer", err);
    }
  }
  return timer;
}

export function areProblemStatementsReleased(now = Date.now()): boolean {
  const releaseAt = getHackathonReleaseTimer().releaseAt;
  return !releaseAt || Date.parse(releaseAt) <= now;
}

export function getSelectedProblemStatementId(): string | null {
  if (!isBrowser()) return null;
  return localStorage.getItem(STORAGE_KEY_SELECTED_STATEMENT);
}

export function saveSelectedProblemStatementId(id: string): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEY_SELECTED_STATEMENT, id);
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT_NAME));
  } catch (err) {
    console.error("Failed to save selected problem statement", err);
  }
}

export function getHackathonStudentProfile(): HackathonStudentProfile | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STUDENT_PROFILE);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<HackathonStudentProfile>;
    if (
      typeof parsed.name !== "string" ||
      typeof parsed.mobile !== "string" ||
      typeof parsed.email !== "string"
    ) {
      return null;
    }
    return { name: parsed.name, mobile: parsed.mobile, email: parsed.email };
  } catch {
    return null;
  }
}

export function saveHackathonStudentProfile(profile: HackathonStudentProfile): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEY_STUDENT_PROFILE, JSON.stringify(profile));
  } catch (err) {
    console.error("Failed to save hackathon student profile", err);
  }
}

export function getAllProblemStatements(): ProblemStatement[] {
  if (!isBrowser()) return STARTER_PROBLEM_STATEMENTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STATEMENTS);
    if (raw === null) {
      localStorage.setItem(STORAGE_KEY_STATEMENTS, JSON.stringify(STARTER_PROBLEM_STATEMENTS));
      return STARTER_PROBLEM_STATEMENTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed as ProblemStatement[];
    }
    return [];
  } catch {
    return [];
  }
}

export function saveAllProblemStatements(statements: ProblemStatement[]): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEY_STATEMENTS, JSON.stringify(statements));
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT_NAME));
  } catch (err) {
    console.error("Failed to persist problem statements", err);
  }
}

export function addProblemStatement(
  statement: Omit<ProblemStatement, "id"> & { id?: string },
): ProblemStatement {
  const existing = getAllProblemStatements();
  const prefixMap: Record<string, string> = {
    "ui-ux": "UX",
    "web-dev": "WEB",
    "vibe-coding": "VC",
    "agentic-ai": "AGT",
  };
  const prefix = prefixMap[statement.domainId] || "PRB";
  const domainCount = existing.filter((p) => p.domainId === statement.domainId).length;
  const generatedId =
    statement.id && statement.id.trim()
      ? statement.id.trim().toUpperCase()
      : `${prefix}-${String(domainCount + 1).padStart(2, "0")}`;

  const newRecord: ProblemStatement = {
    id: generatedId,
    domainId: statement.domainId,
    title: statement.title.trim(),
    category: statement.category?.trim() || "General",
    difficulty: statement.difficulty || "Intermediate",
    industry: statement.industry?.trim() || "",
    scope: statement.scope?.trim() || "",
    platform: statement.platform?.trim() || "",
    description: statement.description.trim(),
    deliverables: statement.deliverables?.filter((d) => Boolean(d.trim())) || [],
  };

  const updated = [newRecord, ...existing];
  saveAllProblemStatements(updated);
  return newRecord;
}

export function bulkAddProblemStatements(
  newStatements: (Omit<ProblemStatement, "id"> & { id?: string })[],
): ProblemStatement[] {
  const existing = getAllProblemStatements();
  const added: ProblemStatement[] = [];

  const prefixMap: Record<string, string> = {
    "ui-ux": "UX",
    "web-dev": "WEB",
    "vibe-coding": "VC",
    "agentic-ai": "AGT",
  };

  for (const item of newStatements) {
    const prefix = prefixMap[item.domainId] || "PRB";
    const domainCount =
      existing.filter((p) => p.domainId === item.domainId).length +
      added.filter((p) => p.domainId === item.domainId).length;

    const id =
      item.id && item.id.trim()
        ? item.id.trim().toUpperCase()
        : `${prefix}-${String(domainCount + 1).padStart(2, "0")}`;

    const record: ProblemStatement = {
      id,
      domainId: item.domainId,
      title: item.title.trim(),
      category: item.category?.trim() || "General",
      difficulty: item.difficulty || "Intermediate",
      industry: item.industry?.trim() || "",
      scope: item.scope?.trim() || "",
      platform: item.platform?.trim() || "",
      description: item.description.trim(),
      deliverables: item.deliverables?.filter((d) => Boolean(d.trim())) || [],
    };
    added.push(record);
  }

  const updated = [...added, ...existing];
  saveAllProblemStatements(updated);
  return added;
}

export function updateProblemStatement(statement: ProblemStatement): boolean {
  const existing = getAllProblemStatements();
  const index = existing.findIndex((p) => p.id === statement.id);
  if (index === -1) return false;

  const sanitized: ProblemStatement = {
    ...statement,
    title: statement.title.trim(),
    category: statement.category?.trim() || "General",
    industry: statement.industry?.trim() || "",
    scope: statement.scope?.trim() || "",
    platform: statement.platform?.trim() || "",
    description: statement.description.trim(),
    deliverables: (statement.deliverables || []).filter((d) => Boolean(d.trim())),
  };

  const updated = [...existing];
  updated[index] = sanitized;
  saveAllProblemStatements(updated);
  return true;
}

export function deleteProblemStatement(id: string): boolean {
  const existing = getAllProblemStatements();
  const filtered = existing.filter((p) => p.id !== id);
  if (filtered.length === existing.length) return false;
  saveAllProblemStatements(filtered);
  return true;
}

export function clearAllProblemStatements(): void {
  if (!isBrowser()) return;
  saveAllProblemStatements([]);
}

export function resetProblemStatementsToStarter(): void {
  if (!isBrowser()) return;
  saveAllProblemStatements(STARTER_PROBLEM_STATEMENTS);
}

export function subscribeToHackathonData(callback: () => void): () => void {
  if (!isBrowser()) return () => {};
  const handler = () => callback();
  window.addEventListener(CHANGE_EVENT_NAME, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(CHANGE_EVENT_NAME, handler);
    window.removeEventListener("storage", handler);
  };
}

export function logoutHackathonStudent(): void {
  if (!isBrowser()) return;

  localStorage.removeItem(STORAGE_KEY_STUDENT_PROFILE);
  localStorage.removeItem(STORAGE_KEY_SELECTED_STATEMENT);
}
