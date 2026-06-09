import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/auth/api";
import { getAdminBookings, updateBookingWorkflow } from "@/lib/platformData";

export async function GET(request) {
  const admin = await requireAdminUser(request);

  if (!admin.ok) {
    return admin.response;
  }

  const result = await getAdminBookings();

  return NextResponse.json({
    ok: true,
    source: result.source,
    bookings: result.data
  });
}

export async function PATCH(request) {
  const admin = await requireAdminUser(request);

  if (!admin.ok) {
    return admin.response;
  }

  const body = await request.json().catch(() => ({}));
  const result = await updateBookingWorkflow({
    bookingId: body.bookingId,
    action: body.action,
    body,
    actorUserId: admin.context.userId,
    actorRole: "admin"
  });

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error },
      { status: result.status || 500 }
    );
  }

  return NextResponse.json(result);
}
