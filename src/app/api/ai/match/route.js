import { NextResponse } from "next/server";
import { instructors as sampleInstructors } from "@/data/instructors";

function getRateNumber(rate) {
  return Number(String(rate).replace(/[^0-9.]/g, "")) || 0;
}

function getLocationScore(instructor, suburb) {
  if (!suburb) {
    return 0;
  }

  const normalizedSuburb = suburb.toLowerCase().trim();

  if (instructor.suburb.toLowerCase() === normalizedSuburb) {
    return 3;
  }

  if (
    instructor.serviceAreas?.some(
      (area) => area.toLowerCase() === normalizedSuburb
    )
  ) {
    return 2;
  }

  return 0;
}

function getLocalReason(instructor, body) {
  const reasons = [];

  if (getLocationScore(instructor, body?.suburb) > 0) {
    reasons.push(`teaches around ${body.suburb}`);
  }

  if (body?.transmission && body.transmission !== "Both") {
    reasons.push(`matches your ${body.transmission.toLowerCase()} preference`);
  }

  if (Array.isArray(body?.special_needs)) {
    if (body.special_needs.includes("Anxiety Friendly")) {
      reasons.push("supports nervous learners");
    }

    if (body.special_needs.includes("International Licence")) {
      reasons.push("supports international licence conversion");
    }
  }

  if (Number(body?.max_hourly_rate)) {
    reasons.push(`fits your $${body.max_hourly_rate}/hr budget`);
  }

  if (Array.isArray(body?.available_days) && body.available_days.length > 0) {
    reasons.push("has availability on one of your selected days");
  }

  if (reasons.length === 0) {
    reasons.push("has a strong rating and learner-friendly profile");
  }

  return `${instructor.name} is recommended because ${reasons.join(", ")}.`;
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
    .sort((left, right) => {
      const locationDifference =
        getLocationScore(right, body?.suburb) - getLocationScore(left, body?.suburb);

      if (locationDifference !== 0) {
        return locationDifference;
      }

      return Number(right.rating) - Number(left.rating);
    })
    .slice(0, 3)
    .map((instructor) => ({
      id: instructor.slug,
      reason: getLocalReason(instructor, body)
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
