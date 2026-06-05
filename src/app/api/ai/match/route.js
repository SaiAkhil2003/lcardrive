import { NextResponse } from "next/server";
import { instructors as sampleInstructors } from "@/data/instructors";

function getRateNumber(rate) {
  return Number(String(rate).replace(/[^0-9.]/g, "")) || 0;
}

function localMatch(body) {
  const candidates = Array.isArray(body?.instructors) && body.instructors.length > 0
    ? body.instructors
    : sampleInstructors;
  const specialNeeds = Array.isArray(body?.special_needs)
    ? body.special_needs
    : [];
  const availableDays = Array.isArray(body?.available_days)
    ? body.available_days
    : [];
  const maxHourlyRate = Number(body?.max_hourly_rate) || 150;

  return candidates
    .filter((instructor) => {
      if (getRateNumber(instructor.rate) > maxHourlyRate) {
        return false;
      }

      if (
        body?.transmission &&
        body.transmission !== "Both" &&
        instructor.transmission !== "Both" &&
        instructor.transmission !== body.transmission
      ) {
        return false;
      }

      if (
        specialNeeds.includes("Anxiety Friendly") &&
        !instructor.anxietyFriendly
      ) {
        return false;
      }

      if (
        specialNeeds.includes("International Licence") &&
        !instructor.internationalLicence
      ) {
        return false;
      }

      if (
        availableDays.length > 0 &&
        !availableDays.some((day) => instructor.availability?.includes(day))
      ) {
        return false;
      }

      return true;
    })
    .sort((left, right) => Number(right.rating) - Number(left.rating))
    .slice(0, 3)
    .map((instructor) => ({
      id: instructor.slug,
      reason: `${instructor.name} matches the selected preferences using local Phase 1 filtering.`
    }));
}

async function getClaudeMatches(body) {
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
        max_tokens: 800,
        messages: [
          {
            role: "user",
            content: `Return only JSON in this exact shape: {"matches":[{"id":"instructor slug","reason":"short reason"}]}. Match learners to instructors from this payload: ${JSON.stringify(body)}`
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error("Anthropic request failed");
    }

    const text = data?.content?.[0]?.text || "";
    const parsed = JSON.parse(text);

    if (!Array.isArray(parsed.matches)) {
      throw new Error("Anthropic response did not contain matches");
    }

    return parsed.matches;
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));

  // TODO: Replace this placeholder with durable per-IP/user rate limiting.
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({
      matches: localMatch(body),
      mode: "local-fallback"
    });
  }

  try {
    return NextResponse.json({
      matches: await getClaudeMatches(body),
      mode: "anthropic"
    });
  } catch {
    return NextResponse.json({
      matches: localMatch(body),
      mode: "local-fallback"
    });
  }
}
