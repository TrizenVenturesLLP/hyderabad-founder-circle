import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  Briefcase,
  CalendarDays,
  Check,
  Clock,
  Compass,
  GraduationCap,
  HandCoins,
  Layers,
  Lightbulb,
  MapPin,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import type { Meetup } from "@/lib/events";
import { submitRsvp } from "@/lib/api";
import { useRsvp } from "@/components/rsvp/rsvp-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Step = 1 | 2 | "success";

type FormState = {
  name: string;
  email: string;
  phone: string;
  countryCode: string;
  profileType: string;
  qualification: string;
  graduationYear: string;
  college: string;
  fieldOfStudy: string;
  jobTitle: string;
  company: string;
  linkedin: string;
  startupStage: string;
  exploring: string;
};

const emptyForm: FormState = {
  name: "",
  email: "",
  phone: "",
  countryCode: "+91",
  profileType: "",
  qualification: "",
  graduationYear: "",
  college: "",
  fieldOfStudy: "",
  jobTitle: "",
  company: "",
  linkedin: "",
  startupStage: "",
  exploring: "",
};

const profileOptions = [
  { label: "Founder / Co-founder", Icon: Lightbulb },
  { label: "Operator / Product professional", Icon: Layers },
  { label: "Working professional", Icon: Briefcase },
  { label: "Student", Icon: GraduationCap },
  { label: "Aspiring entrepreneur", Icon: Compass },
  { label: "Investor / Ecosystem partner", Icon: HandCoins },
] as const;

const qualifications = [
  "Currently studying",
  "Diploma",
  "Bachelor’s degree",
  "Master’s degree",
  "MBA / PGDM",
  "Doctorate",
  "Other",
];

const startupStages = [
  "Idea stage",
  "Building MVP",
  "Early revenue",
  "Growing",
  "Other",
];

const WORK_PROFILES = new Set([
  "Founder / Co-founder",
  "Operator / Product professional",
  "Working professional",
  "Investor / Ecosystem partner",
]);

const fieldClass =
  "h-[52px] w-full rounded-[11px] border border-border/90 bg-card px-3.5 text-sm text-foreground shadow-none outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground/65 focus-visible:border-primary/35 focus-visible:ring-1 focus-visible:ring-primary/40";

const selectClass = cn(
  fieldClass,
  "cursor-pointer appearance-none bg-[length:12px_12px] bg-[right_14px_center] bg-no-repeat pr-10",
  "bg-[url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2712%27 height=%2712%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%23666%27 stroke-width=%272%27%3E%3Cpath d=%27m6 9 6 6 6-6%27/%3E%3C/svg%3E')]",
);

export function RsvpDialog() {
  const { open, event, closeRsvp } = useRsvp();
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  const graduationYears = useMemo(() => {
    const years = ["Currently studying"];
    const current = new Date().getFullYear() + 1;
    for (let y = current; y >= current - 40; y -= 1) years.push(String(y));
    return years;
  }, []);

  const showWork = WORK_PROFILES.has(form.profileType);
  const isFounder = form.profileType === "Founder / Co-founder";
  const isAspiring = form.profileType === "Aspiring entrepreneur";
  const isStudent = form.profileType === "Student";

  function resetAll() {
    setStep(1);
    setForm(emptyForm);
    setErrors({});
    setSubmitting(false);
  }

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validateStep1() {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) next.name = "Please enter your full name.";
    if (!form.email.trim()) next.email = "Please enter your email.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      next.email = "Please enter a valid email.";
    }
    if (!form.phone.trim()) next.phone = "Please enter your WhatsApp number.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function validateStep2() {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.profileType) next.profileType = "Please select who you are.";
    if (!form.qualification) next.qualification = "Please select your qualification.";
    if (!form.graduationYear) next.graduationYear = "Please select graduation year.";
    if (!form.college.trim()) next.college = "Please enter your college or university.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function goNext() {
    if (!validateStep1()) return;
    setErrors({});
    setStep(2);
  }

  async function submitRegistration() {
    if (step !== 2) return;
    if (!validateStep2()) return;

    setSubmitting(true);
    try {
      await submitRsvp({
        name: form.name,
        email: form.email,
        phone: form.phone,
        countryCode: form.countryCode,
        profileType: form.profileType,
        qualification: form.qualification,
        graduationYear: form.graduationYear,
        college: form.college,
        fieldOfStudy: form.fieldOfStudy,
        jobTitle: isStudent ? "" : form.jobTitle,
        company: isStudent ? "" : form.company,
        linkedin: form.linkedin,
        startupStage: isFounder ? form.startupStage : "",
        exploring: isAspiring ? form.exploring : "",
        event: eventPayload(event),
      });
      setStep("success");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not submit RSVP.");
    } finally {
      setSubmitting(false);
    }
  }

  function onSubmit(e: FormEvent) {
    // Block Enter-key / implicit submits — only the Reserve button should validate.
    e.preventDefault();
  }

  function handleClose() {
    closeRsvp();
    window.setTimeout(resetAll, 200);
  }

  const day = new Date(event.dateISO + "T12:00:00");
  const dayNum = day.getDate();
  const monthShort = day
    .toLocaleDateString("en-IN", { month: "short" })
    .toUpperCase();
  const weekday = day.toLocaleDateString("en-IN", { weekday: "long" });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) handleClose();
      }}
    >
      <DialogContent
        className={cn(
          "flex max-h-[min(92vh,880px)] w-[calc(100%-1rem)] max-w-[960px] flex-col gap-0 overflow-hidden rounded-[20px] border-border/80 bg-background p-0 shadow-[0_28px_70px_-30px_rgba(0,0,0,0.45)] sm:max-w-[960px]",
          "max-sm:fixed max-sm:inset-x-0 max-sm:bottom-0 max-sm:top-auto max-sm:max-h-[94vh] max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-b-none max-sm:rounded-t-[20px]",
        )}
      >
        <DialogTitle className="sr-only">Reserve your spot</DialogTitle>
        <DialogDescription className="sr-only">
          Register for {event.title}
        </DialogDescription>

        {step === "success" ? (
          <SuccessView event={event} onClose={handleClose} />
        ) : (
          <div className="grid min-h-0 flex-1 md:grid-cols-12">
            {/* Form — left */}
            <div className="flex min-h-0 min-w-0 flex-col md:col-span-7 md:border-r md:border-border/70">
              <header className="shrink-0 border-b border-border/70 px-5 pb-4 pt-6 sm:px-6 sm:pt-7">
                <div className="flex items-center gap-2.5 pr-8">
                  <span className="h-px w-6 bg-primary" aria-hidden />
                  <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-primary">
                    Registration
                  </p>
                </div>
                <h2 className="mt-3 font-display text-[1.55rem] tracking-tight text-foreground sm:text-[1.75rem]">
                  Reserve your spot
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  Join the next Founders Open House and meet people building, operating, and
                  supporting startups in Hyderabad.
                </p>
                <Stepper step={step} />
              </header>

              <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
                <div className="scrollbar-none min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
                  <MobileEventSummary
                    event={event}
                    monthShort={monthShort}
                    dayNum={dayNum}
                    weekday={weekday}
                  />
                  {step === 1 ? (
                    <section>
                      <h3 className="font-display text-xl tracking-tight text-foreground">
                        Tell us how to reach you
                      </h3>
                      <p className="mt-1.5 text-sm text-muted-foreground">
                        We will use these details only for registration confirmation and event
                        updates.
                      </p>
                      <div className="mt-6 space-y-5">
                        <Field label="Full name" required error={errors.name}>
                          <Input
                            value={form.name}
                            onChange={(e) => update("name", e.target.value)}
                            placeholder="Enter your full name"
                            autoComplete="name"
                            className={fieldClass}
                          />
                        </Field>
                        <div className="grid gap-5 sm:grid-cols-2">
                          <Field label="Email address" required error={errors.email}>
                            <Input
                              type="email"
                              value={form.email}
                              onChange={(e) => update("email", e.target.value)}
                              placeholder="you@email.com"
                              autoComplete="email"
                              className={fieldClass}
                            />
                          </Field>
                          <Field
                            label="WhatsApp number"
                            required
                            error={errors.phone}
                            hint="We may send event updates on WhatsApp."
                          >
                            <div className="flex gap-2">
                              <select
                                value={form.countryCode}
                                onChange={(e) => update("countryCode", e.target.value)}
                                className={cn(selectClass, "w-[5.5rem] shrink-0")}
                                aria-label="Country code"
                              >
                                <option value="+91">+91</option>
                                <option value="+1">+1</option>
                                <option value="+44">+44</option>
                                <option value="+971">+971</option>
                                <option value="+65">+65</option>
                              </select>
                              <Input
                                type="tel"
                                value={form.phone}
                                onChange={(e) => update("phone", e.target.value)}
                                placeholder="98765 43210"
                                autoComplete="tel-national"
                                className={cn(fieldClass, "flex-1")}
                              />
                            </div>
                          </Field>
                        </div>
                      </div>
                    </section>
                  ) : (
                    <section>
                      <h3 className="font-display text-xl tracking-tight text-foreground">
                        Help us understand who is joining
                      </h3>
                      <p className="mt-1.5 text-sm text-muted-foreground">
                        This helps us create a balanced and relevant room.
                      </p>
                      <div className="mt-6">
                        <Label className="text-[13px] font-medium text-foreground/90">
                          Which best describes you? <span className="text-primary">*</span>
                        </Label>
                        <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                          {profileOptions.map(({ label, Icon }) => {
                            const selected = form.profileType === label;
                            return (
                              <button
                                key={label}
                                type="button"
                                onClick={() => update("profileType", label)}
                                className={cn(
                                  "flex items-center gap-3 rounded-[12px] border px-3.5 py-3 text-left text-sm transition-colors",
                                  selected
                                    ? "border-primary bg-primary/10 text-foreground"
                                    : "border-border bg-card text-foreground/85 hover:border-primary/30",
                                )}
                              >
                                <Icon
                                  className={cn(
                                    "h-4 w-4 shrink-0",
                                    selected ? "text-primary" : "text-muted-foreground",
                                  )}
                                  strokeWidth={1.75}
                                />
                                <span className="flex-1 font-medium leading-snug">{label}</span>
                                {selected ? (
                                  <Check className="h-4 w-4 shrink-0 text-primary" strokeWidth={2} />
                                ) : null}
                              </button>
                            );
                          })}
                        </div>
                        {errors.profileType ? (
                          <p className="mt-1.5 text-xs text-destructive">{errors.profileType}</p>
                        ) : null}
                      </div>
                      <div className="mt-8 space-y-8">
                        <div>
                          <div className="mb-4 flex items-center gap-3">
                            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                              Education
                            </p>
                            <span className="h-px flex-1 bg-border/70" aria-hidden />
                          </div>
                          <div className="grid gap-4 sm:grid-cols-2 sm:gap-x-4 sm:gap-y-5">
                            <Field
                              label="Highest qualification"
                              required
                              error={errors.qualification}
                            >
                              <select
                                value={form.qualification}
                                onChange={(e) => update("qualification", e.target.value)}
                                className={cn(
                                  selectClass,
                                  !form.qualification && "text-muted-foreground/65",
                                )}
                              >
                                <option value="">Select qualification</option>
                                {qualifications.map((q) => (
                                  <option key={q} value={q}>
                                    {q}
                                  </option>
                                ))}
                              </select>
                            </Field>
                            <Field
                              label="Graduation year"
                              required
                              error={errors.graduationYear}
                            >
                              <select
                                value={form.graduationYear}
                                onChange={(e) => update("graduationYear", e.target.value)}
                                className={cn(
                                  selectClass,
                                  !form.graduationYear && "text-muted-foreground/65",
                                )}
                              >
                                <option value="">Select year</option>
                                {graduationYears.map((y) => (
                                  <option key={y} value={y}>
                                    {y}
                                  </option>
                                ))}
                              </select>
                            </Field>
                            <Field
                              label="College / University"
                              required
                              error={errors.college}
                              className="sm:col-span-2"
                            >
                              <Input
                                value={form.college}
                                onChange={(e) => update("college", e.target.value)}
                                placeholder="Enter your college or university"
                                className={fieldClass}
                              />
                            </Field>
                            <Field label="Field of study" className="sm:col-span-2">
                              <Input
                                value={form.fieldOfStudy}
                                onChange={(e) => update("fieldOfStudy", e.target.value)}
                                placeholder="Computer Science, Business, Design..."
                                className={fieldClass}
                              />
                            </Field>
                          </div>
                        </div>

                        {showWork ? (
                          <div>
                            <div className="mb-4 flex items-center gap-3">
                              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                                Current work
                              </p>
                              <span className="h-px flex-1 bg-border/70" aria-hidden />
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2 sm:gap-x-4 sm:gap-y-5">
                              <Field label="Current role / Job title">
                                <Input
                                  value={form.jobTitle}
                                  onChange={(e) => update("jobTitle", e.target.value)}
                                  placeholder="Founder, Product Manager, Engineer..."
                                  className={fieldClass}
                                />
                              </Field>
                              <Field label={isFounder ? "Startup name" : "Company / Startup"}>
                                <Input
                                  value={form.company}
                                  onChange={(e) => update("company", e.target.value)}
                                  placeholder="Company or startup name"
                                  className={fieldClass}
                                />
                              </Field>
                              {isFounder ? (
                                <Field label="Startup stage" className="sm:col-span-2">
                                  <select
                                    value={form.startupStage}
                                    onChange={(e) => update("startupStage", e.target.value)}
                                    className={cn(
                                      selectClass,
                                      !form.startupStage && "text-muted-foreground/65",
                                    )}
                                  >
                                    <option value="">Select stage (optional)</option>
                                    {startupStages.map((s) => (
                                      <option key={s} value={s}>
                                        {s}
                                      </option>
                                    ))}
                                  </select>
                                </Field>
                              ) : null}
                              <Field label="LinkedIn profile" className="sm:col-span-2">
                                <Input
                                  value={form.linkedin}
                                  onChange={(e) => update("linkedin", e.target.value)}
                                  placeholder="linkedin.com/in/your-profile"
                                  className={fieldClass}
                                />
                              </Field>
                            </div>
                          </div>
                        ) : null}

                        {isAspiring ? (
                          <div>
                            <div className="mb-4 flex items-center gap-3">
                              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                                Exploring
                              </p>
                              <span className="h-px flex-1 bg-border/70" aria-hidden />
                            </div>
                            <Field label="What are you currently exploring?">
                              <Input
                                value={form.exploring}
                                onChange={(e) => update("exploring", e.target.value)}
                                placeholder="An idea, industry, problem, or opportunity"
                                className={fieldClass}
                              />
                            </Field>
                          </div>
                        ) : null}
                      </div>
                    </section>
                  )}
                </div>
                <footer className="shrink-0 border-t border-border/70 bg-card/70 px-5 py-4 sm:px-6">
                  <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-muted-foreground">
                      Free to attend. No hard-selling.
                    </p>
                    <div className="flex gap-2.5">
                      {step === 2 ? (
                        <button
                          type="button"
                          onClick={() => {
                            setErrors({});
                            setStep(1);
                          }}
                          disabled={submitting}
                          className="rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
                        >
                          Back
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleClose}
                          className="rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                        >
                          Cancel
                        </button>
                      )}
                      {step === 1 ? (
                        <button
                          type="button"
                          onClick={goNext}
                          className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-[0_10px_24px_-14px_color-mix(in_oklab,var(--terracotta)_70%,transparent)] transition-[opacity,transform] hover:opacity-90 active:scale-[0.98]"
                        >
                          Continue
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => void submitRegistration()}
                          disabled={submitting}
                          className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-[0_10px_24px_-14px_color-mix(in_oklab,var(--terracotta)_70%,transparent)] transition-[opacity,transform] hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
                        >
                          {submitting ? "Submitting…" : "Reserve my spot"}
                        </button>
                      )}
                    </div>
                  </div>
                </footer>
              </form>
            </div>

            {/* Event details — right (desktop) */}
            <aside className="hidden min-h-0 bg-secondary/40 md:col-span-5 md:flex md:flex-col">
              <div className="flex h-full min-h-0 flex-col overflow-y-auto px-7 py-8 lg:px-8 lg:py-10">
                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-primary">
                  Event details
                </p>
                <div className="mt-5 flex h-[4.75rem] w-[4.75rem] flex-col items-center justify-center rounded-2xl bg-card text-center shadow-sm ring-1 ring-border/80">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-primary">
                    {monthShort}
                  </span>
                  <span className="font-display text-3xl leading-none text-foreground">
                    {dayNum}
                  </span>
                </div>
                <span className="mt-5 inline-flex w-fit rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-primary">
                  Registration open
                </span>
                <h3 className="mt-3 font-display text-[1.65rem] leading-snug tracking-tight text-foreground">
                  {event.title}
                </h3>
                <ul className="mt-6 space-y-3.5 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2.5">
                    <CalendarDays
                      className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                      strokeWidth={1.75}
                    />
                    <span>
                      <span className="block text-[11px] uppercase tracking-[0.12em] text-muted-foreground/80">
                        Date
                      </span>
                      <span className="font-medium text-foreground">{event.dateLabel}</span>
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={1.75} />
                    <span>
                      <span className="block text-[11px] uppercase tracking-[0.12em] text-muted-foreground/80">
                        Time
                      </span>
                      <span className="font-medium text-foreground">
                        {weekday} · {event.time}
                      </span>
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={1.75} />
                    <span>
                      <span className="block text-[11px] uppercase tracking-[0.12em] text-muted-foreground/80">
                        Venue
                      </span>
                      <span className="font-medium text-foreground">
                        {event.venue}, {event.city}
                      </span>
                    </span>
                  </li>
                </ul>
                <div className="mt-6 rounded-xl border border-border/80 bg-card/80 px-4 py-3.5">
                  <p className="text-sm leading-relaxed text-muted-foreground">{event.blurb}</p>
                </div>
                <p className="mt-auto pt-10 text-xs text-muted-foreground">
                  Free to attend · Limited seats · No pitching
                </p>
              </div>
            </aside>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function MobileEventSummary({
  event,
  monthShort,
  dayNum,
  weekday,
}: {
  event: Meetup;
  monthShort: string;
  dayNum: number;
  weekday: string;
}) {
  return (
    <div className="mb-6 flex gap-3 rounded-[14px] border border-border/80 bg-secondary/30 p-3 md:hidden">
      <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-card text-center ring-1 ring-border/80">
        <span className="text-[9px] font-medium uppercase tracking-wider text-primary">
          {monthShort}
        </span>
        <span className="font-display text-xl leading-none text-foreground">{dayNum}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{event.title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {weekday} · {event.time}
        </p>
        <p className="text-xs text-muted-foreground">
          {event.venue}, {event.city}
        </p>
      </div>
    </div>
  );
}

function Stepper({ step }: { step: 1 | 2 }) {
  return (
    <ol className="mt-5 flex items-center gap-3 text-sm">
      <StepItem n={1} label="Your details" active={step === 1} done={step === 2} />
      <span className="h-px flex-1 max-w-10 bg-border" aria-hidden />
      <StepItem n={2} label="About you" active={step === 2} done={false} />
    </ol>
  );
}

function StepItem({
  n,
  label,
  active,
  done,
}: {
  n: number;
  label: string;
  active: boolean;
  done: boolean;
}) {
  return (
    <li
      className={cn(
        "flex items-center gap-2",
        active || done ? "text-foreground" : "text-muted-foreground",
      )}
    >
      <span
        className={cn(
          "flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-medium",
          done && "bg-primary text-primary-foreground",
          active && !done && "bg-primary text-primary-foreground",
          !active && !done && "border border-border bg-card",
        )}
      >
        {done ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> : `0${n}`}
      </span>
      <span className={cn("text-xs font-medium sm:text-sm", active && "text-primary")}>
        {label}
      </span>
    </li>
  );
}

function SuccessView({ event, onClose }: { event: Meetup; onClose: () => void }) {
  const downloadIcs = () => {
    const [y, m, d] = event.dateISO.split("-").map(Number);
    const pad = (n: number) => String(n).padStart(2, "0");
    const toUtc = (hour: number, minute: number) => {
      const istMs = Date.UTC(y, m - 1, d, hour, minute) - 5.5 * 60 * 60 * 1000;
      const dt = new Date(istMs);
      return `${dt.getUTCFullYear()}${pad(dt.getUTCMonth() + 1)}${pad(dt.getUTCDate())}T${pad(dt.getUTCHours())}${pad(dt.getUTCMinutes())}00Z`;
    };
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "BEGIN:VEVENT",
      `UID:${event.slug}@hyderabadfounders.in`,
      `DTSTART:${toUtc(event.slug === "founders-open-house" ? 10 : 17, 0)}`,
      `DTEND:${toUtc(event.slug === "founders-open-house" ? 13 : 20, 0)}`,
      `SUMMARY:${event.title}`,
      `LOCATION:${event.venue}, ${event.city}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    const blob = new Blob([ics], { type: "text/calendar" });
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = `${event.slug}.ics`;
    a.click();
    URL.revokeObjectURL(href);
  };

  return (
    <div className="flex flex-col items-center px-6 py-10 text-center sm:px-10 sm:py-12">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary">
        <Check className="h-7 w-7" strokeWidth={2.25} />
      </span>
      <h2 className="mt-5 font-display text-3xl tracking-tight text-foreground">
        Your spot is reserved
      </h2>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        We have sent the event confirmation and details to your email and WhatsApp.
      </p>

      <div className="mt-6 w-full max-w-md rounded-[14px] border border-border/80 bg-secondary/25 px-4 py-4 text-left">
        <p className="font-medium text-foreground">{event.title}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {event.dateLabel} · {event.time}
        </p>
        <p className="text-sm text-muted-foreground">
          {event.venue}, {event.city}
        </p>
      </div>

      <p className="mt-5 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
        <Sparkles className="h-3.5 w-3.5 text-primary" strokeWidth={1.75} />
        We look forward to seeing you in the room.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-2.5">
        <button
          type="button"
          onClick={downloadIcs}
          className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          <CalendarDays className="h-3.5 w-3.5" strokeWidth={1.75} />
          Add to Calendar
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Close
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  error,
  hint,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-[13px] font-medium text-foreground/90">
        {label}
        {required ? <span className="text-primary"> *</span> : null}
      </Label>
      {children}
      {hint && !error ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

function eventPayload(event: Meetup) {
  return {
    slug: event.slug,
    title: event.title,
    dateISO: event.dateISO,
    dateLabel: event.dateLabel,
    time: event.time,
    venue: event.venue,
    city: event.city,
    format: event.format,
  };
}
