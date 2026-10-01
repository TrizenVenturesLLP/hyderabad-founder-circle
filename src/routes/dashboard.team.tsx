import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Mail, Phone, Send, ShieldCheck, UserPlus, Users } from "lucide-react";

import { getHackathonStudentProfile } from "@/lib/hackathon-storage";
import {
  addHackathonTeamMember,
  getHackathonUserDetails,
  resendHackathonTeamInvitation,
  type HackathonRegisteredUser,
} from "@/lib/hackathon-api";
import type { HackathonStudentProfile } from "@/lib/hackathon";

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

  const inputClass =
    "mt-1 h-9 w-full border border-(--color-border) bg-white px-3 text-[13px] font-normal text-foreground outline-none transition focus:border-(--brand-accent)";

  return (
    <>
      <section className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-(--brand-accent) hover:underline"
          >
            <ArrowLeft className="size-3.5" />
            Overview
          </Link>
          <h1 className="mt-2 font-display text-xl font-bold tracking-tight sm:text-2xl">
            {teamName}
          </h1>
          <p className="mt-1 text-[13px] text-(--color-text-secondary)">
            Team Lead: <span className="font-semibold text-foreground">{teamLead}</span> ·{" "}
            {members.length || 1} member{(members.length || 1) !== 1 ? "s" : ""}
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
                Up to four people per team, including the Team Lead. They get an email letting them
                know they&apos;ve joined.
              </p>
            </div>
            <span className="border border-(--color-border) bg-(--color-background-alt) px-2 py-0.5 text-[11px] font-semibold text-(--color-text-secondary)">
              {Math.max(0, 4 - members.length)} spots left
            </span>
          </div>

          {members.length < 4 ? (
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
                className="inline-flex h-9 items-center justify-center gap-1.5 self-end bg-(--brand-primary) px-4 text-[13px] font-semibold text-white transition hover:bg-(--brand-primary-hover) disabled:cursor-not-allowed disabled:opacity-60"
              >
                <UserPlus className="size-3.5" />
                {isAddingMember ? "Adding..." : "Add member"}
              </button>
            </form>
          ) : (
            <p className="mt-3 text-[12.5px] text-(--color-text-secondary)">
              Your team has reached its four-member limit.
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
          <h2 className="text-[14px] font-semibold">Members</h2>
          <span className="text-[11.5px] font-medium text-(--color-text-muted)">
            {members.length} of 4
          </span>
        </div>

        {loading ? (
          <p className="p-6 text-center text-[13px] text-(--color-text-secondary)">
            Loading team details...
          </p>
        ) : members.length > 0 ? (
          <ul className="divide-y divide-(--color-border)">
            {members.map((member, index) => {
              const memberName = member.full_name || `Team Member ${index + 1}`;
              const isTeamLead =
                member.role === "lead" ||
                member.email?.toLowerCase() === backendUser?.email?.toLowerCase();

              return (
                <li
                  key={member.email || index}
                  className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-(--brand-accent-soft) text-[12px] font-semibold text-(--brand-accent)">
                      {memberName.charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 truncate text-[13.5px] font-semibold">
                        {memberName}
                        {isTeamLead && (
                          <span className="bg-(--brand-accent-soft) px-1.5 py-0.5 text-[10px] font-semibold text-(--brand-accent)">
                            Lead
                          </span>
                        )}
                      </p>
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11.5px] text-(--color-text-muted)">
                        {member.email && (
                          <span className="inline-flex min-w-0 items-center gap-1">
                            <Mail className="size-3 shrink-0" />
                            <span className="truncate">{member.email}</span>
                          </span>
                        )}
                        {member.phone && (
                          <span className="inline-flex items-center gap-1">
                            <Phone className="size-3 shrink-0" />
                            {member.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {member.email && isCurrentUserTeamLead && !isTeamLead && (
                    <div className="text-right">
                      <button
                        type="button"
                        onClick={() => handleResendInvitation(member.email)}
                        disabled={resendingEmail === member.email}
                        className="inline-flex h-8 items-center gap-1.5 border border-(--color-border) px-2.5 text-[12px] font-semibold text-(--color-text-secondary) transition-colors hover:border-(--brand-accent) hover:text-(--brand-accent) disabled:opacity-60"
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
