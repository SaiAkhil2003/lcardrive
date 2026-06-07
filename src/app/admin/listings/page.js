import AdminListingsClient from "@/components/admin/AdminListingsClient";
import { instructors } from "@/data/instructors";
import { pendingClaims } from "@/data/adminPlaceholders";

function getClaimStatus(instructor) {
  if (pendingClaims.some((claim) => claim.instructorSlug === instructor.slug)) {
    return "Pending";
  }

  return instructor.verified ? "Verified" : "Unclaimed";
}

export default function AdminListingsPage() {
  const listings = instructors.map((instructor) => ({
    slug: instructor.slug,
    name: instructor.name,
    suburb: instructor.suburb,
    state: instructor.state,
    claimStatus: getClaimStatus(instructor),
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
          Seeded instructor listings from the shared placeholder data.
        </p>
      </section>

      <AdminListingsClient initialListings={listings} />
    </div>
  );
}
