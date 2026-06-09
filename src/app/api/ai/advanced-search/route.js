import { NextResponse } from "next/server";
import { createAnthropicText, hasAnthropicConfig } from "@/lib/anthropic";
import { getInstructors } from "@/lib/instructors";
import { checkRateLimit } from "@/lib/rateLimit";
import { getRateNumber } from "@/lib/search";

function scoreInstructor(instructor, query) {
  const normalized = String(query || "").toLowerCase();
  let score = Number(instructor.rating) || 0;

  if (normalized.includes(instructor.suburb.toLowerCase())) {
    score += 4;
  }

  if (instructor.serviceAreas?.some((area) => normalized.includes(area.toLowerCase()))) {
    score += 3;
  }

  if (normalized.includes("manual") && instructor.transmission !== "Auto") {
    score += 2;
  }

  if (normalized.includes("auto") && instructor.transmission !== "Manual") {
    score += 2;
  }

  if (normalized.includes("anxious") || normalized.includes("nervous")) {
    score += instructor.anxietyFriendly ? 3 : 0;
  }

  if (normalized.includes("international")) {
    score += instructor.internationalLicence ? 3 : 0;
  }

  if (normalized.includes("cheap") || normalized.includes("budget")) {
    score += Math.max(0, 5 - getRateNumber(instructor.rate) / 25);
  }

  return score;
}

function getLocalExplanation(instructor, query) {
  const reasons = [];
  const normalized = String(query || "").toLowerCase();

  if (normalized.includes(instructor.suburb.toLowerCase())) {
    reasons.push(`teaches in ${instructor.suburb}`);
  }

  if (instructor.anxietyFriendly && /(anxious|nervous|patient)/i.test(query)) {
    reasons.push("supports nervous learners");
  }

  if (instructor.internationalLicence && /international/i.test(query)) {
    reasons.push("supports international licence conversion");
  }

  if (/manual/i.test(query) && instructor.transmission !== "Auto") {
    reasons.push("can help with manual lessons");
  }

  if (reasons.length === 0) {
    reasons.push(`has a ${instructor.rating} rating and a complete profile`);
  }

  return `${instructor.name} is a fit because they ${reasons.join(", ")}.`;
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const query = body.query || "";
  const rateLimit = checkRateLimit(
    request.headers.get("x-forwarded-for") || "advanced-search-public",
    {
      scope: "advanced-ai-search",
      limit: 30,
      windowMs: 60 * 60 * 1000
    }
  );
  const instructorResult = await getInstructors();
  const ranked = instructorResult.data
    .map((instructor) => ({
      instructor,
      score: scoreInstructor(instructor, query)
    }))
    .sort((left, right) => right.score - left.score)
    .slice(0, 5)
    .map(({ instructor }) => ({
      instructor,
      explanation: getLocalExplanation(instructor, query)
    }));

  if (!rateLimit.allowed || !hasAnthropicConfig()) {
    return NextResponse.json({
      ok: true,
      mode: rateLimit.allowed ? "local-fallback" : "rate-limited-local-fallback",
      query,
      results: ranked,
      rateLimit
    });
  }

  const ai = await createAnthropicText({
    maxTokens: 500,
    prompt: [
      "Explain these driving instructor recommendations in plain language.",
      "Do not invent credentials or availability.",
      `Learner query: ${query}`,
      `Recommendations: ${JSON.stringify(ranked)}`
    ].join("\n")
  });

  return NextResponse.json({
    ok: true,
    mode: ai.ok ? "anthropic" : "local-fallback",
    query,
    results: ranked,
    summary: ai.ok ? ai.text : "Recommendations are ranked using suburb, transmission, budget, and learner needs.",
    rateLimit
  });
}
