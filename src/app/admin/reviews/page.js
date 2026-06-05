import { reviewQueue } from "@/data/adminPlaceholders";

export default function AdminReviewsPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
          Reviews
        </p>

        <h1 className="mt-2 text-3xl font-bold">Moderation queue</h1>

        <p className="mt-3 max-w-2xl text-slate-600">
          Approve or reject learner reviews before they appear publicly. These
          buttons are placeholders only.
        </p>
      </section>

      <section className="space-y-4">
        {reviewQueue.map((review) => (
          <div
            key={review.id}
            className="rounded-2xl border bg-white p-5 shadow-sm"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="text-xl font-bold">{review.instructorName}</h2>
                <p className="mt-1 text-sm text-slate-600">
                  {review.suburb} - {review.reviewer} - Rating {review.rating}
                </p>
                <p className="mt-3 max-w-2xl text-slate-700">{review.text}</p>
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
