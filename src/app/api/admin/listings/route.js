import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth/roles";
import { updateWithServiceRole } from "@/lib/supabase/admin";

function getRateNumber(rate) {
  return Number(String(rate).replace(/[^0-9.]/g, "")) || null;
}

function getLanguages(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function getPayload(body) {
  return {
    display_name: body.name,
    suburb: body.suburb,
    claim_status: body.claimStatus,
    hourly_rate: getRateNumber(body.rate),
    rating: Number(body.rating) || null,
    transmission: body.transmission,
    languages: getLanguages(body.language),
    anxiety_friendly: Boolean(body.anxietyFriendly),
    international_licence_conversion: Boolean(body.internationalLicence),
    verified: body.claimStatus === "Verified",
    updated_at: new Date().toISOString()
  };
}

async function requireAdmin() {
  const authObject = await auth().catch(() => null);

  if (!authObject?.userId) {
    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, error: "Authentication required." },
        { status: 401 }
      )
    };
  }

  if (!isAdmin({ sessionClaims: authObject.sessionClaims, ...authObject.sessionClaims })) {
    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, error: "Forbidden: LCarDrive admin role required." },
        { status: 403 }
      )
    };
  }

  return { ok: true };
}

export async function PATCH(request) {
  const admin = await requireAdmin();

  if (!admin.ok) {
    return admin.response;
  }

  const body = await request.json().catch(() => null);

  if (!body?.slug) {
    return NextResponse.json(
      { ok: false, error: "Missing listing slug." },
      { status: 400 }
    );
  }

  const result = await updateWithServiceRole(
    `instructors?slug=eq.${encodeURIComponent(body.slug)}`,
    getPayload(body)
  );

  if (result.placeholder) {
    return NextResponse.json({
      ok: true,
      mode: "development",
      message: "Supabase service role key is not configured; edit kept client-side."
    });
  }

  if (result.error) {
    return NextResponse.json(
      { ok: false, error: "Listing update failed." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    mode: "supabase",
    listing: result.data?.[0] || null
  });
}
