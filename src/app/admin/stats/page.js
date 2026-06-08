import { getAdminDashboardData } from "@/lib/adminData";

export const dynamic = "force-dynamic";

export default async function AdminStatsPage() {
  const dashboard = await getAdminDashboardData();
  const stats = [
    { label: "Total instructors", value: dashboard.instructors.length },
    { label: "Pending claims", value: dashboard.pendingClaims.length },
    { label: "Review count", value: dashboard.pendingReviews.length },
    { label: "Total searches today", value: dashboard.searchesToday }
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
          Stats
        </p>

        <h1 className="mt-2 text-3xl font-bold">Platform stats</h1>

        <p className="mt-3 max-w-2xl text-slate-600">
          Search analytics read from Supabase search logs when configured, with
          placeholder fallback for local demos.
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

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-semibold">Suburb</th>
                <th className="px-4 py-3 font-semibold">Searches today</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {dashboard.topSuburbs.map((item) => (
                <tr key={item.suburb}>
                  <td className="px-4 py-3 font-semibold">{item.suburb}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {item.searches}
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
