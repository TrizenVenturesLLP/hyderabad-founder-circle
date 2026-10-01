import { useState } from "react";
import { Clock3, Lightbulb, Send, XCircle } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AppSelect } from "@/components/AppSelect";
import {
  proposeHackathonProblemStatement,
  type HackathonProblemProposal,
  type HackathonProposalSlots,
} from "@/lib/hackathon-api";

type ProposalState = {
  problemProposal?: HackathonProblemProposal | null;
  proposalSlots?: HackathonProposalSlots;
};

const fieldClass =
  "mt-1 block w-full border border-(--color-border) bg-white px-3 py-2 text-[13px] outline-none transition placeholder:text-(--color-text-muted) hover:border-(--brand-accent)/50 focus:border-(--brand-accent)";

export function ProblemProposalCard({
  domains,
  defaultDomainId,
  isLead,
  leadName,
  credentials,
  proposal,
  slots,
  onChange,
}: {
  domains: { id: string; name: string }[];
  defaultDomainId: string;
  isLead: boolean;
  leadName: string;
  credentials: { email: string; phone: string } | null;
  proposal: HackathonProblemProposal | null;
  slots: HackathonProposalSlots | null;
  onChange: (state: ProposalState) => void;
}) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    domainId: defaultDomainId,
    title: "",
    description: "",
    industry: "",
    platform: "",
  });

  const slotsLeft = slots ? Math.max(0, slots.limit - slots.approved) : 0;
  const isPending = proposal?.status === "pending_approval";
  const isRejected = proposal?.status === "rejected";
  const canPropose = isLead && !isPending && slotsLeft > 0 && Boolean(credentials);

  if (!slots || (!isLead && !proposal)) return null;

  function openForm() {
    setForm((current) => ({ ...current, domainId: defaultDomainId }));
    setOpen(true);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!credentials) return;
    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Enter a title and a description for your idea.");
      return;
    }
    setSubmitting(true);
    try {
      const result = await proposeHackathonProblemStatement({
        ...credentials,
        domainId: form.domainId,
        title: form.title.trim(),
        description: form.description.trim(),
        industry: form.industry.trim(),
        platform: form.platform.trim(),
      });
      onChange(result);
      setOpen(false);
      setForm({
        domainId: defaultDomainId,
        title: "",
        description: "",
        industry: "",
        platform: "",
      });
      toast.success("Your idea was sent to the admin for approval.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not send your proposal.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-4 border border-dashed border-(--brand-accent)/40 bg-(--brand-accent-soft)/40 p-3.5">
      <div className="flex flex-wrap items-start gap-3">
        <span className="grid size-8 shrink-0 place-items-center rounded-md bg-(--brand-accent-soft) text-(--brand-accent)">
          <Lightbulb className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold">Have your own idea?</p>
          <p className="mt-0.5 text-[12px] leading-5 text-(--color-text-secondary)">
            Propose your own problem statement. If the admin approves it, it becomes your
            team&apos;s problem statement. Only {slots.limit} team ideas can be approved ·{" "}
            <span className="font-semibold text-foreground">
              {slotsLeft} of {slots.limit} slots left
            </span>
            .
          </p>
        </div>
        {canPropose ? (
          <button
            type="button"
            onClick={openForm}
            className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 bg-(--brand-primary) px-3 text-[12.5px] font-semibold text-white transition hover:bg-(--brand-primary-hover) max-sm:w-full sm:h-8"
          >
            <Send className="size-3.5" />
            {isRejected ? "Propose another idea" : "Propose your idea"}
          </button>
        ) : null}
      </div>

      {isPending ? (
        <p className="mt-3 flex items-start gap-1.5 border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] leading-5 text-amber-800">
          <Clock3 className="mt-0.5 size-3.5 shrink-0" />
          <span>
            <span className="font-semibold">&ldquo;{proposal.title}&rdquo;</span> is waiting for
            admin approval.{" "}
            {isLead
              ? "If you confirm a listed statement instead, this proposal is withdrawn."
              : `${leadName} will see the result here.`}
          </span>
        </p>
      ) : isRejected ? (
        <p className="mt-3 flex items-start gap-1.5 border border-red-200 bg-red-50 px-3 py-2 text-[12px] leading-5 text-red-800">
          <XCircle className="mt-0.5 size-3.5 shrink-0" />
          <span>
            <span className="font-semibold">&ldquo;{proposal.title}&rdquo;</span> was not approved
            {proposal.rejectionReason ? `: ${proposal.rejectionReason}` : "."}
          </span>
        </p>
      ) : null}

      {isLead && !isPending && slotsLeft === 0 ? (
        <p className="mt-3 text-[12px] text-(--color-text-secondary)">
          All {slots.limit} slots for team ideas are taken. Please choose one of the listed
          statements.
        </p>
      ) : null}

      <Dialog open={open} onOpenChange={(next) => !submitting && setOpen(next)}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto rounded-none sm:rounded-none max-sm:h-dvh max-sm:max-h-dvh max-sm:content-start max-sm:border-0 max-sm:p-4 max-sm:pb-[max(1rem,env(safe-area-inset-bottom))]">
          <DialogHeader>
            <DialogTitle>Propose your problem statement</DialogTitle>
            <DialogDescription>
              The admin reviews your idea. Once approved, it is confirmed as your team&apos;s
              problem statement and can&apos;t be changed.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3">
            <label className="block text-[12px] font-semibold">
              Track
              <AppSelect
                value={form.domainId}
                onValueChange={(domainId) => setForm((current) => ({ ...current, domainId }))}
                ariaLabel="Track"
                size="sm"
                className="mt-1 rounded-none"
                contentClassName="rounded-none"
                options={domains.map((domain) => ({ value: domain.id, label: domain.name }))}
              />
            </label>
            <label className="block text-[12px] font-semibold">
              Title
              <input
                value={form.title}
                maxLength={200}
                onChange={(event) =>
                  setForm((current) => ({ ...current, title: event.target.value }))
                }
                placeholder="e.g. AI assistant for campus placement prep"
                className={fieldClass}
              />
            </label>
            <label className="block text-[12px] font-semibold">
              Description
              <textarea
                value={form.description}
                maxLength={5000}
                rows={5}
                onChange={(event) =>
                  setForm((current) => ({ ...current, description: event.target.value }))
                }
                placeholder="What problem are you solving, for whom, and what will you build?"
                className={`${fieldClass} resize-y`}
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-[12px] font-semibold">
                Industry <span className="font-normal text-(--color-text-muted)">(optional)</span>
                <input
                  value={form.industry}
                  maxLength={120}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, industry: event.target.value }))
                  }
                  placeholder="e.g. Education"
                  className={fieldClass}
                />
              </label>
              <label className="block text-[12px] font-semibold">
                Platform / tech{" "}
                <span className="font-normal text-(--color-text-muted)">(optional)</span>
                <input
                  value={form.platform}
                  maxLength={200}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, platform: event.target.value }))
                  }
                  placeholder="e.g. Web, React, OpenAI"
                  className={fieldClass}
                />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1 sm:flex sm:justify-end">
              <button
                type="button"
                disabled={submitting}
                onClick={() => setOpen(false)}
                className="inline-flex h-10 items-center justify-center border sm:h-9 border-(--color-border) bg-white px-3.5 text-[12.5px] font-semibold hover:bg-(--color-background-alt) disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex h-10 items-center justify-center gap-1.5 bg-(--brand-primary) px-3.5 text-[12.5px] sm:h-9 font-semibold text-white transition hover:bg-(--brand-primary-hover) disabled:opacity-60"
              >
                <Send className="size-3.5" />
                {submitting ? "Sending…" : "Send for approval"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
