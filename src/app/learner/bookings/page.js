import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getLearnerBookings } from "@/lib/platformData";

export const dynamic = "force-dynamic";

export default async function LearnerBookingsPage() {
  const authObject = await auth().catch(() => ({ userId: null }));
  const result = authObject.userId
    ? await getLearnerBookings(authObject.userId)
    : { data: [], source: "signed-out" };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
          Learner Bookings
        </p>
        <h1 className="mt-2 text-3xl font-bold">Booking history</h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Your own lesson requests and booking statuses.
        </p>
      </section>

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        {result.data.length === 0 ? (
          <div>
            <p className="text-sm text-slate-600">No bookings yet.</p>
            <Link
              href="/search"
              className="mt-4 inline-block rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white"
            >
              Find an instructor
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {result.data.map((booking) => (
              <div key={booking.id} className="rounded-xl border p-4">
                <p className="font-semibold">{booking.instructorSlug}</p>
                <p className="mt-1 text-sm text-slate-600">
                  {booking.scheduledStart} - {booking.status}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Payment: {booking.paymentStatus}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
