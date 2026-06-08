import { pendingClaims, reviewQueue, topSuburbs } from "@/data/adminPlaceholders";
import { getInstructors } from "@/lib/instructors";
import { selectWithServiceRole } from "@/lib/supabase/admin";

function normalizeClaim(row) {
  return {
    id: row.id,
    instructorSlug: row.instructor_slug,
    instructorName: row.instructor_slug,
    suburb: "",
    submittedFullName: row.full_name,
    email: row.email,
    phone: row.phone,
    adiNumber: row.adi_registration,
    status: row.status || "Pending",
    createdAt: row.created_at
  };
}

function normalizeReview(row) {
  return {
    id: row.id,
    instructorName: row.instructor_slug || "Instructor",
    suburb: "",
    reviewerFirstName: row.reviewer_first_name,
    overall: String(row.rating_overall),
    patience: String(row.rating_patience),
    communication: String(row.rating_communication),
    value: String(row.rating_value),
    punctuality: String(row.rating_punctuality),
    passOutcome: row.pass_outcome || "Not provided",
    comment: row.comment,
    status: row.status || "Needs moderation",
    createdAt: row.created_at
  };
}

export async function getAdminInstructors() {
  return getInstructors();
}

export async function getPendingClaims() {
  const result = await selectWithServiceRole(
    "profile_claims?status=eq.pending&select=*&order=created_at.desc"
  );

  if (result.placeholder || result.error || !Array.isArray(result.data)) {
    return {
      data: pendingClaims,
      source: "placeholder",
      error: result.error
    };
  }

  return {
    data: result.data.map(normalizeClaim),
    source: "supabase",
    error: null
  };
}

export async function getPendingReviews() {
  const result = await selectWithServiceRole(
    "reviews?status=eq.pending&select=*&order=created_at.desc"
  );

  if (result.placeholder || result.error || !Array.isArray(result.data)) {
    return {
      data: reviewQueue,
      source: "placeholder",
      error: result.error
    };
  }

  return {
    data: result.data.map(normalizeReview),
    source: "supabase",
    error: null
  };
}

export async function getSearchLogStats() {
  const result = await selectWithServiceRole(
    "search_logs?select=suburb,created_at&order=created_at.desc&limit=500"
  );

  if (result.placeholder || result.error || !Array.isArray(result.data)) {
    return {
      searchesToday: 131,
      topSuburbs,
      source: "placeholder",
      error: result.error
    };
  }

  const today = new Date().toISOString().slice(0, 10);
  const todaysRows = result.data.filter((row) =>
    String(row.created_at || "").startsWith(today)
  );
  const suburbCounts = todaysRows.reduce((counts, row) => {
    const suburb = row.suburb || "Unknown";
    counts[suburb] = (counts[suburb] || 0) + 1;
    return counts;
  }, {});

  return {
    searchesToday: todaysRows.length,
    topSuburbs: Object.entries(suburbCounts)
      .sort((left, right) => right[1] - left[1])
      .slice(0, 8)
      .map(([suburb, searches]) => ({ suburb, searches })),
    source: "supabase",
    error: null
  };
}

export async function getAdminDashboardData() {
  const [instructorResult, claimResult, reviewResult, searchResult] =
    await Promise.all([
      getAdminInstructors(),
      getPendingClaims(),
      getPendingReviews(),
      getSearchLogStats()
    ]);

  return {
    instructors: instructorResult.data,
    pendingClaims: claimResult.data,
    pendingReviews: reviewResult.data,
    searchesToday: searchResult.searchesToday,
    topSuburbs: searchResult.topSuburbs,
    source:
      instructorResult.source === "supabase" ||
      claimResult.source === "supabase" ||
      reviewResult.source === "supabase" ||
      searchResult.source === "supabase"
        ? "supabase"
        : "placeholder"
  };
}
