import { selectWithServiceRole } from "@/lib/supabase/admin";
import { getPlatformCommissionPercent } from "@/lib/platformData";
import { getStripeDisabledMessage } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  const result = await selectWithServiceRole(
    "payment_intents?select=*&order=created_at.desc&limit=100"
  );
  const payments = Array.isArray(result.data) ? result.data : [];
  const stripeMessage = getStripeDisabledMessage();

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
          Payments
        </p>
        <h1 className="mt-2 text-3xl font-bold">Stripe Connect payment readiness</h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Platform commission defaults to {getPlatformCommissionPercent()}%.
          Sensitive Stripe details are not exposed in this dashboard.
        </p>
        {stripeMessage && (
          <p className="mt-4 rounded-xl bg-amber-50 p-4 text-sm font-semibold text-amber-800">
            {stripeMessage}
          </p>
        )}
      </section>

      <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-semibold">Booking</th>
                <th className="px-4 py-3 font-semibold">Instructor</th>
                <th className="px-4 py-3 font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold">Platform fee</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {payments.length === 0 && (
                <tr>
                  <td className="px-4 py-5 text-slate-600" colSpan={5}>
                    No payment records found. Source: {result.placeholder ? "placeholder" : "supabase"}.
                  </td>
                </tr>
              )}
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td className="px-4 py-3 font-semibold">{payment.booking_id}</td>
                  <td className="px-4 py-3">{payment.instructor_slug}</td>
                  <td className="px-4 py-3">${((payment.amount_cents || 0) / 100).toFixed(2)}</td>
                  <td className="px-4 py-3">${((payment.application_fee_cents || 0) / 100).toFixed(2)}</td>
                  <td className="px-4 py-3">{payment.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
