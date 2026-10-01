import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
  type InputHTMLAttributes,
} from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  CalendarDays,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  MapPin,
  Phone,
  Trophy,
  UserRound,
  Users,
} from "lucide-react";
import { POSTER_HACKATHON_DETAILS } from "@/lib/hackathon-data";
import {
  HackathonApiError,
  loginHackathonStudent,
  registerHackathonStudent,
  requestHackathonPasswordLink,
  type HackathonTeamMemberPayload,
} from "@/lib/hackathon-api";
import {
  getHackathonDetails,
  getHackathonStudentProfile,
  saveHackathonStudentProfile,
} from "@/lib/hackathon-storage";

export const Route = createFileRoute("/hackathon/register")({
  component: HackathonRegistrationPage,
});

type Step = "register" | "login" | "reset";

const stepCopy: Record<Step, { eyebrow: string; title: string }> = {
  register: { eyebrow: "Team registration", title: "Register Your Team" },
  login: { eyebrow: "Team sign in", title: "Sign in to your team" },
  reset: { eyebrow: "Team password", title: "Reset your password" },
};

type TeamMember = {
  name: string;
  mobile: string;
  email: string;
};

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  icon: typeof UserRound;
  label: string;
  containerClassName?: string;
};

const registrationSteps = [
  "Register your team. The Team Lead and every member get an email.",
  "Everyone sets a password from the link in their email and signs in.",
  "The Team Lead confirms one problem statement and submits the project.",
];

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

  const [details, setDetails] = useState(POSTER_HACKATHON_DETAILS);
  const [teamName, setTeamName] = useState("");

  const [lead, setLead] = useState<TeamMember>({
    name: "",
    mobile: "",
    email: "",
  });

  const [members, setMembers] = useState<TeamMember[]>([]);

  const [login, setLogin] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInvitation, setIsInvitation] = useState(false);
  const [passwordNotSet, setPasswordNotSet] = useState(false);
  const [linkStatus, setLinkStatus] = useState<{ tone: "success" | "error"; text: string } | null>(
    null,
  );
  const [isSendingLink, setIsSendingLink] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  useEffect(() => {
    setDetails(getHackathonDetails());
    const existingProfile = getHackathonStudentProfile();
    if (existingProfile) {
      setLogin({ email: existingProfile.email ?? "", password: "" });
      setStep("login");
    }

    const search = new URLSearchParams(window.location.search);
    const invitedEmail = search.get("email")?.trim().toLowerCase();
    if (search.get("mode") === "login" && invitedEmail) {
      setStep("login");
      setLogin({ email: invitedEmail, password: "" });
      if (search.get("passwordSet") === "1") {
        setSuccessMessage("Your password is set. Sign in to continue.");
      } else {
        setIsInvitation(true);
      }
    }
  }, []);

  function openReset() {
    setResetEmail(login.email);
    setLinkStatus(null);
    setError("");
    setSuccessMessage("");
    setStep("reset");
  }

  function backToLogin() {
    setLinkStatus(null);
    setStep("login");
  }

  async function handleSendLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = resetEmail.trim().toLowerCase();
    setLinkStatus(null);
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setLinkStatus({ tone: "error", text: "Please enter a valid email address." });
      return;
    }

    setIsSendingLink(true);
    try {
      const response = await requestHackathonPasswordLink(email);
      setLinkStatus({ tone: "success", text: response.message });
    } catch (linkError) {
      setLinkStatus({
        tone: "error",
        text: linkError instanceof Error ? linkError.message : "Could not send the link.",
      });
    } finally {
      setIsSendingLink(false);
    }
  }

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

      setLogin({ email: profile.email, password: "" });
      setIsInvitation(false);
      setPasswordNotSet(true);
      setLinkStatus(null);
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
    setLinkStatus(null);

    if (!login.email.trim() || !login.password) {
      setError("Please enter your registered email and password.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await loginHackathonStudent({
        email: login.email.trim().toLowerCase(),
        password: login.password,
      });
      saveHackathonStudentProfile({
        name: response.profile?.name || "Participant",
        email: response.profile?.email || login.email.trim().toLowerCase(),
        mobile: response.profile?.phone || "",
      });

      void navigate({ to: "/dashboard", replace: true });
    } catch (loginError) {
      const notSet =
        loginError instanceof HackathonApiError && loginError.code === "PASSWORD_NOT_SET";
      setPasswordNotSet(notSet);
      setError(
        loginError instanceof Error ? loginError.message : "Login failed. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const facts = [
    { label: "Dates", value: details.venue.dateLabel, Icon: CalendarDays },
    { label: "Venue", value: details.venue.name, Icon: MapPin },
    { label: "Team size", value: details.venue.teamSize, Icon: Users },
    { label: "Prize pool", value: details.prizePool, Icon: Trophy },
  ];
  const helpContact = details.coordinators.find(
    (person) => person.type === "student" && person.phone,
  );

  return (
    <div className="min-h-dvh bg-background lg:grid lg:h-dvh lg:grid-cols-2 lg:overflow-hidden">
      <aside className="relative overflow-hidden bg-(--brand-primary) text-white lg:h-dvh">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 100% 0%, color-mix(in oklab, var(--brand-accent) 35%, transparent) 0%, transparent 60%)",
          }}
        />

        <div className="relative flex h-full flex-col px-5 py-5 sm:px-8 lg:px-10 lg:py-8">
          <Link
            to="/hackathon"
            className="inline-flex h-9 w-fit items-center gap-1.5 rounded-md border border-white/20 bg-white/5 px-3 text-[13px] font-semibold text-white transition-colors hover:bg-white/10"
          >
            <ArrowLeft className="size-4" />
            Back to Hackathon
          </Link>

          <div className="mt-6 lg:mt-auto">
            <span className="inline-flex rounded-md border border-white/20 bg-white/10 px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider">
              {details.durationBadge}
            </span>
            <h2 className="mt-3 font-display text-2xl font-bold tracking-tight sm:text-3xl">
              {details.title} 2026
            </h2>
            <p className="mt-1 text-[13px] font-semibold uppercase tracking-wider text-indigo-200">
              {details.tagline}
            </p>
            <p className="mt-2 text-[12.5px] leading-5 text-white/70">
              {details.department} · {details.school}
            </p>
          </div>

          <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-white/15 pt-5 sm:grid-cols-4 lg:grid-cols-2">
            {facts.map(({ label, value, Icon }) => (
              <div key={label} className="flex items-start gap-2">
                <Icon className="mt-0.5 size-3.5 shrink-0 text-indigo-200" />
                <div className="min-w-0">
                  <dt className="text-[10.5px] font-medium uppercase tracking-wider text-white/55">
                    {label}
                  </dt>
                  <dd className="text-[13px] font-semibold leading-5">{value}</dd>
                </div>
              </div>
            ))}
          </dl>

          <div className="mt-6 hidden border-t border-white/15 pt-5 lg:block">
            <p className="text-[10.5px] font-semibold uppercase tracking-wider text-white/55">
              How it works
            </p>
            <ol className="mt-3 space-y-2.5">
              {registrationSteps.map((item, index) => (
                <li key={item} className="flex items-start gap-2.5 text-[13px] text-white/85">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-white/10 text-[11px] font-semibold">
                    {index + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ol>
          </div>

          {helpContact && (
            <p className="mt-6 hidden text-[12px] text-white/60 lg:mt-auto lg:block lg:pt-6">
              Need help? Call {helpContact.name} at{" "}
              <a
                href={`tel:${helpContact.phone?.replace(/\s+/g, "")}`}
                className="font-semibold text-white hover:underline"
              >
                {helpContact.phone}
              </a>
            </p>
          )}
        </div>
      </aside>

      <main className="flex justify-center px-4 py-6 sm:px-8 lg:h-dvh lg:overflow-y-auto lg:py-8">
        <div className={`my-auto w-full ${step === "register" ? "max-w-md" : "max-w-[340px]"}`}>
          <p className="text-[10.5px] font-semibold uppercase tracking-wider text-primary">
            {stepCopy[step].eyebrow}
          </p>

          <h1 className="mt-1 font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            {stepCopy[step].title}
          </h1>

          <p className="mt-1 text-[13px] leading-5 text-muted-foreground">
            {step === "register"
              ? "Register your team and add your team members."
              : step === "reset"
                ? "Enter your registered email. We'll send you a link to set a new password. It works once and expires in 10 minutes."
                : isInvitation
                  ? "You've been added to a team. Set your password from the invitation email, then sign in."
                  : "Team Leads and team members sign in with their registered email and password."}
          </p>

          {step === "reset" ? (
            <form onSubmit={handleSendLink} className="mt-5 space-y-3.5">
              <Field
                icon={Mail}
                label="Email address"
                name="resetEmail"
                value={resetEmail}
                onChange={(event) => setResetEmail(event.target.value)}
                placeholder="Enter your registered email"
                type="email"
                autoComplete="email"
                autoFocus
              />

              {linkStatus?.tone === "error" && <FormError message={linkStatus.text} />}
              {linkStatus?.tone === "success" && <FormSuccess message={linkStatus.text} />}

              <button
                type="submit"
                disabled={isSendingLink}
                className="h-10 w-full bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-95 disabled:cursor-wait disabled:opacity-70"
              >
                {isSendingLink ? "Sending link..." : "Send link"}
              </button>

              <button
                type="button"
                onClick={backToLogin}
                className="inline-flex w-full items-center justify-center gap-1.5 text-[13px] font-medium text-primary hover:underline"
              >
                <ArrowLeft className="size-3.5" />
                Back to sign in
              </button>
            </form>
          ) : step === "register" ? (
            <form onSubmit={handleRegistration} className="mt-5 space-y-5">
              {/* Team Details */}
              <section>
                <div className="mb-2.5 flex items-center gap-1.5">
                  <Users className="size-4 text-primary" />
                  <h2 className="text-sm font-semibold text-foreground">Team Details</h2>
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
                <h2 className="mb-2.5 text-sm font-semibold text-foreground">Team Lead</h2>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Field
                    icon={UserRound}
                    label="Full name"
                    containerClassName="sm:col-span-2"
                    name="name"
                    value={lead.name}
                    onChange={updateLead}
                    placeholder="Team Lead name"
                  />
                  <Field
                    icon={Phone}
                    label="Mobile number"
                    name="mobile"
                    value={lead.mobile}
                    onChange={updateLead}
                    placeholder="Mobile number"
                    type="tel"
                  />
                  <Field
                    icon={Mail}
                    label="Email address"
                    name="email"
                    value={lead.email}
                    onChange={updateLead}
                    placeholder="Email address"
                    type="email"
                  />
                </div>
              </section>

              {/* Team Members */}
              <section>
                <div className="mb-2.5 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-sm font-semibold text-foreground">Team Members</h2>
                    <p className="text-[11.5px] text-muted-foreground">
                      Add up to 3 additional members.
                    </p>
                  </div>

                  <span className="text-[11.5px] font-medium text-muted-foreground">
                    {members.length + 1}/4 members
                  </span>
                </div>

                <div className="space-y-2.5">
                  {members.map((member, index) => (
                    <div key={index} className="rounded-md border border-border bg-background p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <h3 className="text-xs font-semibold text-foreground">
                          Member {index + 1}
                        </h3>

                        <button
                          type="button"
                          onClick={() => removeMember(index)}
                          className="text-[11.5px] font-medium text-destructive hover:underline"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <Field
                          icon={UserRound}
                          label="Full name"
                          containerClassName="sm:col-span-2"
                          name="name"
                          value={member.name}
                          onChange={(event) => updateMember(index, event)}
                          placeholder="Member name"
                        />
                        <Field
                          icon={Phone}
                          label="Mobile number"
                          name="mobile"
                          value={member.mobile}
                          onChange={(event) => updateMember(index, event)}
                          placeholder="Mobile number"
                          type="tel"
                        />
                        <Field
                          icon={Mail}
                          label="Email address"
                          name="email"
                          value={member.email}
                          onChange={(event) => updateMember(index, event)}
                          placeholder="Email address"
                          type="email"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {members.length < 3 && (
                  <button
                    type="button"
                    onClick={addMember}
                    className="mt-2.5 w-full rounded-md border border-dashed border-primary/40 px-4 py-2 text-[13px] font-semibold text-primary transition hover:bg-primary/5"
                  >
                    + Add Team Member
                  </button>
                )}
              </section>

              <FormError message={error} />

              <div className="space-y-2.5">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-10 w-full rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-95 disabled:cursor-wait disabled:opacity-70"
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
                  className="w-full text-[13px] font-medium text-primary hover:underline"
                >
                  Already registered? Login
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="mt-5 space-y-3.5">
              <Field
                icon={Mail}
                label="Email address"
                name="email"
                value={login.email}
                onChange={updateLogin}
                placeholder="Enter your registered email"
                type="email"
                autoComplete="email"
              />

              <Field
                icon={Lock}
                label="Password"
                name="password"
                value={login.password}
                onChange={updateLogin}
                placeholder="Enter your password"
                type="password"
                autoComplete="current-password"
              />

              <FormError message={error} />
              <FormSuccess message={successMessage} />

              <button
                type="submit"
                disabled={isSubmitting}
                className="h-10 w-full rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-95 disabled:cursor-wait disabled:opacity-70"
              >
                {isSubmitting ? "Signing in..." : "Sign in"}
              </button>

              <p
                className={`text-center text-[12.5px] ${
                  passwordNotSet ? "border border-amber-300 bg-amber-50 px-3 py-2" : ""
                }`}
              >
                <span className="text-muted-foreground">
                  Forgot or didn&apos;t set your password?
                </span>{" "}
                <button
                  type="button"
                  onClick={openReset}
                  className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                >
                  <KeyRound className="size-3" />
                  Send me a link
                </button>
              </p>

              <div className="border-t border-border pt-3.5 text-center text-[12.5px] text-muted-foreground">
                New to the hackathon?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setSuccessMessage("");
                    setLinkStatus(null);
                    setStep("register");
                  }}
                  className="font-semibold text-primary hover:underline"
                >
                  Register your team
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}

function Field({ icon: Icon, label, containerClassName, type, ...props }: FieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <label className={`block text-xs font-semibold text-foreground ${containerClassName ?? ""}`}>
      {label}

      <span className="relative mt-1 block">
        <Icon className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />

        <input
          {...props}
          type={isPassword && showPassword ? "text" : type}
          className={`h-9 w-full rounded-md border border-border bg-background pl-8 text-[13px] font-normal outline-none transition focus:border-primary ${
            isPassword ? "pr-9" : "pr-3"
          }`}
        />

        {isPassword ? (
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            className="absolute right-1 top-1/2 inline-flex size-7 -translate-y-1/2 items-center justify-center text-muted-foreground transition hover:text-foreground"
          >
            {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
          </button>
        ) : null}
      </span>
    </label>
  );
}

function FormError({ message }: { message: string }) {
  return message ? (
    <p className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-[13px] text-destructive">
      {message}
    </p>
  ) : null;
}

function FormSuccess({ message }: { message: string }) {
  return message ? (
    <p className="rounded-md border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-[13px] text-emerald-700">
      {message}
    </p>
  ) : null;
}
