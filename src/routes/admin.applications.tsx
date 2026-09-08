import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  approveOrgApplication,
  fetchOrgApplications,
  rejectOrgApplication,
  type OrgApplicationItem,
} from "@/lib/admin-api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/AdminPageChrome";

const adminRoute = getRouteApi("/admin");

export const Route = createFileRoute("/admin/applications")({
  component: AdminApplicationsPage,
  head: () => ({
    meta: [{ title: "Org applications — Admin" }],
  }),
});

function AdminApplicationsPage() {
  const { admin } = adminRoute.useRouteContext() as {
    admin?: { role?: string };
  };
  const isPlatform = admin?.role === "platform_admin";
  const [items, setItems] = useState<OrgApplicationItem[]>([]);
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [credentials, setCredentials] = useState<{
    email: string;
    temporaryPassword: string;
  } | null>(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await fetchOrgApplications(
        filter === "all" ? undefined : filter,
      );
      setItems(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isPlatform) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, isPlatform]);

  if (!isPlatform) {
    return (
      <div className="p-6">
        <p className="text-sm text-[var(--color-text-secondary)]">
          Organization applications are only visible to platform admins.
        </p>
      </div>
    );
  }

  async function onApprove(id: string, name: string) {
    if (!confirm(`Approve ${name}? This creates their organization login.`)) {
      return;
    }
    try {
      const res = await approveOrgApplication(id);
      setCredentials(res.credentials);
      toast.success("Organization approved");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Approve failed");
    }
  }

  async function onReject(id: string, name: string) {
    const reason = window.prompt(`Reject ${name}? Optional reason:`) ?? "";
    try {
      await rejectOrgApplication(id, reason);
      toast.success("Application rejected");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reject failed");
    }
  }

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-5 md:p-6">
      <AdminPageHeader
        title="Applications"
        description="Approve organizations before they can create events. Share the temporary password once after approval."
      />

      <div className="mt-5 flex flex-wrap gap-1.5">
        {["pending", "approved", "rejected", "all"].map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              "px-3 py-1.5 text-[12px] font-medium capitalize transition-colors",
              filter === f
                ? "bg-[var(--brand-primary)] text-white"
                : "bg-white text-[var(--color-text-secondary)] ring-1 ring-[var(--color-border)] hover:text-foreground",
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {credentials ? (
        <div className="mt-4 border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <p className="font-semibold">Share these credentials once</p>
          <p className="mt-1">
            Email: <code>{credentials.email}</code>
          </p>
          <p>
            Temporary password: <code>{credentials.temporaryPassword}</code>
          </p>
          <p className="mt-1">Login: /org-login</p>
          <button
            type="button"
            className="mt-2 text-xs underline"
            onClick={() => setCredentials(null)}
          >
            Dismiss
          </button>
        </div>
      ) : null}

      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

      <ul className="mt-5 space-y-2.5">
        {loading ? (
          <li className="text-sm text-[var(--color-text-muted)]">Loading…</li>
        ) : items.length === 0 ? (
          <li className="border border-dashed border-[var(--color-border)] px-4 py-10 text-center text-sm text-[var(--color-text-muted)]">
            No applications in this view.
          </li>
        ) : (
          items.map((item) => (
            <li
              key={item._id}
              className="border border-[var(--color-border)] bg-white p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[14px] font-medium text-foreground">
                    {item.organizationName}
                  </p>
                  <p className="mt-0.5 text-[13px] text-[var(--color-text-secondary)]">
                    {item.email}
                    {item.website ? ` · ${item.website}` : ""}
                  </p>
                  {item.message ? (
                    <p className="mt-2 text-[13px] text-[var(--color-text-muted)]">
                      {item.message}
                    </p>
                  ) : null}
                  <p className="mt-2 text-[11px] uppercase tracking-wide text-[var(--color-text-muted)]">
                    {item.status} ·{" "}
                    {new Date(item.createdAt).toLocaleString("en-IN")}
                  </p>
                </div>
                {item.status === "pending" ? (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="btn-primary !min-h-9 !px-3 !text-xs"
                      onClick={() =>
                        void onApprove(item._id, item.organizationName)
                      }
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      className="btn-secondary !min-h-9 !px-3 !text-xs"
                      onClick={() =>
                        void onReject(item._id, item.organizationName)
                      }
                    >
                      Reject
                    </button>
                  </div>
                ) : null}
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
