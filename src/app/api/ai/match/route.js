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

function instructorMatchesTransmission(instructor, transmission) {
  if (!transmission || transmission === "Both") {
    return true;
  }

  return (
    instructor.transmission === transmission ||
    instructor.transmission === "Both"
  );
}

function getTransmissionReason(instructor, transmission) {
  if (!transmission) {
    return null;
  }

  if (transmission === "Both" && instructor.transmission === "Both") {
    return "support both auto and manual lessons";
  }

  if (
    transmission !== "Both" &&
    instructorMatchesTransmission(instructor, transmission)
  ) {
    return `support ${transmission.toLowerCase()} lessons`;
  }

  return null;
}

function getPreferredDays(body) {
  return Array.isArray(body?.available_days) ? body.available_days : [];
}

function instructorMatchesPreferredDays(instructor, preferredDays) {
  return preferredDays.some((day) => instructor.availability?.includes(day));
}

function getLocalReason(instructor, body) {
  const reasons = [];
  const locationScore = getLocationScore(instructor, body?.suburb);
  const transmissionReason = getTransmissionReason(
    instructor,
    body?.transmission
  );
  const specialNeeds = Array.isArray(body?.special_needs)
    ? body.special_needs
    : [];
  const preferredDays = getPreferredDays(body);
  const maxHourlyRate = Number(body?.max_hourly_rate);
  const instructorRate = getRateNumber(instructor.rate);

  if (locationScore === 3) {
    reasons.push(`teach in ${instructor.suburb}`);
  } else if (locationScore === 2) {
    reasons.push(`cover ${body.suburb}`);
  }

  if (transmissionReason) {
    reasons.push(transmissionReason);
  }

  if (specialNeeds.includes("Anxiety Friendly") && instructor.anxietyFriendly) {
    reasons.push("support nervous learners");
  }

  if (
    specialNeeds.includes("International Licence") &&
    instructor.internationalLicence
  ) {
    reasons.push("support licence conversion");
  }

  if (maxHourlyRate && instructorRate <= maxHourlyRate) {
    reasons.push(`fit your $${body.max_hourly_rate}/hr budget`);
  } else if (
    maxHourlyRate &&
    instructorRate > maxHourlyRate &&
    instructorRate - maxHourlyRate <= 10
  ) {
    reasons.push("are slightly above your budget");
  }

  if (
    preferredDays.length > 0 &&
    instructorMatchesPreferredDays(instructor, preferredDays)
  ) {
    reasons.push("are available on a preferred day");
  }

  if (reasons.length === 0) {
    if (Number(instructor.rating) >= 4.8) {
      reasons.push("have a strong learner rating");
    }

    if (instructor.experience) {
      reasons.push(`have ${instructor.experience} of experience`);
    }

    if (reasons.length === 0) {
      reasons.push("have a learner-friendly profile");
    }
  }

  return `${instructor.name} is recommended because they ${reasons.join(", ")}.`;
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

  return [...candidates]
    .sort((left, right) => {
      const locationDifference =
        getLocationScore(right, body?.suburb) - getLocationScore(left, body?.suburb);

      if (locationDifference !== 0) {
        return locationDifference;
      }

      const scoreDifference =
        getLocalMatchScore(right, body, specialNeeds, availableDays, maxHourlyRate) -
        getLocalMatchScore(left, body, specialNeeds, availableDays, maxHourlyRate);

      if (scoreDifference !== 0) {
        return scoreDifference;
      }

      return Number(right.rating) - Number(left.rating);
    })
    .slice(0, 3)
    .map((instructor) => ({
      id: instructor.slug,
      reason: getLocalReason(instructor, body)
    }));
}

function getLocalMatchScore(
  instructor,
  body,
  specialNeeds,
  availableDays,
  maxHourlyRate
) {
  let score = Number(instructor.rating) || 0;

  if (getRateNumber(instructor.rate) <= maxHourlyRate) {
    score += 2;
  }

  if (instructorMatchesTransmission(instructor, body?.transmission)) {
    score += 2;
  }

  if (specialNeeds.includes("Anxiety Friendly") && instructor.anxietyFriendly) {
    score += 2;
  }

  if (
    specialNeeds.includes("International Licence") &&
    instructor.internationalLicence
  ) {
    score += 2;
  }

  if (
    availableDays.length > 0 &&
    availableDays.some((day) => instructor.availability?.includes(day))
  ) {
    score += 1;
  }

  return score;
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
