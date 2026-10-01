import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { JuryPageHeader } from "@/components/jury/JuryPageHeader";
import { JuryBadge, JuryTable, JuryTableMessage, JuryToolbar } from "@/components/jury/JuryTable";
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
  const [round, setRound] = useState(1);
  const [maxRound, setMaxRound] = useState(1);
  const [cutoff, setCutoff] = useState<number | null>(null);
  const [scoringComplete, setScoringComplete] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError("");
    void getJuryLeaderboard(hackathonId, round)
      .then((data) => {
        setItems(data.items);
        setRequiredEvaluations(data.requiredEvaluations ?? 2);
        setMaxRound(data.maxRound ?? 1);
        setCutoff(data.result?.cutoff ?? null);
        setScoringComplete(Boolean(data.scoringComplete));
      })
      .catch((cause) =>
        setError(cause instanceof Error ? cause.message : "Could not load leaderboard."),
      )
      .finally(() => setLoading(false));
  }, [hackathonId, round]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return query ? items.filter((entry) => entry.teamName.toLowerCase().includes(query)) : items;
  }, [items, search]);

  const rounds = Array.from({ length: maxRound }, (_, index) => index + 1);
  const otherRounds = rounds.filter((value) => value !== round);

  return (
    <section>
      <JuryPageHeader
        title="Leaderboard"
        description={`Team averages appear once ${requiredEvaluations === 1 ? "a Jury evaluation is" : `${requiredEvaluations} Jury evaluations are`} submitted. Drafts are not counted.`}
      />

      {maxRound > 1 ? (
        <div
          role="tablist"
          aria-label="Leaderboard round"
          className="mt-4 inline-flex rounded-xl border border-(--color-border) bg-white p-1"
        >
          {rounds.map((value) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={round === value}
              onClick={() => setRound(value)}
              className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-colors ${
                round === value
                  ? "bg-(--brand-accent) text-white"
                  : "text-(--color-text-secondary) hover:bg-(--color-background-alt)"
              }`}
            >
              Round {value}
            </button>
          ))}
        </div>
      ) : null}

      {!loading && items.length ? (
        <p className="mt-4 rounded-xl border border-(--color-border) bg-white px-4 py-3 text-sm text-(--color-text-secondary)">
          {cutoff !== null ? (
            <>
              Round {round} cutoff is <strong className="text-foreground">{cutoff}</strong>. Teams
              at or above it qualify for Round {round + 1}; the rest are disqualified.
            </>
          ) : scoringComplete ? (
            <>All teams are scored. The admin will set the qualifying cutoff for Round {round}.</>
          ) : (
            <>
              Qualified and disqualified teams are decided once every team has been scored by every
              Jury member.
            </>
          )}
        </p>
      ) : null}

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
        summary={`${items.length} teams${maxRound > 1 ? ` in Round ${round}` : ""}`}
      />

      <JuryTable
        minWidth={720 + otherRounds.length * 110}
        columns={[
          { label: "Rank", className: "w-20" },
          { label: "Team" },
          { label: "Jury evaluations" },
          ...otherRounds.map((value) => ({ label: `Round ${value}`, className: "text-right" })),
          {
            label: maxRound > 1 ? `Round ${round} average` : "Average score",
            className: "text-right",
          },
          { label: "Result" },
        ]}
      >
        {loading ? (
          <JuryTableMessage colSpan={5 + otherRounds.length}>Loading leaderboard…</JuryTableMessage>
        ) : !filtered.length ? (
          <JuryTableMessage colSpan={5 + otherRounds.length}>
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
              {otherRounds.map((value) => {
                const score = entry.roundScores?.find((item) => item.round === value);
                return (
                  <td
                    key={value}
                    className="px-4 py-3 text-right text-xs text-(--color-text-secondary) tabular-nums"
                  >
                    {score?.averageScore === null || score?.averageScore === undefined
                      ? "—"
                      : score.averageScore.toFixed(1)}
                  </td>
                );
              })}
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
              <td className="px-4 py-3">
                {entry.qualification === "qualified" ? (
                  <JuryBadge tone="green">Qualified · going to Round {round + 1}</JuryBadge>
                ) : entry.qualification === "disqualified" ? (
                  <JuryBadge tone="red">Disqualified</JuryBadge>
                ) : (
                  <span className="text-xs text-(--color-text-muted)">—</span>
                )}
              </td>
            </tr>
          ))
        )}
      </JuryTable>
    </section>
  );
}
