import { useEffect, useState } from "react";
import { Download, ExternalLink, FileText, Presentation, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { JuryButton } from "@/components/jury/JuryTable";
import { getJurySubmissionFile, getJurySubmissionViewLink } from "@/lib/jury-api";

type SubmissionViewerDialogProps = {
  hackathonId: string;
  teamId: string;
  teamName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type Preview =
  | { kind: "pdf"; src: string; filename: string }
  | { kind: "slides"; src: string; filename: string }
  | { kind: "unavailable"; filename: string };

function isPdf(contentType: string, filename: string) {
  return contentType === "application/pdf" || /\.pdf$/i.test(filename);
}

function isPubliclyReachable(url: string) {
  const { hostname, protocol } = new URL(url);
  if (protocol !== "https:") return false;
  return !/^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|\[::1\])|\.local$/i.test(
    hostname,
  );
}

export function SubmissionViewerDialog({
  hackathonId,
  teamId,
  teamName,
  open,
  onOpenChange,
}: SubmissionViewerDialogProps) {
  const [preview, setPreview] = useState<Preview | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    let active = true;
    let objectUrl = "";
    setLoading(true);
    setError("");
    setPreview(null);
    void getJurySubmissionViewLink(hackathonId, teamId)
      .then(async (link) => {
        if (isPdf(link.contentType, link.filename)) {
          objectUrl = await getJurySubmissionFile(hackathonId, teamId);
          if (active) setPreview({ kind: "pdf", src: objectUrl, filename: link.filename });
          return;
        }
        if (!active) return;
        setPreview(
          isPubliclyReachable(link.url)
            ? {
                kind: "slides",
                src: `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(link.url)}`,
                filename: link.filename,
              }
            : { kind: "unavailable", filename: link.filename },
        );
      })
      .catch((cause) => {
        if (active) setError(cause instanceof Error ? cause.message : "Could not open the file.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [hackathonId, open, teamId]);

  async function download() {
    setDownloading(true);
    try {
      const url = await getJurySubmissionFile(hackathonId, teamId);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = preview?.filename || "team-submission";
      anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not download the file.");
    } finally {
      setDownloading(false);
    }
  }

  const Icon = preview?.kind === "pdf" ? FileText : Presentation;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[92dvh] max-w-6xl flex-col gap-0 overflow-hidden rounded-2xl p-0 [&>button:last-child]:hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-(--color-border) px-4 py-3 sm:px-5">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-(--brand-accent-soft) text-(--brand-accent)">
            <Icon className="size-4.5" />
          </span>
          <div className="min-w-0 flex-1">
            <DialogTitle className="truncate text-sm font-semibold">
              {preview?.filename || "Team submission"}
            </DialogTitle>
            <DialogDescription className="truncate text-xs">{teamName}</DialogDescription>
          </div>
          <div className="flex items-center gap-1.5">
            {preview && preview.kind !== "unavailable" ? (
              <a
                href={preview.src}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-8 items-center gap-1.5 rounded-full border border-(--color-border) bg-white px-3.5 text-xs font-semibold transition-colors hover:bg-(--color-background-alt)"
              >
                <ExternalLink className="size-3.5" />
                <span className="hidden sm:inline">Open in new tab</span>
              </a>
            ) : null}
            <JuryButton disabled={downloading} onClick={() => void download()}>
              <Download className="size-3.5" />
              <span className="hidden sm:inline">{downloading ? "Preparing…" : "Download"}</span>
            </JuryButton>
            <button
              type="button"
              aria-label="Close preview"
              onClick={() => onOpenChange(false)}
              className="ml-1 rounded-full p-1.5 text-(--color-text-muted) transition-colors hover:bg-(--color-background-alt) hover:text-foreground"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        <div className="relative min-h-0 flex-1 bg-(--color-background-alt)">
          {loading ? (
            <div className="absolute inset-0 grid place-items-center">
              <div className="flex flex-col items-center gap-3 text-sm text-(--color-text-secondary)">
                <span className="size-8 animate-spin rounded-full border-2 border-(--brand-accent-soft) border-t-(--brand-accent)" />
                Opening file…
              </div>
            </div>
          ) : null}
          {error ? (
            <div className="absolute inset-0 grid place-items-center p-6">
              <p
                role="alert"
                className="max-w-md rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700"
              >
                {error}
              </p>
            </div>
          ) : null}
          {preview && preview.kind !== "unavailable" ? (
            <iframe
              key={preview.src}
              src={preview.src}
              title={`${teamName} submission`}
              className="size-full border-0 bg-white"
            />
          ) : null}
          {preview?.kind === "unavailable" ? (
            <div className="absolute inset-0 grid place-items-center p-6">
              <div className="max-w-md text-center">
                <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-white text-(--brand-accent) shadow-(--shadow-small)">
                  <Presentation className="size-6" />
                </span>
                <p className="mt-4 font-semibold">Slide preview is available on the live site</p>
                <p className="mt-1.5 text-sm text-(--color-text-secondary)">
                  PowerPoint files are rendered by the Office Online viewer, which can't reach a
                  local development server. Download the file to view it here.
                </p>
                <JuryButton
                  variant="primary"
                  size="md"
                  className="mt-4"
                  disabled={downloading}
                  onClick={() => void download()}
                >
                  <Download className="size-4" />
                  {downloading ? "Preparing…" : "Download file"}
                </JuryButton>
              </div>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
