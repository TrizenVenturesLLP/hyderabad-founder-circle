const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";
const SESSION_KEY = "tc_analytics_sid";

function getSessionId() {
  if (typeof window === "undefined") return "";
  try {
    let id = window.sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `s_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      window.sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return "";
  }
}

export type FunnelName =
  | "rsvp_open"
  | "rsvp_details"
  | "rsvp_payment"
  | "rsvp_submit"
  | "rsvp_success";

export function trackAnalytics(payload: {
  type: "pageview" | "funnel";
  name: string;
  path?: string;
  eventSlug?: string;
  meta?: Record<string, unknown>;
}) {
  if (typeof window === "undefined") return;

  const body = {
    type: payload.type,
    name: payload.name,
    path: payload.path || window.location.pathname,
    eventSlug: payload.eventSlug || "",
    sessionId: getSessionId(),
    meta: payload.meta || null,
  };

  const url = `${API_BASE}/api/analytics/track`;
  const json = JSON.stringify(body);

  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([json], { type: "application/json" });
      navigator.sendBeacon(url, blob);
      return;
    }
  } catch {
    // fall through
  }

  void fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: json,
    keepalive: true,
  }).catch(() => {});
}

export function trackPageview(path?: string, eventSlug?: string) {
  trackAnalytics({
    type: "pageview",
    name: "page_view",
    path,
    eventSlug,
  });
}

export function trackFunnel(name: FunnelName, eventSlug?: string) {
  trackAnalytics({
    type: "funnel",
    name,
    eventSlug,
  });
}
