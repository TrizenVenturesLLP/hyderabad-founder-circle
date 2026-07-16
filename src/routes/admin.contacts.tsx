import { createFileRoute } from "@tanstack/react-router";
import { Mail, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchAdminContacts, type AdminContact } from "@/lib/admin-api";

export const Route = createFileRoute("/admin/contacts")({
  component: AdminContactsPage,
  head: () => ({
    meta: [{ title: "Contact Requests — Admin" }],
  }),
});

function AdminContactsPage() {
  const [items, setItems] = useState<AdminContact[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await fetchAdminContacts(q.trim() || undefined);
      setItems(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-5 md:p-8">
      <p className="hidden text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--brand-accent)] lg:block">
        Admin
      </p>
      <h1 className="mt-1 font-display text-2xl tracking-tight text-foreground md:text-[1.75rem]">
        Contact Requests
      </h1>
      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
        {loading ? "Loading…" : `${items.length} submission(s)`}
      </p>

      <div className="mt-6 flex h-11 max-w-xl overflow-hidden rounded-xl border border-[var(--color-border)] bg-white focus-within:border-[var(--brand-accent)]">
        <div className="flex items-center pl-3 text-[var(--color-text-muted)]">
          <Search className="size-4" strokeWidth={1.75} />
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void load();
          }}
          placeholder="Search name, email, message…"
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

      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

      <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => (
          <li
            key={item._id}
            className="flex aspect-square flex-col rounded-2xl border border-[var(--color-border)] bg-white p-4 shadow-[0_1px_2px_rgba(59,35,24,0.04)]"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="min-w-0 truncate font-medium text-foreground">
                {item.name}
              </p>
              <p className="shrink-0 text-[10px] leading-tight text-[var(--color-text-muted)]">
                {new Date(item.createdAt).toLocaleDateString()}
              </p>
            </div>
            <a
              href={`mailto:${item.email}`}
              className="mt-1.5 inline-flex min-w-0 items-center gap-1.5 text-xs text-[var(--brand-accent)] hover:underline"
              title={item.email}
            >
              <Mail className="size-3.5 shrink-0" strokeWidth={1.75} />
              <span className="truncate">{item.email}</span>
            </a>
            <p className="mt-3 min-h-0 flex-1 overflow-y-auto whitespace-pre-wrap rounded-xl bg-[var(--color-background-alt)] px-3 py-2.5 text-sm leading-relaxed text-[var(--color-text-secondary)]">
              {item.message}
            </p>
          </li>
        ))}
        {!loading && items.length === 0 ? (
          <li className="col-span-full rounded-2xl border border-dashed border-[var(--color-border)] bg-white px-5 py-12 text-center text-sm text-[var(--color-text-secondary)]">
            No contact requests yet.
          </li>
        ) : null}
      </ul>
    </div>
  );
}
