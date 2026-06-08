import { getPendingClaims } from "@/lib/adminData";

export const dynamic = "force-dynamic";

export default async function AdminClaimsPage() {
  const { data: pendingClaims, source } = await getPendingClaims();

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
          Claims
        </p>

        <h1 className="mt-2 text-3xl font-bold">Claims queue</h1>

        <p className="mt-3 max-w-2xl text-slate-600">
          Review ADI registration numbers submitted after a Clerk sign-up flow.
          {source === "supabase"
            ? " Pending claims are loaded from Supabase."
            : " Approve and reject actions are UI-only when Supabase is not connected."}
        </p>
      </section>

      <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-5 py-4 font-semibold">Instructor name</th>
                <th className="px-5 py-4 font-semibold">Submitted full name</th>
                <th className="px-5 py-4 font-semibold">Email</th>
                <th className="px-5 py-4 font-semibold">Phone</th>
                <th className="px-5 py-4 font-semibold">ADI number</th>
                <th className="px-5 py-4 font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {pendingClaims.map((claim) => (
                <tr key={claim.id}>
                  <td className="px-5 py-4 font-semibold">
                    {claim.instructorName}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {claim.submittedFullName}
                  </td>
                  <td className="px-5 py-4 text-slate-600">{claim.email}</td>
                  <td className="px-5 py-4 text-slate-600">{claim.phone}</td>
                  <td className="px-5 py-4 font-semibold">{claim.adiNumber}</td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
                      >
                        Approve
                      </button>

                      <button
                        type="button"
                        className="rounded-xl border px-4 py-2 font-semibold text-slate-700 hover:border-red-600 hover:text-red-700"
                      >
                        Reject
                      </button>
                    </div>
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
