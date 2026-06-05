import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

function hasClerkServerConfig() {
  return Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY
  );
}

function placeholderBio(body) {
  const years = body?.years_experience || "several";
  const licenceTypes = body?.licence_types || "car";
  const teachingStyle = body?.teaching_style || "calm, clear, patient";
  const learnerTypes = body?.learner_types || "new and nervous learners";
  const proudOf = body?.proud_of || "helping learners build confidence";
  const specialisations = body?.specialisations || "test preparation";

  return `I am a ${teachingStyle} driving instructor with ${years} years of experience teaching ${licenceTypes}. I enjoy working with ${learnerTypes} and focus on practical, confidence-building lessons. I am proud of ${proudOf}, and I can support learners with ${specialisations}.`;
}

async function generateClaudeBio(body) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 500,
        messages: [
          {
            role: "user",
            content: `Write a concise, professional driving instructor bio in first person. Do not invent credentials. Inputs: ${JSON.stringify(body)}`
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error("Anthropic request failed");
    }

    return data?.content?.[0]?.text || placeholderBio(body);
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));

  if (hasClerkServerConfig()) {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { ok: false, error: "Authentication required." },
        { status: 401 }
      );
    }
  }

  // TODO: Replace this placeholder with durable per-user rate limiting.
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({
      ok: true,
      mode: "development-placeholder",
      bio: placeholderBio(body)
    });
  }

  try {
    return NextResponse.json({
      ok: true,
      mode: "anthropic",
      bio: await generateClaudeBio(body)
    });
  } catch {
    return NextResponse.json({
      ok: true,
      mode: "development-placeholder",
      bio: placeholderBio(body)
    });
  }
}
