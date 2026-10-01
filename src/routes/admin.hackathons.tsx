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
  FilePlus2,
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
import { reviewAdminHackathonProblemStatement } from "@/lib/admin-api";
import { adminHackathons, findAdminHackathon } from "@/lib/admin-hackathons";
import { HackathonNav } from "@/components/admin/HackathonNav";
import { AppSelect } from "@/components/AppSelect";
import { ProblemStatementFacts } from "@/components/hackathon/ProblemStatementFacts";
import { FormField, FormSection, SegmentedControl, formFieldClass } from "@/components/FormLayout";

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
  industry: string;
  scope: string;
  platform: string;
  description: string;
  deliverablesText: string;
}

type AdminProblemStatement = ProblemStatement & {
  createdBy?: { name: string } | null;
  status?: "pending_approval" | "active" | "rejected";
  createdAt?: string;
};

const emptyForm: FormState = {
  domainIds: ["ui-ux"],
  title: "",
  category: "",
  difficulty: "Intermediate",
  industry: "",
  scope: "",
  platform: "",
  description: "",
  deliverablesText: "",
};

const hackathons = adminHackathons;

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
  const [evaluationDrafts, setEvaluationDrafts] = useState<Record<string, EvaluationDraft>>({});
  const [savingEvaluationId, setSavingEvaluationId] = useState<string | null>(null);

  const details = getHackathonDetails();
  const activeHackathonId = selectedHackathon?.id || hackathons[0].id;
  const domains = details.domains;

  const [statements, setStatements] = useState<AdminProblemStatement[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string>("ui-ux");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [releaseAt, setReleaseAt] = useState<string | null>(null);
  const [releaseAtInput, setReleaseAtInput] = useState<string>("");

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

  async function handleRemoveTeam(team: RegisteredUserWithStatus) {
    if (!window.confirm(`Remove team "${team.team_name}" permanently? This cannot be undone.`)) {
      return;
    }

    setRegisteredActionId(team._id);
    try {
      await removeHackathonUser(team._id);
      toast.success("Team removed successfully");
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

      return matchesSearch && matchesDifficulty;
    });
  }, [domainStatements, searchQuery, difficultyFilter]);

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

    if (!formData.id?.trim()) {
      toast.error("Problem statement ID is required");
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
        id: formData.id.trim(),
        domainId: formData.domainIds[0],
        domainIds: formData.domainIds,
        title: formData.title.trim(),
        category: formData.category.trim() || "General",
        difficulty: formData.difficulty,
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
        action === "approve"
          ? "Problem Statement approved and live."
          : "Problem Statement rejected.",
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

  if (pathname.includes("/jury") || pathname.includes("/evaluations")) return <Outlet />;

  if (!selectedHackathon) {
    return (
      <div className="space-y-6 p-4 sm:p-5 md:p-6">
        <AdminPageHeader
          title="Hackathons"
          description="Select a hackathon to manage its problem statements."
        />

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {hackathons.map((hackathon) => (
            <Link
              key={hackathon.id}
              to="/admin/hackathons"
              search={{ hackathon: hackathon.id }}
              className="group block rounded-2xl border border-border bg-white p-5 text-left shadow-(--shadow-small) transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-(--color-border-strong) hover:shadow-(--shadow-card-hover)"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-foreground">{hackathon.title}</h2>
                  <p className="mt-1 text-xs text-muted-foreground">{hackathon.date}</p>
                </div>

                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                  {hackathon.status}
                </span>
              </div>

              <div className="space-y-2 text-sm text-muted-foreground">
                <p>📍 {hackathon.venue}</p>
                <p>🏆 Prize Pool: {hackathon.prizePool}</p>
              </div>

              {hackathon.id === activeHackathonId && pendingApprovalCount > 0 ? (
                <p className="mt-4 inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
                  {pendingApprovalCount} Problem Statement
                  {pendingApprovalCount === 1 ? "" : "s"} awaiting approval
                </p>
              ) : null}

              <div className="mt-5 text-sm font-semibold text-primary">Open Hackathon →</div>
            </Link>
          ))}
        </div>
      </div>
    );
  }
  if (showRegisteredStudents) {
    return (
      <div className="space-y-6 p-4 sm:p-5 md:p-6">
        <HackathonNav
          hackathonId={selectedHackathon.id}
          active="teams"
          pendingCount={pendingApprovalCount}
        />
        <AdminPageHeader
          title="Registered Teams"
          description="View registered teams, team leads, members, and problem statement selections."
          actions={
            <button
              type="button"
              onClick={handleOpenRegisteredStudents}
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-white px-4 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
            >
              <RotateCcw className="size-3.5" />
              Refresh
            </button>
          }
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <AdminPanel className="rounded-xl border-border bg-white p-4">
            <p className="text-xs font-medium text-muted-foreground">Total Teams</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{registeredStats.total}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">Registered teams</p>
          </AdminPanel>

          <AdminPanel className="rounded-xl border-border bg-white p-4">
            <p className="text-xs font-medium text-muted-foreground">Problem Selected</p>
            <p className="mt-1 text-2xl font-bold text-primary">{registeredStats.selected}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">Confirmed challenges</p>
          </AdminPanel>

          <AdminPanel className="rounded-xl border-border bg-white p-4">
            <p className="text-xs font-medium text-muted-foreground">Awaiting Selection</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{registeredStats.pending}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">No problem selected</p>
          </AdminPanel>
        </div>

        <AdminPanel className="rounded-xl p-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={registeredSearch}
              onChange={(e) => setRegisteredSearch(e.target.value)}
              placeholder="Search team, lead, email, phone, member, or problem ID..."
              className="w-full rounded-lg border border-border bg-white py-2.5 pl-9 pr-9 text-xs text-foreground focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
            {registeredSearch && (
              <button
                type="button"
                onClick={() => setRegisteredSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          <div className="mt-3 flex justify-end">
            <div className="flex items-center gap-2 text-xs font-medium text-foreground">
              <span>Sort by</span>
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
                className="w-auto min-w-44"
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
                        <p className="mt-1 text-xs text-muted-foreground">
                          Lead:{" "}
                          <span className="font-medium text-foreground">{team.lead_name}</span>
                          {" · "}
                          {team.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
                      <span>
                        {team.members.length} member
                        {team.members.length === 1 ? "" : "s"}
                      </span>
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

                      <button
                        type="button"
                        disabled={registeredActionId === team._id}
                        onClick={() => handleRemoveTeam(team)}
                        className="rounded-lg border border-destructive/20 bg-white px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </AdminPanel>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-5 md:p-6">
      <HackathonNav
        hackathonId={selectedHackathon.id}
        active="statements"
        pendingCount={pendingApprovalCount}
      />
      <AdminPageHeader
        title="Problem Statements"
        description="Approve Jury submissions and manage live problem statements for the 4 competition tracks."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              title="Reset to starter seeds"
            >
              <RotateCcw className="size-3.5" />
              Reset
            </button>
            <button
              type="button"
              onClick={() => {
                setBulkDomains([selectedDomain]);
                setIsBulkModalOpen(true);
              }}
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-white px-4 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
            >
              <Upload className="size-3.5" />
              Bulk add
            </button>
            <button
              type="button"
              onClick={handleOpenCreate}
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-[0_6px_16px_-10px_var(--brand-accent)] transition-colors hover:bg-(--brand-accent-hover)"
            >
              <Plus className="size-3.5" />
              Add statement
            </button>
          </div>
        }
      />

      <AdminPanel className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
          <div>
            <h2 className="text-sm font-bold text-foreground">Approval queue</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Problem Statements added by Jury members go live only after you approve them.
            </p>
          </div>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${pendingApprovalCount ? "bg-amber-100 text-amber-800" : "bg-emerald-50 text-emerald-700"}`}
          >
            {pendingApprovalCount ? `${pendingApprovalCount} pending` : "All caught up"}
          </span>
        </div>
        {pendingApprovalCount ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-(--color-background-alt) text-[11px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
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
                      <p className="truncate text-xs text-muted-foreground">{item.description}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{trackNames(item)}</td>
                    <td className="px-4 py-3 text-xs text-foreground">
                      {item.createdBy?.name ? `Jury · ${item.createdBy.name}` : "—"}
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
                          disabled={reviewingStatementId === item.id}
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
          </div>
        ) : (
          <p className="px-4 py-5 text-center text-xs text-muted-foreground">
            No Problem Statements are waiting for approval.
          </p>
        )}
      </AdminPanel>

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
            className="flex flex-col gap-2 sm:flex-row sm:items-end"
          >
            <label className="text-xs font-medium text-foreground">
              Release date and time
              <input
                type="datetime-local"
                value={releaseAtInput}
                onChange={(e) => setReleaseAtInput(e.target.value)}
                className="mt-1 block rounded-lg border border-border bg-white px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-hidden"
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
      </AdminPanel>

      {/* Domain Selection Tabs (4 Tracks) */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
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
              onClick={() => {
                setSelectedDomain(domain.id);
                setSearchQuery("");
              }}
              className={`flex items-center justify-between rounded-xl border p-3.5 text-left transition-all ${
                isSelected
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border bg-white hover:border-border-strong hover:bg-muted/30"
              }`}
            >
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Track
                </p>
                <p className="font-semibold text-sm text-foreground">{domain.name}</p>
                {pendingCount > 0 ? (
                  <p className="mt-0.5 text-[11px] font-semibold text-amber-700">
                    {pendingCount} pending approval
                  </p>
                ) : null}
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                  isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter and Search Panel */}
      <AdminPanel className="rounded-xl p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, title, keyword, or category..."
              className="w-full rounded-lg border border-border bg-white py-2 pl-9 pr-8 text-xs text-foreground focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary"
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

          <div className="flex items-center gap-2">
            <AppSelect
              ariaLabel="Filter by difficulty"
              value={difficultyFilter}
              onValueChange={setDifficultyFilter}
              options={[{ value: "all", label: "All difficulties" }, ...DIFFICULTY_OPTIONS]}
              shape="pill"
              size="sm"
              className="w-auto min-w-40"
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
          <div className="divide-y divide-border overflow-x-auto">
            {filteredStatements.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-3 p-4 transition-colors hover:bg-muted/30 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded bg-primary/10 px-2 py-0.5 font-mono text-xs font-bold text-primary">
                      {item.id}
                    </span>
                    <span className="rounded bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                      {item.difficulty}
                    </span>
                    {getStatementDomainIds(item).length > 1 && (
                      <span
                        className="rounded bg-(--brand-accent-soft) px-2 py-0.5 text-[11px] font-semibold text-(--brand-accent)"
                        title={trackNames(item)}
                      >
                        {getStatementDomainIds(item).length} tracks: {trackNames(item)}
                      </span>
                    )}
                    {item.category && (
                      <span className="rounded bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                        {item.category}
                      </span>
                    )}
                    {item.status === "pending_approval" ? (
                      <span className="rounded bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                        Pending Approval
                      </span>
                    ) : item.status === "rejected" ? (
                      <span className="rounded bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-800">
                        Rejected
                      </span>
                    ) : null}
                  </div>

                  <h3 className="mt-2 text-sm font-bold text-foreground">{item.title}</h3>
                  {item.industry || item.platform ? (
                    <p className="mt-1 text-[11.5px] text-foreground/80">
                      {item.industry ? (
                        <>
                          <span className="text-muted-foreground">Industry:</span> {item.industry}
                        </>
                      ) : null}
                      {item.industry && item.platform ? (
                        <span className="mx-1.5 text-muted-foreground">·</span>
                      ) : null}
                      {item.platform ? (
                        <>
                          <span className="text-muted-foreground">Platform / Tech:</span>{" "}
                          {item.platform}
                        </>
                      ) : null}
                    </p>
                  ) : null}
                  {item.scope ? (
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      <span className="font-semibold text-foreground/80">Scope:</span> {item.scope}
                    </p>
                  ) : null}
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    Added by {item.createdBy?.name ? `Jury · ${item.createdBy.name}` : "Admin"}
                  </p>

                  {item.deliverables && item.deliverables.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {item.deliverables.map((d, i) => (
                        <span
                          key={i}
                          className="rounded-md border border-border bg-card px-2 py-0.5 text-[11px] text-muted-foreground"
                        >
                          • {d}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-1.5 sm:self-start">
                  {item.status === "pending_approval" ? (
                    <>
                      <button
                        type="button"
                        disabled={reviewingStatementId === item.id}
                        onClick={() => void handleReviewStatement(item, "approve")}
                        className="rounded-md bg-emerald-700 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        disabled={reviewingStatementId === item.id}
                        onClick={() => openReview(item, "reject")}
                        className="rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
                      >
                        Reject
                      </button>
                    </>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(item)}
                    className="inline-flex items-center gap-1 rounded-md border border-border bg-white px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
                  >
                    <Pencil className="size-3" />
                    Edit
                  </button>

                  {deleteConfirmId === item.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="rounded-md bg-destructive px-2.5 py-1.5 text-xs font-semibold text-destructive-foreground hover:opacity-90"
                      >
                        Confirm
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(null)}
                        className="rounded-md border border-border bg-white px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(item.id)}
                      className="inline-flex items-center gap-1 rounded-md border border-border bg-white px-2.5 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="size-3" />
                      Delete
                    </button>
                  )}
                </div>
              </div>
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="review-statement-title"
        >
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-border bg-white p-6 shadow-large">
            <div className="flex items-start justify-between gap-3 border-b border-border pb-3">
              <div className="min-w-0">
                <p className="font-mono text-xs font-semibold text-primary">
                  {reviewTarget.statement.id} · {trackNames(reviewTarget.statement)}
                </p>
                <h3
                  id="review-statement-title"
                  className="mt-1 font-display text-base font-bold text-foreground"
                >
                  {reviewTarget.mode === "reject" ? "Reject: " : ""}
                  {reviewTarget.statement.title}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {reviewTarget.statement.difficulty} ·{" "}
                  {reviewTarget.statement.category || "General"} · Submitted by{" "}
                  {reviewTarget.statement.createdBy?.name
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
              industry={reviewTarget.statement.industry}
              scope={reviewTarget.statement.scope}
              platform={reviewTarget.statement.platform}
              description={reviewTarget.statement.description}
            />
            {reviewTarget.statement.deliverables?.length ? (
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {reviewTarget.statement.deliverables.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            ) : null}

            {reviewTarget.mode === "reject" ? (
              <label className="mt-5 block text-xs font-semibold text-foreground">
                Reason for rejection (shared with the Jury member)
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
              {reviewTarget.mode === "view" ? (
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
                    disabled={reviewingStatementId === reviewTarget.statement.id}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-large">
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
                  <div className="grid gap-4 sm:grid-cols-2">
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
                    <FormField
                      label="Custom ID"
                      htmlFor="admin-ps-id"
                      optional
                      hint="Generated automatically if left blank."
                    >
                      <input
                        id="admin-ps-id"
                        type="text"
                        value={formData.id || ""}
                        onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                        placeholder="e.g. UX-01"
                        className={`${formFieldClass} font-mono`}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-white p-6 shadow-large">
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
