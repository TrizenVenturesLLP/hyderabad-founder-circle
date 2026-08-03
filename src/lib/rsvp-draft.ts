import type { PaymentMethod } from "@/lib/api";

const DRAFT_PREFIX = "hfn-rsvp-draft:";

export type RsvpDraftForm = {
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

export type RsvpDraft = {
  form: RsvpDraftForm;
  step: 1 | 2 | 3;
  paymentMethod: PaymentMethod;
  savedAt: number;
};

function draftKey(eventSlug: string) {
  return `${DRAFT_PREFIX}${eventSlug}`;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

export function hasRsvpDraftContent(form: RsvpDraftForm) {
  return Boolean(
    form.name.trim() ||
      form.email.trim() ||
      form.phone.trim() ||
      form.linkedin.trim() ||
      form.role ||
      form.company.trim() ||
      form.startupStage ||
      form.gtmChallenges.length ||
      form.leaveWith.length ||
      form.industry ||
      form.lookingFor.length ||
      form.offerCommunity.length ||
      form.wantToMeet.length ||
      form.canHelpWith.trim() ||
      form.biggestChallenge.trim() ||
      form.joinWhatsapp ||
      form.subscribeUpdates ||
      form.questions.trim(),
  );
}

export function loadRsvpDraft(eventSlug: string): RsvpDraft | null {
  if (typeof window === "undefined" || !eventSlug) return null;
  try {
    const raw = window.localStorage.getItem(draftKey(eventSlug));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<RsvpDraft>;
    if (!parsed?.form || typeof parsed.form !== "object") return null;

    const step =
      parsed.step === 2 || parsed.step === 3 ? parsed.step : 1;
    const paymentMethod =
      parsed.paymentMethod === "card" ||
      parsed.paymentMethod === "netbanking" ||
      parsed.paymentMethod === "wallet" ||
      parsed.paymentMethod === "upi"
        ? parsed.paymentMethod
        : "upi";

    const form = parsed.form as RsvpDraftForm;
    return {
      form: {
        name: typeof form.name === "string" ? form.name : "",
        email: typeof form.email === "string" ? form.email : "",
        phone: typeof form.phone === "string" ? form.phone : "",
        linkedin: typeof form.linkedin === "string" ? form.linkedin : "",
        role: typeof form.role === "string" ? form.role : "",
        company: typeof form.company === "string" ? form.company : "",
        startupStage:
          typeof form.startupStage === "string" ? form.startupStage : "",
        gtmChallenges: isStringArray(form.gtmChallenges)
          ? form.gtmChallenges
          : [],
        leaveWith: isStringArray(form.leaveWith) ? form.leaveWith : [],
        industry: typeof form.industry === "string" ? form.industry : "",
        lookingFor: isStringArray(form.lookingFor) ? form.lookingFor : [],
        offerCommunity: isStringArray(form.offerCommunity)
          ? form.offerCommunity
          : [],
        wantToMeet: isStringArray(form.wantToMeet) ? form.wantToMeet : [],
        canHelpWith:
          typeof form.canHelpWith === "string" ? form.canHelpWith : "",
        biggestChallenge:
          typeof form.biggestChallenge === "string"
            ? form.biggestChallenge
            : "",
        joinWhatsapp: Boolean(form.joinWhatsapp),
        subscribeUpdates: Boolean(form.subscribeUpdates),
        questions: typeof form.questions === "string" ? form.questions : "",
      },
      step,
      paymentMethod,
      savedAt: typeof parsed.savedAt === "number" ? parsed.savedAt : Date.now(),
    };
  } catch {
    return null;
  }
}

export function saveRsvpDraft(
  eventSlug: string,
  draft: Omit<RsvpDraft, "savedAt">,
) {
  if (typeof window === "undefined" || !eventSlug) return;
  try {
    if (!hasRsvpDraftContent(draft.form)) {
      window.localStorage.removeItem(draftKey(eventSlug));
      return;
    }
    const payload: RsvpDraft = {
      ...draft,
      savedAt: Date.now(),
    };
    window.localStorage.setItem(draftKey(eventSlug), JSON.stringify(payload));
  } catch {
    // Ignore quota / private mode failures.
  }
}

export function clearRsvpDraft(eventSlug: string) {
  if (typeof window === "undefined" || !eventSlug) return;
  try {
    window.localStorage.removeItem(draftKey(eventSlug));
  } catch {
    // Ignore storage failures.
  }
}
