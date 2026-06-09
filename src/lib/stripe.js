import crypto from "crypto";

export function hasStripeCheckoutConfig() {
  return Boolean(
    process.env.STRIPE_SECRET_KEY && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  );
}

export function hasStripeConnectConfig() {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_CONNECT_CLIENT_ID);
}

export function isLiveStripeSecretKey() {
  return String(process.env.STRIPE_SECRET_KEY || "").startsWith("sk_live_");
}

export function getStripeDisabledMessage() {
  if (!hasStripeCheckoutConfig()) {
    return "Stripe is disabled because Stripe environment variables are not configured.";
  }

  if (isLiveStripeSecretKey()) {
    return "Live Stripe charges are disabled until production Stripe Connect legal and payout verification are explicitly completed.";
  }

  return "";
}

function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

function appendParam(params, key, value) {
  if (value !== null && value !== undefined && value !== "") {
    params.append(key, String(value));
  }
}

export async function createCheckoutSession({
  bookingId,
  instructorSlug,
  amountCents,
  platformFeeCents,
  stripeAccountId
}) {
  const disabledMessage = getStripeDisabledMessage();

  if (disabledMessage) {
    return {
      ok: false,
      disabled: true,
      message: disabledMessage
    };
  }

  const params = new URLSearchParams();
  appendParam(params, "mode", "payment");
  appendParam(params, "success_url", `${getSiteUrl()}/portal/bookings/${bookingId}?payment=success`);
  appendParam(params, "cancel_url", `${getSiteUrl()}/portal/bookings/${bookingId}?payment=cancelled`);
  appendParam(params, "line_items[0][quantity]", "1");
  appendParam(params, "line_items[0][price_data][currency]", "aud");
  appendParam(params, "line_items[0][price_data][unit_amount]", amountCents);
  appendParam(params, "line_items[0][price_data][product_data][name]", "LCarDrive lesson booking");
  appendParam(params, "metadata[booking_id]", bookingId);
  appendParam(params, "metadata[instructor_slug]", instructorSlug);
  appendParam(params, "payment_intent_data[application_fee_amount]", platformFeeCents);

  if (stripeAccountId) {
    appendParam(params, "payment_intent_data[transfer_data][destination]", stripeAccountId);
  }

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: params.toString()
  });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    return {
      ok: false,
      error: data?.error?.message || "Stripe checkout session failed."
    };
  }

  return {
    ok: true,
    sessionId: data.id,
    url: data.url
  };
}

export function getStripeConnectOnboardingUrl({ state }) {
  if (!hasStripeConnectConfig() || isLiveStripeSecretKey()) {
    return null;
  }

  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.STRIPE_CONNECT_CLIENT_ID,
    scope: "read_write",
    redirect_uri: `${getSiteUrl()}/portal/subscription`,
    state
  });

  // Production onboarding still needs Stripe legal, identity, and payout review.
  return `https://connect.stripe.com/oauth/authorize?${params.toString()}`;
}

export function verifyStripeSignature({ rawBody, signatureHeader }) {
  if (!process.env.STRIPE_WEBHOOK_SECRET || !signatureHeader) {
    return false;
  }

  const timestamp = signatureHeader
    .split(",")
    .find((part) => part.startsWith("t="))
    ?.slice(2);
  const signatures = signatureHeader
    .split(",")
    .filter((part) => part.startsWith("v1="))
    .map((part) => part.slice(3));

  if (!timestamp || signatures.length === 0) {
    return false;
  }

  const expected = crypto
    .createHmac("sha256", process.env.STRIPE_WEBHOOK_SECRET)
    .update(`${timestamp}.${rawBody}`)
    .digest("hex");

  return signatures.some((signature) => {
    const left = Buffer.from(signature);
    const right = Buffer.from(expected);

    return left.length === right.length && crypto.timingSafeEqual(left, right);
  });
}
