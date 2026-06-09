import { NextResponse } from "next/server";
import { createAnthropicText, hasAnthropicConfig } from "@/lib/anthropic";
import { requireAdminUser } from "@/lib/auth/api";
import { checkRateLimit } from "@/lib/rateLimit";
import { selectWithServiceRole } from "@/lib/supabase/admin";

function getLocalSummary(reviews) {
  if (reviews.length === 0) {
    return "No reviews are available for sentiment summary.";
  }

  const average =
    reviews.reduce((total, review) => total + Number(review.rating_overall || 0), 0) /
    reviews.length;
  const pending = reviews.filter((review) => review.status === "pending").length;

  return `${reviews.length} reviews found. Average overall rating is ${average.toFixed(
    1
  )}. ${pending} reviews are still pending moderation.`;
}

export async function POST(request) {
  const admin = await requireAdminUser(request);

  if (!admin.ok) {
    return admin.response;
  }

  const rateLimit = checkRateLimit(admin.context.userId, {
    scope: "ai-review-summary",
    limit: 20,
    windowMs: 24 * 60 * 60 * 1000
  });
  const result = await selectWithServiceRole(
    "reviews?select=instructor_slug,rating_overall,comment,status,created_at&order=created_at.desc&limit=100"
  );
  const reviews = Array.isArray(result.data) ? result.data : [];
  const local = getLocalSummary(reviews);

  if (!rateLimit.allowed || !hasAnthropicConfig()) {
    return NextResponse.json({
      ok: true,
      mode: rateLimit.allowed ? "local-fallback" : "rate-limited-local-fallback",
      summary: local,
      rateLimit
    });
  }

  const ai = await createAnthropicText({
    maxTokens: 500,
    prompt: [
      "Summarize review sentiment for an admin moderation dashboard.",
      "Do not expose reviewer emails or personal details.",
      `Reviews: ${JSON.stringify(reviews)}`
    ].join("\n")
  });

  return NextResponse.json({
    ok: true,
    mode: ai.ok ? "anthropic" : "local-fallback",
    summary: ai.ok ? ai.text : local,
    rateLimit
  });
}
