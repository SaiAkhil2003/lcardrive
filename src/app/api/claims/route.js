import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { insertWithServiceRole } from "@/lib/supabase/admin";

function hasClerkServerConfig() {
  return Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY
  );
}

function hasClerkSessionCookie(request) {
  return Boolean(request.cookies.get("__session"));
}

function validateClaim(body) {
  return Boolean(
    body?.instructorId &&
      body?.fullName &&
      body?.email &&
      body?.phone &&
      body?.adiRegistration
  );
}

export async function POST(request) {
  const body = await request.json().catch(() => null);

  if (!validateClaim(body)) {
    return NextResponse.json(
      { ok: false, error: "Missing required claim fields." },
      { status: 400 }
    );
  }

  let clerkUserId = "development-placeholder-user";

  if (hasClerkServerConfig()) {
    if (!hasClerkSessionCookie(request)) {
      return NextResponse.json(
        { ok: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    const { userId } = await auth().catch(() => ({ userId: null }));

    if (!userId) {
      return NextResponse.json(
        { ok: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    clerkUserId = userId;
  }

  const payload = {
    instructor_slug: body.instructorId,
    clerk_user_id: clerkUserId,
    full_name: body.fullName,
    email: body.email,
    phone: body.phone,
    adi_registration: body.adiRegistration,
    status: "pending"
  };

  const result = await insertWithServiceRole("profile_claims", payload);

  if (result.error) {
    return NextResponse.json(
      { ok: false, error: result.error },
      { status: 500 }
    );
  }

  if (result.placeholder) {
    return NextResponse.json({
      ok: true,
      mode: "development",
      message:
        "Claim request accepted locally. Configure Supabase keys to persist claims.",
      claim: payload
    });
  }

  return NextResponse.json({
    ok: true,
    mode: "supabase",
    claim: result.data?.[0] || result.data
  });
}
