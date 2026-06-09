import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getInstructorPortalBookings } from "@/lib/platformData";

export const dynamic = "force-dynamic";

export default async function PortalBookingsPage() {
  const authObject = await auth().catch(() => ({ userId: null }));
  const result = authObject.userId
    ? await getInstructorPortalBookings(authObject.userId)
    : { data: [], source: "signed-out" };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
          Bookings
        </p>
        <h1 className="mt-2 text-3xl font-bold">Instructor booking requests</h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Manage pending lesson requests for claimed instructor listings.
        </p>
      </section>

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        {result.data.length === 0 ? (
          <p className="text-sm text-slate-600">
            No instructor-side bookings found. Approved claim ownership is
            required before bookings appear here.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Learner</th>
                  <th className="px-4 py-3 font-semibold">Time</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Payment</th>
                  <th className="px-4 py-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {result.data.map((booking) => (
                  <tr key={booking.id}>
                    <td className="px-4 py-3 font-semibold">{booking.learnerName}</td>
                    <td className="px-4 py-3 text-slate-600">{booking.scheduledStart}</td>
                    <td className="px-4 py-3">{booking.status}</td>
                    <td className="px-4 py-3">{booking.paymentStatus}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/portal/bookings/${booking.id}`}
                        className="font-semibold text-blue-700"
                      >
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
