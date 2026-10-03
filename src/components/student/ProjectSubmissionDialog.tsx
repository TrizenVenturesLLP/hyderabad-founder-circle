import { useState, useEffect, type FormEvent } from "react";
import { AlertCircle, Clock3, Code2, DoorOpen, ExternalLink, FileText, Link, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { submitHackathonProject, type HackathonRegisteredUser } from "@/lib/hackathon-api";
import { SUBMISSION_DEADLINE_ISO } from "@/lib/hackathon";

const inputClass =
  "w-full border border-(--color-border) bg-white text-[13px] text-foreground outline-none transition placeholder:text-(--color-text-muted) focus:border-(--brand-accent) disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed";

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
  const [roomNumber, setRoomNumber] = useState("");
  const [otherLinks, setOtherLinks] = useState("");
  const [description, setDescription] = useState("");
  const [pptUrl, setPptUrl] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const deadlineMs = new Date(SUBMISSION_DEADLINE_ISO).getTime();
  const diffMs = deadlineMs - now;
  const isExpired = diffMs <= 0;

  function formatCountdown(ms: number) {
    if (ms <= 0) return "00h 00m 00s";
    const totalSecs = Math.floor(ms / 1000);
    const hours = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${String(hours).padStart(2, "0")}h ${String(mins).padStart(2, "0")}m ${String(secs).padStart(2, "0")}s`;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (isExpired) {
      setError("Submissions are now closed. The project submission deadline has ended.");
      return;
    }
    if (!roomNumber.trim()) {
      setError("Please enter your team's room number.");
      return;
    }
    if (!/^https?:\/\/\S+$/i.test(githubRepo.trim())) {
      setError("Please enter a valid GitHub repository URL.");
      return;
    }
    if (!/^https?:\/\/\S+$/i.test(videoUrl.trim())) {
      setError("Please enter a valid demo video link.");
      return;
    }
    if (!/^https?:\/\/\S+$/i.test(pptUrl.trim())) {
      setError("Please enter a valid presentation (PPT/PDF) link.");
      return;
    }
    if (!description.trim()) {
      setError("Please describe your project.");
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
        ppt_url: pptUrl.trim(),
        video_url: videoUrl.trim(),
        room_number: roomNumber.trim(),
        other_links: otherLinks.trim() || undefined,
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

  const deadlineDateFormatted = new Date(SUBMISSION_DEADLINE_ISO).toLocaleString("en-US", {
    timeZone: "Asia/Kolkata",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <Dialog open={open} onOpenChange={(next) => !isSubmitting && onOpenChange(next)}>
      <DialogContent className="flex max-h-[90vh] max-w-xl flex-col gap-0 overflow-hidden p-0 sm:rounded-none max-sm:h-dvh max-sm:max-h-dvh max-sm:rounded-none max-sm:border-0">
        <DialogHeader className="border-b border-(--color-border) px-4 py-4 pr-12 text-left sm:px-5">
          <p className="text-[11px] font-semibold tracking-[0.08em] text-(--brand-accent) uppercase">
            Final submission · {statementId}
          </p>
          <DialogTitle className="text-base">Submit your project</DialogTitle>
          <DialogDescription className="text-[12.5px]">
            Add your repository, demo video, room number and presentation. Your team can submit only once.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="grid min-h-0 flex-1 content-start gap-3.5 overflow-y-auto overscroll-contain px-4 py-4 sm:grid-cols-2 sm:px-5">
            <label className="block text-xs font-semibold sm:col-span-2">
              Room Number
              <span className="relative mt-1 block">
                <DoorOpen className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-(--color-text-muted)" />
                <input
                  type="text"
                  required
                  disabled={isSubmitting || isExpired}
                  value={roomNumber}
                  onChange={(event) => setRoomNumber(event.target.value)}
                  placeholder="e.g. Room 302 / Lab 4 / Hall B"
                  className={`${inputClass} h-9 pr-3 pl-8 font-normal`}
                />
              </span>
            </label>
            <label className="block text-xs font-semibold">
              GitHub repository URL
              <span className="relative mt-1 block">
                <Code2 className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-(--color-text-muted)" />
                <input
                  type="url"
                  required
                  disabled={isSubmitting || isExpired}
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
                  disabled={isSubmitting || isExpired}
                  value={videoUrl}
                  onChange={(event) => setVideoUrl(event.target.value)}
                  placeholder="https://drive.google.com/..."
                  className={`${inputClass} h-9 pr-3 pl-8 font-normal`}
                />
              </span>
            </label>
            <label className="block text-xs font-semibold sm:col-span-2">
              Other Links (Optional)
              <span className="relative mt-1 block">
                <Link className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-(--color-text-muted)" />
                <input
                  type="text"
                  disabled={isSubmitting || isExpired}
                  value={otherLinks}
                  onChange={(event) => setOtherLinks(event.target.value)}
                  placeholder="e.g. Live demo, Figma prototype, Drive folder..."
                  className={`${inputClass} h-9 pr-3 pl-8 font-normal`}
                />
              </span>
            </label>
            <label className="block text-xs font-semibold sm:col-span-2">
              Project description
              <textarea
                rows={4}
                required
                disabled={isSubmitting || isExpired}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="What your team built, the approach and key features."
                className={`${inputClass} mt-1 resize-none px-3 py-2 leading-5 font-normal`}
              />
            </label>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold">
                Presentation Link (Google Drive / Canva / Cloud link)
                <p className="mt-0.5 text-[11.5px] font-normal text-amber-700">
                  Please make sure your Google Drive / Cloud link has public viewer access enabled so the jury can view your presentation.
                </p>
                <span className="relative mt-1.5 block">
                  <FileText className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-(--color-text-muted)" />
                  <input
                    type="url"
                    required
                    disabled={isSubmitting || isExpired}
                    value={pptUrl}
                    onChange={(event) => setPptUrl(event.target.value)}
                    placeholder="https://drive.google.com/file/d/..."
                    className={`${inputClass} h-9 pr-3 pl-8 font-normal`}
                  />
                </span>
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
              disabled={isSubmitting || isExpired}
              className="inline-flex h-10 items-center justify-center gap-1.5 bg-(--brand-primary) px-4 sm:h-9 text-[13px] font-semibold text-white transition hover:bg-(--brand-primary-hover) disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Upload className="size-3.5" />
              {isSubmitting ? "Submitting..." : isExpired ? "Submissions closed" : "Submit project"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
