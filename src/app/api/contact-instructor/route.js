import { NextResponse } from "next/server";

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

  const hasResendDeliverySetup = Boolean(
    process.env.RESEND_API_KEY &&
      process.env.RESEND_FROM_EMAIL &&
      process.env.RESEND_CONTACT_TO_EMAIL
  );

  if (!hasResendDeliverySetup) {
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

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL,
      to: process.env.RESEND_CONTACT_TO_EMAIL,
      subject: `LCarDrive contact request for ${body.instructorName}`,
      text: [
        `Instructor: ${body.instructorName}`,
        `Name: ${body.name}`,
        `Email: ${body.email}`,
        `Phone: ${body.phone || "Not provided"}`,
        "",
        body.message
      ].join("\n")
    })
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    return NextResponse.json(
      { ok: false, error: data || "Resend request failed." },
      { status: 502 }
    );
  }

  return NextResponse.json({
    ok: true,
    mode: "resend",
    data
  });
}
