import { NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth/api";
import { userCanManageInstructor } from "@/lib/auth/ownership";
import { getBookingById, updateBookingWorkflow } from "@/lib/platformData";

async function getBookingAccess(request, bookingId) {
  const auth = await requireAuthenticatedUser(request);

  if (!auth.ok) {
    return auth;
  }

  const bookingResult = await getBookingById(bookingId);

  if (!bookingResult.data) {
    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, error: "Booking not found." },
        { status: 404 }
      )
    };
  }

  const isLearnerOwner = bookingResult.data.learnerUserId === auth.context.userId;
  const instructorAccess = await userCanManageInstructor(
    auth.context.userId,
    bookingResult.data.instructorSlug
  );

  if (!auth.context.isAdmin && !isLearnerOwner && !instructorAccess.ok) {
    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, error: "Forbidden: booking ownership required." },
        { status: 403 }
      )
    };
  }

  return {
    ok: true,
    context: auth.context,
    booking: bookingResult.data,
    actorRole: auth.context.isAdmin
      ? "admin"
      : instructorAccess.ok
        ? "instructor"
        : "learner"
  };
}

export async function GET(request, { params }) {
  const access = await getBookingAccess(request, params.bookingId);

  if (!access.ok) {
    return access.response;
  }

  return NextResponse.json({
    ok: true,
    booking: access.booking
  });
}

export async function PATCH(request, { params }) {
  const access = await getBookingAccess(request, params.bookingId);

  if (!access.ok) {
    return access.response;
  }

  const body = await request.json().catch(() => ({}));
  const result = await updateBookingWorkflow({
    bookingId: params.bookingId,
    action: body.action,
    body,
    actorUserId: access.context.userId,
    actorRole: access.actorRole
  });

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error },
      { status: result.status || 500 }
    );
  }

  return NextResponse.json(result);
}
