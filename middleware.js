import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth/roles";

const isPortalRoute = createRouteMatcher(["/portal(.*)"]);
const isClaimRoute = createRouteMatcher(["/claim(.*)"]);
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

function hasClerkServerConfig() {
  return Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
      process.env.CLERK_SECRET_KEY
  );
}

const protectedRoutesMiddleware = clerkMiddleware(async (auth, request) => {
  if (isAdminRoute(request)) {
    const authObject = await auth.protect();

    if (!isAdmin({ sessionClaims: authObject.sessionClaims, ...authObject.sessionClaims })) {
      return new NextResponse("Forbidden: LCarDrive admin role required.", {
        status: 403
      });
    }

    return NextResponse.next();
  }

  if (isPortalRoute(request)) {
    await auth.protect();
  }

  if (isClaimRoute(request)) {
    return NextResponse.next();
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
  matcher: ["/portal/:path*", "/admin/:path*", "/claim/:path*"]
};
