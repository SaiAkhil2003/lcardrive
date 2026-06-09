import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getLearnerBookings, getLearnerFavourites, getLearnerLogbook } from "@/lib/platformData";

export const dynamic = "force-dynamic";

export default async function LearnerDashboardPage() {
  const authObject = await auth().catch(() => ({ userId: null }));
  const userId = authObject.userId;
  const [bookings, favourites, logbook] = userId
    ? await Promise.all([
        getLearnerBookings(userId),
        getLearnerFavourites(userId),
        getLearnerLogbook(userId)
      ])
    : [
        { data: [] },
        { data: [] },
        { data: [], totalMinutes: 0 }
      ];
  const stats = [
    { label: "Bookings", value: bookings.data.length },
    { label: "Favourites", value: favourites.data.length },
    { label: "Logged hours", value: (logbook.totalMinutes / 60).toFixed(1) }
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
          Learner Dashboard
        </p>
        <h1 className="mt-2 text-3xl font-bold">Your driving progress</h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Track booking requests, saved instructors, and logbook hours.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {stats.map((item) => (
          <div key={item.label} className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">{item.label}</p>
            <p className="mt-2 text-2xl font-bold">{item.value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Link
          href="/learner/bookings"
          className="rounded-2xl border bg-white p-5 shadow-sm hover:border-blue-600"
        >
          <h2 className="text-xl font-bold">Booking history</h2>
          <p className="mt-2 text-sm text-slate-600">
            View pending, confirmed, cancelled, and rescheduled lessons.
          </p>
        </Link>
        <Link
          href="/learner/logbook"
          className="rounded-2xl border bg-white p-5 shadow-sm hover:border-blue-600"
        >
          <h2 className="text-xl font-bold">Logbook</h2>
          <p className="mt-2 text-sm text-slate-600">
            Add practice sessions and review total hours.
          </p>
        </Link>
      </section>
    </div>
  );
}
