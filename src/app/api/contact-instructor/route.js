import { NextResponse } from "next/server";
import { getInstructorBySlug } from "@/lib/instructors";
import {
  hasAdminNotificationEmail,
  hasResendConfig,
  sendEmail
} from "@/lib/resend";
import { recordPlatformEvent } from "@/lib/platformData";

function hasRequiredContactFields(body) {
  return Boolean(body?.name && body?.email && body?.message && body?.instructorId);
}

export async function POST(request) {
  const body = await request.json().catch(() => null);

  if (!hasRequiredContactFields(body)) {
    return NextResponse.json(
      { ok: false, error: "Missing required contact fields." },
      { status: 400 }
    );
  }

  const { data: instructor } = await getInstructorBySlug(body.instructorId, {
    includePrivate: true
  });
  const recipient = instructor?.email || process.env.ADMIN_NOTIFICATION_EMAIL || process.env.RESEND_CONTACT_TO_EMAIL;

  await recordPlatformEvent({
    eventType: "contact_instructor",
    entityType: "instructor",
    entityId: body.instructorId,
    metadata: {
      hasInstructorEmail: Boolean(instructor?.email),
      suburb: instructor?.suburb || ""
    }
  });

  if (!hasResendConfig() || !recipient) {
    return NextResponse.json({
      ok: true,
      mode: "development",
      message:
        "Contact request captured locally. Configure Resend server variables to send email.",
      contact: {
        instructorId: body.instructorId,
        instructorName: body.instructorName,
        learnerName: body.name,
        learnerEmail: body.email,
        learnerPhone: body.phone || ""
      }
    });
  }

  const delivery = await sendEmail({
    to: recipient,
    subject: `LCarDrive contact request for ${body.instructorName}`,
    text: [
      `Instructor: ${body.instructorName}`,
      `Name: ${body.name}`,
      `Email: ${body.email}`,
      `Phone: ${body.phone || "Not provided"}`,
      "",
      body.message,
      "",
      hasAdminNotificationEmail() && !instructor?.email
        ? "No instructor email was available, so this was sent to the admin notification inbox."
        : ""
    ]
      .filter(Boolean)
      .join("\n")
  });

  if (!delivery.ok) {
    return NextResponse.json(
      { ok: false, error: delivery.error || "Resend request failed." },
      { status: 502 }
    );
  }

  return NextResponse.json({
    ok: true,
    mode: delivery.mode
  });
}
