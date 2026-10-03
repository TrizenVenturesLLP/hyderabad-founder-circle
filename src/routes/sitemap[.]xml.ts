import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { getMeetups, isHackathonEvent } from "@/lib/events";

const BASE_URL = "https://community.trizenventures.com";

interface SitemapEntry {
  path: string;
  changefreq?:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  priority?: string;
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const meetups = await getMeetups();
        const publicMeetups = meetups.filter((meetup) => !isHackathonEvent(meetup));
        const communitySlugs = Array.from(
          new Set(publicMeetups.map((meetup) => meetup.organization?.slug).filter(Boolean)),
        ) as string[];
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/events", changefreq: "weekly", priority: "0.9" },
          { path: "/hackathon", changefreq: "weekly", priority: "0.9" },
          { path: "/community", changefreq: "monthly", priority: "0.8" },
          { path: "/stories", changefreq: "monthly", priority: "0.7" },
          { path: "/communities", changefreq: "weekly", priority: "0.8" },
          ...communitySlugs.map((slug) => ({
            path: `/communities/${encodeURIComponent(slug)}`,
            changefreq: "weekly" as const,
            priority: "0.7",
          })),
          { path: "/host", changefreq: "monthly", priority: "0.7" },
          { path: "/about", changefreq: "monthly", priority: "0.6" },
          { path: "/contact", changefreq: "yearly", priority: "0.5" },
          { path: "/privacy", changefreq: "yearly", priority: "0.3" },
          { path: "/terms", changefreq: "yearly", priority: "0.3" },
          ...publicMeetups.map((m) => ({
            path: `/events/${encodeURIComponent(m.slug)}`,
            changefreq: "weekly" as const,
            priority: "0.8",
          })),
        ];

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${escapeXml(`${BASE_URL}${e.path}`)}</loc>`,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
