import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { RsvpProvider } from "../components/rsvp/rsvp-context";
import { LazyRsvpDialog } from "../components/rsvp/LazyRsvpDialog";
import { Toaster } from "../components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="font-display text-7xl text-foreground">404</p>
        <h1 className="mt-4 text-xl font-semibold text-foreground">Page not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          That page doesn't exist — but our next meetup probably does.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Go home
          </Link>
          <Link
            to="/events"
            className="inline-flex items-center justify-center rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
          >
            See events
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Try again, or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => {
    const siteUrl = "https://community.trizenventures.com";
    const ogImage = `${siteUrl}/og-image.png`;
    const description =
      "A community of founders, operators and aspiring entrepreneurs in Hyderabad. Monthly meetups on the 3rd Saturday.";

    return {
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { title: "Hyderabad Founders Network — Monthly Startup Meetup" },
        { name: "description", content: description },
        { name: "author", content: "Hyderabad Founders Network" },
        { property: "og:site_name", content: "Hyderabad Founders Network" },
        { property: "og:type", content: "website" },
        { property: "og:url", content: siteUrl },
        {
          property: "og:title",
          content: "Hyderabad Founders Network — Monthly Startup Meetup",
        },
        { property: "og:description", content: description },
        { property: "og:image", content: ogImage },
        { property: "og:image:type", content: "image/png" },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "1200" },
        {
          property: "og:image:alt",
          content: "Trizen Community — Hyderabad Founders Network",
        },
        { name: "twitter:card", content: "summary" },
        {
          name: "twitter:title",
          content: "Hyderabad Founders Network — Monthly Startup Meetup",
        },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: ogImage },
      ],
      links: [
        { rel: "stylesheet", href: appCss },
        { rel: "icon", type: "image/png", href: "/favicon.png" },
        { rel: "apple-touch-icon", href: "/favicon.png" },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossOrigin: "anonymous",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Poppins:wght@400;500;600&display=swap",
        },
      ],
    };
  },
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isAdminShell =
    pathname.startsWith("/admin") || pathname.startsWith("/admin-login");

  return (
    <QueryClientProvider client={queryClient}>
      <RsvpProvider>
        {isAdminShell ? (
          <>
            <Outlet />
            <Toaster />
          </>
        ) : (
          <>
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
            >
              Skip to content
            </a>
            <div className="flex min-h-dvh flex-col overflow-x-clip">
              <SiteHeader />
              <main id="main-content" className="min-w-0 flex-1">
                <Outlet />
              </main>
              <SiteFooter />
            </div>
            <LazyRsvpDialog />
            <Toaster />
          </>
        )}
      </RsvpProvider>
    </QueryClientProvider>
  );
}
