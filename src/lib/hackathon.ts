export type ProblemDifficulty = "Beginner" | "Intermediate" | "Advanced";

/** Includes the Team Lead. */
export const MAX_TEAM_MEMBERS = 6;
/** Round 2 is the final evaluation round. */
export const FINAL_EVALUATION_ROUND = 2;
/** Project submission deadline ISO string. */
export const SUBMISSION_DEADLINE_ISO = "2026-10-04T00:40:00+05:30";

export interface HackathonReleaseTimer {
  releaseAt: string | null;
}

export interface HackathonStudentProfile {
  name: string;
  mobile: string;
  email: string;
}

export interface ProblemStatement {
  id: string;
  domainId: "ui-ux" | "web-dev" | "vibe-coding" | "agentic-ai" | string;
  domainIds?: string[];
  title: string;
  category?: string;
  difficulty: ProblemDifficulty;
  organization?: string;
  contactInfo?: string;
  industry?: string;
  scope?: string;
  platform?: string;
  description: string;
  deliverables?: string[];
  /** False until a Jury member claims the statement; teams can only pick available ones. */
  available?: boolean;
  /** Proposed by a team; reserved for that team only. */
  teamProposal?: boolean;
}

export function getStatementDomainIds(statement: Pick<ProblemStatement, "domainId" | "domainIds">) {
  return statement.domainIds?.length ? statement.domainIds : [statement.domainId];
}

export interface HackathonDomain {
  id: "ui-ux" | "web-dev" | "vibe-coding" | "agentic-ai" | string;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
}

export interface HackathonVenue {
  name: string;
  campus: string;
  area: string;
  address: string;
  city: string;
  mapsUrl: string;
  mapsEmbedUrl: string;
  time: string;
  dateLabel: string;
  dateISO: string;
  endDateISO?: string;
  format: "Offline" | "Online" | "Hybrid";
  teamSize: string;
}

export interface HackathonPerk {
  title: string;
  description: string;
}

export interface HackathonPartner {
  name: string;
  role?: string;
}

export interface HackathonCoordinator {
  name: string;
  designation: string;
  phone?: string;
  type: "faculty" | "academic" | "student" | "leadership";
}

export interface HackathonDetails {
  id: string;
  university: string;
  accreditation: string;
  school: string;
  department: string;
  title: string;
  durationBadge: string;
  tagline: string;
  motto: string;
  blurb: string;
  prizePool: string;
  posterImage: string;
  venue: HackathonVenue;
  domains: HackathonDomain[];
  perks: HackathonPerk[];
  partners: HackathonPartner[];
  coordinators: HackathonCoordinator[];
}
