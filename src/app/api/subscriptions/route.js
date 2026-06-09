import { NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth/api";
import { getClaimedInstructorSlugsForUser } from "@/lib/auth/ownership";
import { getInstructorSubscriptionStatus } from "@/lib/platformData";
import { getStripeDisabledMessage } from "@/lib/stripe";
import { insertWithServiceRole } from "@/lib/supabase/admin";

export async function GET(request) {
  const auth = await requireAuthenticatedUser(request);

  if (!auth.ok) {
    return auth.response;
  }

  return NextResponse.json({
    ok: true,
    status: await getInstructorSubscriptionStatus(auth.context.userId)
  });
}

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

  if (disabledMessage) {
    return NextResponse.json({
      ok: true,
      mode: "disabled",
      message: disabledMessage
    });
  }

  const body = await request.json().catch(() => ({}));
  const result = await insertWithServiceRole("subscriptions", {
    instructor_slug: instructorSlug,
    clerk_user_id: auth.context.userId,
    plan_code: body.planCode || "starter",
    status: "pending_payment"
  });

  if (result.error) {
    return NextResponse.json(
      { ok: false, error: "Subscription could not be created." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    mode: result.placeholder ? "development" : "supabase",
    subscription: result.data?.[0] || result.data
  });
}
