import { useCallback, useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Award, CheckCircle2, Clock3, Download, Eye, LoaderCircle, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader, AdminPanel } from "@/components/admin/AdminPageChrome";
import { HackathonNav, hackathonSectionPageClass } from "@/components/admin/HackathonNav";
import {
  fetchAdminHackathonCertificates,
  generateAdminHackathonCertificates,
  getAdminHackathonCertificateUrl,
  type AdminHackathonCertificateItem,
  type AdminHackathonCertificates,
} from "@/lib/admin-api";

export const Route = createFileRoute("/admin/hackathons/$hackathonId/certificates")({
  component: AdminHackathonCertificatesPage,
});

const emptyCertificates: AdminHackathonCertificates = {
  totalEligible: 0,
  generated: 0,
  pending: 0,
  failed: 0,
  generationRunning: false,
  items: [],
};

function formatDateTime(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function statusTone(status: AdminHackathonCertificateItem["status"]) {
  if (status === "generated") return "bg-emerald-50 text-emerald-700";
  if (status === "failed") return "bg-red-50 text-red-700";
  return "bg-amber-50 text-amber-800";
}

function AdminHackathonCertificatesPage() {
  const { hackathonId } = Route.useParams();
  const [data, setData] = useState(emptyCertificates);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [working, setWorking] = useState(false);
  const [workingParticipantId, setWorkingParticipantId] = useState("");

  const load = useCallback(
    async (quiet = false) => {
      if (!quiet) setLoading(true);
      setError("");
      try {
        setData(await fetchAdminHackathonCertificates(hackathonId));
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Could not load certificates.");
      } finally {
        if (!quiet) setLoading(false);
      }
    },
    [hackathonId],
  );

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!data.generationRunning) return;
    const timer = window.setInterval(() => void load(true), 2000);
    return () => window.clearInterval(timer);
  }, [data.generationRunning, load]);

  async function generate(retryFailed: boolean) {
    setWorking(true);
    setError("");
    try {
      const result = await generateAdminHackathonCertificates(hackathonId, retryFailed);
      await load(true);
      if (result.queued) {
        toast.success(
          retryFailed
            ? `Retrying ${result.queued} failed certificate${result.queued === 1 ? "" : "s"}.`
            : `Queued ${result.queued} certificate${result.queued === 1 ? "" : "s"} for generation.`,
        );
      } else {
        toast.success(
          result.generationRunning
            ? "Certificate generation is already running."
            : "All eligible certificates are up to date.",
        );
      }
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Could not generate certificates.";
      setError(message);
      toast.error(message);
    } finally {
      setWorking(false);
    }
  }

  async function openCertificate(item: AdminHackathonCertificateItem, download: boolean) {
    const target = window.open("about:blank", "_blank");
    if (!target) {
      toast.error("Allow pop-ups to open this certificate.");
      return;
    }
    target.opener = null;
    setWorkingParticipantId(item.participantId);
    try {
      const result = await getAdminHackathonCertificateUrl(
        hackathonId,
        item.participantId,
        download,
      );
      target.location.href = result.url;
    } catch (cause) {
      target.close();
      toast.error(cause instanceof Error ? cause.message : "Could not open this certificate.");
    } finally {
      setWorkingParticipantId("");
    }
  }

  const summary = [
    {
      label: "Total Eligible",
      value: data.totalEligible,
      icon: Award,
      tone: "text-(--brand-accent)",
    },
    { label: "Generated", value: data.generated, icon: CheckCircle2, tone: "text-emerald-700" },
    { label: "Pending", value: data.pending, icon: Clock3, tone: "text-amber-700" },
    { label: "Failed", value: data.failed, icon: RotateCcw, tone: "text-red-700" },
  ];

  return (
    <div className={`space-y-5 p-4 sm:p-5 md:p-6 ${hackathonSectionPageClass}`}>
      <HackathonNav hackathonId={hackathonId} active="certificates" />
      <AdminPageHeader
        title="Certificates"
        description="Generate and verify one participation certificate for each eligible team member."
        actions={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void load()}
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-white px-3 text-xs font-semibold transition-colors hover:bg-muted"
            >
              <RotateCcw className="size-3.5" />
              Refresh
            </button>
            <button
              type="button"
              disabled={working || data.generationRunning}
              onClick={() => void generate(false)}
              className="inline-flex h-9 items-center gap-1.5 rounded-md bg-(--brand-primary) px-3.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {data.generationRunning || working ? (
                <LoaderCircle className="size-3.5 animate-spin" />
              ) : (
                <Award className="size-3.5" />
              )}
              Generate Certificates
            </button>
            <button
              type="button"
              disabled={working || data.generationRunning || data.failed === 0}
              onClick={() => void generate(true)}
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-white px-3.5 text-xs font-semibold transition-colors hover:bg-muted disabled:opacity-50"
            >
              <RotateCcw className="size-3.5" />
              Retry Failed
            </button>
          </div>
        }
      />

      {error ? (
        <div role="alert" className="border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      {data.generationRunning ? (
        <div role="status" className="flex items-center gap-2 text-xs text-muted-foreground">
          <LoaderCircle className="size-3.5 animate-spin" />
          Generating certificates in the background. This list refreshes automatically.
        </div>
      ) : null}

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {summary.map(({ label, value, icon: Icon, tone }) => (
          <AdminPanel key={label} className="p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                {label}
              </p>
              <Icon className={`size-4 ${tone}`} />
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums">{value}</p>
          </AdminPanel>
        ))}
      </section>

      <AdminPanel className="overflow-hidden p-0">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold">Eligible participants</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Winners receive the same participation certificate. Disqualified and suspended teams are
            excluded.
          </p>
        </div>
        {loading ? (
          <div className="flex min-h-36 items-center justify-center text-muted-foreground">
            <LoaderCircle className="size-5 animate-spin" aria-label="Loading certificates" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-xs">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-semibold">Participant</th>
                  <th className="px-4 py-3 font-semibold">Team</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Generated At</th>
                  <th className="px-4 py-3 font-semibold">Certificate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.items.map((item) => (
                  <tr key={item.participantId} className="hover:bg-muted/20">
                    <td className="max-w-64 px-4 py-3 font-medium" title={item.participantName}>
                      <span className="block truncate">{item.participantName}</span>
                    </td>
                    <td className="max-w-56 px-4 py-3" title={item.teamName}>
                      <span className="block truncate">{item.teamName}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded px-2 py-1 font-semibold ${statusTone(item.status)}`}
                      >
                        {item.status === "generated"
                          ? "Generated"
                          : item.status === "failed"
                            ? "Failed"
                            : data.generationRunning
                              ? "Generating"
                              : "Pending"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {formatDateTime(item.generatedAt)}
                    </td>
                    <td className="px-4 py-3">
                      {item.certificate ? (
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            disabled={workingParticipantId === item.participantId}
                            onClick={() => void openCertificate(item, false)}
                            className="inline-flex h-7 items-center gap-1 border border-border bg-white px-2 font-semibold hover:bg-muted disabled:opacity-50"
                          >
                            <Eye className="size-3" />
                            View
                          </button>
                          <button
                            type="button"
                            disabled={workingParticipantId === item.participantId}
                            onClick={() => void openCertificate(item, true)}
                            className="inline-flex h-7 items-center gap-1 border border-border bg-white px-2 font-semibold hover:bg-muted disabled:opacity-50"
                          >
                            <Download className="size-3" />
                            Download
                          </button>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))}
                {!data.items.length ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                      {data.totalEligible
                        ? "No participant certificates found."
                        : "No eligible participants found."}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}
      </AdminPanel>
    </div>
  );
}
