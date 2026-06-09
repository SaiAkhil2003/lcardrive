import { selectWithServiceRole } from "@/lib/supabase/admin";

const approvedClaimStatuses = ["approved", "verified", "accepted"];

export async function getClaimedInstructorSlugsForUser(userId) {
  if (!userId) {
    return {
      data: [],
      source: "missing-user",
      error: null
    };
  }

  const result = await selectWithServiceRole(
    `profile_claims?clerk_user_id=eq.${encodeURIComponent(userId)}&select=instructor_slug,status`
  );

  if (result.placeholder || result.error || !Array.isArray(result.data)) {
    return {
      data: [],
      source: result.placeholder ? "placeholder" : "supabase-error",
      error: result.error
    };
  }

  return {
    data: result.data
      .filter((claim) =>
        approvedClaimStatuses.includes(String(claim.status || "").toLowerCase())
      )
      .map((claim) => claim.instructor_slug)
      .filter(Boolean),
    source: "supabase",
    error: null
  };
}

export async function userCanManageInstructor(userId, instructorSlug) {
  const result = await getClaimedInstructorSlugsForUser(userId);

  return {
    ok: result.data.includes(instructorSlug),
    source: result.source,
    error: result.error
  };
}
