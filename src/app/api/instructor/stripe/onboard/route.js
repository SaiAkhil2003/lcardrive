import { NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth/api";
import { getClaimedInstructorSlugsForUser } from "@/lib/auth/ownership";
import { getStripeConnectOnboardingUrl, getStripeDisabledMessage } from "@/lib/stripe";
import { insertWithServiceRole } from "@/lib/supabase/admin";

export async function POST(request) {
  const auth = await requireAuthenticatedUser(request);

  if (!auth.ok) {
    return auth.response;
  }

  const ownership = await getClaimedInstructorSlugsForUser(auth.context.userId);
  const instructorSlug = ownership.data[0];

  if (!auth.context.isAdmin && !instructorSlug) {
    return NextResponse.json(
      { ok: false, error: "Claimed instructor ownership is required." },
      { status: 403 }
    );
  }

  const disabledMessage = getStripeDisabledMessage();
  const onboardingUrl = getStripeConnectOnboardingUrl({
    state: `${auth.context.userId}:${instructorSlug || "admin"}`
  });

  if (disabledMessage || !onboardingUrl) {
    return NextResponse.json({
      ok: true,
      mode: "disabled",
      message:
        disabledMessage ||
        "Stripe Connect onboarding is disabled until Connect variables are configured."
    });
  }

  await insertWithServiceRole("instructor_payout_accounts", {
    instructor_slug: instructorSlug,
    clerk_user_id: auth.context.userId,
    stripe_onboarding_status: "started"
  });

  return NextResponse.json({
    ok: true,
    mode: "stripe-connect-test",
    onboardingUrl
  });
}
