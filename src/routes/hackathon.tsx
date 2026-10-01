import { useEffect, useState } from "react";
import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { getHackathonDetails, subscribeToHackathonData } from "@/lib/hackathon-storage";
import { HackathonHero } from "@/components/hackathon/HackathonHero";
import { HackathonDomains } from "@/components/hackathon/HackathonDomains";
import { HackathonVenueSection } from "@/components/hackathon/HackathonVenue";
import type { HackathonDetails } from "@/lib/hackathon";

export const Route = createFileRoute("/hackathon")({
  component: HackathonPublicPage,
  head: () => ({
    meta: [
      { title: "AI HACK X MRDU 2026 — Malla Reddy (MR) Deemed to be University" },
      {
        name: "description",
        content:
          "AI HACK X MRDU: 24HRS National Hackathon by Department of CSE-AIML at Malla Reddy University. 4 Tracks: UI/UX Design, Web Dev, Vibe Coding, and Agentic AI with ₹2,00,000 Prize Pool.",
      },
      {
        property: "og:title",
        content: "AI HACK X MRDU 2026 — 24HRS Hackathon",
      },
      {
        property: "og:description",
        content:
          "Innovate Beyond Tomorrow. 4 specialized tracks, live problem statements, ₹2,00,000 prize pool, and internships.",
      },
      {
        property: "og:type",
        content: "website",
      },
    ],
  }),
});

function HackathonPublicPage() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [details, setDetails] = useState<HackathonDetails>(getHackathonDetails());

  useEffect(() => {
    function syncData() {
      setDetails(getHackathonDetails());
    }

    const unsubscribe = subscribeToHackathonData(syncData);
    return () => unsubscribe();
  }, []);

  if (
    pathname.startsWith("/hackathon/problems/") ||
    pathname === "/hackathon/register" ||
    pathname === "/hackathon/login" ||
    pathname === "/hackathon/set-password"
  ) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Overview */}
      <HackathonHero details={details} />

      {/* 4 Domains & Dynamic Problem Statements Managed Via Admin */}
      <HackathonDomains domains={details.domains} />

      {/* Full Venue Details, Map & Organizing Committee */}
      <HackathonVenueSection venue={details.venue} coordinators={details.coordinators} />
    </div>
  );
}
