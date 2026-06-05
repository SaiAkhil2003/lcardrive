import { instructors } from "@/data/instructors";
import { pendingClaims, reviewQueue, topSuburbs } from "@/data/adminPlaceholders";

export default function AdminStatsPage() {
  const stats = [
    { label: "Total instructors", value: instructors.length },
    { label: "Pending claims", value: pendingClaims.length },
    { label: "Reviews", value: reviewQueue.length },
    { label: "Searches today", value: 131 }
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
          Stats
        </p>

        <h1 className="mt-2 text-3xl font-bold">Platform stats</h1>

        <p className="mt-3 max-w-2xl text-slate-600">
          Placeholder cards for admin reporting. Real analytics will be wired
          after the database and event tracking are ready.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <div key={item.label} className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">{item.label}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{item.value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold">Top suburbs</h2>

        <div className="mt-5 space-y-3">
          {topSuburbs.map((item) => (
            <div
              key={item.suburb}
              className="flex items-center justify-between rounded-xl bg-slate-50 p-4"
            >
              <span className="font-semibold">{item.suburb}</span>
              <span className="text-sm text-slate-600">
                {item.searches} searches
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
