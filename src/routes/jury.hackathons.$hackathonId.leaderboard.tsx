import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { JuryPageHeader } from "@/components/jury/JuryPageHeader";
import { JuryTable, JuryTableMessage, JuryToolbar } from "@/components/jury/JuryTable";
import { getJuryLeaderboard, type JuryLeaderboardEntry } from "@/lib/jury-api";

export const Route = createFileRoute("/jury/hackathons/$hackathonId/leaderboard")({
  component: JuryLeaderboardPage,
});

function JuryLeaderboardPage() {
  const { hackathonId } = Route.useParams();
  const [items, setItems] = useState<JuryLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [requiredEvaluations, setRequiredEvaluations] = useState(2);

  useEffect(() => {
    void getJuryLeaderboard(hackathonId)
      .then((data) => {
        setItems(data.items);
        setRequiredEvaluations(data.requiredEvaluations ?? 2);
      })
      .catch((cause) =>
        setError(cause instanceof Error ? cause.message : "Could not load leaderboard."),
      )
      .finally(() => setLoading(false));
  }, [hackathonId]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return query ? items.filter((entry) => entry.teamName.toLowerCase().includes(query)) : items;
  }, [items, search]);

  return (
    <section>
      <JuryPageHeader
        title="Leaderboard"
        description={`Team averages appear once ${requiredEvaluations === 1 ? "a Jury evaluation is" : `${requiredEvaluations} Jury evaluations are`} submitted. Drafts are not counted.`}
      />

      {error ? (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </p>
      ) : null}

      <JuryToolbar
        search={search}
        onSearchChange={setSearch}
        placeholder="Search team"
        summary={`${items.length} teams`}
      />

      <JuryTable
        minWidth={560}
        columns={[
          { label: "Rank", className: "w-20" },
          { label: "Team" },
          { label: "Jury evaluations" },
          { label: "Average score", className: "text-right" },
        ]}
      >
        {loading ? (
          <JuryTableMessage colSpan={4}>Loading leaderboard…</JuryTableMessage>
        ) : !filtered.length ? (
          <JuryTableMessage colSpan={4}>
            {items.length ? "No teams match your search." : "No teams to rank yet."}
          </JuryTableMessage>
        ) : (
          filtered.map((entry) => (
            <tr key={entry.teamId} className="hover:bg-(--color-background-alt)/60">
              <td className="px-4 py-3">
                {entry.rank === null ? (
                  <span className="text-(--color-text-muted)">—</span>
                ) : (
                  <span
                    className={`inline-flex size-8 items-center justify-center rounded-full text-xs font-bold tabular-nums ${entry.rank <= 3 ? "bg-(--brand-accent) text-white" : "bg-(--color-background-alt) text-(--color-text-secondary)"}`}
                  >
                    {entry.rank}
                  </span>
                )}
              </td>
              <td className="px-4 py-3 font-medium">{entry.teamName}</td>
              <td className="px-4 py-3 text-xs text-(--color-text-secondary)">
                {entry.submittedEvaluations} of {entry.totalJuryMembers} submitted
              </td>
              <td className="px-4 py-3 text-right font-semibold tabular-nums">
                {entry.averageScore === null ? (
                  <span className="text-xs font-normal text-(--color-text-muted)">
                    {entry.submittedEvaluations
                      ? `Needs ${requiredEvaluations - entry.submittedEvaluations} more`
                      : "Not evaluated"}
                  </span>
                ) : (
                  `${entry.averageScore.toFixed(1)} / 100`
                )}
              </td>
            </tr>
          ))
        )}
      </JuryTable>
    </section>
  );
}
