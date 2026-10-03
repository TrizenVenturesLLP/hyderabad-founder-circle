import { useEffect, useMemo, useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check, Mail, Pencil, Phone, Send, ShieldCheck, UserPlus, Users, X } from "lucide-react";
import { toast } from "sonner";

import { getHackathonStudentProfile, saveHackathonStudentProfile } from "@/lib/hackathon-storage";
import {
  addHackathonTeamMember,
  getHackathonUserDetails,
  resendHackathonTeamInvitation,
  updateHackathonTeamMember,
  type HackathonRegisteredUser,
} from "@/lib/hackathon-api";
import { MAX_TEAM_MEMBERS, type HackathonStudentProfile } from "@/lib/hackathon";

export const Route = createFileRoute("/dashboard/team")({
  component: TeamPage,
});

function TeamPage() {
  const [backendUser, setBackendUser] = useState<HackathonRegisteredUser | null>(null);
  const [localProfile, setLocalProfile] = useState<HackathonStudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [newMember, setNewMember] = useState({ full_name: "", email: "", phone: "" });
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [memberFeedback, setMemberFeedback] = useState<{
    message: string;
    invitationSent?: boolean;
  } | null>(null);
  const [resendingEmail, setResendingEmail] = useState("");
  const [inviteFeedback, setInviteFeedback] = useState<Record<string, string>>({});

  // Editing state
  const [editingTargetEmail, setEditingTargetEmail] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ full_name: "", email: "", phone: "" });
  const [isUpdatingMember, setIsUpdatingMember] = useState(false);
  const [editFeedback, setEditFeedback] = useState<string | null>(null);

  useEffect(() => {
    const profile = getHackathonStudentProfile();
    setLocalProfile(profile);

    if (profile?.email && profile?.mobile) {
      getHackathonUserDetails({
        email: profile.email,
        phone: profile.mobile,
      })
        .then((res) => {
          if (res.user) {
            setBackendUser(res.user);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const teamName = backendUser?.team_name || "Your Team";
  const teamLead = backendUser?.lead_name || localProfile?.name || "Team Lead";
  const members = backendUser?.members || [];
  const isCurrentUserTeamLead =
    localProfile?.email?.toLowerCase() === backendUser?.email?.toLowerCase() &&
    localProfile?.mobile === backendUser?.phone;

  const allTeamEntries = useMemo(() => {
    if (!backendUser) return [];
    const leadEntry = {
      full_name: backendUser.lead_name,
      email: backendUser.email,
      phone: backendUser.phone,
      isLead: true,
    };
    const additionalMembers = (backendUser.members || [])
      .filter((m) => m.email?.toLowerCase() !== backendUser.email?.toLowerCase())
      .map((m) => ({
        full_name: m.full_name,
        email: m.email,
        phone: m.phone,
        isLead: false,
      }));

    return [leadEntry, ...additionalMembers];
  }, [backendUser]);

  async function handleAddMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!localProfile || !backendUser || members.length >= MAX_TEAM_MEMBERS) return;

    setIsAddingMember(true);
    setMemberFeedback(null);
    try {
      const result = await addHackathonTeamMember({
        email: localProfile.email,
        phone: localProfile.mobile,
        member: newMember,
      });
      if (result.user) setBackendUser(result.user);
      setNewMember({ full_name: "", email: "", phone: "" });
      setMemberFeedback({
        message: result.message,
        invitationSent: result.invitationSent,
      });
    } catch (error) {
      setMemberFeedback({
        message: error instanceof Error ? error.message : "Could not add team member.",
      });
    } finally {
      setIsAddingMember(false);
    }
  }

  async function handleResendInvitation(memberEmail: string) {
    if (!localProfile) return;

    setResendingEmail(memberEmail);
    setInviteFeedback((current) => ({ ...current, [memberEmail]: "" }));
    try {
      const result = await resendHackathonTeamInvitation({
        email: localProfile.email,
        phone: localProfile.mobile,
        member_email: memberEmail,
      });
      setInviteFeedback((current) => ({ ...current, [memberEmail]: result.message }));
    } catch (error) {
      setInviteFeedback((current) => ({
        ...current,
        [memberEmail]: error instanceof Error ? error.message : "Could not resend invitation.",
      }));
    } finally {
      setResendingEmail("");
    }
  }

  function startEditing(entry: { full_name: string; email: string; phone: string }) {
    setEditingTargetEmail(entry.email);
    setEditForm({
      full_name: entry.full_name || "",
      email: entry.email || "",
      phone: entry.phone || "",
    });
    setEditFeedback(null);
  }

  function cancelEditing() {
    setEditingTargetEmail(null);
    setEditFeedback(null);
  }

  async function handleUpdateMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!localProfile || !backendUser || !editingTargetEmail) return;

    setIsUpdatingMember(true);
    setEditFeedback(null);
    try {
      const result = await updateHackathonTeamMember({
        email: localProfile.email,
        phone: localProfile.mobile,
        target_email: editingTargetEmail,
        member: editForm,
      });

      if (result.user) {
        setBackendUser(result.user);

        // If the Team Lead edited their own profile, sync local storage & profile state
        if (editingTargetEmail.toLowerCase() === localProfile.email.toLowerCase()) {
          const updatedProfile: HackathonStudentProfile = {
            ...localProfile,
            name: editForm.full_name,
            email: editForm.email,
            mobile: editForm.phone,
          };
          saveHackathonStudentProfile(updatedProfile);
          setLocalProfile(updatedProfile);
        }
      }
      setEditingTargetEmail(null);
      toast.success(result.message || "Team member details updated successfully!");
    } catch (error) {
      setEditFeedback(error instanceof Error ? error.message : "Could not update team member details.");
    } finally {
      setIsUpdatingMember(false);
    }
  }

  const inputClass =
    "mt-1 h-10 w-full border sm:h-9 border-(--color-border) bg-white px-3 text-[13px] font-normal text-foreground outline-none transition focus:border-(--brand-accent)";

  return (
    <>
      <section className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-bold tracking-tight sm:text-2xl">{teamName}</h1>
          <p className="mt-1 text-[13px] text-(--color-text-secondary)">
            Team Lead: <span className="font-semibold text-foreground">{teamLead}</span> ·{" "}
            {allTeamEntries.length || 1} member{(allTeamEntries.length || 1) !== 1 ? "s" : ""}
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11.5px] font-semibold text-emerald-700">
          <ShieldCheck className="size-3.5" />
          Registered team
        </span>
      </section>

      {!loading && isCurrentUserTeamLead && (
        <section className="mt-5 rounded-lg border border-(--color-border) bg-white p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 className="text-[14px] font-semibold">Add a team member</h2>
              <p className="mt-0.5 text-[12px] text-(--color-text-muted)">
                Up to {MAX_TEAM_MEMBERS} people per team, including the Team Lead. They get an
                invitation email with a link to set their password and sign in.
              </p>
            </div>
            <span className="border border-(--color-border) bg-(--color-background-alt) px-2 py-0.5 text-[11px] font-semibold text-(--color-text-secondary)">
              {Math.max(0, MAX_TEAM_MEMBERS - members.length)} spots left
            </span>
          </div>

          {members.length < MAX_TEAM_MEMBERS ? (
            <form
              onSubmit={handleAddMember}
              className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_auto]"
            >
              <label className="text-xs font-semibold">
                Full name
                <input
                  required
                  value={newMember.full_name}
                  onChange={(event) =>
                    setNewMember((current) => ({ ...current, full_name: event.target.value }))
                  }
                  className={inputClass}
                  autoComplete="name"
                />
              </label>
              <label className="text-xs font-semibold">
                Email address
                <input
                  required
                  type="email"
                  value={newMember.email}
                  onChange={(event) =>
                    setNewMember((current) => ({ ...current, email: event.target.value }))
                  }
                  className={inputClass}
                  autoComplete="email"
                />
              </label>
              <label className="text-xs font-semibold">
                Mobile number
                <input
                  required
                  type="tel"
                  value={newMember.phone}
                  onChange={(event) =>
                    setNewMember((current) => ({ ...current, phone: event.target.value }))
                  }
                  className={inputClass}
                  autoComplete="tel"
                />
              </label>
              <button
                type="submit"
                disabled={isAddingMember}
                className="inline-flex h-10 items-center justify-center gap-1.5 self-end bg-(--brand-primary) px-4 sm:col-span-2 sm:h-9 xl:col-span-1 text-[13px] font-semibold text-white transition hover:bg-(--brand-primary-hover) disabled:cursor-not-allowed disabled:opacity-60"
              >
                <UserPlus className="size-3.5" />
                {isAddingMember ? "Adding..." : "Add member"}
              </button>
            </form>
          ) : (
            <p className="mt-3 text-[12.5px] text-(--color-text-secondary)">
              Your team has reached its {MAX_TEAM_MEMBERS}-member limit.
            </p>
          )}

          {memberFeedback && (
            <p
              role="status"
              className={`mt-2.5 text-[12.5px] ${
                memberFeedback.invitationSent === false
                  ? "text-amber-700"
                  : memberFeedback.invitationSent === undefined
                    ? "text-red-600"
                    : "text-emerald-700"
              }`}
            >
              {memberFeedback.message}
            </p>
          )}
        </section>
      )}

      <section className="mt-5 rounded-lg border border-(--color-border) bg-white">
        <div className="flex items-center justify-between gap-2 border-b border-(--color-border) px-4 py-3">
          <h2 className="text-[14px] font-semibold">Team Members & Lead</h2>
          <span className="text-[11.5px] font-medium text-(--color-text-muted)">
            {allTeamEntries.length} of {MAX_TEAM_MEMBERS}
          </span>
        </div>

        {loading ? (
          <p className="p-6 text-center text-[13px] text-(--color-text-secondary)">
            Loading team details...
          </p>
        ) : allTeamEntries.length > 0 ? (
          <ul className="divide-y divide-(--color-border)">
            {allTeamEntries.map((member, index) => {
              const memberName = member.full_name || `Team Member ${index + 1}`;
              const isEditing = editingTargetEmail?.toLowerCase() === member.email?.toLowerCase();

              if (isEditing) {
                return (
                  <li key={member.email || index} className="p-4 bg-slate-50/70">
                    <form onSubmit={handleUpdateMember} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                          Edit Member Details ({member.isLead ? "Team Lead" : "Team Member"})
                        </span>
                        <button
                          type="button"
                          onClick={cancelEditing}
                          className="text-slate-400 hover:text-slate-600 p-1"
                        >
                          <X className="size-4" />
                        </button>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-3">
                        <label className="text-xs font-semibold">
                          Full Name
                          <input
                            required
                            value={editForm.full_name}
                            onChange={(e) =>
                              setEditForm((prev) => ({ ...prev, full_name: e.target.value }))
                            }
                            className={inputClass}
                          />
                        </label>
                        <label className="text-xs font-semibold">
                          Email Address
                          <input
                            required
                            type="email"
                            value={editForm.email}
                            onChange={(e) =>
                              setEditForm((prev) => ({ ...prev, email: e.target.value }))
                            }
                            className={inputClass}
                          />
                        </label>
                        <label className="text-xs font-semibold">
                          Mobile Number
                          <input
                            required
                            type="tel"
                            value={editForm.phone}
                            onChange={(e) =>
                              setEditForm((prev) => ({ ...prev, phone: e.target.value }))
                            }
                            className={inputClass}
                          />
                        </label>
                      </div>

                      {editFeedback && (
                        <p className="text-[12px] text-red-600 font-medium">{editFeedback}</p>
                      )}

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={cancelEditing}
                          className="h-8 px-3 text-[12px] font-semibold border border-(--color-border) bg-white text-slate-700 hover:bg-slate-100 transition"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isUpdatingMember}
                          className="inline-flex h-8 items-center gap-1 px-3 text-[12px] font-semibold bg-(--brand-primary) text-white hover:bg-(--brand-primary-hover) disabled:opacity-60 transition"
                        >
                          <Check className="size-3.5" />
                          {isUpdatingMember ? "Saving..." : "Save Details"}
                        </button>
                      </div>
                    </form>
                  </li>
                );
              }

              return (
                <li
                  key={member.email || index}
                  className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-(--brand-accent-soft) text-[12px] font-semibold text-(--brand-accent)">
                      {memberName.charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="flex min-w-0 items-center gap-1.5 text-[13.5px] font-semibold">
                        <span className="truncate">{memberName}</span>
                        {member.isLead && (
                          <span className="bg-(--brand-accent-soft) px-1.5 py-0.5 text-[10px] font-semibold text-(--brand-accent) rounded">
                            Team Lead
                          </span>
                        )}
                      </p>
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11.5px] text-(--color-text-muted)">
                        {member.email && (
                          <span className="inline-flex min-w-0 items-center gap-1">
                            <Mail className="size-3 shrink-0 text-slate-400" />
                            <span className="truncate">{member.email}</span>
                          </span>
                        )}
                        {member.phone && (
                          <span className="inline-flex items-center gap-1">
                            <Phone className="size-3 shrink-0 text-slate-400" />
                            {member.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    {member.email && isCurrentUserTeamLead && (
                      <button
                        type="button"
                        onClick={() => startEditing(member)}
                        className="inline-flex h-8 items-center gap-1.5 border border-(--color-border) bg-white px-2.5 text-[12px] font-semibold text-slate-700 transition-colors hover:border-(--brand-accent) hover:text-(--brand-accent)"
                      >
                        <Pencil className="size-3.5" />
                        Edit details
                      </button>
                    )}

                    {member.email && isCurrentUserTeamLead && !member.isLead && (
                      <div>
                        <button
                          type="button"
                          onClick={() => handleResendInvitation(member.email)}
                          disabled={resendingEmail === member.email}
                          className="inline-flex h-8 items-center gap-1.5 border border-(--color-border) bg-white px-2.5 text-[12px] font-semibold text-(--color-text-secondary) transition-colors hover:border-(--brand-accent) hover:text-(--brand-accent) disabled:opacity-60"
                        >
                          <Send className="size-3.5" />
                          {resendingEmail === member.email ? "Sending..." : "Resend invite"}
                        </button>
                        {inviteFeedback[member.email] && (
                          <p role="status" className="mt-1 text-[11px] text-(--color-text-muted)">
                            {inviteFeedback[member.email]}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="p-8 text-center">
            <Users className="mx-auto size-7 text-(--color-text-muted)" />
            <p className="mt-2 text-[13.5px] font-semibold">No team members found</p>
            <p className="mt-0.5 text-[12.5px] text-(--color-text-secondary)">
              Team member details are not available yet.
            </p>
          </div>
        )}
      </section>
    </>
  );
}
