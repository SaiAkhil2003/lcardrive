import { getPendingReviews } from "@/lib/adminData";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const { data: reviewQueue, source } = await getPendingReviews();

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
          Reviews
        </p>

        <h1 className="mt-2 text-3xl font-bold">Moderation queue</h1>

        <p className="mt-3 max-w-2xl text-slate-600">
          Approve or reject learner reviews before they appear publicly. These
          buttons are placeholders only. {source === "supabase" ? "Pending reviews are loaded from Supabase." : ""}
        </p>
      </section>

      <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-semibold">Reviewer first name</th>
                <th className="px-4 py-3 font-semibold">Instructor</th>
                <th className="px-4 py-3 font-semibold">Overall</th>
                <th className="px-4 py-3 font-semibold">Patience</th>
                <th className="px-4 py-3 font-semibold">Communication</th>
                <th className="px-4 py-3 font-semibold">Value</th>
                <th className="px-4 py-3 font-semibold">Punctuality</th>
                <th className="px-4 py-3 font-semibold">Pass outcome</th>
                <th className="px-4 py-3 font-semibold">Comment</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {reviewQueue.map((review) => (
                <tr key={review.id}>
                  <td className="px-4 py-3 font-semibold">
                    {review.reviewerFirstName}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {review.instructorName}
                  </td>
                  <td className="px-4 py-3">{review.overall}</td>
                  <td className="px-4 py-3">{review.patience}</td>
                  <td className="px-4 py-3">{review.communication}</td>
                  <td className="px-4 py-3">{review.value}</td>
                  <td className="px-4 py-3">{review.punctuality}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {review.passOutcome}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {review.comment}
                  </td>
                  <td className="px-4 py-3">
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
