import { auth } from "@clerk/nextjs/server";
import { getInstructorSubscriptionStatus } from "@/lib/platformData";
import { getStripeDisabledMessage } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export default async function PortalSubscriptionPage() {
  const authObject = await auth().catch(() => ({ userId: null }));
  const status = authObject.userId
    ? await getInstructorSubscriptionStatus(authObject.userId)
    : { source: "signed-out", subscription: null, featuredListing: null };
  const stripeMessage = getStripeDisabledMessage();

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
          Subscription
        </p>
        <h1 className="mt-2 text-3xl font-bold">Featured listing and plan status</h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Subscription and featured listing payments stay disabled until Stripe
          test-mode setup and payout readiness are complete.
        </p>
        {stripeMessage && (
          <p className="mt-4 rounded-xl bg-amber-50 p-4 text-sm font-semibold text-amber-800">
            {stripeMessage}
          </p>
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">Current plan</h2>
          <p className="mt-3 text-slate-600">
            {status.subscription?.status || "No active subscription"}
          </p>
        </div>
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">Featured listing</h2>
          <p className="mt-3 text-slate-600">
            {status.featuredListing?.status || "No featured listing order"}
          </p>
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold">Stripe Connect readiness</h2>
        <p className="mt-3 text-sm text-slate-600">
          Production payouts require Stripe Connect onboarding, identity checks,
          payout account verification, refunds/disputes handling, and legal
          review before real charges are enabled.
        </p>
      </section>
    </div>
  );
}
