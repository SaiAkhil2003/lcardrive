import { instructors } from "@/data/instructors";
import { pendingClaims } from "@/data/adminPlaceholders";

function getClaimStatus(instructor) {
  if (pendingClaims.some((claim) => claim.instructorSlug === instructor.slug)) {
    return "Pending claim";
  }

  return instructor.verified ? "Claimed" : "Unclaimed";
}

export default function AdminListingsPage() {
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

      <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-5 py-4 font-semibold">Name</th>
                <th className="px-5 py-4 font-semibold">Suburb</th>
                <th className="px-5 py-4 font-semibold">Claim status</th>
                <th className="px-5 py-4 font-semibold">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {instructors.map((instructor) => (
                <tr key={instructor.slug}>
                  <td className="px-5 py-4 font-semibold">{instructor.name}</td>
                  <td className="px-5 py-4 text-slate-600">
                    {instructor.suburb}, {instructor.state}
                  </td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      {getClaimStatus(instructor)}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      className="rounded-xl border px-4 py-2 font-semibold text-slate-700 hover:border-blue-600 hover:text-blue-700"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
