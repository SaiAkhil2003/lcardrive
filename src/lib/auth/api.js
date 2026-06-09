import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isAdmin, isInstructor } from "@/lib/auth/roles";

export function hasClerkServerConfig() {
  return Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY
  );
}

export function hasClerkSessionCookie(request) {
  return Boolean(request?.cookies?.get("__session"));
}

export function authenticationRequiredResponse(message = "Authentication required.") {
  return NextResponse.json(
    { ok: false, error: message },
    { status: 401 }
  );
}

export function forbiddenResponse(message = "Forbidden.") {
  return NextResponse.json(
    { ok: false, error: message },
    { status: 403 }
  );
}

export async function getRequestAuth(request) {
  if (!hasClerkServerConfig()) {
    return {
      configured: false,
      userId: null,
      sessionClaims: null,
      isAdmin: false,
      isInstructor: false
    };
  }

  if (request && !hasClerkSessionCookie(request)) {
    return {
      configured: true,
      userId: null,
      sessionClaims: null,
      isAdmin: false,
      isInstructor: false
    };
  }

  const authObject = await auth().catch(() => null);
  const sessionClaims = authObject?.sessionClaims || null;
  const user = { sessionClaims, ...sessionClaims };

  return {
    configured: true,
    userId: authObject?.userId || null,
    sessionClaims,
    isAdmin: isAdmin(user),
    isInstructor: isInstructor(user)
  };
}

export async function requireAuthenticatedUser(request) {
  const context = await getRequestAuth(request);

  if (!context.configured) {
    return {
      ok: false,
      response: authenticationRequiredResponse(
        "Authentication required. Configure Clerk server variables for protected writes."
      )
    };
  }

  if (!context.userId) {
    return {
      ok: false,
      response: authenticationRequiredResponse()
    };
  }

  return {
    ok: true,
    context
  };
}

export async function requireAdminUser(request) {
  const result = await requireAuthenticatedUser(request);

  if (!result.ok) {
    return result;
  }

  if (!result.context.isAdmin) {
    return {
      ok: false,
      response: forbiddenResponse("Forbidden: LCarDrive admin role required.")
    };
  }

  return result;
}
