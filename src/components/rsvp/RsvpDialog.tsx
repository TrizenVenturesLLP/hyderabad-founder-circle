import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  CalendarDays,
  Check,
  ChevronDown,
  Clock,
  CreditCard,
  ImagePlus,
  Info,
  Landmark,
  Mail,
  MapPin,
  MessageCircle,
  Smartphone,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { meetupMapsUrl, type Meetup } from "@/lib/events";
import {
  createPaymentOrder,
  REGISTRATION_FEE_INR,
  verifyPaymentAndRegister,
  type PaymentMethod,
  type RsvpPayload,
} from "@/lib/api";
import { openRazorpayCheckout } from "@/lib/razorpay";
import {
  clearRsvpDraft,
  hasRsvpDraftContent,
  loadRsvpDraft,
  saveRsvpDraft,
} from "@/lib/rsvp-draft";
import { links } from "@/lib/links";
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

type Step = 1 | 2 | 3 | "processing" | "success";

const PAYMENT_OPTIONS: {
  id: PaymentMethod;
  label: string;
  hint: string;
  icon: typeof Smartphone;
}[] = [
  {
    id: "upi",
    label: "Pay with UPI",
    hint: "GPay · PhonePe · BHIM",
    icon: Smartphone,
  },
  {
    id: "card",
    label: "Pay with Cards",
    hint: "Visa · Mastercard · RuPay · Amex · via Razorpay",
    icon: CreditCard,
  },
  {
    id: "netbanking",
    label: "Pay with Net Banking",
    hint: "All major banks",
    icon: Landmark,
  },
  {
    id: "wallet",
    label: "Pay with Wallet",
    hint: "Paytm · Amazon Pay · more",
    icon: Wallet,
  },
];

type FormState = {
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  role: string;
  company: string;
  startupStage: string;
  gtmChallenges: string[];
  leaveWith: string[];
  industry: string;
  lookingFor: string[];
  offerCommunity: string[];
  wantToMeet: string[];
  canHelpWith: string;
  biggestChallenge: string;
  joinWhatsapp: boolean;
  subscribeUpdates: boolean;
  questions: string;
};

const emptyForm: FormState = {
  name: "",
  email: "",
  phone: "",
  linkedin: "",
  role: "",
  company: "",
  startupStage: "",
  gtmChallenges: [],
  leaveWith: [],
  industry: "",
  lookingFor: [],
  offerCommunity: [],
  wantToMeet: [],
  canHelpWith: "",
  biggestChallenge: "",
  joinWhatsapp: false,
  subscribeUpdates: false,
  questions: "",
};

const roles = [
  "Founder / Co-founder",
  "Aspiring entrepreneur",
  "Product Manager",
  "Designer",
  "Operator / Growth",
  "Investor / Ecosystem",
  "Working professional",
  "Student",
  "Other",
] as const;

const startupStages = [
  "Idea stage",
  "MVP in development",
  "MVP launched",
  "Acquiring first customers",
  "Early revenue",
  "Scaling GTM",
  "Exploring a startup idea",
] as const;

const gtmChallengeOptions = [
  "Defining our Ideal Customer Profile (ICP)",
  "Positioning our product clearly in the market",
  "Validating product-market fit",
  "Finding our first paying customers",
  "Building a repeatable customer acquisition strategy",
  "Generating demand with a limited budget",
  "Pricing and packaging our product",
  "Scaling beyond founder-led sales",
  "Building an effective sales pipeline",
  "Choosing the right GTM strategy for our stage",
  "Preparing for launch",
  "Other",
] as const;

const leaveWithOptions = [
  "A clearer GTM strategy",
  "Better positioning",
  "Customer acquisition ideas",
  "Feedback on my current approach",
  "Founder connections",
  "Practical frameworks",
  "Other",
] as const;

const industries = [
  "SaaS / Software",
  "Fintech",
  "Health / Climate",
  "Consumer / D2C",
  "AI / Deep tech",
  "Marketplace",
  "Other",
] as const;

const lookingForOptions = [
  "Networking",
  "Mentors",
  "Investors",
  "Customers",
  "Hiring",
  "Collaboration",
  "Learning",
] as const;

const offerCommunityOptions = [
  "Mentorship",
  "Technical / engineering skills",
  "AI / ML expertise",
  "Product / design",
  "GTM / growth",
  "Hiring intros",
  "Investor intros",
  "Domain expertise",
  "Feedback / sounding board",
  "Other",
] as const;

const wantToMeetOptions = [
  "Founders",
  "AI builders",
  "Investors",
  "Designers",
  "Operators / growth",
  "Potential co-founders",
  "Engineers",
  "Product managers",
  "Mentors",
  "Other",
] as const;

/** Max lengths by field type */
const FIELD_LIMITS = {
  name: 80,
  email: 80,
  phone: 10,
  linkedin: 200,
  company: 80,
  canHelpWith: 400,
  biggestChallenge: 400,
  questions: 400,
} as const;

const fieldClass =
  "h-[52px] w-full rounded-[11px] border border-border/90 bg-card px-3.5 text-sm text-foreground shadow-none outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground/65 focus-visible:border-primary/35 focus-visible:ring-1 focus-visible:ring-primary/40";

const textareaClass =
  "min-h-[96px] w-full resize-y rounded-[11px] border border-border/90 bg-card px-3.5 py-3 text-sm text-foreground shadow-none outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground/65 focus-visible:border-primary/35 focus-visible:ring-1 focus-visible:ring-primary/40";

const selectClass = cn(
  fieldClass,
  "cursor-pointer appearance-none bg-[length:12px_12px] bg-[right_14px_center] bg-no-repeat pr-10",
  "bg-[url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2712%27 height=%2712%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%23666%27 stroke-width=%272%27%3E%3Cpath d=%27m6 9 6 6 6-6%27/%3E%3C/svg%3E')]",
);

type FormErrorKey = keyof FormState | "lookingFor";

export function RsvpDialog() {
  const { open, event, closeRsvp } = useRsvp();
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<FormErrorKey, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("upi");
  const [draftRestored, setDraftRestored] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const formScrollRef = useRef<HTMLDivElement>(null);
  const skipNextSaveRef = useRef(false);

  useEffect(() => {
    const el = formScrollRef.current;
    if (!el) return;
    el.scrollTop = 0;
  }, [step]);

  useEffect(() => {
    if (!open) return;

    skipNextSaveRef.current = true;
    const draft = loadRsvpDraft(event.slug);
    if (draft && hasRsvpDraftContent(draft.form)) {
      setForm(draft.form);
      setStep(draft.step);
      setPaymentMethod(draft.paymentMethod);
      setDraftRestored(true);
      setErrors({});
      setSubmitting(false);
    } else {
      setStep(1);
      setForm(emptyForm);
      setErrors({});
      setSubmitting(false);
      setPaymentMethod("upi");
      setDraftRestored(false);
    }
  }, [open, event.slug]);

  useEffect(() => {
    if (!open || step === "success" || step === "processing") return;
    if (skipNextSaveRef.current) {
      skipNextSaveRef.current = false;
      return;
    }

    const timer = window.setTimeout(() => {
      saveRsvpDraft(event.slug, {
        form,
        step,
        paymentMethod,
      });
      setDraftRestored(hasRsvpDraftContent(form));
    }, 250);

    return () => window.clearTimeout(timer);
  }, [open, event.slug, form, step, paymentMethod]);

  useEffect(() => {
    if (!open) return;

    const { body } = document;
    const scrollY = window.scrollY;
    const previous = {
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      paddingRight: body.style.paddingRight,
    };
    const scrollbarGap = window.innerWidth - document.documentElement.clientWidth;

    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    if (scrollbarGap > 0) {
      body.style.paddingRight = `${scrollbarGap}px`;
    }

    return () => {
      body.style.overflow = previous.overflow;
      body.style.position = previous.position;
      body.style.top = previous.top;
      body.style.width = previous.width;
      body.style.paddingRight = previous.paddingRight;
      window.scrollTo(0, scrollY);
    };
  }, [open]);

  function resetAll() {
    setStep(1);
    setForm(emptyForm);
    setErrors({});
    setSubmitting(false);
    setPaymentMethod("upi");
    setDraftRestored(false);
    setCheckoutOpen(false);
  }

  function clearSavedDetails() {
    clearRsvpDraft(event.slug);
    skipNextSaveRef.current = true;
    resetAll();
    toast.message("Saved details cleared.");
  }

  function buildRsvpPayload(): RsvpPayload {
    return {
      name: form.name,
      email: form.email,
      phone: form.phone,
      countryCode: "+91",
      linkedin: form.linkedin,
      role: form.role,
      company: form.company,
      startupStage: form.startupStage,
      gtmChallenges: form.gtmChallenges,
      leaveWith: form.leaveWith,
      industry: form.industry,
      lookingFor: form.lookingFor,
      offerCommunity: form.offerCommunity,
      wantToMeet: form.wantToMeet,
      canHelpWith: form.canHelpWith,
      biggestChallenge: form.biggestChallenge,
      joinWhatsapp: form.joinWhatsapp,
      subscribeUpdates: form.subscribeUpdates,
      questions: form.questions,
      event: eventPayload(event),
    };
  }

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function toggleLookingFor(option: string) {
    setForm((prev) => {
      const has = prev.lookingFor.includes(option);
      return {
        ...prev,
        lookingFor: has
          ? prev.lookingFor.filter((x) => x !== option)
          : [...prev.lookingFor, option],
      };
    });
    setErrors((prev) => ({ ...prev, lookingFor: undefined }));
  }

  function toggleOfferCommunity(option: string) {
    setForm((prev) => {
      const has = prev.offerCommunity.includes(option);
      return {
        ...prev,
        offerCommunity: has
          ? prev.offerCommunity.filter((x) => x !== option)
          : [...prev.offerCommunity, option],
      };
    });
    setErrors((prev) => ({ ...prev, offerCommunity: undefined }));
  }

  function toggleWantToMeet(option: string) {
    setForm((prev) => {
      const has = prev.wantToMeet.includes(option);
      return {
        ...prev,
        wantToMeet: has
          ? prev.wantToMeet.filter((x) => x !== option)
          : [...prev.wantToMeet, option],
      };
    });
    setErrors((prev) => ({ ...prev, wantToMeet: undefined }));
  }

  function toggleGtmChallenge(option: string) {
    setForm((prev) => {
      const has = prev.gtmChallenges.includes(option);
      if (has) {
        return {
          ...prev,
          gtmChallenges: prev.gtmChallenges.filter((x) => x !== option),
        };
      }
      if (prev.gtmChallenges.length >= 3) {
        toast.message("Please select exactly 3 options.");
        return prev;
      }
      return { ...prev, gtmChallenges: [...prev.gtmChallenges, option] };
    });
    setErrors((prev) => ({ ...prev, gtmChallenges: undefined }));
  }

  function toggleLeaveWith(option: string) {
    setForm((prev) => {
      const has = prev.leaveWith.includes(option);
      return {
        ...prev,
        leaveWith: has
          ? prev.leaveWith.filter((x) => x !== option)
          : [...prev.leaveWith, option],
      };
    });
    setErrors((prev) => ({ ...prev, leaveWith: undefined }));
  }

  function validateStep1() {
    const next: Partial<Record<FormErrorKey, string>> = {};
    if (!form.name.trim()) next.name = "Please enter your full name.";
    if (!form.email.trim()) next.email = "Please enter your email.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      next.email = "Please enter a valid email.";
    }
    if (!form.phone.trim()) next.phone = "Please enter your mobile number.";
    else if (!/^\d{10}$/.test(form.phone.trim())) {
      next.phone = "Please enter a valid 10-digit mobile number.";
    }
    if (!form.linkedin.trim()) next.linkedin = "Please enter your LinkedIn profile URL.";
    else if (form.linkedin.trim().length > FIELD_LIMITS.linkedin) {
      next.linkedin = `LinkedIn URL must be under ${FIELD_LIMITS.linkedin} characters.`;
    }
    else if (
      !/^https?:\/\/(www\.)?linkedin\.com\/.+/i.test(form.linkedin.trim()) &&
      !/^linkedin\.com\/.+/i.test(form.linkedin.trim())
    ) {
      next.linkedin = "Please enter a valid LinkedIn URL.";
    }
    if (!form.role) next.role = "Please select your role.";
    if (!form.company.trim()) next.company = "Please enter your startup or company.";
    if (!form.startupStage) next.startupStage = "Please select your startup stage.";
    if (form.gtmChallenges.length !== 3) {
      next.gtmChallenges = "Please select exactly 3 options.";
    }
    if (form.leaveWith.length === 0) {
      next.leaveWith = "Please select at least one option.";
    }
    if (!form.industry) next.industry = "Please select your industry.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function validateStep2() {
    const next: Partial<Record<FormErrorKey, string>> = {};
    if (form.lookingFor.length === 0) {
      next.lookingFor = "Please select at least one option.";
    }
    if (form.offerCommunity.length === 0) {
      next.offerCommunity = "Please select at least one option.";
    }
    if (form.wantToMeet.length === 0) {
      next.wantToMeet = "Please select at least one option.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function goNext() {
    if (!validateStep1()) return;
    setErrors({});
    setStep(2);
  }

  function goToPayment() {
    if (step !== 2) return;
    if (!validateStep2()) return;
    setErrors({});
    setStep(3);
  }

  async function payAndRegister() {
    if (step !== 3) return;

    setSubmitting(true);
    toast.dismiss();
    try {
      const payload = buildRsvpPayload();
      const order = await createPaymentOrder({
        ...payload,
        paymentMethod,
      });

      setCheckoutOpen(true);
      await openRazorpayCheckout({
        keyId: order.keyId,
        orderId: order.orderId,
        amount: order.amount,
        currency: order.currency,
        name: "Hyderabad Founders Network",
        description: `${event.title} · Event Pass`,
        method: paymentMethod,
        prefill: order.prefill,
        onDismiss: () => {
          setCheckoutOpen(false);
          setSubmitting(false);
          toast.message("Payment cancelled. You can try again when ready.");
        },
        onSuccess: (response) => {
          setCheckoutOpen(false);
          void (async () => {
            try {
              setStep("processing");
              await verifyPaymentAndRegister({
                ...payload,
                paymentMethod,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });
              setStep("success");
              clearRsvpDraft(event.slug);
              setDraftRestored(false);
            } catch (err) {
              setStep(3);
              const message =
                err instanceof Error
                  ? err.message
                  : "Payment received but registration failed. Please contact support.";
              toast.error(message, { duration: 4500, closeButton: true });
            } finally {
              setSubmitting(false);
            }
          })();
        },
      });
    } catch (err) {
      setCheckoutOpen(false);
      const message =
        err instanceof TypeError && /fetch/i.test(err.message)
          ? "Could not reach the server. Please try again."
          : err instanceof Error
            ? err.message
            : "Could not start payment.";
      toast.error(message, { duration: 3500, closeButton: true });
      setSubmitting(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
  }

  function handleClose() {
    if (step !== "success" && step !== "processing") {
      saveRsvpDraft(event.slug, {
        form,
        step: step === 2 || step === 3 ? step : 1,
        paymentMethod,
      });
      closeRsvp();
      return;
    }

    clearRsvpDraft(event.slug);
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
      modal={!checkoutOpen}
      onOpenChange={(next) => {
        if (!next) {
          if (checkoutOpen) return;
          handleClose();
        }
      }}
    >
      <DialogContent
        closeLabel={step === "success" ? "Close" : undefined}
        overlayClassName={
          checkoutOpen ? "pointer-events-none bg-black/40" : undefined
        }
        onOpenAutoFocus={(e) => {
          // Keep focus in dialog; avoid jumping page scroll under the modal.
          if (step === "success" || step === "processing" || checkoutOpen) e.preventDefault();
        }}
        onInteractOutside={(e) => {
          if (checkoutOpen || step === "processing") e.preventDefault();
        }}
        onPointerDownOutside={(e) => {
          if (checkoutOpen || step === "processing") e.preventDefault();
        }}
        onFocusOutside={(e) => {
          if (checkoutOpen || step === "processing") e.preventDefault();
        }}
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        className={cn(
          "flex flex-col gap-0 overflow-hidden overscroll-contain rounded-[20px] border-border/80 bg-background p-0 shadow-[0_28px_70px_-30px_rgba(0,0,0,0.45)]",
          checkoutOpen && "pointer-events-none",
          step === "success" || step === "processing"
            ? [
                "max-h-[min(92dvh,560px)] w-[calc(100%-1.25rem)] max-w-[680px] sm:max-w-[680px]",
                "max-sm:!inset-x-0 max-sm:!bottom-0 max-sm:!left-0 max-sm:!right-0 max-sm:!top-auto",
                "max-sm:!translate-x-0 max-sm:!translate-y-0",
                "max-sm:!w-full max-sm:!max-w-none max-sm:rounded-b-none max-sm:rounded-t-[20px] max-sm:!max-h-[92dvh]",
              ]
            : [
                "max-h-[min(92dvh,880px)] w-[calc(100%-1rem)] max-w-[1080px] sm:max-w-[1080px]",
                // Full-bleed bottom sheet on mobile — override dialog centering
                "max-sm:!inset-x-0 max-sm:!bottom-0 max-sm:!left-0 max-sm:!right-0 max-sm:!top-auto",
                "max-sm:!translate-x-0 max-sm:!translate-y-0",
                "max-sm:!w-full max-sm:!max-w-none max-sm:rounded-b-none max-sm:rounded-t-[20px] max-sm:!max-h-[94dvh]",
              ],
        )}
      >
        <DialogTitle className="sr-only">Founders & Builders Meetup Registration</DialogTitle>
        <DialogDescription className="sr-only">
          Register for {event.title}
        </DialogDescription>

        {step === "success" ? (
          <SuccessView event={event} registrantName={form.name} />
        ) : step === "processing" ? (
          <ProcessingView />
        ) : (
          <div className="grid min-h-0 flex-1 md:grid-cols-12">
            <div className="flex min-h-0 min-w-0 flex-col md:col-span-8 md:border-r md:border-border/70">
                <header className="shrink-0 border-b border-border/70 px-4 pb-4 pt-6 pr-16 sm:px-6 sm:pt-7 sm:pr-20">
                <div className="flex items-center justify-between gap-3 pr-8">
                  <div className="flex items-center gap-2.5">
                    <span className="h-px w-6 bg-primary" aria-hidden />
                    <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-primary">
                      Registration
                    </p>
                  </div>
                  {draftRestored || hasRsvpDraftContent(form) ? (
                    <button
                      type="button"
                      onClick={clearSavedDetails}
                      className="text-[11px] font-medium text-muted-foreground underline-offset-2 transition-colors hover:text-foreground hover:underline sm:text-xs"
                    >
                      Clear saved details
                    </button>
                  ) : null}
                </div>
                <h2 className="mt-3 font-display text-[1.45rem] tracking-tight text-foreground sm:text-[1.65rem]">
                  Founders & Builders Meetup Registration
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  Reserve your seat for the next meetup in Hyderabad.
                  {draftRestored || hasRsvpDraftContent(form) ? (
                    <span className="mt-1 block text-xs text-primary/90">
                      Your details are saved — reopen anytime to continue.
                    </span>
                  ) : null}
                </p>
                <Stepper step={step} />
              </header>

              <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
                <div
                  ref={formScrollRef}
                  className="scrollbar-none min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-4 py-5 pb-6 [-webkit-overflow-scrolling:touch] sm:px-6"
                >
                  <MobileEventSummary
                    event={event}
                    monthShort={monthShort}
                    dayNum={dayNum}
                    weekday={weekday}
                  />

                  {step === 1 ? (
                    <section className="space-y-5">
                      <Field
                        label="Full Name"
                        required
                        error={errors.name}
                        count={form.name.length}
                        max={FIELD_LIMITS.name}
                      >
                        <Input
                          value={form.name}
                          onChange={(e) => update("name", e.target.value)}
                          placeholder="Enter your full name"
                          autoComplete="name"
                          maxLength={FIELD_LIMITS.name}
                          className={fieldClass}
                        />
                      </Field>

                      <div className="grid gap-5 sm:grid-cols-2">
                        <Field
                          label="Email"
                          required
                          error={errors.email}
                          count={form.email.length}
                          max={FIELD_LIMITS.email}
                        >
                          <Input
                            type="email"
                            value={form.email}
                            onChange={(e) => update("email", e.target.value)}
                            placeholder="you@email.com"
                            autoComplete="email"
                            maxLength={FIELD_LIMITS.email}
                            className={fieldClass}
                          />
                        </Field>
                        <Field
                          label="Mobile Number"
                          required
                          error={errors.phone}
                          hint="10-digit Indian mobile number"
                          count={form.phone.length}
                          max={FIELD_LIMITS.phone}
                        >
                          <div className="flex gap-1.5">
                            <span
                              className={cn(
                                fieldClass,
                                "inline-flex w-[3.25rem] shrink-0 items-center justify-center px-0 text-sm text-muted-foreground",
                              )}
                              aria-label="Country code +91"
                            >
                              +91
                            </span>
                            <Input
                              type="tel"
                              inputMode="numeric"
                              value={form.phone}
                              onChange={(e) =>
                                update(
                                  "phone",
                                  e.target.value.replace(/\D/g, "").slice(0, FIELD_LIMITS.phone),
                                )
                              }
                              placeholder="9876543210"
                              autoComplete="tel-national"
                              maxLength={FIELD_LIMITS.phone}
                              className={cn(fieldClass, "min-w-0 flex-1")}
                            />
                          </div>
                        </Field>
                      </div>

                      <Field
                        label="What is your LinkedIn profile URL?"
                        required
                        error={errors.linkedin}
                        count={form.linkedin.length}
                        max={FIELD_LIMITS.linkedin}
                      >
                        <Input
                          value={form.linkedin}
                          onChange={(e) => update("linkedin", e.target.value)}
                          placeholder="https://linkedin.com/in/username"
                          maxLength={FIELD_LIMITS.linkedin}
                          className={fieldClass}
                        />
                      </Field>

                      <Field
                        label="What best describes your role?"
                        required
                        error={errors.role}
                      >
                        <select
                          value={form.role}
                          onChange={(e) => update("role", e.target.value)}
                          className={cn(selectClass, !form.role && "text-muted-foreground/65")}
                        >
                          <option value="">Select your role</option>
                          {roles.map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </select>
                      </Field>

                      <Field
                        label="What is your startup or company name?"
                        required
                        error={errors.company}
                        count={form.company.length}
                        max={FIELD_LIMITS.company}
                      >
                        <Input
                          value={form.company}
                          onChange={(e) => update("company", e.target.value)}
                          placeholder="Enter your startup or company name"
                          maxLength={FIELD_LIMITS.company}
                          className={fieldClass}
                        />
                      </Field>

                      <Field
                        label="What stage is your startup or venture currently in?"
                        required
                        error={errors.startupStage}
                      >
                        <select
                          value={form.startupStage}
                          onChange={(e) => update("startupStage", e.target.value)}
                          className={cn(
                            selectClass,
                            !form.startupStage && "text-muted-foreground/65",
                          )}
                        >
                          <option value="">Select an option</option>
                          {startupStages.map((stage) => (
                            <option key={stage} value={stage}>
                              {stage}
                            </option>
                          ))}
                        </select>
                      </Field>

                      <Field
                        label="Which go-to-market challenges are most relevant to your startup today? Select 3 options."
                        required
                        error={errors.gtmChallenges}
                        hint={`${form.gtmChallenges.length}/3 selected`}
                      >
                        <MultiSelectDropdown
                          options={gtmChallengeOptions}
                          selected={form.gtmChallenges}
                          onToggle={toggleGtmChallenge}
                          max={3}
                          placeholder="Select 3 challenges"
                        />
                      </Field>

                      <Field
                        label="What are you hoping to leave this session with?"
                        required
                        error={errors.leaveWith}
                      >
                        <MultiSelectDropdown
                          options={leaveWithOptions}
                          selected={form.leaveWith}
                          onToggle={toggleLeaveWith}
                          placeholder="Select one or more"
                        />
                      </Field>

                      <Field
                        label="What industry is your startup or company in?"
                        required
                        error={errors.industry}
                      >
                        <select
                          value={form.industry}
                          onChange={(e) => update("industry", e.target.value)}
                          className={cn(
                            selectClass,
                            !form.industry && "text-muted-foreground/65",
                          )}
                        >
                          <option value="">Select industry</option>
                          {industries.map((industry) => (
                            <option key={industry} value={industry}>
                              {industry}
                            </option>
                          ))}
                        </select>
                      </Field>
                    </section>
                  ) : null}

                  {step === 2 ? (
                    <section className="space-y-6">
                      <div>
                        <Label className="text-[13px] font-medium text-foreground/90">
                          What are you looking for today?{" "}
                          <span className="text-primary">*</span>
                        </Label>
                        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {lookingForOptions.map((option) => {
                            const selected = form.lookingFor.includes(option);
                            return (
                              <button
                                key={option}
                                type="button"
                                onClick={() => toggleLookingFor(option)}
                                className={cn(
                                  "flex items-center gap-3 rounded-[12px] border px-3.5 py-3 text-left text-sm transition-colors",
                                  selected
                                    ? "border-primary bg-primary/10 text-foreground"
                                    : "border-border bg-card text-foreground/85 hover:border-primary/30",
                                )}
                              >
                                <span
                                  className={cn(
                                    "flex h-4 w-4 items-center justify-center rounded border",
                                    selected
                                      ? "border-primary bg-primary text-primary-foreground"
                                      : "border-border",
                                  )}
                                  aria-hidden
                                >
                                  {selected ? (
                                    <Check className="h-3 w-3" strokeWidth={3} />
                                  ) : null}
                                </span>
                                {option}
                              </button>
                            );
                          })}
                        </div>
                        {errors.lookingFor ? (
                          <p className="mt-1.5 text-xs text-destructive">{errors.lookingFor}</p>
                        ) : null}
                      </div>

                      <div>
                        <Label className="text-[13px] font-medium text-foreground/90">
                          What can you offer the community?{" "}
                          <span className="text-primary">*</span>
                        </Label>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Skills, experience, mentoring — how you can help others.
                        </p>
                        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {offerCommunityOptions.map((option) => {
                            const selected = form.offerCommunity.includes(option);
                            return (
                              <button
                                key={option}
                                type="button"
                                onClick={() => toggleOfferCommunity(option)}
                                className={cn(
                                  "flex items-center gap-3 rounded-[12px] border px-3.5 py-3 text-left text-sm transition-colors",
                                  selected
                                    ? "border-primary bg-primary/10 text-foreground"
                                    : "border-border bg-card text-foreground/85 hover:border-primary/30",
                                )}
                              >
                                <span
                                  className={cn(
                                    "flex h-4 w-4 items-center justify-center rounded border",
                                    selected
                                      ? "border-primary bg-primary text-primary-foreground"
                                      : "border-border",
                                  )}
                                  aria-hidden
                                >
                                  {selected ? (
                                    <Check className="h-3 w-3" strokeWidth={3} />
                                  ) : null}
                                </span>
                                {option}
                              </button>
                            );
                          })}
                        </div>
                        {errors.offerCommunity ? (
                          <p className="mt-1.5 text-xs text-destructive">
                            {errors.offerCommunity}
                          </p>
                        ) : null}
                      </div>

                      <div>
                        <Label className="text-[13px] font-medium text-foreground/90">
                          Who would you like to meet?{" "}
                          <span className="text-primary">*</span>
                        </Label>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Founders, builders, investors, operators — who should we connect you with?
                        </p>
                        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {wantToMeetOptions.map((option) => {
                            const selected = form.wantToMeet.includes(option);
                            return (
                              <button
                                key={option}
                                type="button"
                                onClick={() => toggleWantToMeet(option)}
                                className={cn(
                                  "flex items-center gap-3 rounded-[12px] border px-3.5 py-3 text-left text-sm transition-colors",
                                  selected
                                    ? "border-primary bg-primary/10 text-foreground"
                                    : "border-border bg-card text-foreground/85 hover:border-primary/30",
                                )}
                              >
                                <span
                                  className={cn(
                                    "flex h-4 w-4 items-center justify-center rounded border",
                                    selected
                                      ? "border-primary bg-primary text-primary-foreground"
                                      : "border-border",
                                  )}
                                  aria-hidden
                                >
                                  {selected ? (
                                    <Check className="h-3 w-3" strokeWidth={3} />
                                  ) : null}
                                </span>
                                {option}
                              </button>
                            );
                          })}
                        </div>
                        {errors.wantToMeet ? (
                          <p className="mt-1.5 text-xs text-destructive">{errors.wantToMeet}</p>
                        ) : null}
                      </div>

                      <Field
                        label="Anything else about what you can offer? (optional)"
                        count={form.canHelpWith.length}
                        max={FIELD_LIMITS.canHelpWith}
                      >
                        <textarea
                          value={form.canHelpWith}
                          onChange={(e) => update("canHelpWith", e.target.value)}
                          placeholder="A short note on skills, intros, or experience…"
                          maxLength={FIELD_LIMITS.canHelpWith}
                          className={textareaClass}
                        />
                      </Field>

                      <Field
                        label="Biggest challenge you're facing"
                        count={form.biggestChallenge.length}
                        max={FIELD_LIMITS.biggestChallenge}
                      >
                        <textarea
                          value={form.biggestChallenge}
                          onChange={(e) => update("biggestChallenge", e.target.value)}
                          placeholder="Hiring, pricing, distribution, fundraising…"
                          maxLength={FIELD_LIMITS.biggestChallenge}
                          className={textareaClass}
                        />
                      </Field>

                      <div className="space-y-3">
                        <div className="rounded-[14px] border border-border/80 bg-secondary/20 p-4">
                          <div className="flex items-start gap-3">
                            <button
                              type="button"
                              onClick={() => {
                                update("joinWhatsapp", !form.joinWhatsapp);
                              }}
                              className={cn(
                                "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                                form.joinWhatsapp
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-border bg-card",
                              )}
                              aria-pressed={form.joinWhatsapp}
                              aria-label="Join our WhatsApp Community"
                            >
                              {form.joinWhatsapp ? (
                                <Check className="h-3 w-3" strokeWidth={3} />
                              ) : null}
                            </button>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-foreground">
                                Join our WhatsApp Community?
                              </p>
                              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                Get meetup updates and connect with other founders.
                              </p>
                              <a
                                href={links.community}
                                target="_blank"
                                rel="noreferrer"
                                onClick={() => update("joinWhatsapp", true)}
                                className="mt-2.5 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/15"
                              >
                                <MessageCircle className="h-3.5 w-3.5" strokeWidth={1.75} />
                                Open community invite
                              </a>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-[14px] border border-border/80 bg-secondary/20 p-4">
                          <CheckboxRow
                            checked={form.subscribeUpdates}
                            onChange={(checked) => update("subscribeUpdates", checked)}
                            label="Subscribe to monthly updates?"
                          />
                        </div>
                      </div>

                      <Field
                        label="Any questions?"
                        count={form.questions.length}
                        max={FIELD_LIMITS.questions}
                      >
                        <textarea
                          value={form.questions}
                          onChange={(e) => update("questions", e.target.value)}
                          placeholder="Anything else we should know…"
                          maxLength={FIELD_LIMITS.questions}
                          className={textareaClass}
                        />
                      </Field>
                    </section>
                  ) : null}

                  {step === 3 ? (
                    <section className="space-y-5">
                      <div>
                        <h3 className="text-base font-medium text-foreground">
                          Select a payment method
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Complete your ₹{REGISTRATION_FEE_INR} registration fee
                          securely via Razorpay.
                        </p>
                      </div>

                      <div className="overflow-hidden rounded-[14px] border border-border/80">
                        {PAYMENT_OPTIONS.map((option, index) => {
                          const Icon = option.icon;
                          const selected = paymentMethod === option.id;
                          return (
                            <button
                              key={option.id}
                              type="button"
                              onClick={() => setPaymentMethod(option.id)}
                              className={cn(
                                "flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors",
                                index > 0 && "border-t border-border/70",
                                selected
                                  ? "bg-primary/10"
                                  : "bg-card hover:bg-secondary/40",
                              )}
                            >
                              <span
                                className={cn(
                                  "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                                  selected
                                    ? "border-primary"
                                    : "border-border",
                                )}
                                aria-hidden
                              >
                                {selected ? (
                                  <span className="h-2 w-2 rounded-full bg-primary" />
                                ) : null}
                              </span>
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary/70 text-primary">
                                <Icon className="h-4 w-4" strokeWidth={1.75} />
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block text-sm font-medium text-foreground">
                                  {option.label}
                                </span>
                                <span className="mt-0.5 block text-xs text-muted-foreground">
                                  {option.hint}
                                </span>
                              </span>
                              {option.id === "card" ? (
                                <span className="hidden text-[11px] font-medium text-primary sm:inline">
                                  via Razorpay
                                </span>
                              ) : null}
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex items-start gap-2.5 rounded-[12px] border border-border/70 bg-secondary/30 px-3.5 py-3 text-xs leading-relaxed text-muted-foreground md:hidden">
                        <Info
                          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary"
                          strokeWidth={1.75}
                        />
                        <p>
                          We do not store your card details or financial
                          information. Payments are processed securely by
                          Razorpay.
                        </p>
                      </div>

                      <div className="rounded-[14px] border border-border/80 bg-secondary/20 p-4 md:hidden">
                        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-primary">
                          Payment summary
                        </p>
                        <div className="mt-3 flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Event Pass × 1
                          </span>
                          <span className="font-medium text-foreground">
                            ₹{REGISTRATION_FEE_INR}
                          </span>
                        </div>
                        <div className="mt-3 flex items-center justify-between border-t border-border/70 pt-3">
                          <span className="text-sm font-medium text-foreground">
                            Total
                          </span>
                          <span className="font-display text-xl text-foreground">
                            ₹{REGISTRATION_FEE_INR}
                          </span>
                        </div>
                      </div>
                    </section>
                  ) : null}
                </div>

                <footer className="shrink-0 border-t border-border/70 bg-background px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between gap-3">
                    {step === 2 || step === 3 ? (
                      <button
                        type="button"
                        onClick={() => setStep(step === 3 ? 2 : 1)}
                        className="rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                      >
                        Back
                      </button>
                    ) : (
                      <span />
                    )}
                    {step === 1 ? (
                      <button
                        type="button"
                        onClick={goNext}
                        className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-[opacity,transform] hover:opacity-90 active:scale-[0.98]"
                      >
                        Continue
                      </button>
                    ) : step === 2 ? (
                      <button
                        type="button"
                        onClick={goToPayment}
                        className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-[opacity,transform] hover:opacity-90 active:scale-[0.98]"
                      >
                        continue 
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => void payAndRegister()}
                        disabled={submitting}
                        className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-[opacity,transform] hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
                      >
                        {submitting ? "Opening checkout…" : "Proceed to payment"}
                      </button>
                    )}
                  </div>
                </footer>
              </form>
            </div>

            <aside className="hidden min-h-0 bg-secondary/40 md:col-span-4 md:flex md:flex-col">
              <div className="flex h-full min-h-0 flex-col overflow-y-auto px-7 py-8 lg:px-8 lg:py-10">
                {step === 3 ? (
                  <>
                    <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-primary">
                      Payment summary
                    </p>
                    <h3 className="mt-4 font-display text-[1.45rem] leading-snug tracking-tight text-foreground">
                      {event.title}
                    </h3>
                    <div className="mt-6 space-y-3 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-muted-foreground">Event Pass × 1</span>
                        <span className="font-medium text-foreground">
                          ₹{REGISTRATION_FEE_INR}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-muted-foreground">Sub total</span>
                        <span className="font-medium text-foreground">
                          ₹{REGISTRATION_FEE_INR}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3 border-t border-border/70 pt-3">
                        <span className="font-medium text-foreground">Total</span>
                        <span className="font-display text-2xl text-foreground">
                          ₹{REGISTRATION_FEE_INR}
                        </span>
                      </div>
                    </div>
                    <div className="mt-6 flex items-start gap-2.5 rounded-[12px] border border-border/70 bg-card/80 px-3.5 py-3 text-xs leading-relaxed text-muted-foreground">
                      <Info
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary"
                        strokeWidth={1.75}
                      />
                      <p>
                        We do not store your card details or financial
                        information. Payments are processed securely by
                        Razorpay.
                      </p>
                    </div>
                    <p className="mt-auto pt-10 text-xs leading-relaxed text-muted-foreground">
                      By proceeding, you agree to share registration details with
                      Hyderabad Founders Network for event coordination.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-primary">
                      Event summary
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
                        <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={1.75} />
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
                            {event.venue}
                            {event.space ? ` · ${event.space}` : ""}
                          </span>
                          {event.address ? (
                            <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                              {event.address}
                            </span>
                          ) : (
                            <span className="mt-0.5 block text-xs text-muted-foreground">
                              {event.city}
                            </span>
                          )}
                        </span>
                      </li>
                    </ul>
                    <p className="mt-auto pt-10 text-xs text-muted-foreground">
                      ₹{REGISTRATION_FEE_INR} registration ·{" "}
                      {typeof event.seats === "number" ? `${event.seats} seats` : "Limited seats"}{" "}
                      · No pitching
                    </p>
                  </>
                )}
              </div>
            </aside>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function CheckboxRow({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center gap-3 text-left text-sm text-foreground"
    >
      <span
        className={cn(
          "flex h-4 w-4 items-center justify-center rounded border",
          checked
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-card",
        )}
        aria-hidden
      >
        {checked ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
      </span>
      {label}
    </button>
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
          {event.space ? `${event.venue} · ${event.space}` : `${event.venue}, ${event.city}`}
        </p>
      </div>
    </div>
  );
}

function Stepper({ step }: { step: 1 | 2 | 3 }) {
  return (
    <ol className="mt-5 flex min-w-0 items-center gap-2 text-sm sm:gap-3">
      <StepItem n={1} label="Your details" active={step === 1} done={step > 1} />
      <span className="h-px min-w-3 flex-1 bg-border sm:max-w-8" aria-hidden />
      <StepItem n={2} label="Your goals" active={step === 2} done={step > 2} />
      <span className="h-px min-w-3 flex-1 bg-border sm:max-w-8" aria-hidden />
      <StepItem n={3} label="Payment" active={step === 3} done={false} />
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

function eventHours(event: Meetup) {
  if (/11\s*:\s*00\s*AM/i.test(event.time)) {
    return { startHour: 11, startMin: 0, endHour: 13, endMin: 0 };
  }
  if (/10\s*:\s*00\s*AM/i.test(event.time)) {
    return { startHour: 10, startMin: 0, endHour: 13, endMin: 0 };
  }
  return { startHour: 17, startMin: 0, endHour: 20, endMin: 0 };
}

function googleCalendarUrl(event: Meetup) {
  const [y, m, d] = event.dateISO.split("-").map(Number);
  const { startHour, startMin, endHour, endMin } = eventHours(event);
  const pad = (n: number) => String(n).padStart(2, "0");
  const stamp = (hour: number, minute: number) =>
    `${y}${pad(m)}${pad(d)}T${pad(hour)}${pad(minute)}00`;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${stamp(startHour, startMin)}/${stamp(endHour, endMin)}`,
    details: event.blurb,
    location: event.address ?? `${event.venue}, ${event.city}`,
    ctz: "Asia/Kolkata",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function ProcessingView() {
  return (
    <div className="relative flex min-h-[320px] flex-1 flex-col items-center justify-center gap-6 px-8 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,color-mix(in_oklab,var(--saffron)_10%,transparent),transparent_55%)]"
      />
      <div className="relative flex flex-col items-center gap-4">
        {/* Animated spinner */}
        <span className="relative flex h-16 w-16 items-center justify-center">
          <span
            aria-hidden
            className="absolute inset-0 animate-[hero-pulse_1.8s_ease-in-out_infinite] rounded-full bg-primary/20"
          />
          <svg
            className="relative h-10 w-10 animate-spin text-primary"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
          >
            <circle
              className="opacity-20"
              cx="12" cy="12" r="10"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              className="opacity-90"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        </span>
        <div className="text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-primary">
            Processing
          </p>
          <h2 className="mt-2 font-display text-[1.5rem] font-semibold leading-tight tracking-tight text-foreground">
            Confirming your registration…
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Please wait while we lock in your seat. Do not close this window.
          </p>
        </div>
      </div>
    </div>
  );
}

function SuccessView({
  event,
  registrantName,
}: {
  event: Meetup;
  registrantName: string;
}) {
  const { closeRsvp } = useRsvp();
  const day = new Date(event.dateISO + "T12:00:00");
  const dayNum = day.getDate();
  const monthShort = day
    .toLocaleDateString("en-IN", { month: "short" })
    .toUpperCase();

  const badgeSearch = {
    event: event.slug,
    ...(registrantName.trim()
      ? { name: registrantName.trim() }
      : {}),
  };

  const eventCard = (
    <div className="h-full w-full overflow-hidden rounded-[16px] border border-border/70 bg-background/90 text-left shadow-[0_16px_36px_-26px_rgba(0,0,0,0.35)]">
      <div className="flex items-center justify-center gap-2 border-b border-border/70 bg-primary px-4 py-3 text-primary-foreground">
        <span className="text-[11px] font-medium uppercase tracking-[0.14em]">
          {monthShort}
        </span>
        <span className="font-display text-xl leading-none">{dayNum}</span>
      </div>
      <div className="divide-y divide-border/70">
        <SuccessMeta
          icon={CalendarDays}
          label="Event"
          value={event.title}
          hint={event.dateLabel}
        />
        <SuccessMeta
          icon={MapPin}
          label="Location"
          value={
            event.space
              ? `${event.venue} · ${event.space}`
              : `${event.venue}, ${event.city}`
          }
          hint={event.address}
        />
        <SuccessMeta icon={Clock} label="Time" value={event.time} />
      </div>
    </div>
  );

  const actions = (
    <div className="flex h-full w-full flex-col justify-center gap-2">
      <Link
        to="/badge"
        search={badgeSearch}
        onClick={() => {
          closeRsvp();
        }}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-3.5 py-2.5 text-[13px] font-medium text-primary-foreground shadow-[0_10px_24px_-14px_color-mix(in_oklab,var(--terracotta)_75%,transparent)] transition-[opacity,transform] hover:opacity-90 active:scale-[0.98] sm:px-4 sm:text-sm"
      >
        <ImagePlus className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" strokeWidth={1.75} />
        <span className="truncate">Create badge</span>
      </Link>
      <a
        href={links.community}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center justify-center gap-2 rounded-full border border-border/90 bg-background/80 px-3.5 py-2.5 text-[13px] font-medium text-foreground transition-colors hover:border-primary/30 hover:bg-secondary/40 sm:px-4 sm:text-sm"
      >
        <MessageCircle className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" strokeWidth={1.75} />
        <span className="truncate">WhatsApp</span>
      </a>
      <a
        href={googleCalendarUrl(event)}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center justify-center gap-2 rounded-full border border-border/90 bg-background/80 px-3.5 py-2.5 text-[13px] font-medium text-foreground transition-colors hover:border-primary/30 hover:bg-secondary/40 sm:px-4 sm:text-sm"
      >
        <CalendarDays className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" strokeWidth={1.75} />
        <span className="truncate">Calendar</span>
      </a>
    </div>
  );

  return (
    <div className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,color-mix(in_oklab,var(--saffron)_14%,transparent),transparent_52%),radial-gradient(ellipse_at_85%_100%,color-mix(in_oklab,var(--terracotta)_8%,transparent),transparent_50%)]"
      />

      <div className="relative px-4 pb-5 pt-12 sm:px-6 sm:pb-6 sm:pt-14">
        {/* Desktop: copy + actions | card · Mobile: header, then card | actions */}
        <div className="grid gap-4 md:grid-cols-2 md:items-stretch md:gap-6">
          <div className="flex min-w-0 flex-col">
            <div className="flex flex-col items-center text-center md:items-start md:text-left">
              <div className="mb-2.5 inline-flex items-center gap-2.5">
                <span className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center">
                  <span
                    aria-hidden
                    className="absolute inset-0 animate-[hero-pulse_2.4s_ease-in-out_infinite] rounded-full bg-primary/20"
                  />
                  <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_10px_24px_-10px_color-mix(in_oklab,var(--terracotta)_70%,transparent)]">
                    <Check className="h-4 w-4" strokeWidth={2.5} />
                  </span>
                </span>
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-primary sm:text-[11px]">
                  Confirmed
                </p>
              </div>
              <h2 className="font-display text-[1.45rem] leading-tight tracking-tight text-foreground sm:text-[1.7rem]">
                You&apos;re Registered!
              </h2>
              <p className="mt-1.5 max-w-sm text-[13px] leading-relaxed text-muted-foreground sm:text-sm">
                Seat locked in. Create a badge, join WhatsApp, and save the date.
              </p>
            </div>

            {/* Actions under copy on desktop only */}
            <div className="mt-auto hidden pt-5 md:block">{actions}</div>
            <p className="mt-3 hidden items-center gap-2 text-left text-[12px] text-muted-foreground md:inline-flex">
              <Mail className="h-3.5 w-3.5 shrink-0 text-primary" strokeWidth={1.75} />
              Confirmation + badge link sent to your email.
            </p>
          </div>

          {/* Card column — on mobile shares row with actions */}
          <div className="grid min-w-0 grid-cols-[minmax(0,1.2fr)_minmax(7.5rem,0.8fr)] items-stretch gap-2.5 sm:gap-3 md:block">
            <div className="min-w-0">{eventCard}</div>
            <div className="min-w-0 md:hidden">{actions}</div>
          </div>
        </div>

        <p className="mt-3.5 flex items-center justify-center gap-2 text-center text-[11px] text-muted-foreground md:hidden">
          <Mail className="h-3.5 w-3.5 shrink-0 text-primary" strokeWidth={1.75} />
          Confirmation + badge link sent to your email.
        </p>
      </div>
    </div>
  );
}

function SuccessMeta({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="flex items-start justify-center gap-2.5 px-4 py-3.5 text-center">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
      </span>
      <div className="min-w-0 flex-1 text-left">
        <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </p>
        <p className="mt-0.5 text-sm font-medium leading-snug text-foreground">{value}</p>
        {hint ? <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p> : null}
      </div>
    </div>
  );
}

function MultiSelectDropdown({
  options,
  selected,
  onToggle,
  max,
  placeholder,
}: {
  options: readonly string[];
  selected: string[];
  onToggle: (option: string) => void;
  max?: number;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const atMax = typeof max === "number" && selected.length >= max;

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent | TouchEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const summary =
    selected.length === 0
      ? placeholder
      : selected.length <= 2
        ? selected.join(", ")
        : `${selected.length} selected`;

  return (
    <div ref={rootRef} className="relative w-full min-w-0">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex h-[52px] w-full items-center justify-between gap-3 rounded-[11px] border border-border/90 bg-card px-3.5 text-left text-sm text-foreground shadow-none outline-none transition-[border-color,box-shadow] focus-visible:border-primary/35 focus-visible:ring-1 focus-visible:ring-primary/40",
          selected.length === 0 && "text-muted-foreground/65",
          open && "border-primary/35 ring-1 ring-primary/40",
        )}
      >
        <span className="min-w-0 flex-1 truncate pr-2">{summary}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
            open && "rotate-180",
          )}
          strokeWidth={1.75}
          aria-hidden
        />
      </button>

      {open ? (
        <div
          role="listbox"
          aria-multiselectable="true"
          className="absolute left-0 right-0 z-30 mt-1.5 max-h-56 overflow-y-auto rounded-[12px] border border-border/90 bg-card py-1.5 shadow-[0_16px_40px_-24px_rgba(0,0,0,0.45)]"
        >
          {options.map((option) => {
            const isSelected = selected.includes(option);
            const disabled = atMax && !isSelected;
            return (
              <button
                key={option}
                type="button"
                role="option"
                aria-selected={isSelected}
                disabled={disabled}
                onClick={() => onToggle(option)}
                className={cn(
                  "flex w-full items-start gap-3 px-3.5 py-2.5 text-left text-sm transition-colors",
                  isSelected
                    ? "bg-primary/10 text-foreground"
                    : "text-foreground/85 hover:bg-muted/70",
                  disabled && "cursor-not-allowed opacity-40 hover:bg-transparent",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background",
                  )}
                  aria-hidden
                >
                  {isSelected ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
                </span>
                <span className="min-w-0 flex-1 leading-snug">{option}</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function Field({
  label,
  required,
  error,
  hint,
  count,
  max,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  count?: number;
  max?: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-start justify-between gap-3">
        <Label className="min-w-0 flex-1 text-[13px] font-medium leading-snug text-foreground/90">
          {label}
          {required ? <span className="text-primary"> *</span> : null}
        </Label>
        {typeof count === "number" && typeof max === "number" ? (
          <span
            className={cn(
              "shrink-0 pt-0.5 text-[11px] tabular-nums text-muted-foreground",
              count >= max && "text-primary",
            )}
          >
            {count}/{max}
          </span>
        ) : null}
      </div>
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
    mapsUrl: meetupMapsUrl(event),
  };
}
