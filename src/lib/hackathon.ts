export type ProblemDifficulty = "Beginner" | "Intermediate" | "Advanced";

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
  industry?: string;
  scope?: string;
  platform?: string;
  description: string;
  deliverables?: string[];
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
