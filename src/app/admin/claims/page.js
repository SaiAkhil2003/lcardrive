import { pendingClaims } from "@/data/adminPlaceholders";

export default function AdminClaimsPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
          Claims
        </p>

        <h1 className="mt-2 text-3xl font-bold">Claims queue</h1>

        <p className="mt-3 max-w-2xl text-slate-600">
          Review ADI registration numbers submitted after a Clerk sign-up flow.
          Approve and reject actions are UI-only placeholders.
        </p>
      </section>

      <section className="space-y-4">
        {pendingClaims.map((claim) => (
          <div
            key={claim.id}
            className="rounded-2xl border bg-white p-5 shadow-sm"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-bold">{claim.instructorName}</h2>
                <p className="mt-1 text-sm text-slate-600">
                  {claim.suburb} submitted by {claim.submittedBy}
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  ADI number submitted: {claim.adiNumber}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Approve
                </button>

                <button
                  type="button"
                  className="rounded-xl border px-5 py-3 text-sm font-semibold text-slate-700 hover:border-red-600 hover:text-red-700"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
