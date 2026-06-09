import { auth } from "@clerk/nextjs/server";
import ProfileCompletenessBar from "@/components/portal/ProfileCompletenessBar";
import AvailabilityEditor from "@/components/portal/AvailabilityEditor";
import { getClaimedInstructorSlugsForUser } from "@/lib/auth/ownership";
import { getAvailabilityRecords } from "@/lib/platformData";

export const dynamic = "force-dynamic";

export default async function PortalAvailabilityPage() {
  const authObject = await auth().catch(() => ({ userId: null }));
  const ownership = authObject.userId
    ? await getClaimedInstructorSlugsForUser(authObject.userId)
    : { data: [], source: "signed-out" };
  const instructorSlug = ownership.data[0] || "sarah-m-footscray";
  const availability = await getAvailabilityRecords(instructorSlug);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
          Availability
        </p>

        <h1 className="mt-2 text-3xl font-bold">Weekly availability</h1>

        <p className="mt-3 max-w-2xl text-slate-600">
          Weekly recurring availability powers public booking slot generation.
        </p>
        {ownership.data.length === 0 && (
          <p className="mt-4 rounded-xl bg-amber-50 p-4 text-sm font-semibold text-amber-800">
            Approved claim ownership is required before availability can be
            persisted. Showing sample availability for Sarah M.
          </p>
        )}
      </section>

      <ProfileCompletenessBar value={82} />

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <AvailabilityEditor instructorSlug={instructorSlug} records={availability.data} />
      </section>
    </div>
  );
}
