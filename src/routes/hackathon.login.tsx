import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/hackathon/login")({
  component: HackathonLoginRedirect,
});

function HackathonLoginRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const email = params.get("email")?.trim() || "";

    const nextParams = new URLSearchParams();
    if (email) {
      nextParams.set("email", email);
    }
    nextParams.set("mode", "login");

    void navigate({
      to: `/hackathon/register?${nextParams.toString()}`,
      replace: true,
    });
  }, [navigate]);

  return null;
}
