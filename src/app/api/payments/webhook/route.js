import { NextResponse } from "next/server";
import { updateWithServiceRole } from "@/lib/supabase/admin";
import { verifyStripeSignature } from "@/lib/stripe";

function getPaymentStatus(eventType) {
  if (eventType === "checkout.session.completed") {
    return "paid";
  }

  if (eventType === "payment_intent.payment_failed") {
    return "failed";
  }

  return "received";
}

export async function POST(request) {
  const rawBody = await request.text();

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({
      ok: true,
      mode: "disabled",
      message: "Stripe webhook handling is disabled until STRIPE_WEBHOOK_SECRET is configured."
    });
  }

  const signatureHeader = request.headers.get("stripe-signature");

  if (!verifyStripeSignature({ rawBody, signatureHeader })) {
    return NextResponse.json(
      { ok: false, error: "Invalid Stripe signature." },
      { status: 400 }
    );
  }

  const event = JSON.parse(rawBody);
  const bookingId =
    event?.data?.object?.metadata?.booking_id ||
    event?.data?.object?.client_reference_id ||
    "";
  const status = getPaymentStatus(event.type);

  if (bookingId) {
    await updateWithServiceRole(
      `payment_intents?booking_id=eq.${encodeURIComponent(bookingId)}`,
      {
        status,
        raw_event_type: event.type,
        updated_at: new Date().toISOString()
      }
    );
    await updateWithServiceRole(
      `bookings?id=eq.${encodeURIComponent(bookingId)}`,
      {
        payment_status: status,
        updated_at: new Date().toISOString()
      }
    );
  }

  return NextResponse.json({
    ok: true,
    received: true
  });
}
