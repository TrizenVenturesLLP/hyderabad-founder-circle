import { useCallback, useEffect, useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Mail, RotateCcw, UserRoundX } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader, AdminPanel } from "@/components/admin/AdminPageChrome";
import { HackathonNav } from "@/components/admin/HackathonNav";
import {
  createAdminHackathonInvitation,
  fetchAdminHackathonInvitations,
  fetchAdminHackathonJuryMembers,
  resendAdminHackathonInvitation,
  revokeAdminHackathonInvitation,
  revokeAdminHackathonJuryMember,
  type AdminHackathonInvitation,
  type AdminHackathonJuryMember,
} from "@/lib/admin-api";

export const Route = createFileRoute("/admin/hackathons/$hackathonId/jury")({
  component: AdminHackathonJuryPage,
});

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

  async function revokeInvitation(invitation: AdminHackathonInvitation) {
    if (!window.confirm(`Revoke the invitation for ${invitation.email}?`)) return;
    setWorkingId(invitation._id);
    try {
      await revokeAdminHackathonInvitation(hackathonId, invitation._id);
      toast.success("Invitation revoked.");
      await load();
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Could not revoke invitation.");
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

  return (
    <div className="space-y-6 p-4 sm:p-5 md:p-6">
      <HackathonNav hackathonId={hackathonId} active="jury" />
      <AdminPageHeader
        title="Jury"
        description="Invite Jury members and track their evaluation progress."
        actions={
          <button
            type="button"
            onClick={() => void load()}
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-white px-4 text-xs font-semibold transition-colors hover:bg-muted"
          >
            <RotateCcw className="size-3.5" />
            Refresh
          </button>
        }
      />
      <AdminPanel className="p-4">
        <h2 className="text-sm font-semibold">Invite Jury member</h2>
        <form
          onSubmit={invite}
          className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
        >
          <label className="text-xs font-medium">
            Email
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              className="mt-1 block h-10 w-full border border-border px-3 text-sm"
            />
          </label>
          <label className="text-xs font-medium">
            Name (optional)
            <input
              maxLength={120}
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
              className="mt-1 block h-10 w-full border border-border px-3 text-sm"
            />
          </label>
          <button
            type="submit"
            disabled={sending}
            className="btn-primary h-10 justify-center gap-2 disabled:opacity-60"
          >
            <Mail className="size-4" />
            {sending ? "Sending…" : "Send invitation"}
          </button>
        </form>
      </AdminPanel>
      {error ? (
        <AdminPanel className="border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </AdminPanel>
      ) : null}
      <section>
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="text-base font-semibold">Invitations</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Delivery status is separate from invitation acceptance.
            </p>
          </div>
          <span className="text-xs text-muted-foreground">{invitations.length} total</span>
        </div>
        {loading ? (
          <AdminPanel className="p-8 text-center text-sm text-muted-foreground">
            Loading invitations…
          </AdminPanel>
        ) : invitations.length === 0 ? (
          <AdminPanel className="p-8 text-center text-sm text-muted-foreground">
            No Jury invitations yet.
          </AdminPanel>
        ) : (
          <AdminPanel className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-muted/40 text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Sent</th>
                  <th className="px-4 py-3">Expiry</th>
                  <th className="px-4 py-3">Delivery</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {invitations.map((item) => (
                  <tr key={item._id}>
                    <td className="px-4 py-3">
                      <span className="font-medium">{item.inviteeName || item.email}</span>
                      {item.inviteeName ? (
                        <span className="block text-xs text-muted-foreground">{item.email}</span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 capitalize">{item.status}</td>
                    <td className="px-4 py-3">{new Date(item.lastSentAt).toLocaleString()}</td>
                    <td className="px-4 py-3">{new Date(item.expiresAt).toLocaleString()}</td>
                    <td className="px-4 py-3 capitalize">{item.deliveryStatus}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {["pending", "expired"].includes(item.status) ? (
                          <>
                            <button
                              type="button"
                              disabled={workingId === item._id}
                              onClick={() => void resend(item)}
                              className="border border-border px-2 py-1 text-xs hover:bg-muted"
                            >
                              Resend
                            </button>
                            <button
                              type="button"
                              disabled={workingId === item._id}
                              onClick={() => void revokeInvitation(item)}
                              className="border border-border px-2 py-1 text-xs text-destructive hover:bg-destructive/5"
                            >
                              Revoke
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-muted-foreground">No actions</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </AdminPanel>
        )}
      </section>
      <section>
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="text-base font-semibold">Jury members</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Evaluation progress across {teamCount} active teams.
            </p>
          </div>
          <span className="text-xs text-muted-foreground">{members.length} assigned</span>
        </div>
        {members.length === 0 ? (
          <AdminPanel className="p-8 text-center text-sm text-muted-foreground">
            Accepted Jury members will appear here.
          </AdminPanel>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {members.map((member) => (
              <AdminPanel
                key={member.id}
                className={`p-4 ${member.status === "revoked" ? "opacity-70" : ""}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 font-semibold">
                      {member.name}
                      {member.status === "revoked" ? (
                        <span className="rounded bg-red-50 px-1.5 py-0.5 text-[10.5px] font-semibold text-red-700 uppercase">
                          Removed
                        </span>
                      ) : null}
                    </p>
                    <p className="mt-1 truncate text-sm text-muted-foreground">{member.email}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Joined {new Date(member.joinedAt).toLocaleDateString()}
                      {member.status === "revoked" && member.accountStatus === "disabled"
                        ? " · Sign-in disabled"
                        : ""}
                    </p>
                  </div>
                  {member.status === "active" ? (
                    <button
                      type="button"
                      disabled={workingId === member.id}
                      onClick={() => void revokeMember(member)}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/5 disabled:opacity-60"
                    >
                      <UserRoundX className="size-3.5" />
                      {workingId === member.id ? "Removing…" : "Remove"}
                    </button>
                  ) : null}
                </div>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span>
                    {member.teamsEvaluated} evaluated · {member.teamsPending} pending
                  </span>
                  <strong>{member.completionPercent}%</strong>
                </div>
                <div className="mt-2 h-2 bg-muted">
                  <div
                    className="h-2 bg-primary"
                    style={{ width: `${member.completionPercent}%` }}
                  />
                </div>
              </AdminPanel>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
