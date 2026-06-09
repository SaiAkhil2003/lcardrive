import { NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth/api";
import { getClaimedInstructorSlugsForUser } from "@/lib/auth/ownership";
import { getStripeDisabledMessage } from "@/lib/stripe";
import { insertWithServiceRole, selectWithServiceRole } from "@/lib/supabase/admin";

export async function GET(request) {
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

  const result = await selectWithServiceRole(
    `featured_listing_orders?instructor_slug=eq.${encodeURIComponent(instructorSlug)}&select=*&order=created_at.desc`
  );

  return NextResponse.json({
    ok: true,
    mode: result.placeholder ? "development" : "supabase",
    featuredListings: result.data || []
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
  const result = await insertWithServiceRole("featured_listing_orders", {
    instructor_slug: instructorSlug,
    clerk_user_id: auth.context.userId,
    status: "pending_payment",
    starts_at: body.startsAt || null,
    ends_at: body.endsAt || null,
    amount_cents: Number(body.amountCents) || 0
  });

  if (result.error) {
    return NextResponse.json(
      { ok: false, error: "Featured listing order could not be created." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    mode: result.placeholder ? "development" : "supabase",
    featuredListing: result.data?.[0] || result.data
  });
}
