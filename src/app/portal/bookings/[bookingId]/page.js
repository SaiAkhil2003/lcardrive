import { auth } from "@clerk/nextjs/server";
import BookingActionsClient from "@/components/booking/BookingActionsClient";
import { userCanManageInstructor } from "@/lib/auth/ownership";
import { getBookingById } from "@/lib/platformData";

export const dynamic = "force-dynamic";

export default async function PortalBookingDetailPage({ params }) {
  const authObject = await auth().catch(() => ({ userId: null, sessionClaims: null }));
  const bookingResult = await getBookingById(params.bookingId);
  const ownership =
    authObject.userId && bookingResult.data
      ? await userCanManageInstructor(authObject.userId, bookingResult.data.instructorSlug)
      : { ok: false };

  if (!bookingResult.data || !ownership.ok) {
    return (
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Booking unavailable</h1>
        <p className="mt-3 text-slate-600">
          This booking is only visible to the claimed instructor owner or admin.
        </p>
      </div>
    );
  }

  const booking = bookingResult.data;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
          Booking Detail
        </p>
        <h1 className="mt-2 text-3xl font-bold">{booking.learnerName}</h1>
        <p className="mt-3 text-slate-600">{booking.scheduledStart}</p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ["Status", booking.status],
          ["Payment", booking.paymentStatus],
          ["Pickup", booking.pickupSuburb || "Not provided"]
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">{label}</p>
            <p className="mt-2 text-xl font-bold">{value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold">Workflow actions</h2>
        <div className="mt-5">
          <BookingActionsClient bookingId={booking.id} />
        </div>
      </section>
    </div>
  );
}
