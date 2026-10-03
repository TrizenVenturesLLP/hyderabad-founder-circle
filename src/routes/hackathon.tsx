import { useEffect, useState } from "react";
import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { getHackathonDetails, subscribeToHackathonData } from "@/lib/hackathon-storage";
import { HackathonHero } from "@/components/hackathon/HackathonHero";
import { HackathonDomains } from "@/components/hackathon/HackathonDomains";
import { HackathonVenueSection } from "@/components/hackathon/HackathonVenue";
import type { HackathonDetails } from "@/lib/hackathon";
import { POSTER_HACKATHON_DETAILS } from "@/lib/hackathon-data";

const siteUrl = "https://community.trizenventures.com";
const hackathonUrl = `${siteUrl}/hackathon`;
const hackathonTitle = "AI Hackathon in Hyderabad 2026 | AI HACK X MRDU";
const hackathonDescription =
  "Join AI HACK X MRDU 2026, a 24-hour national AI hackathon in Hyderabad on October 3–4. Build across four tracks for a ₹2,00,000 prize pool.";
const hackathonImage = `${siteUrl}${POSTER_HACKATHON_DETAILS.posterImage}`;

export const Route = createFileRoute("/hackathon")({
  component: HackathonPublicPage,
  head: () => ({
    meta: [
      { title: hackathonTitle },
      { name: "description", content: hackathonDescription },
      { name: "robots", content: "index,follow" },
      { property: "og:site_name", content: "Trizen Community" },
      { property: "og:title", content: hackathonTitle },
      { property: "og:description", content: hackathonDescription },
      { property: "og:type", content: "event" },
      { property: "og:url", content: hackathonUrl },
      { property: "og:image", content: hackathonImage },
      { property: "og:image:alt", content: "AI HACK X MRDU 2026 hackathon poster" },
      { property: "og:locale", content: "en_IN" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: hackathonTitle },
      { name: "twitter:description", content: hackathonDescription },
      { name: "twitter:image", content: hackathonImage },
    ],
    links: [{ rel: "canonical", href: hackathonUrl }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Event",
          name: POSTER_HACKATHON_DETAILS.title,
          description: POSTER_HACKATHON_DETAILS.blurb,
          url: hackathonUrl,
          image: [hackathonImage],
          startDate: POSTER_HACKATHON_DETAILS.venue.dateISO,
          ...(POSTER_HACKATHON_DETAILS.venue.endDateISO
            ? { endDate: POSTER_HACKATHON_DETAILS.venue.endDateISO }
            : {}),
          eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
          eventStatus: "https://schema.org/EventScheduled",
          location: {
            "@type": "Place",
            name: POSTER_HACKATHON_DETAILS.venue.name,
            address: {
              "@type": "PostalAddress",
              streetAddress: POSTER_HACKATHON_DETAILS.venue.address,
              addressLocality: POSTER_HACKATHON_DETAILS.venue.city,
              addressRegion: "Telangana",
              postalCode: "500100",
              addressCountry: "IN",
            },
          },
          organizer: {
            "@type": "Organization",
            name: POSTER_HACKATHON_DETAILS.university,
            url: siteUrl,
          },
        }),
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
