import type { PaymentMethod } from "@/lib/api";
import brandLogo from "@/assets/trizen-mark.png";

const RAZORPAY_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";

export type RazorpaySuccessResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayCheckoutOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image?: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: { color?: string };
  modal?: {
    ondismiss?: () => void;
  };
  handler: (response: RazorpaySuccessResponse) => void;
  config?: {
    display: {
      blocks: Record<
        string,
        {
          name: string;
          instruments: Array<{ method: string }>;
        }
      >;
      sequence: string[];
      preferences: { show_default_blocks: boolean };
    };
  };
};

type RazorpayInstance = {
  open: () => void;
  on: (event: string, handler: (response: unknown) => void) => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => RazorpayInstance;
  }
}

let scriptPromise: Promise<void> | null = null;

function brandLogoUrl() {
  if (typeof window === "undefined") return brandLogo;
  try {
    return new URL(brandLogo, window.location.origin).toString();
  } catch {
    return brandLogo;
  }
}

export function loadRazorpayScript() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Razorpay can only load in the browser."));
  }
  if (window.Razorpay) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${RAZORPAY_SCRIPT}"]`,
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("Could not load Razorpay checkout.")),
      );
      if (window.Razorpay) resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error("Could not load Razorpay checkout."));
    };
    document.body.appendChild(script);
  });

  return scriptPromise;
}

function methodDisplayConfig(method: PaymentMethod) {
  const labels: Record<PaymentMethod, string> = {
    upi: "Pay with UPI",
    card: "Pay with Cards",
    netbanking: "Pay with Net Banking",
    wallet: "Pay with Wallet",
  };

  return {
    display: {
      blocks: {
        preferred: {
          name: labels[method],
          instruments: [{ method }],
        },
      },
      sequence: ["block.preferred"],
      preferences: {
        show_default_blocks: false,
      },
    },
  };
}

export async function openRazorpayCheckout(options: {
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  method: PaymentMethod;
  prefill: { name: string; email: string; contact: string };
  themeColor?: string;
  image?: string;
  onSuccess: (response: RazorpaySuccessResponse) => void;
  onDismiss?: () => void;
}) {
  await loadRazorpayScript();
  if (!window.Razorpay) {
    throw new Error("Razorpay checkout is unavailable.");
  }

  const rzp = new window.Razorpay({
    key: options.keyId,
    amount: options.amount,
    currency: options.currency,
    name: options.name,
    description: options.description,
    image: options.image || brandLogoUrl(),
    order_id: options.orderId,
    prefill: options.prefill,
    theme: { color: options.themeColor ?? "#d8643c" },
    config: methodDisplayConfig(options.method),
    modal: {
      ondismiss: options.onDismiss,
    },
    handler: options.onSuccess,
  });

  rzp.open();
}
