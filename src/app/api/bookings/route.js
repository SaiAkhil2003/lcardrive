import { NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth/api";
import { createBooking, getLearnerBookings } from "@/lib/platformData";
import { sendEmail, sendAdminNotification } from "@/lib/resend";

export async function GET(request) {
  const auth = await requireAuthenticatedUser(request);

  if (!auth.ok) {
    return auth.response;
  }

  const result = await getLearnerBookings(auth.context.userId);

  return NextResponse.json({
    ok: true,
    source: result.source,
    bookings: result.data
  });
}

export async function POST(request) {
  const auth = await requireAuthenticatedUser(request);

  if (!auth.ok) {
    return auth.response;
  }

  const body = await request.json().catch(() => ({}));
  const result = await createBooking({
    userId: auth.context.userId,
    body
  });

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error },
      { status: result.status || 500 }
    );
  }

  await Promise.all([
    sendEmail({
      to: body.learnerEmail,
      subject: "LCarDrive booking request received",
      text: [
        `Hi ${body.learnerName || "there"},`,
        "",
        "Your lesson request was received as pending.",
        "The instructor or admin must accept it before it is confirmed.",
        result.booking.scheduledStart ? `Requested time: ${result.booking.scheduledStart}` : ""
      ]
        .filter(Boolean)
        .join("\n")
    }),
    sendAdminNotification({
      subject: "New LCarDrive booking request",
      text: [
        "A new booking request was submitted.",
        `Instructor: ${result.booking.instructorSlug}`,
        `Learner: ${body.learnerName || "Not provided"}`,
        `Requested time: ${result.booking.scheduledStart}`
      ].join("\n")
    })
  ]);

  return NextResponse.json(result);
}
