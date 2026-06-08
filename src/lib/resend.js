export function hasResendConfig() {
  return Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL);
}

function getAdminNotificationEmail() {
  return process.env.ADMIN_NOTIFICATION_EMAIL || process.env.RESEND_CONTACT_TO_EMAIL || "";
}

export function hasAdminNotificationEmail() {
  return Boolean(getAdminNotificationEmail());
}

export async function sendEmail({ to, subject, text }) {
  if (!hasResendConfig() || !to) {
    return {
      ok: true,
      mode: "development",
      skipped: true
    };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL,
      to,
      subject,
      text
    })
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    return {
      ok: false,
      mode: "resend",
      error: data || "Resend request failed."
    };
  }

  return {
    ok: true,
    mode: "resend",
    data
  };
}

export async function sendAdminNotification({ subject, text }) {
  return sendEmail({
    to: getAdminNotificationEmail(),
    subject,
    text
  });
}
