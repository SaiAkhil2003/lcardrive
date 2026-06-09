import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth/roles";

const isPortalRoute = createRouteMatcher(["/portal(.*)"]);
const isLearnerRoute = createRouteMatcher(["/learner(.*)"]);
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isAdminApiRoute = createRouteMatcher(["/api/admin(.*)"]);
const isAuthenticatedApiRoute = createRouteMatcher([
  "/api/ai/bio",
  "/api/ai/pricing-suggestion",
  "/api/bookings(.*)",
  "/api/claims",
  "/api/favourites",
  "/api/featured-listings",
  "/api/instructor/stripe/onboard",
  "/api/logbook",
  "/api/payments/create-checkout-session",
  "/api/subscriptions"
]);

function hasClerkServerConfig() {
  return Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
      process.env.CLERK_SECRET_KEY
  );
}

function redirectToSignIn(request) {
  const signInUrl = new URL("/sign-in", request.url);
  signInUrl.searchParams.set("redirect_url", request.url);

  return NextResponse.redirect(signInUrl);
}

const protectedRoutesMiddleware = clerkMiddleware(async (auth, request) => {
  if (isAuthenticatedApiRoute(request)) {
    const authObject = await auth();

    if (!authObject.userId) {
      return NextResponse.json(
        { ok: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    return NextResponse.next();
  }

  if (isAdminRoute(request) || isAdminApiRoute(request)) {
    const authObject = await auth();

    if (!authObject.userId) {
      if (isAdminApiRoute(request)) {
        return NextResponse.json(
          { ok: false, error: "Authentication required." },
          { status: 401 }
        );
      }

      return redirectToSignIn(request);
    }

    if (!isAdmin({ sessionClaims: authObject.sessionClaims, ...authObject.sessionClaims })) {
      if (isAdminApiRoute(request)) {
        return NextResponse.json(
          { ok: false, error: "Forbidden: LCarDrive admin role required." },
          { status: 403 }
        );
      }

      return new NextResponse("Forbidden: LCarDrive admin role required.", {
        status: 403
      });
    }

    return NextResponse.next();
  }

  if (isPortalRoute(request) || isLearnerRoute(request)) {
    const authObject = await auth();

    if (!authObject.userId) {
      return redirectToSignIn(request);
    }
  }

  return NextResponse.next();
});

export default function middleware(request, event) {
  if (!hasClerkServerConfig()) {
    return NextResponse.next();
  }

  return protectedRoutesMiddleware(request, event);
}

export const config = {
  matcher: [
    "/portal",
    "/portal/:path*",
    "/learner",
    "/learner/:path*",
    "/admin",
    "/admin/:path*",
    "/api/admin/:path*",
    "/api/ai/bio",
    "/api/ai/pricing-suggestion",
    "/api/bookings/:path*",
    "/api/bookings",
    "/api/claims",
    "/api/favourites",
    "/api/featured-listings",
    "/api/instructor/stripe/onboard",
    "/api/logbook",
    "/api/payments/create-checkout-session",
    "/api/subscriptions"
  ]
};
