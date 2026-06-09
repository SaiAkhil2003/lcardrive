import AdminBookingActionsClient from "@/components/admin/AdminBookingActionsClient";
import { getAdminBookings } from "@/lib/platformData";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage() {
  const result = await getAdminBookings();

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
          Bookings
        </p>
        <h1 className="mt-2 text-3xl font-bold">Booking operations</h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Review pending, confirmed, cancelled, and rescheduled lesson requests.
          Source: {result.source}.
        </p>
      </section>

      <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-semibold">Learner</th>
                <th className="px-4 py-3 font-semibold">Instructor</th>
                <th className="px-4 py-3 font-semibold">Time</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Payment</th>
                <th className="px-4 py-3 font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {result.data.length === 0 && (
                <tr>
                  <td className="px-4 py-5 text-slate-600" colSpan={7}>
                    No bookings found.
                  </td>
                </tr>
              )}
              {result.data.map((booking) => (
                <tr key={booking.id}>
                  <td className="px-4 py-3 font-semibold">{booking.learnerName}</td>
                  <td className="px-4 py-3 text-slate-600">{booking.instructorSlug}</td>
                  <td className="px-4 py-3 text-slate-600">{booking.scheduledStart}</td>
                  <td className="px-4 py-3">{booking.status}</td>
                  <td className="px-4 py-3">{booking.paymentStatus}</td>
                  <td className="px-4 py-3">
                    ${(booking.amountCents / 100).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <AdminBookingActionsClient bookingId={booking.id} />
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
