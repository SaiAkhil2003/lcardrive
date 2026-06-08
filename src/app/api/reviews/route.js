import { NextResponse } from "next/server";
import { insertWithAnonKey } from "@/lib/supabase/client";

function validateReview(body) {
  return Boolean(
    body?.instructorId &&
      body?.reviewerFirstName &&
      body?.reviewerEmail &&
      body?.comment
  );
}

function getRating(value) {
  const rating = Number(value) || 5;
  return Math.max(1, Math.min(5, rating));
}

export async function POST(request) {
  const body = await request.json().catch(() => null);

  if (!validateReview(body)) {
    return NextResponse.json(
      { ok: false, error: "Missing required review fields." },
      { status: 400 }
    );
  }

  const payload = {
    instructor_slug: body.instructorId,
    reviewer_first_name: body.reviewerFirstName,
    reviewer_email: body.reviewerEmail,
    rating_overall: getRating(body.ratingOverall),
    rating_patience: getRating(body.ratingPatience),
    rating_communication: getRating(body.ratingCommunication),
    rating_value: getRating(body.ratingValue),
    rating_punctuality: getRating(body.ratingPunctuality),
    pass_outcome: body.passOutcome || "",
    comment: body.comment,
    status: "pending"
  };

  const result = await insertWithAnonKey("reviews", payload);

  if (result.error) {
    return NextResponse.json(
      { ok: false, error: "Review could not be submitted." },
      { status: 500 }
    );
  }

  if (result.placeholder) {
    return NextResponse.json({
      ok: true,
      mode: "development",
      message: "Review accepted locally. Configure Supabase to persist reviews.",
      review: payload
    });
  }

  return NextResponse.json({
    ok: true,
    mode: "supabase",
    review: result.data?.[0] || result.data
  });
}
