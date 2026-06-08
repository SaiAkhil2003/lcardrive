import AdminListingsClient from "@/components/admin/AdminListingsClient";
import { getAdminInstructors, getPendingClaims } from "@/lib/adminData";

export const dynamic = "force-dynamic";

function getClaimStatus(instructor, pendingClaims) {
  if (pendingClaims.some((claim) => claim.instructorSlug === instructor.slug)) {
    return "Pending";
  }

  return instructor.verified ? "Verified" : "Unclaimed";
}

export default async function AdminListingsPage() {
  const [instructorResult, claimResult] = await Promise.all([
    getAdminInstructors(),
    getPendingClaims()
  ]);
  const listings = instructorResult.data.map((instructor) => ({
    slug: instructor.slug,
    name: instructor.name,
    suburb: instructor.suburb,
    state: instructor.state,
    claimStatus: getClaimStatus(instructor, claimResult.data),
    rate: instructor.rate,
    rating: instructor.rating,
    transmission: instructor.transmission,
    language: instructor.language,
    anxietyFriendly: instructor.anxietyFriendly,
    internationalLicence: instructor.internationalLicence
  }));

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
          Listings
        </p>

        <h1 className="mt-2 text-3xl font-bold">All listings</h1>

        <p className="mt-3 max-w-2xl text-slate-600">
          {instructorResult.source === "supabase"
            ? "Instructor listings loaded from Supabase."
            : "Seeded instructor listings from the shared placeholder data."}
        </p>
      </section>

      <AdminListingsClient
        initialListings={listings}
        canPersist={instructorResult.source === "supabase"}
      />
    </div>
  );
}
