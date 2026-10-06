import { useCallback, useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, Download, ExternalLink, LoaderCircle } from "lucide-react";
import {
  getParticipantCertificateUrl,
  getParticipantHackathonCertificate,
  type ParticipantCertificate,
} from "@/lib/hackathon-api";

export const Route = createFileRoute("/dashboard/certificate")({
  component: ParticipantCertificatePage,
});

const HACKATHON_ID = "ai-hack-x-mrdu-2026";

function getCertificatePreviewUrl(url: string) {
  const previewUrl = new URL(url);
  previewUrl.hash = "toolbar=0&navpanes=0&scrollbar=0&view=Fit";
  return previewUrl.toString();
}

function ParticipantCertificatePage() {
  const [certificate, setCertificate] = useState<ParticipantCertificate | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");

  const loadCertificate = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getParticipantHackathonCertificate(HACKATHON_ID);
      setCertificate(response.certificate);
      if (response.certificate.status === "generated") {
        const link = await getParticipantCertificateUrl(HACKATHON_ID);
        setPreviewUrl(link.url);
      } else {
        setPreviewUrl("");
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load your certificate.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCertificate();
  }, [loadCertificate]);

  async function openCertificate(download: boolean) {
    setWorking(true);
    setError("");
    try {
      const link = await getParticipantCertificateUrl(HACKATHON_ID, download);
      if (!download) setPreviewUrl(link.url);
      const anchor = document.createElement("a");
      anchor.href = download ? link.url : getCertificatePreviewUrl(link.url);
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
      anchor.click();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not open your certificate.");
    } finally {
      setWorking(false);
    }
  }

  const ready = certificate?.status === "generated";

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <section className="rounded-lg border border-(--color-border) bg-white p-5 sm:p-7">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-md bg-(--brand-accent-soft) text-(--brand-accent)">
            <Award className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold tracking-[0.08em] text-(--brand-accent) uppercase">
              AI HACK × MRDU 2026
            </p>
            <h1 className="mt-1 font-display text-xl font-bold tracking-tight sm:text-2xl">
              Participation Certificate
            </h1>
            {ready ? (
              <p className="mt-1 text-[13px] text-(--color-text-secondary)">
                Your participation certificate is ready.
              </p>
            ) : (
              <p className="mt-1 text-[13px] text-(--color-text-secondary)">
                Your participation certificate is being generated.
              </p>
            )}
          </div>
        </div>

        {error ? (
          <div
            role="alert"
            className="mt-5 flex flex-wrap items-center justify-between gap-3 border border-red-200 bg-red-50 p-3 text-[13px] text-red-800"
          >
            <span>{error}</span>
            {error.toLowerCase().includes("sign in") ? (
              <Link
                to="/hackathon/register"
                search={{ mode: "login" }}
                className="font-semibold underline underline-offset-2"
              >
                Sign in again
              </Link>
            ) : null}
          </div>
        ) : null}

        {loading ? (
          <div className="mt-6 flex min-h-48 items-center justify-center text-(--color-text-muted)">
            <LoaderCircle className="size-5 animate-spin" aria-label="Loading certificate" />
          </div>
        ) : ready && previewUrl ? (
          <>
            <div className="mt-5 overflow-hidden rounded-md border border-(--color-border) bg-white">
              <iframe
                title="Participation certificate preview"
                src={getCertificatePreviewUrl(previewUrl)}
                className="h-[min(70vh,760px)] w-full bg-white"
              />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={working}
                onClick={() => void openCertificate(false)}
                className="inline-flex h-10 items-center justify-center gap-2 bg-(--brand-primary) px-4 text-[13px] font-semibold text-white transition hover:bg-(--brand-primary-hover) disabled:opacity-60"
              >
                <ExternalLink className="size-4" />
                View Certificate
              </button>
              <button
                type="button"
                disabled={working}
                onClick={() => void openCertificate(true)}
                className="inline-flex h-10 items-center justify-center gap-2 border border-(--color-border) bg-white px-4 text-[13px] font-semibold transition hover:bg-(--color-background-alt) disabled:opacity-60"
              >
                <Download className="size-4" />
                Download PDF
              </button>
            </div>
          </>
        ) : !loading && !error ? (
          <div className="mt-5 grid min-h-48 place-items-center border border-dashed border-(--color-border) bg-(--color-background-alt) p-5 text-center">
            <p className="text-[13px] text-(--color-text-secondary)">
              Your participation certificate is being generated.
            </p>
          </div>
        ) : null}
      </section>
    </div>
  );
}
