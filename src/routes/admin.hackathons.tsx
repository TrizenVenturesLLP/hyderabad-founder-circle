import { createFileRoute, Link, Outlet, redirect, useRouterState } from "@tanstack/react-router";
import {
  ExternalLink,
  Plus,
  Pencil,
  Trash2,
  Search,
  RotateCcw,
  X,
  FileText,
  Upload,
  CalendarClock,
  ArrowLeft,
  Users,
  Eye,
  Save,
  Check,
  ClipboardCheck,
  FilePlus2,
  CalendarDays,
  MapPin,
  Trophy,
  Gavel,
  ArrowRight,
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { AdminPageHeader, AdminPanel } from "@/components/admin/AdminPageChrome";
import { subscribeToHackathonData, getHackathonDetails } from "@/lib/hackathon-storage";
import {
  getStatementDomainIds,
  type ProblemDifficulty,
  type ProblemStatement,
} from "@/lib/hackathon";
import { TrackMultiSelect } from "@/components/admin/TrackMultiSelect";
import { cn } from "@/lib/utils";
import {
  activateHackathonUser,
  getHackathonRegisteredUsers,
  removeHackathonUser,
  suspendHackathonUser,
  getHackathonReleaseTimer as getServerReleaseTimer,
  saveHackathonReleaseTimer as saveServerReleaseTimer,
  clearHackathonReleaseTimer,
  getAdminHackathonProblemStatements,
  saveHackathonProblemStatement,
  bulkAddHackathonProblemStatements,
  clearHackathonProblemStatements,
  deleteHackathonProblemStatement,
  fetchAdminHackathonSubmission,
  saveHackathonEvaluation,
  type HackathonEvaluationScores,
  type HackathonRegisteredUser,
} from "@/lib/hackathon-api";
import {
  releaseAdminHackathonProblemStatement,
  reviewAdminHackathonProblemStatement,
  setAdminHackathonJuryClaimLimit,
  type AdminSessionUser,
} from "@/lib/admin-api";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { adminHackathons, findAdminHackathon } from "@/lib/admin-hackathons";
import { HackathonNav, hackathonSectionPageClass } from "@/components/admin/HackathonNav";
import { tabIndicatorClass, useTabIndicator } from "@/components/admin/useTabIndicator";
import { AppSelect } from "@/components/AppSelect";
import { ProblemStatementFacts } from "@/components/hackathon/ProblemStatementFacts";
import { FormField, FormSection, SegmentedControl, formFieldClass } from "@/components/FormLayout";
import { links } from "@/lib/links";

const DIFFICULTIES: readonly ProblemDifficulty[] = ["Beginner", "Intermediate", "Advanced"];
const DIFFICULTY_OPTIONS = DIFFICULTIES.map((value) => ({ value, label: value }));

export const Route = createFileRoute("/admin/hackathons")({
  validateSearch: (search: Record<string, unknown>): { hackathon?: string; view?: "teams" } => ({
    hackathon: typeof search.hackathon === "string" ? search.hackathon : undefined,
    view: search.view === "teams" ? "teams" : undefined,
  }),
  beforeLoad: ({ context }) => {
    const { admin } = context as { admin?: { role?: string } };
    if (admin?.role !== "platform_admin") {
      throw redirect({ to: "/admin/events" });
    }
  },
  component: AdminHackathonsPage,
  head: () => ({
    meta: [{ title: "AI Hack x MRDU — Admin Problem Statements" }],
  }),
});

interface FormState {
  id?: string;
  domainIds: string[];
  title: string;
  category: string;
  difficulty: ProblemDifficulty;
  organization: string;
  contactInfo: string;
  industry: string;
  scope: string;
  platform: string;
  description: string;
  deliverablesText: string;
}

type AdminProblemStatement = ProblemStatement & {
  createdBy?: { name: string } | null;
  claimedBy?: { name: string; email?: string } | null;
  proposedByTeam?: { team_name: string; lead_name?: string } | null;
  confirmedTeams?: { team_name: string; lead_name?: string }[];
  status?: "pending_approval" | "active" | "rejected";
  createdAt?: string;
};

const emptyForm: FormState = {
  domainIds: ["ui-ux"],
  title: "",
  category: "",
  difficulty: "Intermediate",
  organization: "",
  contactInfo: links.phone,
  industry: "",
  scope: "",
  platform: "",
  description: "",
  deliverablesText: "",
};

const hackathons = adminHackathons;

type SelectionState = "both" | "confirmed-only" | "claimed-only" | "neither";

const SELECTION_FILTERS: {
  value: SelectionState;
  label: string;
  hint: string;
  className: string;
}[] = [
  {
    value: "both",
    label: "Confirmed & claimed",
    hint: "Teams picked it and a Jury member scores it",
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  {
    value: "confirmed-only",
    label: "Confirmed, not claimed",
    hint: "Teams picked it but no Jury member will score them yet",
    className: "border-red-200 bg-red-50 text-red-800",
  },
  {
    value: "claimed-only",
    label: "Claimed, not confirmed",
    hint: "A Jury member claimed it but no team picked it yet",
    className: "border-amber-200 bg-amber-50 text-amber-800",
  },
  {
    value: "neither",
    label: "Not claimed or confirmed",
    hint: "Live, but no Jury member and no team yet",
    className: "border-border bg-white text-foreground",
  },
];

function selectionState(statement: AdminProblemStatement): SelectionState | null {
  if (statement.status && statement.status !== "active") return null;
  const confirmed = Boolean(statement.confirmedTeams?.length);
  const claimed = Boolean(statement.claimedBy);
  if (confirmed && claimed) return "both";
  if (confirmed) return "confirmed-only";
  if (claimed) return "claimed-only";
  return "neither";
}

const hackathonQuickLinkClass =
  "inline-flex h-8 cursor-pointer items-center gap-1.5 border border-(--color-border) bg-white px-2.5 text-(--color-text-secondary) transition-colors hover:border-(--brand-accent) hover:bg-(--brand-accent-soft) hover:text-(--brand-accent)";

type BulkField = "title" | "industry" | "scope" | "platform" | "description";

const BULK_FIELD_LABELS: { field: BulkField; pattern: RegExp }[] = [
  { field: "title", pattern: /^(?:problem\s*statement|title)\s*:\s*/i },
  { field: "industry", pattern: /^industry\s*:\s*/i },
  { field: "scope", pattern: /^scope\s*:\s*/i },
  { field: "platform", pattern: /^(?:platform\s*\/?\s*(?:tech)?|tech(?:nology)?)\s*:\s*/i },
  { field: "description", pattern: /^description\s*:\s*/i },
];

function matchBulkLabel(line: string) {
  for (const { field, pattern } of BULK_FIELD_LABELS) {
    const match = line.match(pattern);
    if (match) return { field, rest: line.slice(match[0].length).trim() };
  }
  return null;
}

function parseBulkProblemStatements(text: string) {
  const blocks = text
    .split(/\n\s*\n/)
    .map((block) =>
      block
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
    )
    .filter((lines) => lines.length > 0);

  const grouped: string[][] = [];
  for (const lines of blocks) {
    const label = matchBulkLabel(lines[0]);
    if (grouped.length && label && label.field !== "title") {
      grouped[grouped.length - 1].push(...lines);
    } else {
      grouped.push([...lines]);
    }
  }

  return grouped
    .map((lines) => {
      const values: Record<BulkField, string[]> = {
        title: [],
        industry: [],
        scope: [],
        platform: [],
        description: [],
      };
      let current: BulkField = "title";
      lines.forEach((line, index) => {
        const label = matchBulkLabel(line);
        if (label) {
          current = label.field;
          if (label.rest) values[current].push(label.rest);
          return;
        }
        if (index === 0) {
          values.title.push(line.replace(/^(\d+[.)]|[-*])\s*/, ""));
          current = "description";
          return;
        }
        values[current === "title" ? "description" : current].push(line);
      });
      const title = values.title.join(" ").trim();
      const description = values.description.join("\n").trim() || title;
      return {
        title,
        description,
        industry: values.industry.join(" ").trim(),
        scope: values.scope.join("\n").trim(),
        platform: values.platform.join(" ").trim(),
      };
    })
    .filter((item) => item.title);
}

type RegisteredUserWithStatus = HackathonRegisteredUser & {
  status?: "active" | "suspended";
};

const evaluationCriteria: {
  key: keyof HackathonEvaluationScores;
  label: string;
  weight: number;
}[] = [
  { key: "problem_understanding", label: "Problem Understanding & Impact", weight: 20 },
  { key: "innovation_creativity", label: "Innovation & Creativity", weight: 20 },
  { key: "technical_implementation", label: "Technical Implementation", weight: 25 },
  { key: "functionality_execution", label: "Functionality & Execution", weight: 20 },
  { key: "communication_presentation", label: "Communication & Presentation", weight: 15 },
];

type EvaluationDraft = {
  scores: Partial<Record<keyof HackathonEvaluationScores, number | "">>;
  comments: string;
};

function toEvaluationDraft(team: HackathonRegisteredUser): EvaluationDraft {
  return {
    scores: Object.fromEntries(
      evaluationCriteria.map(({ key }) => [key, team.evaluation?.scores?.[key] ?? ""]),
    ),
    comments: team.evaluation?.comments ?? "",
  };
}

function toDateTimeInputValue(isoValue: string | null): string {
  if (!isoValue) return "";
  const date = new Date(isoValue);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function AdminHackathonsPage() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  const search = Route.useSearch();
  const { admin } = Route.useRouteContext() as { admin?: AdminSessionUser };
  const isSuperAdmin = admin?.role === "platform_admin";
  const selectedHackathon = findAdminHackathon(search.hackathon);
  const showRegisteredStudents = Boolean(selectedHackathon) && search.view === "teams";
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUserWithStatus[]>([]);
  const [registeredUsersLoading, setRegisteredUsersLoading] = useState(false);
  const [registeredUsersError, setRegisteredUsersError] = useState<string | null>(null);
  const [registeredSearch, setRegisteredSearch] = useState("");
  const [registeredSort, setRegisteredSort] = useState<
    "registration-date" | "team-name" | "score-high-low" | "score-low-high"
  >("registration-date");
  const [registeredActionId, setRegisteredActionId] = useState<string | null>(null);
  const [removeTarget, setRemoveTarget] = useState<RegisteredUserWithStatus | null>(null);
  const [removeConfirmText, setRemoveConfirmText] = useState("");
  const [evaluationDrafts, setEvaluationDrafts] = useState<Record<string, EvaluationDraft>>({});
  const [savingEvaluationId, setSavingEvaluationId] = useState<string | null>(null);

  const details = getHackathonDetails();
  const activeHackathonId = selectedHackathon?.id || hackathons[0].id;
  const domains = details.domains;

  const [statements, setStatements] = useState<AdminProblemStatement[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string>("ui-ux");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [selectionFilter, setSelectionFilter] = useState<SelectionState | "all">("all");
  const [releaseAt, setReleaseAt] = useState<string | null>(null);
  const [releaseAtInput, setReleaseAtInput] = useState<string>("");
  const [claimLimit, setClaimLimit] = useState(20);
  const [claimLimitInput, setClaimLimitInput] = useState("20");
  const [savingClaimLimit, setSavingClaimLimit] = useState(false);
  const [teamProposalLimit, setTeamProposalLimit] = useState(5);
  const [releasingStatementId, setReleasingStatementId] = useState<string | null>(null);

  // Single Add / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormState>(emptyForm);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [reviewingStatementId, setReviewingStatementId] = useState<string | null>(null);
  const [reviewTarget, setReviewTarget] = useState<{
    statement: AdminProblemStatement;
    mode: "view" | "reject";
  } | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const trackTabs = useTabIndicator("problem-tracks", selectedDomain);

  useEffect(() => {
    if (!isQueueOpen || reviewTarget) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsQueueOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isQueueOpen, reviewTarget]);

  // Bulk Add Modal
  const [isBulkModalOpen, setIsBulkModalOpen] = useState<boolean>(false);
  const [bulkText, setBulkText] = useState<string>("");
  const [bulkDomains, setBulkDomains] = useState<string[]>(["ui-ux"]);
  const [bulkDifficulty, setBulkDifficulty] = useState<ProblemDifficulty>("Intermediate");

  useEffect(() => {
    async function load() {
      try {
        const data = await getAdminHackathonProblemStatements(activeHackathonId);
        setStatements(data.statements || []);
        setClaimLimit(data.claimLimit ?? 20);
        setClaimLimitInput(String(data.claimLimit ?? 20));
        setTeamProposalLimit(data.teamProposalLimit ?? 5);
      } catch (error) {
        console.error("Failed to load problem statements:", error);
        toast.error("Failed to load problem statements");
      }

      try {
        const timer = await getServerReleaseTimer();
        setReleaseAt(timer.releaseAt);
        setReleaseAtInput(toDateTimeInputValue(timer.releaseAt));
      } catch (error) {
        console.error("Failed to load release timer:", error);
      }
    }

    void load();

    const unsubscribe = subscribeToHackathonData(() => {
      // Keep this subscription for now.
      // Problem statements are now loaded from the backend.
    });

    return () => unsubscribe();
  }, [activeHackathonId]);

  async function handleSaveClaimLimit(e: React.FormEvent) {
    e.preventDefault();
    const limit = Number(claimLimitInput);
    if (!Number.isInteger(limit) || limit < 1 || limit > 500) {
      toast.error("Claim limit must be a whole number from 1 to 500.");
      return;
    }
    setSavingClaimLimit(true);
    try {
      const result = await setAdminHackathonJuryClaimLimit(activeHackathonId, limit);
      setClaimLimit(result.claimLimit);
      setClaimLimitInput(String(result.claimLimit));
      toast.success(`Each Jury member can now claim up to ${result.claimLimit} statements.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update the claim limit.");
    } finally {
      setSavingClaimLimit(false);
    }
  }

  async function handleReleaseStatement(item: AdminProblemStatement) {
    if (
      !window.confirm(
        `Release ${item.id} from ${item.claimedBy?.name || "its Jury member"}?\n\nAnother Jury member can then claim it. Scores the previous Jury member gave teams on this statement will no longer count.`,
      )
    )
      return;
    setReleasingStatementId(item.id);
    try {
      await releaseAdminHackathonProblemStatement(activeHackathonId, item.id);
      setStatements((current) =>
        current.map((statement) =>
          statement.id === item.id ? { ...statement, claimedBy: null } : statement,
        ),
      );
      toast.success(`${item.id} released.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not release the statement.");
    } finally {
      setReleasingStatementId(null);
    }
  }

  async function handleSaveReleaseTimer(e: React.FormEvent) {
    e.preventDefault();

    if (!releaseAtInput) {
      toast.error("Choose a release date and time");
      return;
    }

    const releaseDate = new Date(releaseAtInput);

    if (Number.isNaN(releaseDate.getTime())) {
      toast.error("Choose a valid release date and time");
      return;
    }

    try {
      const timer = await saveServerReleaseTimer(releaseDate.toISOString());

      setReleaseAt(timer.releaseAt);
      toast.success("Problem statement release timer saved");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save release timer");
    }
  }

  async function handleClearReleaseTimer() {
    try {
      await clearHackathonReleaseTimer();

      setReleaseAt(null);
      setReleaseAtInput("");

      toast.success("Problem statements are now available");
    } catch (error) {
      console.error(error);
      toast.error("Failed to release problem statements");
    }
  }

  async function handleResetReleaseTimer() {
    if (!window.confirm("Reset the problem statement release timer?")) return;

    try {
      await clearHackathonReleaseTimer();

      setReleaseAt(null);
      setReleaseAtInput("");

      toast.success("Problem statement release timer reset");
    } catch (error) {
      console.error(error);
      toast.error("Failed to reset problem statement release timer");
    }
  }

  async function handleOpenRegisteredStudents() {
    setRegisteredUsersLoading(true);
    setRegisteredUsersError(null);

    try {
      const data = await getHackathonRegisteredUsers();
      const users = data.users || [];
      setRegisteredUsers(users);
      setEvaluationDrafts(
        Object.fromEntries(users.map((team) => [team._id, toEvaluationDraft(team)])),
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not load registered teams.";
      setRegisteredUsersError(message);
      toast.error(message);
    } finally {
      setRegisteredUsersLoading(false);
    }
  }

  useEffect(() => {
    if (showRegisteredStudents) void handleOpenRegisteredStudents();
  }, [showRegisteredStudents]);

  async function handleSaveEvaluation(team: RegisteredUserWithStatus) {
    const draft = evaluationDrafts[team._id] ?? toEvaluationDraft(team);
    const scores = Object.fromEntries(
      evaluationCriteria.map(({ key }) => [key, draft.scores[key]]),
    ) as Partial<Record<keyof HackathonEvaluationScores, number | "">>;

    if (evaluationCriteria.some(({ key }) => scores[key] === "" || scores[key] === undefined)) {
      toast.error("Enter a score for every evaluation criterion");
      return;
    }

    setSavingEvaluationId(team._id);
    try {
      const result = await saveHackathonEvaluation(team._id, {
        scores: scores as HackathonEvaluationScores,
        comments: draft.comments,
      });
      if (result.user) {
        setRegisteredUsers((users) =>
          users.map((user) => (user._id === result.user?._id ? result.user! : user)),
        );
        setEvaluationDrafts((drafts) => ({
          ...drafts,
          [team._id]: toEvaluationDraft(result.user!),
        }));
      }
      toast.success("Team evaluation saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save team evaluation.");
    } finally {
      setSavingEvaluationId(null);
    }
  }

  async function handleSuspendTeam(team: RegisteredUserWithStatus) {
    if (!window.confirm(`Suspend team "${team.team_name}"?`)) return;

    setRegisteredActionId(team._id);
    try {
      await suspendHackathonUser(team._id);
      toast.success("Team suspended successfully");
      await handleOpenRegisteredStudents();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not suspend team.");
    } finally {
      setRegisteredActionId(null);
    }
  }

  async function handleActivateTeam(team: RegisteredUserWithStatus) {
    setRegisteredActionId(team._id);
    try {
      await activateHackathonUser(team._id);
      toast.success("Team reactivated successfully");
      await handleOpenRegisteredStudents();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not reactivate team.");
    } finally {
      setRegisteredActionId(null);
    }
  }

  function handleRemoveTeam(team: RegisteredUserWithStatus) {
    setRemoveConfirmText("");
    setRemoveTarget(team);
  }

  async function confirmRemoveTeam() {
    const team = removeTarget;
    if (!team || removeConfirmText.trim() !== team.team_name.trim()) return;

    setRegisteredActionId(team._id);
    try {
      await removeHackathonUser(team._id);
      toast.success(`Team "${team.team_name}" removed`);
      setRemoveTarget(null);
      await handleOpenRegisteredStudents();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not remove team.");
    } finally {
      setRegisteredActionId(null);
    }
  }

  function getTeamWeightedScore(team: HackathonRegisteredUser) {
    const scores = team.evaluation?.scores;
    if (!scores) return 0;

    return evaluationCriteria.reduce(
      (total, criterion) => total + ((scores[criterion.key] ?? 0) * criterion.weight) / 10,
      0,
    );
  }

  const filteredRegisteredUsers = useMemo(() => {
    const query = registeredSearch.trim().toLowerCase();
    let filtered = registeredUsers;

    if (query) {
      filtered = registeredUsers.filter((team) => {
        const memberText = team.members
          .map((member) => `${member.full_name} ${member.email} ${member.phone}`)
          .join(" ");

        return `${team.team_name} ${team.lead_name} ${team.email} ${team.phone} ${
          team.problem_statement_id || ""
        } ${memberText}`
          .toLowerCase()
          .includes(query);
      });
    }

    return [...filtered].sort((left, right) => {
      switch (registeredSort) {
        case "team-name":
          return (left.team_name || "").localeCompare(right.team_name || "");
        case "score-high-low": {
          const leftScore = getTeamWeightedScore(left);
          const rightScore = getTeamWeightedScore(right);
          return rightScore - leftScore;
        }
        case "score-low-high": {
          const leftScore = getTeamWeightedScore(left);
          const rightScore = getTeamWeightedScore(right);
          return leftScore - rightScore;
        }
        case "registration-date":
        default: {
          const leftDate = new Date(left.createdAt || 0).getTime();
          const rightDate = new Date(right.createdAt || 0).getTime();
          return rightDate - leftDate;
        }
      }
    });
  }, [registeredUsers, registeredSearch, registeredSort]);

  const registeredStats = useMemo(() => {
    const selected = registeredUsers.filter((team) => Boolean(team.problem_statement_id)).length;

    return {
      total: registeredUsers.length,
      selected,
      pending: registeredUsers.length - selected,
    };
  }, [registeredUsers]);

  const domainStatements = useMemo(() => {
    return statements.filter((s) => getStatementDomainIds(s).includes(selectedDomain));
  }, [statements, selectedDomain]);

  const trackOptions = domains.map((d) => ({ value: d.id, label: d.name }));

  function trackNames(statement: ProblemStatement) {
    return getStatementDomainIds(statement)
      .map((id) => domains.find((d) => d.id === id)?.name || id)
      .join(", ");
  }

  const pendingStatements = useMemo(
    () => statements.filter((s) => s.status === "pending_approval"),
    [statements],
  );
  const pendingApprovalCount = pendingStatements.length;
  const approvedTeamProposals = statements.filter(
    (s) => s.proposedByTeam && s.status === "active",
  ).length;
  const teamSlotsFull = (item: AdminProblemStatement) =>
    Boolean(item.proposedByTeam) && approvedTeamProposals >= teamProposalLimit;
  const liveStatementCount = statements.filter((s) => !s.status || s.status === "active").length;
  const rejectedStatementCount = statements.filter((s) => s.status === "rejected").length;

  const filteredStatements = useMemo(() => {
    return domainStatements.filter((item) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesDifficulty =
        difficultyFilter === "all" ||
        item.difficulty.toLowerCase() === difficultyFilter.toLowerCase();

      const matchesSelection =
        selectionFilter === "all" || selectionState(item) === selectionFilter;

      return matchesSearch && matchesDifficulty && matchesSelection;
    });
  }, [domainStatements, searchQuery, difficultyFilter, selectionFilter]);

  const selectionCounts = useMemo(() => {
    const counts: Record<SelectionState, number> = {
      both: 0,
      "confirmed-only": 0,
      "claimed-only": 0,
      neither: 0,
    };
    for (const item of domainStatements) {
      const state = selectionState(item);
      if (state) counts[state] += 1;
    }
    return counts;
  }, [domainStatements]);

  function handleOpenCreate() {
    setEditingId(null);
    setFormData({
      ...emptyForm,
      domainIds: [selectedDomain],
    });
    setIsModalOpen(true);
  }

  function handleOpenEdit(item: ProblemStatement) {
    setEditingId(item.id);
    setFormData({
      id: item.id,
      domainIds: getStatementDomainIds(item),
      title: item.title,
      category: item.category || "",
      difficulty: item.difficulty,
      organization: item.organization || "",
      contactInfo: item.contactInfo || links.phone,
      industry: item.industry || "",
      scope: item.scope || "",
      platform: item.platform || "",
      description: item.description,
      deliverablesText: (item.deliverables || []).join("\n"),
    });
    setIsModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (!formData.description.trim()) {
      toast.error("Description is required");
      return;
    }

    if (!formData.contactInfo.trim()) {
      toast.error("Contact info is required");
      return;
    }

    if (formData.domainIds.length === 0) {
      toast.error("Select at least one domain track");
      return;
    }

    const deliverables = formData.deliverablesText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    try {
      await saveHackathonProblemStatement({
        id: editingId ?? undefined,
        domainId: formData.domainIds[0],
        domainIds: formData.domainIds,
        title: formData.title.trim(),
        category: formData.category.trim() || "General",
        difficulty: formData.difficulty,
        organization: formData.organization.trim(),
        contactInfo: formData.contactInfo.trim(),
        industry: formData.industry.trim(),
        scope: formData.scope.trim(),
        platform: formData.platform.trim(),
        description: formData.description.trim(),
        deliverables,
      });

      const data = await getAdminHackathonProblemStatements(activeHackathonId);
      setStatements(data.statements || []);

      toast.success(
        editingId
          ? `Problem statement ${editingId} updated`
          : "Problem statement created successfully",
      );

      setIsModalOpen(false);
    } catch (error) {
      console.error("Save problem statement error:", error);

      toast.error(error instanceof Error ? error.message : "Failed to save problem statement");
    }
  }

  async function handleBulkImport(e: React.FormEvent) {
    e.preventDefault();
    if (!bulkText.trim()) {
      toast.error("Please enter at least one problem statement");
      return;
    }

    if (bulkDomains.length === 0) {
      toast.error("Select at least one domain track");
      return;
    }

    const parsedItems = parseBulkProblemStatements(bulkText).map((item) => ({
      ...item,
      domainId: bulkDomains[0],
      domainIds: bulkDomains,
      difficulty: bulkDifficulty,
    }));

    if (parsedItems.length === 0) {
      toast.error("Could not parse problem statements");
      return;
    }

    try {
      const result = await bulkAddHackathonProblemStatements(parsedItems);
      const refreshed = await getAdminHackathonProblemStatements(activeHackathonId);
      setStatements(refreshed.statements || []);
      toast.success(
        `Imported ${result.statements?.length || 0} problem statements into ${bulkDomains
          .map((id) => domains.find((d) => d.id === id)?.name || id)
          .join(", ")}`,
      );
      setIsBulkModalOpen(false);
      setBulkText("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not import problem statements.");
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteHackathonProblemStatement(id);

      const data = await getAdminHackathonProblemStatements(activeHackathonId);
      setStatements(data.statements || []);

      toast.success(`Deleted statement ${id}`);
      setDeleteConfirmId(null);
    } catch (error) {
      console.error("Delete problem statement error:", error);

      toast.error(error instanceof Error ? error.message : "Could not delete statement");
    }
  }

  function openReview(statement: AdminProblemStatement, mode: "view" | "reject") {
    setRejectReason("");
    setReviewTarget({ statement, mode });
  }

  async function handleReviewStatement(
    statement: AdminProblemStatement,
    action: "approve" | "reject",
    rejectionReason?: string,
  ) {
    const reason = action === "reject" ? rejectionReason?.trim() : undefined;
    if (action === "reject" && !reason) {
      toast.error("Enter a reason before rejecting.");
      return;
    }
    setReviewingStatementId(statement.id);
    try {
      await reviewAdminHackathonProblemStatement(activeHackathonId, statement.id, {
        action,
        reason,
      });
      const refreshed = await getAdminHackathonProblemStatements(activeHackathonId);
      setStatements(refreshed.statements || []);
      setReviewTarget(null);
      toast.success(
        action === "reject"
          ? "Problem Statement rejected."
          : statement.proposedByTeam
            ? `Approved — confirmed as ${statement.proposedByTeam.team_name}'s problem statement.`
            : "Problem Statement approved and live.",
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not review Problem Statement.");
    } finally {
      setReviewingStatementId(null);
    }
  }

  async function handleReset() {
    if (
      window.confirm(
        "Reset problem statements to the starter set? This will replace current entries.",
      )
    ) {
      void clearHackathonProblemStatements()
        .then(async () => {
          const refreshed = await getAdminHackathonProblemStatements(activeHackathonId);
          setStatements(refreshed.statements || []);
          toast.success("Problem statements reset to starter templates");
        })
        .catch((error) =>
          toast.error(
            error instanceof Error ? error.message : "Could not reset problem statements.",
          ),
        );
    }
  }

  async function handleDownloadSubmission(fileUrl: string) {
    try {
      const objectUrl = await fetchAdminHackathonSubmission(fileUrl);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = "hackathon-submission";
      anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not download submission.");
    }
  }

  if (pathname.replace(/\/+$/, "") !== "/admin/hackathons") return <Outlet />;

  if (!selectedHackathon) {
    return (
      <div className="space-y-6 p-4 sm:p-5 md:p-6">
        <AdminPageHeader
          title="Hackathons"
          description="Manage problem statements, registered teams, jury and results for each hackathon."
        />

        <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          {hackathons.map((hackathon) => {
            const isActive = hackathon.id === activeHackathonId;
            const liveCount = isActive ? liveStatementCount : null;
            const pendingCount = isActive ? pendingApprovalCount : null;
            const statusClass =
              hackathon.status === "Ongoing"
                ? "bg-emerald-400/15 text-emerald-200 ring-emerald-300/30"
                : hackathon.status === "Completed"
                  ? "bg-white/10 text-white/70 ring-white/20"
                  : "bg-indigo-300/15 text-indigo-100 ring-indigo-200/30";

            return (
              <article
                key={hackathon.id}
                className="flex flex-col border border-(--color-border) bg-white transition-shadow hover:shadow-md"
              >
                <div className="relative overflow-hidden bg-(--brand-primary) px-5 py-4 text-white">
                  <div
                    className="pointer-events-none absolute inset-0"
                    aria-hidden
                    style={{
                      background:
                        "radial-gradient(ellipse 70% 90% at 100% 0%, color-mix(in oklab, var(--brand-accent) 45%, transparent) 0%, transparent 65%)",
                    }}
                  />
                  <div className="relative flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[10.5px] font-semibold tracking-[0.08em] text-indigo-200 uppercase">
                        Hackathon
                      </p>
                      <h2 className="mt-1 truncate text-lg font-bold tracking-tight">
                        {hackathon.title}
                      </h2>
                    </div>
                    <span
                      className={`shrink-0 px-2 py-0.5 text-[11px] font-semibold ring-1 ${statusClass}`}
                    >
                      {hackathon.status}
                    </span>
                  </div>
                </div>

                <dl className="grid gap-3 px-5 py-4 text-[13px] sm:grid-cols-3">
                  <div className="flex items-start gap-2">
                    <CalendarDays className="mt-0.5 size-4 shrink-0 text-(--brand-accent)" />
                    <div className="min-w-0">
                      <dt className="text-[10.5px] font-semibold tracking-wider text-(--color-text-muted) uppercase">
                        Dates
                      </dt>
                      <dd className="font-semibold text-foreground">{hackathon.date}</dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-(--brand-accent)" />
                    <div className="min-w-0">
                      <dt className="text-[10.5px] font-semibold tracking-wider text-(--color-text-muted) uppercase">
                        Venue
                      </dt>
                      <dd
                        className="truncate font-semibold text-foreground"
                        title={hackathon.venue}
                      >
                        {hackathon.venue}
                      </dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Trophy className="mt-0.5 size-4 shrink-0 text-(--brand-accent)" />
                    <div className="min-w-0">
                      <dt className="text-[10.5px] font-semibold tracking-wider text-(--color-text-muted) uppercase">
                        Prize pool
                      </dt>
                      <dd className="font-semibold text-foreground">{hackathon.prizePool}</dd>
                    </div>
                  </div>
                </dl>

                {liveCount !== null ? (
                  <div className="mx-5 grid grid-cols-2 border border-(--color-border)">
                    <div className="px-3 py-2.5">
                      <p className="text-[10.5px] font-semibold tracking-wider text-(--color-text-muted) uppercase">
                        Live statements
                      </p>
                      <p className="mt-0.5 text-lg font-bold text-foreground">{liveCount}</p>
                    </div>
                    <div
                      className={`border-l border-(--color-border) px-3 py-2.5 ${pendingCount ? "bg-amber-50" : ""}`}
                    >
                      <p
                        className={`text-[10.5px] font-semibold tracking-wider uppercase ${pendingCount ? "text-amber-700" : "text-(--color-text-muted)"}`}
                      >
                        Awaiting approval
                      </p>
                      <p
                        className={`mt-0.5 text-lg font-bold ${pendingCount ? "text-amber-800" : "text-foreground"}`}
                      >
                        {pendingCount}
                      </p>
                    </div>
                  </div>
                ) : null}

                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-(--color-border) px-5 py-3 text-[12px] font-semibold">
                  <Link
                    to="/admin/hackathons"
                    search={{ hackathon: hackathon.id, view: "teams" }}
                    className={hackathonQuickLinkClass}
                  >
                    <Users className="size-3.5" />
                    Teams
                  </Link>
                  <Link
                    to="/admin/hackathons/$hackathonId/jury"
                    params={{ hackathonId: hackathon.id }}
                    className={hackathonQuickLinkClass}
                  >
                    <Gavel className="size-3.5" />
                    Jury
                  </Link>
                  <Link
                    to="/admin/hackathons/$hackathonId/leaderboard"
                    params={{ hackathonId: hackathon.id }}
                    className={hackathonQuickLinkClass}
                  >
                    <Trophy className="size-3.5" />
                    Leaderboard
                  </Link>
                  <Link
                    to="/admin/hackathons"
                    search={{ hackathon: hackathon.id }}
                    className="inline-flex h-9 items-center justify-center gap-1.5 bg-(--brand-primary) px-3 text-white transition-colors hover:bg-(--brand-primary-hover) max-sm:w-full sm:ml-auto sm:h-8"
                  >
                    Open hackathon
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    );
  }
  if (showRegisteredStudents) {
    return (
      <div key="teams" className={`space-y-4 p-4 sm:p-5 md:p-6 ${hackathonSectionPageClass}`}>
        <HackathonNav
          hackathonId={selectedHackathon.id}
          active="teams"
          pendingCount={pendingApprovalCount}
        />
        <AdminPageHeader
          title="Registered Teams"
          description="Team leads, members, and their problem statement selections."
          actions={
            <button
              type="button"
              onClick={handleOpenRegisteredStudents}
              className="inline-flex h-8 items-center gap-1.5 border border-border bg-white px-3 text-xs font-semibold whitespace-nowrap text-foreground transition-colors hover:bg-muted"
            >
              <RotateCcw className="size-3.5" />
              Refresh
            </button>
          }
        />

        <AdminPanel className="overflow-hidden rounded-xl">
          <dl className="grid grid-cols-3 divide-x divide-border border-b border-border">
            {[
              { label: "Total teams", value: registeredStats.total, tone: "text-foreground" },
              { label: "Problem selected", value: registeredStats.selected, tone: "text-primary" },
              {
                label: "Awaiting selection",
                value: registeredStats.pending,
                tone: registeredStats.pending > 0 ? "text-amber-600" : "text-foreground",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col gap-0.5 px-3 py-2.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3 sm:px-4"
              >
                <dt className="truncate text-[11.5px] font-medium text-muted-foreground">
                  {stat.label}
                </dt>
                <dd className={`text-lg leading-none font-bold tabular-nums ${stat.tone}`}>
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>

          <div className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={registeredSearch}
                onChange={(e) => setRegisteredSearch(e.target.value)}
                placeholder="Search team, lead, email, phone, member, or problem ID..."
                className="h-9 w-full border border-border bg-white pl-8 pr-8 text-xs text-foreground focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary"
              />
              {registeredSearch && (
                <button
                  type="button"
                  onClick={() => setRegisteredSearch("")}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-2 text-xs font-medium text-muted-foreground sm:justify-end">
              <span className="whitespace-nowrap">Sort by</span>
              <AppSelect
                ariaLabel="Sort teams"
                value={registeredSort}
                onValueChange={(value) =>
                  setRegisteredSort(
                    value as
                      "registration-date" | "team-name" | "score-high-low" | "score-low-high",
                  )
                }
                options={[
                  { value: "registration-date", label: "Registration date" },
                  { value: "team-name", label: "Team name" },
                  { value: "score-high-low", label: "Score: High → Low" },
                  { value: "score-low-high", label: "Score: Low → High" },
                ]}
                shape="pill"
                size="sm"
                className="min-w-0 flex-1 sm:w-auto sm:min-w-44 sm:flex-none"
              />
            </div>
          </div>
        </AdminPanel>

        {registeredUsersLoading ? (
          <AdminPanel className="rounded-xl p-10 text-center">
            <Users className="mx-auto size-7 animate-pulse text-primary" />
            <p className="mt-3 text-sm font-semibold text-foreground">
              Loading registered teams...
            </p>
          </AdminPanel>
        ) : registeredUsersError ? (
          <AdminPanel className="rounded-xl border-destructive/20 bg-destructive/5 p-8 text-center">
            <p className="text-sm font-semibold text-destructive">
              Could not load registered teams
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{registeredUsersError}</p>
            <button
              type="button"
              onClick={handleOpenRegisteredStudents}
              className="mt-4 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-95"
            >
              Try Again
            </button>
          </AdminPanel>
        ) : filteredRegisteredUsers.length === 0 ? (
          <AdminPanel className="rounded-xl p-10 text-center">
            <Users className="mx-auto size-8 text-muted-foreground" />
            <p className="mt-3 text-sm font-semibold text-foreground">
              {registeredUsers.length === 0 ? "No registered teams yet" : "No matching teams"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {registeredUsers.length === 0
                ? "Teams registered for the hackathon will appear here."
                : "Try a different search term."}
            </p>
          </AdminPanel>
        ) : (
          <AdminPanel className="overflow-hidden rounded-xl">
            <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-3">
              <div className="flex items-center gap-2">
                <Users className="size-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Registered Teams
                </span>
                <span className="text-xs text-muted-foreground">
                  ({filteredRegisteredUsers.length})
                </span>
              </div>
            </div>

            <div className="divide-y divide-border">
              {filteredRegisteredUsers.map((team) => (
                <details key={team._id} className="group">
                  <summary className="flex cursor-pointer list-none flex-col gap-3 px-4 py-4 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Users className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate text-sm font-bold text-foreground">
                            {team.team_name}
                          </h3>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              team.status === "suspended"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-emerald-100 text-emerald-700"
                            }`}
                          >
                            {team.status === "suspended" ? "Suspended" : "Active"}
                          </span>

                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              team.problem_statement_id
                                ? "bg-primary/10 text-primary"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {team.problem_statement_id ? "Problem Selected" : "Awaiting Selection"}
                          </span>
                        </div>
                        <p className="mt-1 text-xs break-all text-muted-foreground sm:break-normal">
                          Lead:{" "}
                          <span className="font-medium text-foreground">{team.lead_name}</span>
                          {" · "}
                          {team.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-3 pl-12 text-xs text-muted-foreground sm:pl-0">
                      <span className="mr-auto sm:mr-0">
                        {team.members.length} member
                        {team.members.length === 1 ? "" : "s"}
                      </span>
                      {isSuperAdmin ? (
                        <button
                          type="button"
                          disabled={registeredActionId === team._id}
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            handleRemoveTeam(team);
                          }}
                          aria-label={`Remove team ${team.team_name}`}
                          title="Remove team"
                          className="inline-flex size-8 items-center justify-center border border-destructive/20 bg-white text-destructive transition hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      ) : null}
                      <Eye className="size-4 transition-transform group-open:rotate-180" />
                    </div>
                  </summary>

                  <div className="border-t border-border bg-muted/10 px-4 py-4">
                    <div className="grid gap-4 lg:grid-cols-3">
                      <div className="rounded-lg border border-border bg-white p-4">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Team Lead
                        </p>
                        <p className="mt-2 text-sm font-bold text-foreground">{team.lead_name}</p>
                        <p className="mt-1 break-all text-xs text-muted-foreground">{team.email}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{team.phone}</p>
                      </div>

                      <div className="rounded-lg border border-border bg-white p-4">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Problem Statement
                        </p>
                        <p className="mt-2 text-sm font-bold text-foreground">
                          {team.problem_statement_id || "Not selected"}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {team.problem_statement_id
                            ? "Team lead has confirmed a problem statement."
                            : "Team is still awaiting problem selection."}
                        </p>
                      </div>

                      <div className="rounded-lg border border-border bg-white p-4">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Registration
                        </p>
                        <p className="mt-2 text-sm font-bold text-foreground">
                          {team.createdAt ? new Date(team.createdAt).toLocaleDateString() : "—"}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {team.members.length} registered member
                          {team.members.length === 1 ? "" : "s"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 rounded-lg border border-border bg-white">
                      <div className="border-b border-border px-4 py-3">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Team Members
                        </p>
                      </div>

                      <div className="divide-y divide-border">
                        {team.members.map((member, index) => (
                          <div
                            key={`${team._id}-${member.email}-${index}`}
                            className="grid gap-1 px-4 py-3 text-xs sm:grid-cols-3 sm:gap-4"
                          >
                            <p className="font-semibold text-foreground">{member.full_name}</p>
                            <p className="break-all text-muted-foreground">{member.email}</p>
                            <p className="text-muted-foreground">{member.phone}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 rounded-lg border border-border bg-white p-4">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Project Submission
                      </p>

                      {team.submission?.github_repo ||
                      team.submission?.description ||
                      team.submission?.ppt_url ||
                      team.submission?.video_url ? (
                        <div className="mt-3 space-y-3">
                          {team.submission.github_repo && (
                            <div>
                              <p className="text-xs font-semibold text-foreground">
                                GitHub Repository
                              </p>
                              <a
                                href={team.submission.github_repo}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-1 block break-all text-xs text-primary hover:underline"
                              >
                                {team.submission.github_repo}
                              </a>
                            </div>
                          )}

                          {team.submission.description && (
                            <div>
                              <p className="text-xs font-semibold text-foreground">Description</p>
                              <p className="mt-1 whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground">
                                {team.submission.description}
                              </p>
                            </div>
                          )}

                          {team.submission.ppt_url && (
                            <div>
                              <p className="text-xs font-semibold text-foreground">Presentation</p>
                              <button
                                type="button"
                                onClick={() =>
                                  void handleDownloadSubmission(team.submission!.ppt_url!)
                                }
                                className="mt-1 inline-flex text-xs font-semibold text-primary hover:underline"
                              >
                                Download PPT / PDF
                              </button>
                            </div>
                          )}

                          {team.submission.video_url && (
                            <div>
                              <p className="text-xs font-semibold text-foreground">
                                Recorded Video
                              </p>
                              <a
                                href={team.submission.video_url}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-1 inline-flex text-xs font-semibold text-primary hover:underline"
                              >
                                View Recorded Video
                              </a>
                            </div>
                          )}

                          {team.submission.submitted_at && (
                            <p className="pt-1 text-[11px] text-muted-foreground">
                              Submitted: {new Date(team.submission.submitted_at).toLocaleString()}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="mt-2 text-xs text-muted-foreground">
                          No project submitted yet.
                        </p>
                      )}

                      {team.submission?.submitted_at &&
                        (() => {
                          const draft = evaluationDrafts[team._id] ?? toEvaluationDraft(team);
                          const weightedScore = evaluationCriteria.reduce(
                            (total, criterion) =>
                              total +
                              (Number(draft.scores[criterion.key] || 0) * criterion.weight) / 10,
                            0,
                          );

                          return (
                            <form
                              className="mt-4 border-t border-border pt-4"
                              onSubmit={(event) => {
                                event.preventDefault();
                                void handleSaveEvaluation(team);
                              }}
                            >
                              <div className="mb-2 flex items-center justify-between gap-3">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                  Team Evaluation
                                </p>
                                <span className="rounded-full bg-muted px-2 py-1 text-[10px] font-semibold text-muted-foreground">
                                  {team.evaluation?.evaluated_at ? "Evaluated" : "Not Evaluated"}
                                </span>
                              </div>

                              <div className="divide-y divide-border">
                                {evaluationCriteria.map((criterion) => (
                                  <label
                                    key={criterion.key}
                                    className="grid grid-cols-[minmax(0,1fr)_auto_5rem] items-center gap-3 py-3"
                                  >
                                    <span>
                                      <span className="block text-xs font-semibold text-foreground">
                                        {criterion.label}
                                      </span>
                                      <span className="mt-1 block text-[11px] text-muted-foreground">
                                        Score from 0 to 10
                                      </span>
                                    </span>
                                    <span className="text-[11px] text-muted-foreground">
                                      {criterion.weight}%
                                    </span>
                                    <input
                                      type="number"
                                      min="0"
                                      max="10"
                                      step="1"
                                      required
                                      aria-label={`${criterion.label} score`}
                                      value={draft.scores[criterion.key]}
                                      onChange={(event) => {
                                        const value = event.target.value;
                                        setEvaluationDrafts((drafts) => ({
                                          ...drafts,
                                          [team._id]: {
                                            ...draft,
                                            scores: {
                                              ...draft.scores,
                                              [criterion.key]: value === "" ? "" : Number(value),
                                            },
                                          },
                                        }));
                                      }}
                                      className="h-10 w-20 rounded-lg border border-border bg-white px-3 text-sm font-semibold text-foreground focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary"
                                    />
                                  </label>
                                ))}
                              </div>

                              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-primary/10 p-3">
                                <div>
                                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                    Weighted Score
                                  </p>
                                  <p className="mt-1 text-lg font-bold text-foreground">
                                    {weightedScore.toFixed(1)}{" "}
                                    <span className="text-xs font-medium">/ 100</span>
                                  </p>
                                </div>
                                <button
                                  type="submit"
                                  disabled={savingEvaluationId === team._id}
                                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  <Save className="size-3.5" />
                                  {savingEvaluationId === team._id
                                    ? "Saving..."
                                    : team.evaluation?.evaluated_at
                                      ? "Update Evaluation"
                                      : "Save Evaluation"}
                                </button>
                              </div>

                              <label className="mt-4 block text-xs font-semibold text-foreground">
                                Judge Comments
                                <textarea
                                  rows={3}
                                  maxLength={2000}
                                  value={draft.comments}
                                  onChange={(event) =>
                                    setEvaluationDrafts((drafts) => ({
                                      ...drafts,
                                      [team._id]: { ...draft, comments: event.target.value },
                                    }))
                                  }
                                  placeholder="Add feedback about the team's submission..."
                                  className="mt-2 w-full resize-y rounded-lg border border-border bg-white px-3 py-2.5 text-xs font-normal text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary"
                                />
                              </label>
                            </form>
                          );
                        })()}
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-border pt-4">
                      {team.status === "suspended" ? (
                        <button
                          type="button"
                          disabled={registeredActionId === team._id}
                          onClick={() => handleActivateTeam(team)}
                          className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {registeredActionId === team._id ? "Please wait..." : "Reactivate"}
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={registeredActionId === team._id}
                          onClick={() => handleSuspendTeam(team)}
                          className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {registeredActionId === team._id ? "Please wait..." : "Suspend"}
                        </button>
                      )}

                      {isSuperAdmin ? (
                        <button
                          type="button"
                          disabled={registeredActionId === team._id}
                          onClick={() => handleRemoveTeam(team)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/20 bg-white px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Trash2 className="size-3.5" />
                          Remove team
                        </button>
                      ) : null}
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </AdminPanel>
        )}

        <AlertDialog
          open={Boolean(removeTarget)}
          onOpenChange={(open) => {
            if (!open && !registeredActionId) setRemoveTarget(null);
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Remove team &quot;{removeTarget?.team_name}&quot;?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This permanently deletes the team registration, its members, problem selection,
                submission file, jury evaluations and the Team Lead&apos;s sign-in password. This
                cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <label className="block text-xs font-semibold text-foreground">
              Type <span className="font-mono text-destructive">{removeTarget?.team_name}</span> to
              confirm
              <input
                type="text"
                value={removeConfirmText}
                onChange={(event) => setRemoveConfirmText(event.target.value)}
                autoFocus
                autoComplete="off"
                className="mt-1.5 h-9 w-full border border-border bg-background px-3 text-[13px] font-normal outline-none focus:border-destructive"
              />
            </label>

            <AlertDialogFooter>
              <AlertDialogCancel disabled={Boolean(registeredActionId)}>Cancel</AlertDialogCancel>
              <button
                type="button"
                onClick={confirmRemoveTeam}
                disabled={
                  !removeTarget ||
                  removeConfirmText.trim() !== removeTarget.team_name.trim() ||
                  Boolean(registeredActionId)
                }
                className="inline-flex h-10 items-center justify-center gap-1.5 bg-destructive px-4 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 className="size-4" />
                {registeredActionId ? "Removing..." : "Remove team"}
              </button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  return (
    <div key="statements" className={`space-y-6 p-4 sm:p-5 md:p-6 ${hackathonSectionPageClass}`}>
      <HackathonNav
        hackathonId={selectedHackathon.id}
        active="statements"
        pendingCount={pendingApprovalCount}
      />
      <AdminPageHeader
        title={
          <span className="inline-flex flex-wrap items-center gap-2.5">
            Problem Statements
            <span
              className="inline-flex items-center gap-1 bg-(--brand-accent-soft) px-2 py-0.5 align-middle text-[12px] font-bold tracking-normal text-(--brand-accent)"
              style={{ fontFamily: "var(--font-sans)" }}
              title="Unique problem statements. A statement shared across tracks is counted once."
            >
              {statements.length} total
            </span>
          </span>
        }
        description={
          <>
            {liveStatementCount} live
            {pendingApprovalCount ? ` · ${pendingApprovalCount} awaiting approval` : ""}
            {rejectedStatementCount ? ` · ${rejectedStatementCount} rejected` : ""} across the 4
            competition tracks. Statements shared across tracks are counted once here, but appear in
            each track&apos;s tab.
          </>
        }
        actions={
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:justify-end lg:flex-nowrap max-sm:[&>button]:justify-center">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap border border-transparent px-2.5 max-sm:order-3 max-sm:border-border text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              title="Reset to starter seeds"
            >
              <RotateCcw className="size-3.5" />
              Reset
            </button>
            <span className="hidden h-6 w-px bg-border sm:block" aria-hidden />
            <button
              type="button"
              onClick={() => setIsQueueOpen(true)}
              className={`inline-flex h-9 items-center gap-1.5 whitespace-nowrap border px-3.5 text-xs font-semibold transition-colors ${
                pendingApprovalCount
                  ? "border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"
                  : "border-border bg-white text-foreground hover:bg-muted"
              }`}
            >
              <ClipboardCheck className="size-3.5" />
              Approval queue
              {pendingApprovalCount ? (
                <span className="inline-flex min-w-5 items-center justify-center bg-amber-500 px-1.5 py-0.5 text-[10.5px] font-bold text-white">
                  {pendingApprovalCount}
                </span>
              ) : null}
            </button>
            <button
              type="button"
              onClick={() => {
                setBulkDomains([selectedDomain]);
                setIsBulkModalOpen(true);
              }}
              className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap border border-border bg-white px-3.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
            >
              <Upload className="size-3.5" />
              Bulk add
            </button>
            <button
              type="button"
              onClick={handleOpenCreate}
              className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap border border-primary bg-primary px-3.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-(--brand-accent-hover) max-sm:order-4"
            >
              <Plus className="size-3.5" />
              Add statement
            </button>
          </div>
        }
      />

      {isQueueOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="approval-queue-title"
          onClick={(event) => {
            if (event.target === event.currentTarget) setIsQueueOpen(false);
          }}
        >
          <div className="flex h-dvh w-full max-w-4xl flex-col overflow-hidden border-border bg-white shadow-large sm:h-auto sm:max-h-[85vh] sm:rounded-2xl sm:border">
            <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-4 sm:px-5">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3
                    id="approval-queue-title"
                    className="font-display text-base font-bold text-foreground"
                  >
                    Approval queue
                  </h3>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${pendingApprovalCount ? "bg-amber-100 text-amber-800" : "bg-emerald-50 text-emerald-700"}`}
                  >
                    {pendingApprovalCount ? `${pendingApprovalCount} pending` : "All caught up"}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Problem Statements added by Jury members go live only after you approve them. Team
                  ideas become that team&apos;s statement when approved ·{" "}
                  <span className="font-semibold text-foreground">
                    {approvedTeamProposals} of {teamProposalLimit} team ideas approved
                  </span>
                  .
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsQueueOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:text-foreground"
                aria-label="Close"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-auto overscroll-contain">
              {pendingApprovalCount ? (
                <>
                  <ul className="divide-y divide-border md:hidden">
                    {pendingStatements.map((item) => (
                      <li key={item.id} className="px-4 py-3.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-xs font-semibold text-primary">
                            {item.id}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ""}
                          </span>
                        </div>
                        <p className="mt-1 font-medium text-foreground">{item.title}</p>
                        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                          {item.description}
                        </p>
                        <p className="mt-1.5 text-xs text-foreground">
                          {item.proposedByTeam
                            ? `Team · ${item.proposedByTeam.team_name}`
                            : item.createdBy?.name
                              ? `Jury · ${item.createdBy.name}`
                              : "—"}
                          <span className="text-muted-foreground"> · {trackNames(item)}</span>
                        </p>
                        <div className="mt-3 grid grid-cols-3 gap-1.5">
                          <button
                            type="button"
                            onClick={() => openReview(item, "view")}
                            className="inline-flex h-9 items-center justify-center gap-1 rounded-full border border-border bg-white text-xs font-semibold text-foreground hover:bg-muted"
                          >
                            <Eye className="size-3.5" />
                            View
                          </button>
                          <button
                            type="button"
                            disabled={reviewingStatementId === item.id || teamSlotsFull(item)}
                            onClick={() => void handleReviewStatement(item, "approve")}
                            className="inline-flex h-9 items-center justify-center gap-1 rounded-full bg-emerald-600 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                          >
                            <Check className="size-3.5" />
                            Approve
                          </button>
                          <button
                            type="button"
                            disabled={reviewingStatementId === item.id}
                            onClick={() => openReview(item, "reject")}
                            className="inline-flex h-9 items-center justify-center gap-1 rounded-full border border-red-200 bg-white text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
                          >
                            <X className="size-3.5" />
                            Reject
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <table className="hidden w-full min-w-[760px] text-left text-sm md:table">
                    <thead className="sticky top-0 z-10 bg-(--color-background-alt) text-[11px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
                      <tr>
                        <th className="px-4 py-2.5">ID</th>
                        <th className="px-4 py-2.5">Title</th>
                        <th className="px-4 py-2.5">Track</th>
                        <th className="px-4 py-2.5">Submitted by</th>
                        <th className="px-4 py-2.5">Date</th>
                        <th className="px-4 py-2.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {pendingStatements.map((item) => (
                        <tr key={item.id} className="align-middle hover:bg-muted/30">
                          <td className="px-4 py-3 font-mono text-xs font-semibold text-primary">
                            {item.id}
                          </td>
                          <td className="max-w-[280px] px-4 py-3">
                            <p className="truncate font-medium text-foreground">{item.title}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              {item.description}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">
                            {trackNames(item)}
                          </td>
                          <td className="px-4 py-3 text-xs text-foreground">
                            {item.proposedByTeam
                              ? `Team · ${item.proposedByTeam.team_name}`
                              : item.createdBy?.name
                                ? `Jury · ${item.createdBy.name}`
                                : "—"}
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">
                            {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "—"}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => openReview(item, "view")}
                                className="inline-flex items-center gap-1 rounded-full border border-border bg-white px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
                              >
                                <Eye className="size-3.5" />
                                View
                              </button>
                              <button
                                type="button"
                                disabled={reviewingStatementId === item.id || teamSlotsFull(item)}
                                title={
                                  teamSlotsFull(item)
                                    ? `All ${teamProposalLimit} team idea slots are used`
                                    : undefined
                                }
                                onClick={() => void handleReviewStatement(item, "approve")}
                                className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                              >
                                <Check className="size-3.5" />
                                Approve
                              </button>
                              <button
                                type="button"
                                disabled={reviewingStatementId === item.id}
                                onClick={() => openReview(item, "reject")}
                                className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
                              >
                                <X className="size-3.5" />
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              ) : (
                <div className="px-4 py-12 text-center">
                  <Check className="mx-auto size-8 text-emerald-600" />
                  <p className="mt-2 text-sm font-semibold text-foreground">All caught up</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    No Problem Statements are waiting for approval.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      <AdminPanel className="rounded-xl border-primary/20 bg-primary/5 p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CalendarClock className="size-4 text-primary" />
              <h2 className="text-sm font-bold text-foreground">Problem Statement Release</h2>
            </div>
            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-muted-foreground">
              Keep problem statements hidden from students until the scheduled time.
            </p>
            <p className="mt-2 text-xs font-semibold text-primary">
              {releaseAt
                ? `Scheduled for ${new Date(releaseAt).toLocaleString()}`
                : "No timer set — problem statements are available"}
            </p>
          </div>

          <form
            onSubmit={handleSaveReleaseTimer}
            className="grid grid-cols-2 gap-2 sm:flex sm:flex-row sm:items-end max-sm:[&>button]:h-10 [&>*:last-child:nth-child(even)]:col-span-2"
          >
            <label className="col-span-2 text-xs font-medium text-foreground">
              Release date and time
              <input
                type="datetime-local"
                value={releaseAtInput}
                onChange={(e) => setReleaseAtInput(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-border bg-white px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-hidden sm:w-auto"
              />
            </label>
            <button
              type="submit"
              className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:opacity-95"
            >
              Save Timer
            </button>
            {releaseAt && (
              <button
                type="button"
                onClick={handleClearReleaseTimer}
                className="rounded-lg border border-border bg-white px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted"
              >
                Release Now
              </button>
            )}
            <button
              type="button"
              onClick={handleResetReleaseTimer}
              className="rounded-lg border border-destructive/30 bg-white px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10"
            >
              Reset Timer
            </button>
          </form>
        </div>

        <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">Jury claim limit</p>
            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-muted-foreground">
              Each Jury member claims statements and scores only the teams that pick them. Teams can
              pick any statement; a team on an unclaimed statement is scored once a Jury member
              claims it. Currently {claimLimit} per Jury member ·{" "}
              {statements.filter((s) => s.claimedBy).length} of {statements.length} claimed.
            </p>
          </div>
          <form onSubmit={handleSaveClaimLimit} className="flex items-end gap-2">
            <label className="flex-1 text-xs font-medium text-foreground sm:flex-none">
              Statements per Jury member
              <input
                type="number"
                min={1}
                max={500}
                value={claimLimitInput}
                onChange={(e) => setClaimLimitInput(e.target.value)}
                className="mt-1 block w-full rounded-lg sm:w-28 border border-border bg-white px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-hidden"
              />
            </label>
            <button
              type="submit"
              disabled={savingClaimLimit}
              className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:opacity-95 disabled:opacity-60"
            >
              {savingClaimLimit ? "Saving…" : "Save limit"}
            </button>
          </form>
        </div>
      </AdminPanel>

      <div
        ref={trackTabs.containerRef}
        role="tablist"
        aria-label="Competition tracks"
        className="relative flex gap-6 overflow-x-auto border-b border-(--color-border) [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {domains.map((domain) => {
          const isSelected = domain.id === selectedDomain;
          const count = statements.filter((s) =>
            getStatementDomainIds(s).includes(domain.id),
          ).length;
          const pendingCount = statements.filter(
            (s) => getStatementDomainIds(s).includes(domain.id) && s.status === "pending_approval",
          ).length;
          return (
            <button
              key={domain.id}
              type="button"
              role="tab"
              data-tab-key={domain.id}
              aria-selected={isSelected}
              onClick={() => {
                setSelectedDomain(domain.id);
                setSearchQuery("");
              }}
              className={`relative inline-flex shrink-0 items-center gap-2 px-1 pt-1 pb-3 text-[13.5px] font-medium whitespace-nowrap transition-colors duration-200 outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--brand-accent) ${
                isSelected
                  ? "text-(--brand-primary)"
                  : "text-(--color-text-secondary) hover:text-foreground"
              }`}
            >
              {domain.name}
              <span
                className={`min-w-5 px-1.5 py-0.5 text-center text-[10.5px] font-bold ${
                  isSelected
                    ? "bg-(--brand-accent) text-white"
                    : "bg-muted text-(--color-text-secondary)"
                }`}
              >
                {count}
              </span>
              {pendingCount > 0 ? (
                <span
                  className="bg-amber-100 px-1.5 py-0.5 text-[10.5px] font-bold text-amber-800"
                  title={`${pendingCount} pending approval`}
                >
                  {pendingCount} pending
                </span>
              ) : null}
            </button>
          );
        })}
        <span aria-hidden className={tabIndicatorClass} style={trackTabs.indicatorStyle} />
      </div>

      <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
        {SELECTION_FILTERS.map((option) => {
          const active = selectionFilter === option.value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={active}
              onClick={() => setSelectionFilter(active ? "all" : option.value)}
              title={option.hint}
              className={cn(
                "flex items-center justify-between gap-2 border px-3 py-2.5 text-left transition sm:gap-3 sm:px-3.5",
                option.className,
                active
                  ? "ring-2 ring-(--brand-accent) ring-offset-1"
                  : "opacity-90 hover:opacity-100 hover:shadow-sm",
              )}
            >
              <span className="min-w-0">
                <span className="block text-[11.5px] leading-snug font-semibold sm:truncate sm:text-xs">
                  {option.label}
                </span>
                <span className="hidden truncate text-[11px] opacity-75 sm:block">
                  {option.hint}
                </span>
              </span>
              <span className="text-xl font-bold tabular-nums">
                {selectionCounts[option.value]}
              </span>
            </button>
          );
        })}
      </div>
      {selectionFilter !== "all" ? (
        <p className="-mt-3 text-xs text-muted-foreground">
          Showing only &ldquo;
          {SELECTION_FILTERS.find((option) => option.value === selectionFilter)?.label}&rdquo; in
          this track ·{" "}
          <button
            type="button"
            onClick={() => setSelectionFilter("all")}
            className="font-semibold text-primary hover:underline"
          >
            Show all
          </button>
        </p>
      ) : null}

      {/* Filter and Search Panel */}
      <AdminPanel className="rounded-xl p-3 sm:p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, title, keyword, or category..."
              className="h-10 w-full rounded-lg border border-border bg-white py-2 pl-9 pr-8 text-xs sm:h-auto text-foreground focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          <div className="flex w-full items-center gap-2 sm:w-auto">
            <AppSelect
              ariaLabel="Filter by difficulty"
              value={difficultyFilter}
              onValueChange={setDifficultyFilter}
              options={[{ value: "all", label: "All difficulties" }, ...DIFFICULTY_OPTIONS]}
              shape="pill"
              size="sm"
              className="w-full sm:w-auto sm:min-w-40"
            />
          </div>
        </div>
      </AdminPanel>

      {/* Problem Statements Table */}
      <AdminPanel className="overflow-hidden rounded-xl">
        <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-foreground">
              {domains.find((d) => d.id === selectedDomain)?.name}
            </span>
            <span className="text-xs text-muted-foreground">
              ({filteredStatements.length} challenges)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              <Plus className="size-3.5" />
              Add Challenge
            </button>
          </div>
        </div>

        {filteredStatements.length > 0 ? (
          <div
            key={selectedDomain}
            className="grid gap-3 p-3 animate-in fade-in-0 slide-in-from-bottom-1 duration-300 motion-reduce:animate-none sm:grid-cols-2 sm:p-4 xl:grid-cols-3"
          >
            {filteredStatements.map((item) => (
              <article
                key={item.id}
                className={`flex flex-col border bg-white transition-shadow hover:shadow-md sm:min-h-[280px] ${
                  item.status === "pending_approval"
                    ? "border-amber-300"
                    : item.status === "rejected"
                      ? "border-red-200"
                      : "border-border"
                }`}
              >
                <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-2.5">
                  <span className="truncate font-mono text-[11px] font-bold text-primary">
                    {item.id}
                  </span>
                  <div className="flex shrink-0 items-center gap-1.5">
                    {item.status === "pending_approval" ? (
                      <span className="bg-amber-100 px-2 py-0.5 text-[10.5px] font-semibold text-amber-800">
                        Pending
                      </span>
                    ) : item.status === "rejected" ? (
                      <span className="bg-red-100 px-2 py-0.5 text-[10.5px] font-semibold text-red-800">
                        Rejected
                      </span>
                    ) : null}
                    <span className="bg-muted px-2 py-0.5 text-[10.5px] font-semibold text-muted-foreground">
                      {item.difficulty}
                    </span>
                  </div>
                </div>

                <div className="flex flex-1 flex-col px-4 py-3.5">
                  <h3 className="line-clamp-2 text-sm font-bold leading-snug text-foreground">
                    <button
                      type="button"
                      onClick={() => openReview(item, "view")}
                      title={item.title}
                      className="text-left hover:text-(--brand-accent) hover:underline"
                    >
                      {item.title}
                    </button>
                  </h3>

                  {item.industry || item.platform || item.scope ? (
                    <dl className="mt-2 space-y-0.5 text-[11.5px]">
                      {item.industry ? (
                        <div className="flex gap-1">
                          <dt className="shrink-0 text-muted-foreground">Industry:</dt>
                          <dd className="truncate text-foreground/80" title={item.industry}>
                            {item.industry}
                          </dd>
                        </div>
                      ) : null}
                      {item.platform ? (
                        <div className="flex gap-1">
                          <dt className="shrink-0 text-muted-foreground">Tech:</dt>
                          <dd className="truncate text-foreground/80" title={item.platform}>
                            {item.platform}
                          </dd>
                        </div>
                      ) : null}
                      {item.scope ? (
                        <div className="flex gap-1">
                          <dt className="shrink-0 text-muted-foreground">Scope:</dt>
                          <dd className="truncate text-foreground/80" title={item.scope}>
                            {item.scope}
                          </dd>
                        </div>
                      ) : null}
                    </dl>
                  ) : null}

                  <p
                    className="mt-2.5 line-clamp-4 text-xs leading-relaxed text-muted-foreground"
                    title={item.description}
                  >
                    {item.description}
                  </p>

                  <div className="mt-auto flex flex-wrap gap-1.5 pt-3">
                    {getStatementDomainIds(item).length > 1 ? (
                      <span
                        className="bg-(--brand-accent-soft) px-2 py-0.5 text-[10.5px] font-semibold text-(--brand-accent)"
                        title={trackNames(item)}
                      >
                        {getStatementDomainIds(item).length} tracks
                      </span>
                    ) : null}
                    {item.category ? (
                      <span className="bg-muted px-2 py-0.5 text-[10.5px] font-medium text-muted-foreground">
                        {item.category}
                      </span>
                    ) : null}
                    {item.deliverables?.length ? (
                      <span
                        className="bg-muted px-2 py-0.5 text-[10.5px] font-medium text-muted-foreground"
                        title={item.deliverables.join("\n")}
                      >
                        {item.deliverables.length} deliverable
                        {item.deliverables.length === 1 ? "" : "s"}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 border-t border-border bg-muted/30 px-4 py-2.5">
                  <div className="min-w-0 text-[11px]">
                    <p className="truncate text-muted-foreground">
                      {item.proposedByTeam
                        ? `Team idea · ${item.proposedByTeam.team_name}`
                        : item.createdBy?.name
                          ? `Added by Jury · ${item.createdBy.name}`
                          : "Added by Admin"}
                    </p>
                    <p
                      className={cn(
                        "truncate font-semibold",
                        item.claimedBy ? "text-emerald-700" : "text-amber-700",
                      )}
                    >
                      {item.claimedBy
                        ? `Scored by ${item.claimedBy.name}`
                        : "Unclaimed · no Jury to score yet"}
                    </p>
                    <p
                      className={cn(
                        "truncate",
                        item.confirmedTeams?.length
                          ? "font-semibold text-foreground"
                          : "text-muted-foreground",
                      )}
                      title={item.confirmedTeams?.map((team) => team.team_name).join(", ")}
                    >
                      {item.confirmedTeams?.length
                        ? `Confirmed by ${item.confirmedTeams.map((team) => team.team_name).join(", ")}`
                        : "No team has confirmed it"}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    {item.claimedBy ? (
                      <button
                        type="button"
                        disabled={releasingStatementId === item.id}
                        onClick={() => void handleReleaseStatement(item)}
                        title="Release so another Jury member can claim it"
                        className="inline-flex h-7 items-center border border-border bg-white px-2 text-[11px] font-semibold text-foreground hover:bg-muted disabled:opacity-60"
                      >
                        {releasingStatementId === item.id ? "Releasing…" : "Release"}
                      </button>
                    ) : null}
                    {item.status === "pending_approval" ? (
                      <>
                        <button
                          type="button"
                          disabled={reviewingStatementId === item.id || teamSlotsFull(item)}
                          title={
                            teamSlotsFull(item)
                              ? `All ${teamProposalLimit} team idea slots are used`
                              : undefined
                          }
                          onClick={() => void handleReviewStatement(item, "approve")}
                          className="inline-flex h-7 items-center gap-1 bg-emerald-700 px-2 text-[11px] font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
                        >
                          <Check className="size-3" />
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={reviewingStatementId === item.id}
                          onClick={() => openReview(item, "reject")}
                          aria-label="Reject"
                          title="Reject"
                          className="inline-flex size-7 items-center justify-center border border-red-200 bg-white text-red-700 hover:bg-red-50 disabled:opacity-60"
                        >
                          <X className="size-3.5" />
                        </button>
                      </>
                    ) : null}

                    {deleteConfirmId === item.id ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="inline-flex h-7 items-center bg-destructive px-2 text-[11px] font-semibold text-destructive-foreground hover:opacity-90"
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(null)}
                          className="inline-flex h-7 items-center border border-border bg-white px-2 text-[11px] text-muted-foreground hover:text-foreground"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => openReview(item, "view")}
                          aria-label={`View ${item.title}`}
                          title="View"
                          className="inline-flex size-7 items-center justify-center border border-border bg-white text-foreground hover:bg-muted"
                        >
                          <Eye className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          aria-label={`Edit ${item.title}`}
                          title="Edit"
                          className="inline-flex size-7 items-center justify-center border border-border bg-white text-foreground hover:bg-muted"
                        >
                          <Pencil className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(item.id)}
                          aria-label={`Delete ${item.title}`}
                          title="Delete"
                          className="inline-flex size-7 items-center justify-center border border-border bg-white text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-muted-foreground">
            No problem statements found in this track. Click "Add Statement" or "Bulk Add" to create
            challenges.
          </div>
        )}
      </AdminPanel>

      {reviewTarget ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="review-statement-title"
        >
          <div className="h-dvh w-full max-w-xl overflow-y-auto overscroll-contain border-border bg-white p-4 shadow-large sm:h-auto sm:max-h-[90vh] sm:rounded-2xl sm:border sm:p-6">
            <div className="flex items-start justify-between gap-3 border-b border-border pb-3">
              <div className="min-w-0">
                <h3
                  id="review-statement-title"
                  className="mt-1 font-display text-base font-bold text-foreground"
                >
                  {reviewTarget.mode === "reject"
                    ? "Reject Problem Statement"
                    : "Problem Statement Details"}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {reviewTarget.statement.difficulty} ·{" "}
                  {reviewTarget.statement.category || "General"} · Submitted by{" "}
                  {reviewTarget.statement.proposedByTeam
                    ? `Team · ${reviewTarget.statement.proposedByTeam.team_name}`
                    : reviewTarget.statement.createdBy?.name
                      ? `Jury · ${reviewTarget.statement.createdBy.name}`
                      : "Admin"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReviewTarget(null)}
                className="rounded-lg p-1 text-muted-foreground hover:text-foreground"
                aria-label="Close"
              >
                <X className="size-5" />
              </button>
            </div>

            <ProblemStatementFacts
              className="mt-4"
              statementId={reviewTarget.statement.id}
              title={reviewTarget.statement.title}
              domain={trackNames(reviewTarget.statement)}
              industry={reviewTarget.statement.industry}
              organization={reviewTarget.statement.organization}
              contactInfo={reviewTarget.statement.contactInfo}
              scope={reviewTarget.statement.scope}
              platform={reviewTarget.statement.platform}
              description={reviewTarget.statement.description}
            />
            {reviewTarget.statement.status !== "pending_approval" &&
            reviewTarget.statement.status !== "rejected" ? (
              <div className="mt-4 grid gap-3 border border-border bg-muted/30 p-3 text-xs sm:grid-cols-2">
                <div>
                  <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                    Jury
                  </p>
                  <p className="mt-1 font-semibold text-foreground">
                    {reviewTarget.statement.claimedBy?.name || "Not claimed yet"}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                    Confirmed by teams ({reviewTarget.statement.confirmedTeams?.length || 0})
                  </p>
                  {reviewTarget.statement.confirmedTeams?.length ? (
                    <ul className="mt-1 space-y-0.5">
                      {reviewTarget.statement.confirmedTeams.map((team) => (
                        <li key={team.team_name} className="text-foreground">
                          <span className="font-semibold">{team.team_name}</span>
                          {team.lead_name ? (
                            <span className="text-muted-foreground"> · {team.lead_name}</span>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-1 text-muted-foreground">No team yet</p>
                  )}
                </div>
              </div>
            ) : null}
            {reviewTarget.statement.deliverables?.length ? (
              <div className="mt-4">
                <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                  Key deliverables
                </p>
                <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  {reviewTarget.statement.deliverables.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {reviewTarget.mode === "reject" ? (
              <label className="mt-5 block text-xs font-semibold text-foreground">
                Reason for rejection (shared with the{" "}
                {reviewTarget.statement.proposedByTeam ? "team" : "Jury member"})
                <textarea
                  autoFocus
                  rows={3}
                  maxLength={500}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-border px-3 py-2 text-sm font-normal"
                />
              </label>
            ) : null}

            <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-border pt-4">
              {reviewTarget.mode === "view" &&
              reviewTarget.statement.status !== "pending_approval" ? (
                <>
                  <button
                    type="button"
                    onClick={() => setReviewTarget(null)}
                    className="rounded-full border border-border bg-white px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const statement = reviewTarget.statement;
                      setReviewTarget(null);
                      handleOpenEdit(statement);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-95"
                  >
                    <Pencil className="size-3.5" />
                    Edit statement
                  </button>
                </>
              ) : reviewTarget.mode === "view" ? (
                <>
                  <button
                    type="button"
                    onClick={() => setReviewTarget({ ...reviewTarget, mode: "reject" })}
                    className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-white px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-50"
                  >
                    <X className="size-3.5" />
                    Reject
                  </button>
                  <button
                    type="button"
                    disabled={
                      reviewingStatementId === reviewTarget.statement.id ||
                      teamSlotsFull(reviewTarget.statement)
                    }
                    title={
                      teamSlotsFull(reviewTarget.statement)
                        ? `All ${teamProposalLimit} team idea slots are used`
                        : undefined
                    }
                    onClick={() => void handleReviewStatement(reviewTarget.statement, "approve")}
                    className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                  >
                    <Check className="size-3.5" />
                    Approve &amp; make live
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setReviewTarget(null)}
                    className="rounded-full border border-border bg-white px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={
                      !rejectReason.trim() || reviewingStatementId === reviewTarget.statement.id
                    }
                    onClick={() =>
                      void handleReviewStatement(reviewTarget.statement, "reject", rejectReason)
                    }
                    className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                  >
                    <X className="size-3.5" />
                    Reject statement
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* Create / Edit Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 sm:p-4">
          <div className="flex h-dvh w-full max-w-2xl flex-col overflow-hidden border-border bg-white shadow-large sm:h-auto sm:max-h-[92vh] sm:rounded-2xl sm:border">
            <div className="flex items-start justify-between gap-3 border-b border-border px-5 pt-5 pb-4 sm:px-7">
              <div className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-(--brand-accent-soft) text-(--brand-accent)">
                  {editingId ? <Pencil className="size-5" /> : <FilePlus2 className="size-5" />}
                </span>
                <div>
                  <h3 className="font-(family-name:--font-brand) text-xl font-semibold text-foreground">
                    {editingId ? "Edit Problem Statement" : "Add Problem Statement"}
                  </h3>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {editingId
                      ? `Updating ${editingId}.`
                      : "Fill in the details teams will see for this challenge."}
                  </p>
                </div>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex min-h-0 flex-1 flex-col">
              <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5 sm:px-7">
                <FormSection title="Basics">
                  <FormField
                    label="Title"
                    htmlFor="admin-ps-title"
                    counter={`${formData.title.length}/200`}
                  >
                    <input
                      id="admin-ps-title"
                      type="text"
                      required
                      maxLength={200}
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Clear challenge title"
                      className={formFieldClass}
                    />
                  </FormField>
                  <FormField label="Sub-category / topic" htmlFor="admin-ps-category" optional>
                    <input
                      id="admin-ps-category"
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="e.g. Mobile UX, LLM Agents"
                      className={formFieldClass}
                    />
                  </FormField>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField label="Organization" htmlFor="admin-ps-organization" optional>
                      <input
                        id="admin-ps-organization"
                        type="text"
                        maxLength={200}
                        value={formData.organization}
                        onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                        placeholder="Organization name"
                        className={formFieldClass}
                      />
                    </FormField>
                    <FormField label="Contact Info" htmlFor="admin-ps-contact-info">
                      <input
                        id="admin-ps-contact-info"
                        type="tel"
                        inputMode="tel"
                        required
                        maxLength={200}
                        value={formData.contactInfo}
                        onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                        placeholder="Phone number or contact details"
                        className={formFieldClass}
                      />
                    </FormField>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField label="Industry" htmlFor="admin-ps-industry">
                      <input
                        id="admin-ps-industry"
                        type="text"
                        required
                        maxLength={120}
                        value={formData.industry}
                        onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                        placeholder="e.g. Healthcare, FinTech"
                        className={formFieldClass}
                      />
                    </FormField>
                    <FormField label="Platform / Tech" htmlFor="admin-ps-platform">
                      <input
                        id="admin-ps-platform"
                        type="text"
                        required
                        maxLength={200}
                        value={formData.platform}
                        onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                        placeholder="e.g. Web, React, Node.js"
                        className={formFieldClass}
                      />
                    </FormField>
                  </div>
                </FormSection>

                <FormSection title="Classification">
                  <div className="grid gap-4">
                    <FormField
                      label="Domain tracks"
                      hint="The statement appears under every selected track."
                    >
                      <TrackMultiSelect
                        ariaLabel="Domain tracks"
                        options={trackOptions}
                        value={formData.domainIds}
                        onChange={(domainIds) => setFormData({ ...formData, domainIds })}
                      />
                    </FormField>
                    <FormField label="Difficulty">
                      <SegmentedControl
                        ariaLabel="Difficulty"
                        value={formData.difficulty}
                        onChange={(difficulty) => setFormData({ ...formData, difficulty })}
                        options={DIFFICULTIES}
                      />
                    </FormField>
                  </div>
                </FormSection>

                <FormSection title="Details">
                  <FormField
                    label="Scope"
                    htmlFor="admin-ps-scope"
                    hint="What is in and out of scope for this problem."
                    counter={`${formData.scope.length}/3000`}
                  >
                    <textarea
                      id="admin-ps-scope"
                      required
                      maxLength={3000}
                      rows={3}
                      value={formData.scope}
                      onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                      className={`${formFieldClass} resize-y`}
                    />
                  </FormField>
                  <FormField
                    label="Description"
                    htmlFor="admin-ps-description"
                    hint="Detail the challenge, context and objectives."
                    counter={`${formData.description.length} chars`}
                  >
                    <textarea
                      id="admin-ps-description"
                      required
                      rows={6}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className={`${formFieldClass} resize-y`}
                    />
                  </FormField>
                  <FormField
                    label="Key deliverables"
                    htmlFor="admin-ps-deliverables"
                    optional
                    hint="One deliverable per line."
                    counter={
                      formData.deliverablesText.trim()
                        ? `${formData.deliverablesText.split("\n").filter((line) => line.trim()).length} listed`
                        : undefined
                    }
                  >
                    <textarea
                      id="admin-ps-deliverables"
                      rows={4}
                      value={formData.deliverablesText}
                      onChange={(e) =>
                        setFormData({ ...formData, deliverablesText: e.target.value })
                      }
                      placeholder={
                        "Working prototype repo and deployment\nArchitecture design doc\nLive demonstration"
                      }
                      className={`${formFieldClass} resize-y`}
                    />
                  </FormField>
                </FormSection>
              </div>

              <div className="flex justify-end gap-2 border-t border-border bg-(--color-background-alt) px-5 py-4 sm:px-7">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <Save className="size-4" />
                  {editingId ? "Save changes" : "Create statement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Add Modal Dialog */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 sm:p-4">
          <div className="h-dvh w-full max-w-xl overflow-y-auto overscroll-contain border-border bg-white p-4 shadow-large sm:h-auto sm:max-h-[90vh] sm:rounded-2xl sm:border sm:p-6">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-display text-base font-bold text-foreground">
                Bulk Add Problem Statements
              </h3>
              <button
                type="button"
                onClick={() => setIsBulkModalOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleBulkImport} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <p className="block text-xs font-medium text-foreground">Target domain tracks</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    Every imported statement appears under all selected tracks.
                  </p>
                  <TrackMultiSelect
                    ariaLabel="Target domain tracks"
                    options={trackOptions}
                    value={bulkDomains}
                    onChange={setBulkDomains}
                    className="mt-1.5"
                  />
                </div>

                <div className="sm:max-w-[50%]">
                  <label className="block text-xs font-medium text-foreground">
                    Default Difficulty
                  </label>
                  <AppSelect
                    ariaLabel="Default difficulty"
                    value={bulkDifficulty}
                    onValueChange={(value) => setBulkDifficulty(value as ProblemDifficulty)}
                    options={DIFFICULTY_OPTIONS}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground">
                  Paste Problem Statements (Separated by empty lines)
                </label>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  First line of each block is the Title. Add optional Industry:, Scope:,
                  Platform/Tech: and Description: lines; unlabeled lines become the Description.
                </p>
                <textarea
                  required
                  rows={10}
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  placeholder={`1. Smart Dashboard Design\nIndustry: IoT / Manufacturing\nScope: Real-time telemetry dashboard for plant managers\nPlatform/Tech: Web, React, WebSockets\nDescription: Create an intuitive analytics interface for IoT telemetry.\n\n2. Design System Tokens\nBuild an accessible color and typography system.`}
                  className="mt-2 w-full rounded-lg border border-border bg-white p-3 text-xs text-foreground focus:border-primary focus:outline-hidden font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => setIsBulkModalOpen(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <Upload className="size-4" />
                  Import statements
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
