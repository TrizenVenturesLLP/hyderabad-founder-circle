import { useState, type FormEvent } from "react";
import { Code2, ExternalLink, FileText, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { submitHackathonProject, type HackathonRegisteredUser } from "@/lib/hackathon-api";

const inputClass =
  "w-full border border-(--color-border) bg-white text-[13px] text-foreground outline-none transition placeholder:text-(--color-text-muted) focus:border-(--brand-accent)";

const MAX_FILE_BYTES = 10 * 1024 * 1024;

export function ProjectSubmissionDialog({
  open,
  onOpenChange,
  email,
  phone,
  statementId,
  onSubmitted,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  phone: string;
  statementId: string;
  onSubmitted: (user: HackathonRegisteredUser | undefined) => void;
}) {
  const [githubRepo, setGithubRepo] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!/^https?:\/\/\S+$/i.test(githubRepo.trim())) {
      setError("Please enter a valid GitHub repository URL.");
      return;
    }
    if (!/^https?:\/\/\S+$/i.test(videoUrl.trim())) {
      setError("Please enter a valid demo video link.");
      return;
    }
    if (!description.trim()) {
      setError("Please describe your project.");
      return;
    }
    if (!file) {
      setError("Please upload your presentation (PDF, PPT or PPTX).");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setError("The presentation must be 10 MB or smaller.");
      return;
    }
    if (
      !window.confirm(
        "Submit your team's project?\n\nYou can submit only once, and the submission can't be edited afterwards.",
      )
    ) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await submitHackathonProject({
        email,
        phone,
        github_repo: githubRepo.trim(),
        description: description.trim(),
        ppt: file,
        video_url: videoUrl.trim(),
      });
      toast.success(response.message || "Project submitted successfully.");
      onSubmitted(response.user);
      onOpenChange(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to submit the project.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !isSubmitting && onOpenChange(next)}>
      <DialogContent className="flex max-h-[90vh] max-w-xl flex-col gap-0 overflow-hidden p-0 sm:rounded-none max-sm:h-dvh max-sm:max-h-dvh max-sm:rounded-none max-sm:border-0">
        <DialogHeader className="border-b border-(--color-border) px-4 py-4 pr-12 text-left sm:px-5">
          <p className="text-[11px] font-semibold tracking-[0.08em] text-(--brand-accent) uppercase">
            Final submission · {statementId}
          </p>
          <DialogTitle className="text-base">Submit your project</DialogTitle>
          <DialogDescription className="text-[12.5px]">
            Add your repository, demo video and presentation. Your team can submit only once.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="grid min-h-0 flex-1 content-start gap-3.5 overflow-y-auto overscroll-contain px-4 py-4 sm:grid-cols-2 sm:px-5">
            <label className="block text-xs font-semibold">
              GitHub repository URL
              <span className="relative mt-1 block">
                <Code2 className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-(--color-text-muted)" />
                <input
                  type="url"
                  required
                  value={githubRepo}
                  onChange={(event) => setGithubRepo(event.target.value)}
                  placeholder="https://github.com/team/project"
                  className={`${inputClass} h-9 pr-3 pl-8 font-normal`}
                />
              </span>
            </label>
            <label className="block text-xs font-semibold">
              Demo video URL
              <span className="relative mt-1 block">
                <ExternalLink className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-(--color-text-muted)" />
                <input
                  type="url"
                  required
                  value={videoUrl}
                  onChange={(event) => setVideoUrl(event.target.value)}
                  placeholder="https://drive.google.com/..."
                  className={`${inputClass} h-9 pr-3 pl-8 font-normal`}
                />
              </span>
            </label>
            <label className="block text-xs font-semibold sm:col-span-2">
              Project description
              <textarea
                rows={4}
                required
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="What your team built, the approach and key features."
                className={`${inputClass} mt-1 resize-none px-3 py-2 leading-5 font-normal`}
              />
            </label>
            <div className="sm:col-span-2">
              <p className="text-xs font-semibold">Presentation (PDF, PPT or PPTX)</p>
              <label
                htmlFor="project-presentation"
                className="mt-1 flex cursor-pointer items-center gap-3 border border-dashed border-(--color-border) bg-(--color-background-alt) px-3 py-3 transition hover:border-(--brand-accent)"
              >
                <span className="grid size-8 shrink-0 place-items-center bg-(--brand-accent-soft) text-(--brand-accent)">
                  {file ? <FileText className="size-4" /> : <Upload className="size-4" />}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-semibold">
                    {file ? file.name : "Upload your PPT or PDF"}
                  </span>
                  <span className="block text-[11.5px] text-(--color-text-muted)">
                    {file ? "Click to choose a different file" : "Up to 10 MB"}
                  </span>
                </span>
                <input
                  id="project-presentation"
                  type="file"
                  accept=".pdf,.ppt,.pptx"
                  className="hidden"
                  onChange={(event) => setFile(event.target.files?.[0] || null)}
                />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 border-t border-(--color-border) px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:flex sm:flex-wrap sm:items-center sm:justify-end sm:px-5 sm:pb-3">
            {error ? (
              <p
                role="alert"
                className="col-span-2 text-[12.5px] font-medium text-red-600 sm:mr-auto"
              >
                {error}
              </p>
            ) : null}
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="h-10 border border-(--color-border) bg-white px-4 sm:h-9 text-[13px] font-semibold text-(--color-text-secondary) transition-colors hover:bg-(--color-background-alt) disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-10 items-center justify-center gap-1.5 bg-(--brand-primary) px-4 sm:h-9 text-[13px] font-semibold text-white transition hover:bg-(--brand-primary-hover) disabled:cursor-wait disabled:opacity-60"
            >
              <Upload className="size-3.5" />
              {isSubmitting ? "Submitting..." : "Submit project"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
