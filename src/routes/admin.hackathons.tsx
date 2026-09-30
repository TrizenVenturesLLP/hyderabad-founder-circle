import { createFileRoute, Link } from "@tanstack/react-router";
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
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { AdminPageHeader, AdminPanel } from "@/components/admin/AdminPageChrome";
import {
  getAllProblemStatements,
  addProblemStatement,
  updateProblemStatement,
  deleteProblemStatement,
  bulkAddProblemStatements,
  clearAllProblemStatements,
  resetProblemStatementsToStarter,
  subscribeToHackathonData,
  getHackathonDetails,
} from "@/lib/hackathon-storage";
import type { ProblemDifficulty, ProblemStatement } from "@/lib/hackathon";
import {
  activateHackathonUser,
  getHackathonRegisteredUsers,
  removeHackathonUser,
  suspendHackathonUser,
  getHackathonReleaseTimer as getServerReleaseTimer,
  saveHackathonReleaseTimer as saveServerReleaseTimer,
  clearHackathonReleaseTimer,
  getHackathonProblemStatements,
  saveHackathonProblemStatement,
  deleteHackathonProblemStatement,
  saveHackathonEvaluation,
  type HackathonEvaluationScores,
  type HackathonRegisteredUser,
} from "@/lib/hackathon-api";

export const Route = createFileRoute("/admin/hackathons")({
  component: AdminHackathonsPage,
  head: () => ({
    meta: [{ title: "AI Hack x MRDU — Admin Problem Statements" }],
  }),
});

interface FormState {
  id?: string;
  domainId: string;
  title: string;
  category: string;
  difficulty: ProblemDifficulty;
  description: string;
  deliverablesText: string;
}

const emptyForm: FormState = {
  domainId: "ui-ux",
  title: "",
  category: "",
  difficulty: "Intermediate",
  description: "",
  deliverablesText: "",
};

type HackathonCard = {
  id: string;
  title: string;
  date: string;
  venue: string;
  status: "Upcoming" | "Ongoing" | "Completed";
  prizePool: string;
};

const hackathons: HackathonCard[] = [
  {
    id: "ai-hack-x-mrdu-2026",
    title: "AI HACK X MRDU 2026",
    date: "October 3–4, 2026",
    venue: "Malla Reddy Deemed to be University",
    status: "Upcoming",
    prizePool: "₹2,00,000",
  },
];

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
  const [selectedHackathon, setSelectedHackathon] = useState<HackathonCard | null>(null);
  const [showRegisteredStudents, setShowRegisteredStudents] = useState(false);
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
  const domains = details.domains;

  const [statements, setStatements] = useState<ProblemStatement[]>([]);
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

  // Bulk Add Modal
  const [isBulkModalOpen, setIsBulkModalOpen] = useState<boolean>(false);
  const [bulkText, setBulkText] = useState<string>("");
  const [bulkDomain, setBulkDomain] = useState<string>("ui-ux");
  const [bulkDifficulty, setBulkDifficulty] = useState<ProblemDifficulty>("Intermediate");

  useEffect(() => {
    async function load() {
      try {
        const data = await getHackathonProblemStatements();
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
  }, []);

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
    setShowRegisteredStudents(true);
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

  async function handleSaveEvaluation(team: RegisteredUserWithStatus) {
    const draft = evaluationDrafts[team._id] ?? toEvaluationDraft(team);
    const scores = Object.fromEntries(
      evaluationCriteria.map(({ key }) => [key, draft.scores[key]]),
    ) as Partial<HackathonEvaluationScores>;

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
      (total, criterion) =>
        total + ((scores[criterion.key] ?? 0) * criterion.weight) / 10,
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
    return statements.filter((s) => s.domainId === selectedDomain);
  }, [statements, selectedDomain]);

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
      domainId: selectedDomain,
    });
    setIsModalOpen(true);
  }

  function handleOpenEdit(item: ProblemStatement) {
    setEditingId(item.id);
    setFormData({
      id: item.id,
      domainId: item.domainId,
      title: item.title,
      category: item.category || "",
      difficulty: item.difficulty,
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

    const deliverables = formData.deliverablesText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    try {
      await saveHackathonProblemStatement({
        id: formData.id.trim(),
        domainId: formData.domainId,
        title: formData.title.trim(),
        category: formData.category.trim() || "General",
        difficulty: formData.difficulty,
        description: formData.description.trim(),
        deliverables,
      });

      const data = await getHackathonProblemStatements();
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

  function handleBulkImport(e: React.FormEvent) {
    e.preventDefault();
    if (!bulkText.trim()) {
      toast.error("Please enter at least one problem statement");
      return;
    }

    const rawBlocks = bulkText
      .split(/\n\s*\n/)
      .map((b) => b.trim())
      .filter(Boolean);

    const parsedItems: {
      domainId: string;
      title: string;
      description: string;
      difficulty: ProblemDifficulty;
    }[] = [];

    for (const block of rawBlocks) {
      const lines = block
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      if (lines.length === 0) continue;
      const title = lines[0].replace(/^(\d+[\.\)]|\-|\*)\s*/, "");
      const description = lines.slice(1).join(" ") || title;
      parsedItems.push({
        domainId: bulkDomain,
        title,
        description,
        difficulty: bulkDifficulty,
      });
    }

    if (parsedItems.length === 0) {
      toast.error("Could not parse problem statements");
      return;
    }

    const added = bulkAddProblemStatements(parsedItems);
    toast.success(`Successfully imported ${added.length} problem statements into ${bulkDomain}`);
    setIsBulkModalOpen(false);
    setBulkText("");
  }

  async function handleDelete(id: string) {
    try {
      await deleteHackathonProblemStatement(id);

      const data = await getHackathonProblemStatements();
      setStatements(data.statements || []);

      toast.success(`Deleted statement ${id}`);
      setDeleteConfirmId(null);
    } catch (error) {
      console.error("Delete problem statement error:", error);

      toast.error(error instanceof Error ? error.message : "Could not delete statement");
    }
  }

  function handleReset() {
    if (
      window.confirm(
        "Reset problem statements to the starter set? This will replace current entries.",
      )
    ) {
      resetProblemStatementsToStarter();
      toast.success("Problem statements reset to starter templates");
    }
  }

  if (!selectedHackathon) {
    return (
      <div className="space-y-6 pl-4">
        <AdminPageHeader
          title="Hackathons"
          description="Select a hackathon to manage its problem statements."
        />

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {hackathons.map((hackathon) => (
            <button
              key={hackathon.id}
              type="button"
              onClick={() => setSelectedHackathon(hackathon)}
              className="group rounded-xl border border-border bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
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

              <div className="mt-5 text-sm font-semibold text-primary">Open Hackathon →</div>
            </button>
          ))}
        </div>
      </div>
    );
  }
  if (showRegisteredStudents) {
    return (
      <div className="space-y-6 pl-4">
        <AdminPageHeader
          title="AI HACK X MRDU — Registered Teams"
          description="View registered teams, team leads, members, and problem statement selections."
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowRegisteredStudents(false)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted"
              >
                <ArrowLeft className="size-3.5" />
                Back to Problem Statements
              </button>
              <button
                type="button"
                onClick={handleOpenRegisteredStudents}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:opacity-95"
              >
                <RotateCcw className="size-3.5" />
                Refresh
              </button>
            </div>
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
            <label className="flex items-center gap-2 text-xs font-medium text-foreground">
              <span>Sort by</span>
              <select
                value={registeredSort}
                onChange={(e) =>
                  setRegisteredSort(
                    e.target.value as
                      | "registration-date"
                      | "team-name"
                      | "score-high-low"
                      | "score-low-high",
                  )
                }
                className="rounded-lg border border-border bg-white px-2.5 py-2 text-xs font-medium text-foreground focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary"
              >
                <option value="registration-date">Registration date</option>
                <option value="team-name">Team name</option>
                <option value="score-high-low">Score: High → Low</option>
                <option value="score-low-high">Score: Low → High</option>
              </select>
            </label>
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
                              <a
                                href={team.submission.ppt_url}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-1 inline-flex text-xs font-semibold text-primary hover:underline"
                              >
                                View PPT / PDF
                              </a>
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

                      {team.submission?.submitted_at && (() => {
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
    <div className="space-y-6 pl-4">
      {/* Top Header */}
      <AdminPageHeader
        title="AI HACK X MRDU — Problem Statements"
        description="Add and manage live challenge problem statements for the 4 competition tracks."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedHackathon(null)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted"
            >
              <ArrowLeft className="size-3.5" />
              Back to Hackathons
            </button>

            <button
              type="button"
              onClick={handleOpenRegisteredStudents}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted"
            >
              <Users className="size-3.5" />
              Registered Students
            </button>
            <button
              type="button"
              onClick={() => {
                setBulkDomain(selectedDomain);
                setIsBulkModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted"
            >
              <Upload className="size-3.5" />
              Bulk Add
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-2.5 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted"
              title="Reset to starter seeds"
            >
              <RotateCcw className="size-3.5" />
              Reset
            </button>
            <button
              type="button"
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-95"
            >
              <Plus className="size-3.5" />
              Add Statement
            </button>
          </div>
        }
      />

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
          const count = statements.filter((s) => s.domainId === domain.id).length;
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
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="rounded-lg border border-border bg-white px-3 py-2 text-xs font-medium text-foreground focus:border-primary focus:outline-hidden"
            >
              <option value="all">All Difficulties</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
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
                    {item.category && (
                      <span className="rounded bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                        {item.category}
                      </span>
                    )}
                  </div>

                  <h3 className="mt-2 text-sm font-bold text-foreground">{item.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {item.description}
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

      {/* Create / Edit Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-white p-6 shadow-large">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-display text-base font-bold text-foreground">
                {editingId ? `Edit Problem Statement: ${editingId}` : "Add New Problem Statement"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-foreground">Domain Track</label>
                  <select
                    value={formData.domainId}
                    onChange={(e) => setFormData({ ...formData, domainId: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-hidden"
                  >
                    {domains.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground">
                    Custom ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.id || ""}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    placeholder="e.g. UX-01, WEB-01 (auto if blank)"
                    className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-foreground">
                    Sub-Category / Topic
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g. Mobile UX, Full Stack, LLM Agents"
                    className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground">
                    Difficulty Level
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) =>
                      setFormData({ ...formData, difficulty: e.target.value as ProblemDifficulty })
                    }
                    className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-hidden"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground">Problem Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Clear challenge title"
                  className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground">
                  Description & Context *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detail the technical challenge, scope, and objectives..."
                  className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground">
                  Key Deliverables (One per line)
                </label>
                <textarea
                  rows={3}
                  value={formData.deliverablesText}
                  onChange={(e) => setFormData({ ...formData, deliverablesText: e.target.value })}
                  placeholder="Working prototype repo and deployment&#10;Architecture design doc&#10;Live demonstration"
                  className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-hidden font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-border bg-white px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-95"
                >
                  {editingId ? "Save Changes" : "Create Statement"}
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
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-foreground">
                    Target Domain Track
                  </label>
                  <select
                    value={bulkDomain}
                    onChange={(e) => setBulkDomain(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-hidden"
                  >
                    {domains.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground">
                    Default Difficulty
                  </label>
                  <select
                    value={bulkDifficulty}
                    onChange={(e) => setBulkDifficulty(e.target.value as ProblemDifficulty)}
                    className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-hidden"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground">
                  Paste Problem Statements (Separated by empty lines)
                </label>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  First line of each block becomes the Title, subsequent lines become the
                  Description.
                </p>
                <textarea
                  required
                  rows={8}
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  placeholder={`1. Smart Dashboard Design\nCreate an intuitive analytics interface for IoT telemetry.\n\n2. Design System Tokens\nBuild an accessible color and typography system.`}
                  className="mt-2 w-full rounded-lg border border-border bg-white p-3 text-xs text-foreground focus:border-primary focus:outline-hidden font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => setIsBulkModalOpen(false)}
                  className="rounded-lg border border-border bg-white px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-95"
                >
                  Import Problem Statements
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
