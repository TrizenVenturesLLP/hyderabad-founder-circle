import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
  type InputHTMLAttributes,
} from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Mail, Phone, UserRound, Users } from "lucide-react";
import {
  loginHackathonStudent,
  registerHackathonStudent,
  type HackathonTeamMemberPayload,
} from "@/lib/hackathon-api";
import { getHackathonStudentProfile, saveHackathonStudentProfile } from "@/lib/hackathon-storage";

export const Route = createFileRoute("/hackathon/register")({
  component: HackathonRegistrationPage,
});

type Step = "register" | "login";

type TeamMember = {
  name: string;
  mobile: string;
  email: string;
};

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  icon: typeof UserRound;
  label: string;
};

function HackathonRegistrationPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>(() => {
    if (typeof window === "undefined") {
      return "register";
    }

    const search = new URLSearchParams(window.location.search);
    const invitedEmail = search.get("email")?.trim().toLowerCase();
    return search.get("mode") === "login" && invitedEmail ? "login" : "register";
  });

  const [teamName, setTeamName] = useState("");

  const [lead, setLead] = useState<TeamMember>({
    name: "",
    mobile: "",
    email: "",
  });

  const [members, setMembers] = useState<TeamMember[]>([]);

  const [login, setLogin] = useState({
    mobile: "",
    email: "",
  });

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInvitation, setIsInvitation] = useState(false);

  useEffect(() => {
    const existingProfile = getHackathonStudentProfile();
    if (existingProfile) {
      setLogin({
        mobile: existingProfile.mobile,
        email: existingProfile.email ?? "",
      });
      setStep("login");
    }

    const search = new URLSearchParams(window.location.search);
    const invitedEmail = search.get("email")?.trim().toLowerCase();
    if (search.get("mode") === "login" && invitedEmail) {
      setIsInvitation(true);
      setStep("login");
      setLogin({ mobile: "", email: invitedEmail });
    }
  }, []);

  function updateLead(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    setLead((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function updateMember(index: number, event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    setMembers((current) =>
      current.map((member, memberIndex) =>
        memberIndex === index
          ? {
              ...member,
              [name]: value,
            }
          : member,
      ),
    );
  }

  function addMember() {
    if (members.length >= 3) return;

    setMembers((current) => [
      ...current,
      {
        name: "",
        mobile: "",
        email: "",
      },
    ]);
  }

  function removeMember(index: number) {
    setMembers((current) => current.filter((_, memberIndex) => memberIndex !== index));
  }

  function updateLogin(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    setLogin((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleRegistration(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccessMessage("");

    if (!teamName.trim()) {
      setError("Please enter your team name.");
      return;
    }

    if (!lead.name.trim() || !lead.mobile.trim() || !lead.email.trim()) {
      setError("Please enter all Team Lead details.");
      return;
    }

    if (!/^\+?[0-9\s()-]{10,}$/.test(lead.mobile.trim())) {
      setError("Please enter a valid Team Lead mobile number.");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(lead.email.trim())) {
      setError("Please enter a valid Team Lead email address.");
      return;
    }

    for (let i = 0; i < members.length; i++) {
      const member = members[i];

      if (!member.name.trim() || !member.mobile.trim() || !member.email.trim()) {
        setError(`Please complete all details for Member ${i + 1}.`);
        return;
      }

      if (!/^\+?[0-9\s()-]{10,}$/.test(member.mobile.trim())) {
        setError(`Please enter a valid mobile number for Member ${i + 1}.`);
        return;
      }

      if (!/^\S+@\S+\.\S+$/.test(member.email.trim())) {
        setError(`Please enter a valid email for Member ${i + 1}.`);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const profile = {
        name: lead.name.trim(),
        mobile: lead.mobile.trim(),
        email: lead.email.trim().toLowerCase(),
      };
      const teamMembers: HackathonTeamMemberPayload[] = [
        {
          full_name: profile.name,
          email: profile.email,
          phone: profile.mobile,
          role: "lead",
        },
        ...members.map((member) => ({
          full_name: member.name.trim(),
          email: member.email.trim().toLowerCase(),
          phone: member.mobile.trim(),
          role: "member" as const,
        })),
      ];

      const response = await registerHackathonStudent({
        team_name: teamName.trim(),
        lead_name: profile.name,
        email: profile.email,
        phone: profile.mobile,
        members: teamMembers,
      });

      saveHackathonStudentProfile(profile);

      setLogin({
        mobile: profile.mobile,
        email: profile.email,
      });

      setStep("login");

      setSuccessMessage(response.message || "Registration is successful");
    } catch (registrationError) {
      setError(
        registrationError instanceof Error
          ? registrationError.message
          : "Registration failed. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccessMessage("");

    if (!login.email.trim() || !login.mobile.trim()) {
      setError("Please enter your registered email and mobile number.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await loginHackathonStudent({
        email: login.email.trim().toLowerCase(),
        phone: login.mobile.trim(),
      });
      saveHackathonStudentProfile({
        name: response.profile?.name || "Participant",
        email: response.profile?.email || login.email.trim().toLowerCase(),
        mobile: response.profile?.phone || login.mobile.trim(),
      });

      void navigate({ to: "/dashboard", replace: true });
    } catch (loginError) {
      setError(
        loginError instanceof Error ? loginError.message : "Login failed. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background py-10 md:py-14">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Link
          to="/hackathon"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="size-4" />
          Back to Hackathon
        </Link>

        <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-xs sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            AI HACK X MRDU 2026
          </p>

          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {step === "register" ? "Register Your Team" : "Student Login"}
          </h1>

          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {step === "register"
              ? "Register your team and add your team members."
              : isInvitation
                ? "You have been added to a team. Verify your mobile number to open your team dashboard."
                : "Verify your registered details to continue to your dashboard."}
          </p>

          {step === "register" ? (
            <form onSubmit={handleRegistration} className="mt-8 space-y-8">
              {/* Team Details */}
              <section>
                <div className="mb-4 flex items-center gap-2">
                  <Users className="size-5 text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">Team Details</h2>
                </div>

                <div>
                  <Field
                    icon={Users}
                    label="Team name"
                    name="teamName"
                    value={teamName}
                    onChange={(event) => setTeamName(event.target.value)}
                    placeholder="Enter your team name"
                  />
                </div>
              </section>

              {/* Team Lead */}
              <section>
                <h2 className="mb-4 text-lg font-semibold text-foreground">Team Lead</h2>

                <div className="space-y-5">
                  <Field
                    icon={UserRound}
                    label="Full name"
                    name="name"
                    value={lead.name}
                    onChange={updateLead}
                    placeholder="Enter Team Lead name"
                  />

                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field
                      icon={Phone}
                      label="Mobile number"
                      name="mobile"
                      value={lead.mobile}
                      onChange={updateLead}
                      placeholder="Enter mobile number"
                      type="tel"
                    />

                    <Field
                      icon={Mail}
                      label="Email address"
                      name="email"
                      value={lead.email}
                      onChange={updateLead}
                      placeholder="Enter email address"
                      type="email"
                    />
                  </div>
                </div>
              </section>

              {/* Team Members */}
              <section>
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">Team Members</h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Add up to 3 additional members.
                    </p>
                  </div>

                  <span className="text-xs font-medium text-muted-foreground">
                    {members.length + 1}/4 members
                  </span>
                </div>

                <div className="space-y-5">
                  {members.map((member, index) => (
                    <div key={index} className="rounded-xl border border-border bg-background p-4">
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-foreground">
                          Member {index + 1}
                        </h3>

                        <button
                          type="button"
                          onClick={() => removeMember(index)}
                          className="text-xs font-medium text-destructive hover:underline"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="space-y-5">
                        <Field
                          icon={UserRound}
                          label="Full name"
                          name="name"
                          value={member.name}
                          onChange={(event) => updateMember(index, event)}
                          placeholder="Enter member name"
                        />

                        <div className="grid gap-5 sm:grid-cols-2">
                          <Field
                            icon={Phone}
                            label="Mobile number"
                            name="mobile"
                            value={member.mobile}
                            onChange={(event) => updateMember(index, event)}
                            placeholder="Enter mobile number"
                            type="tel"
                          />

                          <Field
                            icon={Mail}
                            label="Email address"
                            name="email"
                            value={member.email}
                            onChange={(event) => updateMember(index, event)}
                            placeholder="Enter email address"
                            type="email"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {members.length < 3 && (
                  <button
                    type="button"
                    onClick={addMember}
                    className="mt-4 w-full rounded-xl border border-dashed border-primary/40 px-5 py-3 text-sm font-semibold text-primary transition hover:bg-primary/5"
                  >
                    + Add Team Member
                  </button>
                )}
              </section>

              <FormError message={error} />

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-95 disabled:cursor-wait disabled:opacity-70"
              >
                {isSubmitting ? "Registering..." : "Register Team"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setError("");
                  setSuccessMessage("");
                  setStep("login");
                }}
                className="w-full text-sm font-medium text-primary hover:underline"
              >
                Already registered? Login
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="mt-8 space-y-5">
              <Field
                icon={Phone}
                label="Registered mobile number"
                name="mobile"
                value={login.mobile}
                onChange={updateLogin}
                placeholder="Enter your registered mobile"
                type="tel"
              />

              <Field
                icon={Mail}
                label="Registered email address"
                name="email"
                value={login.email}
                onChange={updateLogin}
                placeholder="Enter your registered email"
                type="email"
              />

              <FormError message={error} />
              <FormSuccess message={successMessage} />

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-95 disabled:cursor-wait disabled:opacity-70"
              >
                {isSubmitting ? "Signing in..." : "Login and Open Dashboard"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setError("");
                  setSuccessMessage("");
                  setStep("register");
                }}
                className="w-full text-sm font-medium text-primary hover:underline"
              >
                Register a new team
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ icon: Icon, label, ...props }: FieldProps) {
  return (
    <label className="block text-sm font-semibold text-foreground">
      {label}

      <span className="relative mt-2 block">
        <Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

        <input
          {...props}
          className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-sm font-normal outline-none transition focus:border-primary"
        />
      </span>
    </label>
  );
}

function FormError({ message }: { message: string }) {
  return message ? (
    <p className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
      {message}
    </p>
  ) : null;
}

function FormSuccess({ message }: { message: string }) {
  return message ? (
    <p className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-700">
      {message}
    </p>
  ) : null;
}
