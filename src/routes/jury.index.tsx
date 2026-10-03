import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useJuryWorkspace } from "@/components/jury/JuryWorkspaceContext";

export const Route = createFileRoute("/jury/")({
  component: JuryIndexPage,
});

function JuryIndexPage() {
  const { hackathons, loading, error } = useJuryWorkspace();

  if (loading) {
    return (
      <p className="py-10 text-sm text-[var(--color-text-secondary)]">Loading your workspace…</p>
    );
  }
  if (error) {
    return (
      <p role="alert" className="border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {error}
      </p>
    );
  }
  if (hackathons.length) {
    return (
      <Navigate
        to="/jury/hackathons/$hackathonId/overview"
        params={{ hackathonId: hackathons[0].slug }}
        replace
      />
    );
  }
  return (
    <div className="mx-auto mt-8 max-w-xl border border-dashed border-[var(--color-border)] bg-white p-8 text-center">
      <h1 className="font-semibold">No assigned Hackathons</h1>
      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
        An administrator will send an invitation when you are assigned.
      </p>
    </div>
  );
}
