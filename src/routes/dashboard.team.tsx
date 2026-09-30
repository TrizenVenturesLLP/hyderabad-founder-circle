import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Mail, Phone, Send, ShieldCheck, UserPlus, Users } from "lucide-react";

import { getHackathonStudentProfile } from "@/lib/hackathon-storage";
import {
  addHackathonTeamMember,
  getHackathonUserDetails,
  resendHackathonTeamInvitation,
} from "@/lib/hackathon-api";

export const Route = createFileRoute("/dashboard/team")({
  component: TeamPage,
});

function TeamPage() {
  const [backendUser, setBackendUser] = useState<any>(null);
  const [localProfile, setLocalProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newMember, setNewMember] = useState({ full_name: "", email: "", phone: "" });
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [memberFeedback, setMemberFeedback] = useState<{
    message: string;
    invitationSent?: boolean;
  } | null>(null);
  const [resendingEmail, setResendingEmail] = useState("");
  const [inviteFeedback, setInviteFeedback] = useState<Record<string, string>>({});

  useEffect(() => {
    const profile = getHackathonStudentProfile();
    setLocalProfile(profile);

    if (profile?.email && profile?.mobile) {
      getHackathonUserDetails({
        email: profile.email,
        phone: profile.mobile,
      })
        .then((res) => {
          console.log("Fetched User Data from /user:", res.user);

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

  async function handleAddMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!localProfile || !backendUser || members.length >= 4) return;

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

  return (
    <>
      {/* Back */}
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#5b52e8] hover:underline"
      >
        <ArrowLeft className="size-4" />
        Back to Dashboard
      </Link>

      {/* Team Overview */}
      <section className="mt-4 rounded-2xl border border-[#dddafa] bg-white p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-[#f0efff] text-[#5b52e8]">
              <Users className="size-8" />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#5b52e8]">
                Hackathon Team
              </p>

              <h2 className="mt-1 text-2xl font-bold text-[#151934]">{teamName}</h2>

              <p className="mt-1 text-sm text-[#707792]">
                {members.length || 1} team member
                {(members.length || 1) !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-[#eef9f2] px-3 py-2 text-xs font-semibold text-[#23844b]">
            <ShieldCheck className="size-4" />
            Registered Team
          </div>
        </div>
      </section>

      {/* Team Lead */}
      <section className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#7c82a1]">Team Lead</p>

        <div className="mt-3 rounded-2xl border border-[#e1e3eb] bg-white p-5">
          <div className="flex items-center gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#eeeeff] text-lg font-bold text-[#5b52e8]">
              {teamLead.charAt(0).toUpperCase()}
            </div>

            <div className="flex-1">
              <p className="font-semibold text-[#151934]">{teamLead}</p>

              <p className="mt-1 text-xs text-[#7c82a1]">Team Lead</p>
            </div>

            <ShieldCheck className="size-5 text-[#5b52e8]" />
          </div>
        </div>
      </section>

      {/* Team Members */}
      <section className="mt-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#7c82a1]">
              Team Members
            </p>

            <h2 className="mt-1 text-2xl font-bold text-[#151934]">Your Team</h2>
          </div>

          <span className="rounded-full bg-[#f1f0ff] px-3 py-1.5 text-xs font-semibold text-[#5b52e8]">
            {members.length} Members
          </span>
        </div>

        {!loading && isCurrentUserTeamLead && (
          <div className="mt-4 rounded-xl border border-[#e1e3eb] bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-[#151934]">Add a team member</h3>
                <p className="mt-1 text-xs text-[#7c82a1]">
                  Up to four people per team, including the team lead.
                </p>
              </div>
              <span className="text-xs text-[#7c82a1]">
                {Math.max(0, 4 - members.length)} spots left
              </span>
            </div>

            {members.length < 4 ? (
              <form onSubmit={handleAddMember} className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <label className="text-xs font-medium text-[#59617a]">
                  Full name
                  <input
                    required
                    value={newMember.full_name}
                    onChange={(event) =>
                      setNewMember((current) => ({ ...current, full_name: event.target.value }))
                    }
                    className="mt-1.5 h-10 w-full rounded-md border border-[#dfe2eb] px-3 text-sm text-[#151934] outline-none focus:border-[#5b52e8]"
                    autoComplete="name"
                  />
                </label>
                <label className="text-xs font-medium text-[#59617a]">
                  Email address
                  <input
                    required
                    type="email"
                    value={newMember.email}
                    onChange={(event) =>
                      setNewMember((current) => ({ ...current, email: event.target.value }))
                    }
                    className="mt-1.5 h-10 w-full rounded-md border border-[#dfe2eb] px-3 text-sm text-[#151934] outline-none focus:border-[#5b52e8]"
                    autoComplete="email"
                  />
                </label>
                <label className="text-xs font-medium text-[#59617a]">
                  Mobile number
                  <input
                    required
                    type="tel"
                    value={newMember.phone}
                    onChange={(event) =>
                      setNewMember((current) => ({ ...current, phone: event.target.value }))
                    }
                    className="mt-1.5 h-10 w-full rounded-md border border-[#dfe2eb] px-3 text-sm text-[#151934] outline-none focus:border-[#5b52e8]"
                    autoComplete="tel"
                  />
                </label>
                <button
                  type="submit"
                  disabled={isAddingMember}
                  className="inline-flex h-10 items-center justify-center gap-2 self-end rounded-md bg-[#30286f] px-4 text-sm font-semibold text-white hover:bg-[#25205c] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <UserPlus className="size-4" />
                  {isAddingMember ? "Adding..." : "Add member"}
                </button>
              </form>
            ) : (
              <p className="mt-4 text-sm text-[#707792]">Your team has reached its four-member limit.</p>
            )}

            {memberFeedback && (
              <p
                role="status"
                className={`mt-3 text-sm ${
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
          </div>
        )}

        {loading ? (
          <div className="mt-4 rounded-2xl border border-[#e1e3eb] bg-white p-8 text-center text-sm text-[#707792]">
            Loading team details...
          </div>
        ) : members.length > 0 ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {members.map((member: any, index: number) => {
              const memberName = member.full_name || member.name || `Team Member ${index + 1}`;
              const isTeamLead =
                member.role === "lead" ||
                member.email?.toLowerCase() === backendUser?.email?.toLowerCase();

              return (
                <div
                  key={member.id || member.email || index}
                  className="rounded-2xl border border-[#e1e3eb] bg-white p-5 transition hover:border-[#c9c5f4] hover:shadow-sm"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#f1f0ff] font-bold text-[#5b52e8]">
                      {memberName.charAt(0).toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <p className="font-semibold text-[#151934]">{memberName}</p>

                      <p className="mt-1 text-xs text-[#7c82a1]">
                        {isTeamLead ? "Team Lead" : "Team Member"}
                      </p>

                      {member.email && (
                        <>
                          <div className="mt-3 flex items-center gap-2 text-xs text-[#707792]">
                            <Mail className="size-3.5" />
                            <span className="truncate">{member.email}</span>
                          </div>
                          {isCurrentUserTeamLead && !isTeamLead && (
                            <button
                              type="button"
                              onClick={() => handleResendInvitation(member.email)}
                              disabled={resendingEmail === member.email}
                              className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#5b52e8] hover:underline disabled:opacity-60"
                            >
                              <Send className="size-3.5" />
                              {resendingEmail === member.email ? "Sending..." : "Resend invite"}
                            </button>
                          )}
                          {inviteFeedback[member.email] && (
                            <p role="status" className="mt-2 text-xs text-[#707792]">
                              {inviteFeedback[member.email]}
                            </p>
                          )}
                        </>
                      )}

                      {(member.mobile || member.phone) && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-[#707792]">
                          <Phone className="size-3.5" />
                          <span>{member.mobile || member.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed border-[#d9dce7] bg-white p-10 text-center">
            <Users className="mx-auto size-9 text-[#a2a7bb]" />

            <h3 className="mt-3 font-semibold text-[#151934]">No team members found</h3>

            <p className="mt-1 text-sm text-[#707792]">
              Team member details are not available yet.
            </p>
          </div>
        )}
      </section>
    </>
  );
}
