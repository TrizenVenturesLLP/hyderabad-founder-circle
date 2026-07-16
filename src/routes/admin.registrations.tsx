import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  fetchAdminRsvps,
  sendReminderEmails,
  type AdminRsvp,
  type ReminderSendResult,
} from "@/lib/admin-api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/registrations")({
  component: AdminRegistrationsPage,
  head: () => ({
    meta: [{ title: "Registrations — Admin" }],
  }),
});

const PAGE_SIZE = 15;

function AdminRegistrationsPage() {
  const [items, setItems] = useState<AdminRsvp[]>([]);
  const [events, setEvents] = useState<
    { slug: string; title: string; count: number }[]
  >([]);
  const [eventSlug, setEventSlug] = useState("all");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [composeOpen, setComposeOpen] = useState(false);
  const [page, setPage] = useState(1);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await fetchAdminRsvps({
        eventSlug: eventSlug === "all" ? undefined : eventSlug,
        q: q.trim() || undefined,
      });
      setItems(data.items);
      setEvents(data.events);
      setSelected(new Set());
      setPage(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventSlug]);

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return items.slice(start, start + PAGE_SIZE);
  }, [items, currentPage]);

  const rangeStart = items.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, items.length);

  const pageIds = pageItems.map((i) => i._id);
  const allPageSelected =
    pageIds.length > 0 && pageIds.every((id) => selected.has(id));

  function toggleAllPage() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allPageSelected) {
        for (const id of pageIds) next.delete(id);
      } else {
        for (const id of pageIds) next.add(id);
      }
      return next;
    });
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const selectedCount = selected.size;

  return (
    <div className="p-5 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="hidden text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--brand-accent)] lg:block">
            Admin
          </p>
          <h1 className="mt-1 font-display text-2xl tracking-tight text-foreground md:text-[1.75rem]">
            Registrations
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            {loading
              ? "Loading…"
              : `${items.length} registration(s)`}
          </p>
        </div>

        {selectedCount > 0 ? (
          <button
            type="button"
            className="btn-primary"
            onClick={() => setComposeOpen(true)}
          >
            Send Reminder ({selectedCount})
          </button>
        ) : null}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <select
          value={eventSlug}
          onChange={(e) => setEventSlug(e.target.value)}
          className="h-11 shrink-0 rounded-xl border border-[var(--color-border)] bg-white px-3 text-sm outline-none focus:border-[var(--brand-accent)]"
        >
          <option value="all">All events</option>
          {events.map((e) => (
            <option key={e.slug} value={e.slug}>
              {e.title} ({e.count})
            </option>
          ))}
        </select>

        <div className="flex h-11 min-w-0 flex-1 overflow-hidden rounded-xl border border-[var(--color-border)] bg-white focus-within:border-[var(--brand-accent)]">
          <div className="flex items-center pl-3 text-[var(--color-text-muted)]">
            <Search className="size-4" strokeWidth={1.75} />
          </div>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void load();
            }}
            placeholder="Search name, email, company…"
            className="min-w-0 flex-1 bg-transparent px-2.5 text-sm outline-none"
          />
          <button
            type="button"
            onClick={() => void load()}
            className="shrink-0 border-l border-[var(--color-border)] bg-[var(--color-background-alt)] px-4 text-sm font-semibold text-foreground transition-colors hover:bg-[var(--brand-accent-soft)]"
          >
            Search
          </button>
        </div>
      </div>

      {error ? (
        <p className="mt-4 text-sm text-red-600">{error}</p>
      ) : null}

      <div className="mt-6 overflow-x-auto rounded-[16px] border border-[var(--color-border)] bg-white shadow-[0_1px_2px_rgba(59,35,24,0.04)]">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="border-b border-[var(--color-border)] bg-[var(--color-background-alt)] text-[11px] uppercase tracking-wider text-[var(--color-text-muted)]">
            <tr>
              <th className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={allPageSelected}
                  onChange={toggleAllPage}
                  aria-label="Select all on this page"
                />
              </th>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Phone</th>
              <th className="px-4 py-3 font-semibold">Role</th>
              <th className="px-4 py-3 font-semibold">Company</th>
              <th className="px-4 py-3 font-semibold">Event</th>
              <th className="px-4 py-3 font-semibold">Emails sent</th>
              <th className="px-4 py-3 font-semibold">Registered</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((row) => {
              const sent = row.emailStats?.sentCount ?? 0;
              const failed = row.emailStats?.failedCount ?? 0;
              return (
                <tr
                  key={row._id}
                  className={cn(
                    "border-b border-[var(--color-border)] last:border-0",
                    selected.has(row._id) && "bg-[var(--brand-accent-soft)]/40",
                  )}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(row._id)}
                      onChange={() => toggleOne(row._id)}
                      aria-label={`Select ${row.name}`}
                    />
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">
                    {row.name}
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                    {row.email}
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                    {formatAdminPhone(row.countryCode, row.phone)}
                  </td>
                  <td className="px-4 py-3">{row.role}</td>
                  <td className="px-4 py-3">{row.company}</td>
                  <td className="px-4 py-3">{row.event?.title}</td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-foreground">{sent}</span>
                    {failed > 0 ? (
                      <span className="ml-1.5 text-xs text-red-600">
                        ({failed} failed)
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text-muted)]">
                    {new Date(row.createdAt).toLocaleString()}
                  </td>
                </tr>
              );
            })}
            {!loading && items.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-4 py-10 text-center text-[var(--color-text-secondary)]"
                >
                  No registrations found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {!loading && items.length > 0 ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-[var(--color-text-secondary)]">
            Showing{" "}
            <span className="font-medium text-foreground">
              {rangeStart}–{rangeEnd}
            </span>{" "}
            of{" "}
            <span className="font-medium text-foreground">{items.length}</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex h-9 items-center gap-1 rounded-xl border border-[var(--color-border)] bg-white px-3 text-sm font-semibold text-foreground disabled:cursor-not-allowed disabled:opacity-40"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="size-4" strokeWidth={1.75} />
              Previous
            </button>
            <span className="min-w-[5.5rem] text-center text-sm text-[var(--color-text-secondary)]">
              Page{" "}
              <span className="font-medium text-foreground">{currentPage}</span>{" "}
              of{" "}
              <span className="font-medium text-foreground">{totalPages}</span>
            </span>
            <button
              type="button"
              className="inline-flex h-9 items-center gap-1 rounded-xl border border-[var(--color-border)] bg-white px-3 text-sm font-semibold text-foreground disabled:cursor-not-allowed disabled:opacity-40"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
              <ChevronRight className="size-4" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      ) : null}

      {composeOpen ? (
        <ReminderComposeModal
          rsvpIds={[...selected]}
          eventSlug={eventSlug === "all" ? "" : eventSlug}
          onClose={() => setComposeOpen(false)}
          onSent={() => {
            setComposeOpen(false);
            setSelected(new Set());
            void load();
          }}
        />
      ) : null}
    </div>
  );
}

function ReminderComposeModal({
  rsvpIds,
  eventSlug,
  onClose,
  onSent,
}: {
  rsvpIds: string[];
  eventSlug: string;
  onClose: () => void;
  onSent: () => void;
}) {
  const [subject, setSubject] = useState(
    "Reminder: {{eventTitle}} — {{eventDate}}",
  );
  const [body, setBody] = useState(
    "Hi {{name}},\n\nThis is a friendly reminder about {{eventTitle}} on {{eventDate}}, {{eventTime}} at {{venue}}.\n\nYour seat is reserved — we look forward to seeing you there.\n\n— Trizen Community",
  );
  const [attachments, setAttachments] = useState<
    { filename: string; contentType: string; content: string }[]
  >([]);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");
  const [sendResults, setSendResults] = useState<ReminderSendResult[]>([]);

  const attachmentLabel = useMemo(
    () =>
      attachments.length
        ? attachments.map((a) => a.filename).join(", ")
        : "No attachments",
    [attachments],
  );

  const failedResults = useMemo(
    () => sendResults.filter((r) => r.status !== "sent"),
    [sendResults],
  );
  const sentResults = useMemo(
    () => sendResults.filter((r) => r.status === "sent"),
    [sendResults],
  );

  async function onFileChange(files: FileList | null) {
    if (!files?.length) return;
    const next: typeof attachments = [];
    for (const file of Array.from(files)) {
      const content = await fileToBase64(file);
      next.push({
        filename: file.name,
        contentType: file.type || "application/octet-stream",
        content,
      });
    }
    setAttachments(next);
  }

  async function onSend() {
    setStatus("sending");
    setMessage("");
    setSendResults([]);
    try {
      const res = await sendReminderEmails({
        subject: subject.trim(),
        body: body.trim(),
        rsvpIds,
        eventSlug,
        attachments,
      });
      setSendResults(res.results || []);
      if (res.failureCount > 0) {
        setStatus("error");
        setMessage(
          `Sent ${res.successCount}, failed ${res.failureCount}. Failed recipients are listed below.`,
        );
      } else {
        setStatus("success");
        setMessage(`Sent successfully to ${res.successCount} recipient(s).`);
        setTimeout(onSent, 1200);
      }
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Send failed");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[92dvh] w-full max-w-xl overflow-y-auto rounded-[20px] border border-[var(--color-border)] bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-xl tracking-tight">Write email</h2>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              Sending to {rsvpIds.length} selected registration(s). Use{" "}
              <code className="rounded bg-[var(--color-background-alt)] px-1 text-xs">
                {"{{name}}"}
              </code>
              ,{" "}
              <code className="rounded bg-[var(--color-background-alt)] px-1 text-xs">
                {"{{eventTitle}}"}
              </code>
              ,{" "}
              <code className="rounded bg-[var(--color-background-alt)] px-1 text-xs">
                {"{{eventDate}}"}
              </code>
              ,{" "}
              <code className="rounded bg-[var(--color-background-alt)] px-1 text-xs">
                {"{{eventTime}}"}
              </code>
              ,{" "}
              <code className="rounded bg-[var(--color-background-alt)] px-1 text-xs">
                {"{{venue}}"}
              </code>
              ,{" "}
              <code className="rounded bg-[var(--color-background-alt)] px-1 text-xs">
                {"{{company}}"}
              </code>
              .
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-[var(--color-text-muted)] hover:text-foreground"
          >
            Close
          </button>
        </div>

        <label className="mt-5 block">
          <span className="text-xs font-semibold text-[var(--color-text-muted)]">
            Subject
          </span>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-[var(--color-border)] px-3 py-2.5 text-sm"
          />
        </label>

        <label className="mt-4 block">
          <span className="text-xs font-semibold text-[var(--color-text-muted)]">
            Body
          </span>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={10}
            className="mt-1.5 w-full rounded-xl border border-[var(--color-border)] px-3 py-2.5 text-sm"
          />
        </label>

        <label className="mt-4 block">
          <span className="text-xs font-semibold text-[var(--color-text-muted)]">
            Attachments (optional)
          </span>
          <input
            type="file"
            multiple
            onChange={(e) => void onFileChange(e.target.files)}
            className="mt-1.5 block w-full text-sm"
          />
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            {attachmentLabel}
          </p>
        </label>

        {message ? (
          <p
            className={cn(
              "mt-4 text-sm",
              status === "success" ? "text-green-700" : "text-red-600",
            )}
          >
            {message}
          </p>
        ) : null}

        {failedResults.length > 0 ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-red-700">
              Failed ({failedResults.length})
            </p>
            <ul className="mt-2 max-h-40 space-y-2 overflow-y-auto text-sm">
              {failedResults.map((r) => (
                <li key={r.email} className="text-red-800">
                  <span className="font-medium">{r.name || "Unknown"}</span>
                  <span className="text-red-700"> — {r.email}</span>
                  {r.error ? (
                    <span className="mt-0.5 block text-xs text-red-600">
                      {r.error}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {sentResults.length > 0 && failedResults.length > 0 ? (
          <div className="mt-3 rounded-xl border border-green-200 bg-green-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-green-700">
              Sent ({sentResults.length})
            </p>
            <ul className="mt-2 max-h-28 space-y-1 overflow-y-auto text-sm text-green-800">
              {sentResults.map((r) => (
                <li key={r.email}>
                  {r.name || "Unknown"} — {r.email}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mt-6 flex justify-end gap-2">
          {failedResults.length > 0 ? (
            <button type="button" className="btn-secondary" onClick={onSent}>
              Done
            </button>
          ) : (
            <>
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary disabled:opacity-60"
                disabled={
                  status === "sending" || !subject.trim() || !body.trim()
                }
                onClick={() => void onSend()}
              >
                {status === "sending" ? "Sending…" : "Send"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      const base64 = result.includes(",") ? result.split(",")[1] : result;
      resolve(base64);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/** Avoid "+91 +91 …" when phone already includes the country code. */
function formatAdminPhone(countryCode?: string, phone?: string) {
  const p = (phone || "").trim();
  if (!p) return "—";
  const code = (countryCode || "+91").trim();
  if (p.startsWith("+") || (code && p.startsWith(code))) return p;
  return `${code} ${p}`;
}
