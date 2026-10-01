import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Mail, RotateCcw, Send, Trash2, UserRoundX } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader, AdminPanel } from "@/components/admin/AdminPageChrome";
import { HackathonNav, hackathonSectionPageClass } from "@/components/admin/HackathonNav";
import {
  createAdminHackathonInvitation,
  deleteAdminHackathonInvitation,
  deleteAdminHackathonJuryMemberRecord,
  fetchAdminHackathonInvitations,
  fetchAdminHackathonJuryMembers,
  resendAdminHackathonInvitation,
  revokeAdminHackathonJuryMember,
  type AdminHackathonInvitation,
  type AdminHackathonJuryMember,
} from "@/lib/admin-api";

export const Route = createFileRoute("/admin/hackathons/$hackathonId/jury")({
  component: AdminHackathonJuryPage,
});

const invitationStatusTone: Record<AdminHackathonInvitation["status"], string> = {
  pending: "bg-amber-50 text-amber-700",
  accepted: "bg-emerald-50 text-emerald-700",
  revoked: "bg-red-50 text-red-700",
  expired: "bg-muted text-muted-foreground",
};

const deliveryTone: Record<AdminHackathonInvitation["deliveryStatus"], string> = {
  sent: "text-emerald-700",
  failed: "text-red-700",
};

const iconButtonClass =
  "inline-flex size-7 items-center justify-center border border-border bg-white text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50";
const dangerIconButtonClass =
  "inline-flex size-7 items-center justify-center border border-red-200 bg-white text-destructive transition-colors hover:bg-destructive/5 disabled:opacity-50";

function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

function SectionHeading({ title, count, hint }: { title: string; count: number; hint: string }) {
  return (
    <div className="mb-2 flex items-baseline justify-between gap-3">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
        {title}
        <span className="bg-muted px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground tabular-nums">
          {count}
        </span>
      </h2>
      <p className="truncate text-[11.5px] text-muted-foreground">{hint}</p>
    </div>
  );
}

function AdminHackathonJuryPage() {
  const { hackathonId } = Route.useParams();
  const [invitations, setInvitations] = useState<AdminHackathonInvitation[]>([]);
  const [members, setMembers] = useState<AdminHackathonJuryMember[]>([]);
  const [teamCount, setTeamCount] = useState(0);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [workingId, setWorkingId] = useState("");
  const [error, setError] = useState("");

  const activeMemberByEmail = useMemo(
    () =>
      new Map(
        members
          .filter((member) => member.status === "active" && member.email)
          .map((member) => [member.email.toLowerCase(), member]),
      ),
    [members],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [invitationData, memberData] = await Promise.all([
        fetchAdminHackathonInvitations(hackathonId),
        fetchAdminHackathonJuryMembers(hackathonId),
      ]);
      setInvitations(invitationData.items);
      setMembers(memberData.items);
      setTeamCount(memberData.teamCount);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load Jury management.");
    } finally {
      setLoading(false);
    }
  }, [hackathonId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function invite(event: FormEvent) {
    event.preventDefault();
    setSending(true);
    try {
      const result = await createAdminHackathonInvitation(hackathonId, { email, name });
      toast[result.emailSent ? "success" : "warning"](
        result.emailSent
          ? "Invitation sent."
          : "Invitation saved, but email delivery failed. Resend after checking email service.",
      );
      setEmail("");
      setName("");
      await load();
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Could not invite Jury member.");
    } finally {
      setSending(false);
    }
  }

  async function resend(invitation: AdminHackathonInvitation) {
    setWorkingId(invitation._id);
    try {
      const result = await resendAdminHackathonInvitation(hackathonId, invitation._id);
      toast[result.emailSent ? "success" : "warning"](
        result.emailSent ? "Invitation resent." : "Resend failed; invitation remains pending.",
      );
      await load();
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Could not resend invitation.");
    } finally {
      setWorkingId("");
    }
  }

  async function deleteInvitation(invitation: AdminHackathonInvitation) {
    const warning =
      invitation.status === "pending"
        ? "\n\nThe invitation link they received will stop working."
        : "";
    if (!window.confirm(`Delete the invitation for ${invitation.email}?${warning}`)) return;
    setWorkingId(invitation._id);
    try {
      await deleteAdminHackathonInvitation(hackathonId, invitation._id);
      toast.success("Invitation deleted.");
      await load();
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Could not delete invitation.");
    } finally {
      setWorkingId("");
    }
  }

  async function revokeMember(member: AdminHackathonJuryMember) {
    if (
      !window.confirm(
        `Remove ${member.name} from this Hackathon Jury?\n\nThey will no longer be able to sign in to the Jury portal. Problem statements they added will stay visible.`,
      )
    )
      return;
    setWorkingId(member.id);
    try {
      const result = await revokeAdminHackathonJuryMember(hackathonId, member.id);
      toast.success(
        result.accountDisabled
          ? `${member.name} was removed and can no longer sign in.`
          : `${member.name} was removed from this Hackathon.`,
      );
      await load();
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Could not remove Jury member.");
    } finally {
      setWorkingId("");
    }
  }

  async function deleteMemberRecord(member: AdminHackathonJuryMember) {
    if (
      !window.confirm(
        `Delete ${member.name}'s Jury record permanently?\n\nThey are already removed; this only clears them from this list.`,
      )
    )
      return;
    setWorkingId(member.id);
    try {
      await deleteAdminHackathonJuryMemberRecord(hackathonId, member.id);
      toast.success(`${member.name} was deleted from the list.`);
      await load();
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Could not delete Jury record.");
    } finally {
      setWorkingId("");
    }
  }

  return (
    <div className={`space-y-4 p-4 sm:p-5 md:p-6 ${hackathonSectionPageClass}`}>
      <HackathonNav hackathonId={hackathonId} active="jury" />
      <AdminPageHeader
        title="Jury"
        description="Invite Jury members and track their evaluation progress."
        actions={
          <button
            type="button"
            onClick={() => void load()}
            className="inline-flex h-8 items-center gap-1.5 border border-border bg-white px-3 text-xs font-semibold whitespace-nowrap transition-colors hover:bg-muted"
          >
            <RotateCcw className="size-3.5" />
            Refresh
          </button>
        }
      />

      <AdminPanel className="rounded-xl p-3">
        <form onSubmit={invite} className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <span className="shrink-0 text-xs font-semibold text-foreground sm:pr-1">
            Invite Jury member
          </span>
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            aria-label="Jury member email"
            placeholder="Email address"
            className="h-9 min-w-0 flex-1 border border-border bg-white px-3 text-[13px] placeholder:text-muted-foreground focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary"
          />
          <input
            maxLength={120}
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="name"
            aria-label="Jury member name"
            placeholder="Name (optional)"
            className="h-9 min-w-0 flex-1 border border-border bg-white px-3 text-[13px] placeholder:text-muted-foreground focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary"
          />
          <button
            type="submit"
            disabled={sending}
            className="btn-primary h-9 shrink-0 justify-center gap-2 px-4 text-xs whitespace-nowrap disabled:opacity-60"
          >
            <Mail className="size-3.5" />
            {sending ? "Sending…" : "Send invitation"}
          </button>
        </form>
      </AdminPanel>

      {error ? (
        <AdminPanel className="rounded-xl border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </AdminPanel>
      ) : null}

      <section>
        <SectionHeading
          title="Jury members"
          count={members.length}
          hint={`Evaluation progress across ${teamCount} active teams`}
        />
        {loading && members.length === 0 ? (
          <AdminPanel className="rounded-xl p-6 text-center text-sm text-muted-foreground">
            Loading Jury members…
          </AdminPanel>
        ) : members.length === 0 ? (
          <AdminPanel className="rounded-xl p-6 text-center text-sm text-muted-foreground">
            Accepted Jury members will appear here.
          </AdminPanel>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {members.map((member) => {
              const removed = member.status === "revoked";
              const busy = workingId === member.id;
              return (
                <AdminPanel
                  key={member.id}
                  className={`rounded-xl p-3 ${removed ? "bg-muted/30" : ""}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 text-[13px] font-semibold text-foreground">
                        <span className="truncate">{member.name}</span>
                        {removed ? (
                          <span className="shrink-0 bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold text-red-700 uppercase">
                            Removed
                          </span>
                        ) : null}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{member.email}</p>
                    </div>
                    {removed ? (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void deleteMemberRecord(member)}
                        title="Delete record"
                        aria-label={`Delete ${member.name}'s record`}
                        className={dangerIconButtonClass}
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void revokeMember(member)}
                        title="Remove from Jury"
                        aria-label={`Remove ${member.name} from the Jury`}
                        className={dangerIconButtonClass}
                      >
                        <UserRoundX className="size-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="mt-2.5 flex items-center justify-between text-[11.5px] text-muted-foreground">
                    <span>
                      {member.teamsEvaluated} evaluated · {member.teamsPending} pending
                    </span>
                    <span className="font-semibold text-foreground tabular-nums">
                      {member.completionPercent}%
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 bg-muted">
                    <div
                      className={`h-1.5 transition-[width] duration-500 ${removed ? "bg-muted-foreground/40" : "bg-primary"}`}
                      style={{ width: `${member.completionPercent}%` }}
                    />
                  </div>
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    Joined {new Date(member.joinedAt).toLocaleDateString()}
                    {removed && member.accountStatus === "disabled" ? " · Sign-in disabled" : ""}
                  </p>
                </AdminPanel>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <SectionHeading
          title="Invitations"
          count={invitations.length}
          hint="Delivery status is separate from acceptance"
        />
        {loading && invitations.length === 0 ? (
          <AdminPanel className="rounded-xl p-6 text-center text-sm text-muted-foreground">
            Loading invitations…
          </AdminPanel>
        ) : invitations.length === 0 ? (
          <AdminPanel className="rounded-xl p-6 text-center text-sm text-muted-foreground">
            No Jury invitations yet.
          </AdminPanel>
        ) : (
          <AdminPanel className="overflow-x-auto rounded-xl">
            <table className="w-full min-w-[720px] text-left text-[13px]">
              <thead className="border-b border-border bg-muted/40 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                <tr>
                  <th className="px-3 py-2">Invitee</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Sent</th>
                  <th className="px-3 py-2">Expires</th>
                  <th className="px-3 py-2">Delivery</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {invitations.map((item) => {
                  const busy = workingId === item._id;
                  const activeMember =
                    item.status === "accepted"
                      ? activeMemberByEmail.get(item.email.toLowerCase())
                      : undefined;
                  return (
                    <tr key={item._id} className="transition-colors hover:bg-muted/30">
                      <td className="max-w-[240px] px-3 py-2">
                        <span className="block truncate font-medium text-foreground">
                          {item.inviteeName || item.email}
                        </span>
                        {item.inviteeName ? (
                          <span className="block truncate text-[11.5px] text-muted-foreground">
                            {item.email}
                          </span>
                        ) : null}
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`inline-block px-1.5 py-0.5 text-[11px] font-semibold capitalize ${invitationStatusTone[item.status]}`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">
                        {formatDateTime(item.lastSentAt)}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">
                        {item.status === "pending" || item.status === "expired"
                          ? formatDateTime(item.expiresAt)
                          : "—"}
                      </td>
                      <td
                        className={`px-3 py-2 text-xs font-semibold capitalize ${deliveryTone[item.deliveryStatus]}`}
                      >
                        {item.deliveryStatus}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex justify-end gap-1.5">
                          {item.status === "pending" || item.status === "expired" ? (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => void resend(item)}
                              title="Resend invitation"
                              aria-label={`Resend invitation to ${item.email}`}
                              className={iconButtonClass}
                            >
                              <Send className="size-3.5" />
                            </button>
                          ) : null}
                          {activeMember ? (
                            <button
                              type="button"
                              disabled={workingId === activeMember.id}
                              onClick={() => void revokeMember(activeMember)}
                              title="Remove from Jury"
                              aria-label={`Remove ${activeMember.name} from the Jury`}
                              className={dangerIconButtonClass}
                            >
                              <UserRoundX className="size-3.5" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => void deleteInvitation(item)}
                              title="Delete invitation"
                              aria-label={`Delete invitation for ${item.email}`}
                              className={dangerIconButtonClass}
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </AdminPanel>
        )}
      </section>
    </div>
  );
}
