import type { Meetup } from "@/lib/events";

const API_BASE =
  (import.meta as ImportMeta & { env: Record<string, string> }).env
    .VITE_API_URL || "http://localhost:4000";

export const REGISTRATION_FEE_INR = 99;

export function eventFeeInr(event?: { payment?: { amountInr?: number } } | null) {
  const amount = Number(event?.payment?.amountInr);
  return Number.isFinite(amount) && amount > 0 ? amount : REGISTRATION_FEE_INR;
}

export type EventPaymentConfig = {
  keyId?: string;
  amountInr: number;
  amountPaise: number;
  currency: string;
  ticketName: string;
  checkoutMode: "razorpay" | "manual";
  methods: {
    type: string;
    label?: string;
    upiId?: string;
    paymentNumber?: string;
    paymentLink?: string;
    qrImageUrl?: string;
    instructions?: string;
  }[];
  hasRazorpay: boolean;
  hasManualMethods: boolean;
  enabled: boolean;
};

export async function fetchPaymentConfig(eventSlug: string) {
  const res = await fetch(
    `${API_BASE}/api/payments/config?eventSlug=${encodeURIComponent(eventSlug)}`,
  );
  const data = (await res.json().catch(() => ({}))) as EventPaymentConfig & {
    error?: string;
  };
  if (!res.ok) {
    throw new Error(data.error || "Could not load payment options.");
  }
  return data;
}

export async function submitManualPaymentRegistration(
  payload: RsvpPayload & {
    provider: string;
    proofKey: string;
    note?: string;
  },
) {
  const res = await fetch(`${API_BASE}/api/payments/manual-confirm`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = (await res.json().catch(() => ({}))) as {
    error?: string;
    message?: string;
    id?: string;
    paymentStatus?: string;
  };
  if (!res.ok) {
    throw new Error(data.error || "Could not submit registration.");
  }
  return data;
}

export async function uploadPaymentProof(file: File) {
  const body = new FormData();
  body.append("proof", file);
  const res = await fetch(`${API_BASE}/api/payments/proof-upload`, {
    method: "POST",
    body,
  });
  const data = (await res.json().catch(() => ({}))) as {
    key?: string;
    error?: string;
  };
  if (!res.ok || !data.key) {
    throw new Error(data.error || "Could not upload payment proof.");
  }
  return data.key;
}

export type RsvpPayload = {
  name: string;
  email: string;
  phone: string;
  countryCode: string;
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
  canHelpWith?: string;
  biggestChallenge?: string;
  joinWhatsapp?: boolean;
  subscribeUpdates?: boolean;
  questions?: string;
  heardAboutEvent: string;
  heardAboutEventOther?: string;
  event: Pick<
    Meetup,
    "slug" | "title" | "dateISO" | "dateLabel" | "time" | "venue" | "city" | "format"
  > & {
    mapsUrl?: string;
  };
};

export type PaymentMethod = "upi" | "card" | "netbanking" | "wallet";

export type CreatePaymentOrderResponse = {
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
  amountInr: number;
  ticketName: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
};

export async function submitRsvp(payload: RsvpPayload) {
  const res = await fetch(`${API_BASE}/api/rsvp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = (await res.json().catch(() => ({}))) as {
    error?: string;
    message?: string;
  };

  if (!res.ok) {
    throw new Error(data.error || "Could not submit RSVP.");
  }

  return data;
}

export async function createPaymentOrder(
  payload: RsvpPayload & { paymentMethod: PaymentMethod },
) {
  const res = await fetch(`${API_BASE}/api/payments/create-order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = (await res.json().catch(() => ({}))) as CreatePaymentOrderResponse & {
    error?: string;
  };

  if (!res.ok) {
    throw new Error(data.error || "Could not start payment.");
  }

  return data;
}

export async function verifyPaymentAndRegister(
  payload: RsvpPayload & {
    paymentMethod: PaymentMethod;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  },
) {
  const res = await fetch(`${API_BASE}/api/payments/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = (await res.json().catch(() => ({}))) as {
    error?: string;
    message?: string;
    id?: string;
  };

  if (!res.ok) {
    throw new Error(data.error || "Could not verify payment.");
  }

  return data;
}

export type ContactPayload = {
  name: string;
  email: string;
  message: string;
};

export async function submitContact(payload: ContactPayload) {
  const res = await fetch(`${API_BASE}/api/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = (await res.json().catch(() => ({}))) as {
    error?: string;
    message?: string;
    id?: string;
  };

  if (!res.ok) {
    throw new Error(data.error || "Could not send message.");
  }

  return data;
}
