import { getAdminAnalytics } from "@/lib/platformData";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const analytics = await getAdminAnalytics();
  const stats = [
    { label: "Searches today", value: analytics.searchesToday },
    { label: "Contact attempts", value: analytics.contactAttempts },
    { label: "Pending bookings", value: analytics.bookingsPending },
    { label: "Confirmed bookings", value: analytics.bookingsConfirmed },
    { label: "Claim submissions", value: analytics.claimSubmissions },
    { label: "Review submissions", value: analytics.reviewSubmissions },
    { label: "Conversion estimate", value: analytics.conversionEstimate },
    { label: "Source", value: analytics.source }
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
          Analytics
        </p>
        <h1 className="mt-2 text-3xl font-bold">Platform analytics</h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Privacy-safe operational metrics from search logs, bookings, claims,
          reviews, and platform events. No unnecessary personal data is shown.
        </p>
        {analytics.source !== "supabase" && (
          <p className="mt-4 rounded-xl bg-amber-50 p-4 text-sm font-semibold text-amber-800">
            Supabase analytics unavailable. Showing placeholder labels only.
          </p>
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <div key={item.label} className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">{item.label}</p>
            <p className="mt-2 text-2xl font-bold">{item.value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">Top suburbs</h2>
          <div className="mt-4 space-y-3">
            {analytics.topSuburbs.length === 0 && (
              <p className="text-sm text-slate-600">No suburb data available.</p>
            )}
            {analytics.topSuburbs.map((item) => (
              <div key={item.suburb} className="flex items-center justify-between rounded-xl border p-3">
                <span className="font-semibold">{item.suburb}</span>
                <span className="text-sm text-slate-600">{item.searches}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">Top filters</h2>
          <div className="mt-4 space-y-3">
            {analytics.topFilters.length === 0 && (
              <p className="text-sm text-slate-600">No filter data available.</p>
            )}
            {analytics.topFilters.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-xl border p-3">
                <span className="font-semibold">{item.label}</span>
                <span className="text-sm text-slate-600">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
