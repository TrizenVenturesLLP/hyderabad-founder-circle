import { createFileRoute } from "@tanstack/react-router";
import { Mail, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchAdminContacts, type AdminContact } from "@/lib/admin-api";
import { AdminPageHeader } from "@/components/admin/AdminPageChrome";

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
    <div className="h-full overflow-y-auto p-4 sm:p-5 md:p-6">
      <AdminPageHeader
        title="Contacts"
        description={loading ? "Loading…" : `${items.length} submission(s)`}
      />

      <div className="mt-5 flex h-10 w-full max-w-xl overflow-hidden border border-[var(--color-border)] bg-white focus-within:border-[var(--brand-accent)]">
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
          className="shrink-0 border-l border-[var(--color-border)] bg-[var(--color-background-alt)] px-3 text-sm font-semibold text-foreground transition-colors hover:bg-[var(--brand-primary-soft)] sm:px-4"
        >
          Search
        </button>
      </div>

      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

      <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <li
            key={item._id}
            className="flex flex-col border border-[var(--color-border)] bg-white p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-[14px] font-medium text-foreground">
                  {item.name}
                </p>
                <a
                  href={`mailto:${item.email}`}
                  className="mt-1 inline-flex max-w-full items-center gap-1.5 text-[12px] text-[var(--brand-accent)] hover:underline"
                  title={item.email}
                >
                  <Mail className="size-3.5 shrink-0" strokeWidth={1.75} />
                  <span className="truncate">{item.email}</span>
                </a>
              </div>
              <p className="shrink-0 text-[11px] text-[var(--color-text-muted)]">
                {new Date(item.createdAt).toLocaleDateString()}
              </p>
            </div>
            <p className="mt-3 whitespace-pre-wrap bg-[var(--color-background-alt)] px-3 py-2.5 text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
              {item.message}
            </p>
          </li>
        ))}
        {!loading && items.length === 0 ? (
          <li className="col-span-full border border-dashed border-[var(--color-border)] px-4 py-10 text-center text-sm text-[var(--color-text-muted)]">
            No contact requests yet.
          </li>
        ) : null}
      </ul>
    </div>
  );
}
