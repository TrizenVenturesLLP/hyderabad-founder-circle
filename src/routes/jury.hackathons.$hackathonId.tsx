import { createFileRoute, Navigate, Outlet, useRouterState } from "@tanstack/react-router";

export const Route = createFileRoute("/jury/hackathons/$hackathonId")({
  component: JuryHackathonLayout,
});

function JuryHackathonLayout() {
  const { hackathonId } = Route.useParams();
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  if (pathname.replace(/\/$/, "") === `/jury/hackathons/${hackathonId}`) {
    return (
      <Navigate to="/jury/hackathons/$hackathonId/overview" params={{ hackathonId }} replace />
    );
  }
  return <Outlet />;
}
