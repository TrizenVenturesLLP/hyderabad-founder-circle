import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/problem-statements")({
  component: () => <Outlet />,
});
