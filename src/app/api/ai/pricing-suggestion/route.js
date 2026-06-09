import { NextResponse } from "next/server";
import { createAnthropicText, hasAnthropicConfig } from "@/lib/anthropic";
import { requireAuthenticatedUser } from "@/lib/auth/api";
import { userCanManageInstructor } from "@/lib/auth/ownership";
import { getInstructorBySlug, getInstructors } from "@/lib/instructors";
import { checkRateLimit } from "@/lib/rateLimit";
import { getRateNumber } from "@/lib/search";

function getLocalPricingSuggestion(instructor, instructors) {
  const comparable = instructors
    .filter((item) => item.suburb === instructor.suburb || item.transmission === instructor.transmission)
    .map((item) => getRateNumber(item.rate))
    .filter(Boolean);
  const average = comparable.length
    ? Math.round(comparable.reduce((total, rate) => total + rate, 0) / comparable.length)
    : getRateNumber(instructor.rate);
  const current = getRateNumber(instructor.rate);

  return {
    currentRate: current,
    suggestedRate: average,
    explanation:
      current && average
        ? `Comparable LCarDrive listings average around $${average}/hr. Keep pricing within $5 to $10 of that range unless your profile has verified reviews, specialist support, or strong availability.`
        : "Add a valid hourly rate and comparable local listings before relying on pricing guidance."
  };
}

export async function POST(request) {
  const auth = await requireAuthenticatedUser(request);

  if (!auth.ok) {
    return auth.response;
  }

  const body = await request.json().catch(() => ({}));
  const instructorSlug = body.instructorSlug;
  const ownership = instructorSlug
    ? await userCanManageInstructor(auth.context.userId, instructorSlug)
    : { ok: auth.context.isAdmin };

  if (!auth.context.isAdmin && !ownership.ok) {
    return NextResponse.json(
      { ok: false, error: "Claimed instructor ownership is required." },
      { status: 403 }
    );
  }

  const rateLimit = checkRateLimit(auth.context.userId, {
    scope: "ai-pricing",
    limit: 10,
    windowMs: 24 * 60 * 60 * 1000
  });
  const [{ data: instructor }, instructorResult] = await Promise.all([
    getInstructorBySlug(instructorSlug || "sarah-m-footscray"),
    getInstructors()
  ]);
  const local = getLocalPricingSuggestion(instructor || instructorResult.data[0], instructorResult.data);

  if (!rateLimit.allowed || !hasAnthropicConfig()) {
    return NextResponse.json({
      ok: true,
      mode: rateLimit.allowed ? "local-fallback" : "rate-limited-local-fallback",
      suggestion: local,
      rateLimit
    });
  }

  const ai = await createAnthropicText({
    maxTokens: 400,
    prompt: [
      "Give a conservative hourly pricing suggestion for a Victorian driving instructor.",
      "Do not guarantee earnings. Do not invent market data.",
      `Instructor: ${JSON.stringify(instructor)}`,
      `Local comparison: ${JSON.stringify(local)}`
    ].join("\n")
  });

  return NextResponse.json({
    ok: true,
    mode: ai.ok ? "anthropic" : "local-fallback",
    suggestion: {
      ...local,
      explanation: ai.ok ? ai.text : local.explanation
    },
    rateLimit
  });
}
