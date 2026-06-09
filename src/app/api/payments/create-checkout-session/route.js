import { NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth/api";
import { userCanManageInstructor } from "@/lib/auth/ownership";
import { getBookingById } from "@/lib/platformData";
import { createCheckoutSession, getStripeDisabledMessage } from "@/lib/stripe";
import {
  insertWithServiceRole,
  selectWithServiceRole,
  updateWithServiceRole
} from "@/lib/supabase/admin";

async function canPayForBooking(authContext, booking) {
  if (booking.learnerUserId === authContext.userId || authContext.isAdmin) {
    return true;
  }

  const ownership = await userCanManageInstructor(
    authContext.userId,
    booking.instructorSlug
  );

  return ownership.ok;
}

export async function POST(request) {
  const auth = await requireAuthenticatedUser(request);

  if (!auth.ok) {
    return auth.response;
  }

  const disabledMessage = getStripeDisabledMessage();

  if (disabledMessage) {
    return NextResponse.json({
      ok: true,
      mode: "disabled",
      message: disabledMessage
    });
  }

  const body = await request.json().catch(() => ({}));
  const bookingResult = await getBookingById(body.bookingId);

  if (!bookingResult.data) {
    return NextResponse.json(
      { ok: false, error: "Booking not found." },
      { status: 404 }
    );
  }

  if (!(await canPayForBooking(auth.context, bookingResult.data))) {
    return NextResponse.json(
      { ok: false, error: "Forbidden: booking ownership required." },
      { status: 403 }
    );
  }

  const payoutResult = await selectWithServiceRole(
    `instructor_payout_accounts?instructor_slug=eq.${encodeURIComponent(bookingResult.data.instructorSlug)}&select=stripe_account_id&limit=1`
  );
  const stripeAccountId = payoutResult.data?.[0]?.stripe_account_id || "";
  const session = await createCheckoutSession({
    bookingId: bookingResult.data.id,
    instructorSlug: bookingResult.data.instructorSlug,
    amountCents: bookingResult.data.amountCents,
    platformFeeCents: bookingResult.data.platformFeeCents,
    stripeAccountId
  });

  if (!session.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: session.message || session.error || "Checkout unavailable."
      },
      { status: session.disabled ? 200 : 502 }
    );
  }

  await insertWithServiceRole("payment_intents", {
    booking_id: bookingResult.data.id,
    learner_clerk_user_id: bookingResult.data.learnerUserId,
    instructor_slug: bookingResult.data.instructorSlug,
    stripe_checkout_session_id: session.sessionId,
    stripe_account_id: stripeAccountId || null,
    amount_cents: bookingResult.data.amountCents,
    application_fee_cents: bookingResult.data.platformFeeCents,
    currency: "aud",
    status: "checkout_created"
  });
  await updateWithServiceRole(
    `bookings?id=eq.${encodeURIComponent(bookingResult.data.id)}`,
    {
      payment_status: "checkout_created",
      updated_at: new Date().toISOString()
    }
  );

  return NextResponse.json({
    ok: true,
    mode: "stripe-test",
    checkoutUrl: session.url,
    sessionId: session.sessionId
  });
}
