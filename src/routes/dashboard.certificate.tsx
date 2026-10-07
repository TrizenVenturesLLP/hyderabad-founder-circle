import { useCallback, useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, Download, ExternalLink, LoaderCircle, Star } from "lucide-react";
import {
  getParticipantCertificateUrl,
  getParticipantHackathonCertificate,
  getParticipantRound2Certificate,
  getParticipantRound2CertificateUrl,
  type ParticipantCertificate,
  type ParticipantRound2Certificate,
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
  const [round2Certificate, setRound2Certificate] =
    useState<ParticipantRound2Certificate | null>(null);
  const [round2PreviewUrl, setRound2PreviewUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");

  const loadCertificate = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [participationResult, round2Result] = await Promise.all([
        getParticipantHackathonCertificate(HACKATHON_ID).then(
          (response) => ({ response }),
          (cause: unknown) => ({ cause }),
        ),
        getParticipantRound2Certificate(HACKATHON_ID).then(
          (response) => ({ response }),
          (cause: unknown) => ({ cause }),
        ),
      ]);
      const participationCertificate =
        "response" in participationResult ? participationResult.response.certificate : null;
      const secondRoundCertificate =
        "response" in round2Result ? round2Result.response.certificate : null;
      setCertificate(participationCertificate);
      setRound2Certificate(secondRoundCertificate);

      const previewRequests: Promise<void>[] = [];
      if (participationCertificate?.status === "generated") {
        previewRequests.push(
          getParticipantCertificateUrl(HACKATHON_ID).then(
            (link) => setPreviewUrl(link.url),
            (cause: unknown) => {
              setError(
                cause instanceof Error ? cause.message : "Could not load your certificate preview.",
              );
            },
          ),
        );
      } else {
        setPreviewUrl("");
      }
      if (secondRoundCertificate) {
        previewRequests.push(
          getParticipantRound2CertificateUrl(HACKATHON_ID).then(
            (link) => setRound2PreviewUrl(link.url),
            (cause: unknown) => {
              setError(
                cause instanceof Error
                  ? cause.message
                  : "Could not load your second-round certificate preview.",
              );
            },
          ),
        );
      } else {
        setRound2PreviewUrl("");
      }
      await Promise.all(previewRequests);
      if (!participationCertificate && !secondRoundCertificate) {
        const failure =
          "cause" in participationResult
            ? participationResult.cause
            : "cause" in round2Result
              ? round2Result.cause
              : null;
        if (failure) {
          setError(failure instanceof Error ? failure.message : "Could not load your certificates.");
        }
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

  async function openRound2Certificate(download: boolean) {
    setWorking(true);
    setError("");
    try {
      const link = await getParticipantRound2CertificateUrl(HACKATHON_ID, download);
      if (!download) setRound2PreviewUrl(link.url);
      const anchor = document.createElement("a");
      anchor.href = download ? link.url : getCertificatePreviewUrl(link.url);
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
      anchor.click();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not open your second-round selection certificate.",
      );
    } finally {
      setWorking(false);
    }
  }

  const ready = certificate?.status === "generated";
  const round2Ready = Boolean(round2Certificate && round2PreviewUrl);

  return (
    <div className="mx-auto max-w-6xl space-y-5">
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
              Your Certificates
            </h1>
            <p className="mt-1 text-[13px] text-(--color-text-secondary)">
              Here are the certificates you have earned for AI HACK × MRDU 2K26.
            </p>
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
        ) : !loading ? (
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {certificate ? (
            <article className="flex min-w-0 flex-col rounded-lg border border-(--color-border) bg-white p-3 sm:p-4">
              <div className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-md bg-(--brand-accent-soft) text-(--brand-accent)">
                  <Award className="size-5" />
                </span>
                <div>
                  <h2 className="text-sm font-bold">Participation Certificate</h2>
                  <p className="mt-1 text-xs text-(--color-text-secondary)">
                    For participating in AI HACK × MRDU 2K26.
                  </p>
                </div>
              </div>
              {ready && previewUrl ? (
                <iframe
                  title="Participation certificate preview"
                  src={getCertificatePreviewUrl(previewUrl)}
                  className="mt-3 h-[min(62vh,620px)] w-full rounded-md border border-(--color-border) bg-white"
                />
              ) : (
                <div className="mt-3 grid min-h-48 flex-1 place-items-center rounded-md border border-dashed border-(--color-border) bg-(--color-background-alt) p-5 text-center">
                  <p className="text-[13px] text-(--color-text-secondary)">
                    Your participation certificate is being generated.
                  </p>
                </div>
              )}
              {ready ? (
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    disabled={working}
                    onClick={() => void openCertificate(false)}
                    className="inline-flex h-10 items-center justify-center gap-2 bg-(--brand-primary) px-3 text-[13px] font-semibold text-white transition hover:bg-(--brand-primary-hover) disabled:opacity-60"
                  >
                    <ExternalLink className="size-4" />
                    View Certificate
                  </button>
                  <button
                    type="button"
                    disabled={working}
                    onClick={() => void openCertificate(true)}
                    className="inline-flex h-10 items-center justify-center gap-2 border border-(--color-border) bg-white px-3 text-[13px] font-semibold transition hover:bg-(--color-background-alt) disabled:opacity-60"
                  >
                    <Download className="size-4" />
                    Download PDF
                  </button>
                </div>
              ) : null}
            </article>
            ) : null}

            {round2Certificate ? (
              <article className="flex min-w-0 flex-col rounded-lg border border-(--color-border) bg-white p-3 sm:p-4">
                <div className="flex items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-md bg-amber-100 text-amber-600">
                    <Star className="size-5" />
                  </span>
                  <div>
                    <h2 className="text-sm font-bold">Second Round Selection Certificate</h2>
                    <p className="mt-1 text-xs text-(--color-text-secondary)">
                      For being selected for the Second Round.
                    </p>
                  </div>
                </div>
                {round2Ready ? (
                  <iframe
                    title="Second-round selection certificate preview"
                    src={getCertificatePreviewUrl(round2PreviewUrl)}
                    className="mt-3 h-[min(62vh,620px)] w-full rounded-md border border-(--color-border) bg-white"
                  />
                ) : (
                  <div className="mt-3 grid min-h-48 flex-1 place-items-center rounded-md border border-dashed border-(--color-border) bg-(--color-background-alt) p-5 text-center">
                    <p className="text-[13px] text-(--color-text-secondary)">
                      Your second-round selection certificate is being prepared.
                    </p>
                  </div>
                )}
                {round2Ready ? (
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      disabled={working}
                      onClick={() => void openRound2Certificate(false)}
                      className="inline-flex h-10 items-center justify-center gap-2 bg-(--brand-primary) px-3 text-[13px] font-semibold text-white transition hover:bg-(--brand-primary-hover) disabled:opacity-60"
                    >
                      <ExternalLink className="size-4" />
                      View Certificate
                    </button>
                    <button
                      type="button"
                      disabled={working}
                      onClick={() => void openRound2Certificate(true)}
                      className="inline-flex h-10 items-center justify-center gap-2 border border-(--color-border) bg-white px-3 text-[13px] font-semibold transition hover:bg-(--color-background-alt) disabled:opacity-60"
                    >
                      <Download className="size-4" />
                      Download PDF
                    </button>
                  </div>
                ) : null}
              </article>
            ) : null}
          </div>
        ) : null}
      </section>
    </div>
  );
}
