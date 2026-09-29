import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Mail, Phone, ShieldCheck, Users } from "lucide-react";

import { getHackathonStudentProfile } from "@/lib/hackathon-storage";
import { getHackathonUserDetails } from "@/lib/hackathon-api";

export const Route = createFileRoute("/dashboard/team")({
  component: TeamPage,
});

function TeamPage() {
  const [backendUser, setBackendUser] = useState<any>(null);
  const [localProfile, setLocalProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

        {loading ? (
          <div className="mt-4 rounded-2xl border border-[#e1e3eb] bg-white p-8 text-center text-sm text-[#707792]">
            Loading team details...
          </div>
        ) : members.length > 0 ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {members.map((member: any, index: number) => {
              const memberName = member.full_name || member.name || `Team Member ${index + 1}`;

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

                      <p className="mt-1 text-xs text-[#7c82a1]">Team Member</p>

                      {member.email && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-[#707792]">
                          <Mail className="size-3.5" />
                          <span className="truncate">{member.email}</span>
                        </div>
                      )}

                      {member.mobile && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-[#707792]">
                          <Phone className="size-3.5" />
                          <span>{member.mobile}</span>
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
