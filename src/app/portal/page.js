import Link from "next/link";
import ProfileCompletenessBar from "@/components/portal/ProfileCompletenessBar";
import { instructors } from "@/data/instructors";

export default function PortalHomePage() {
  const instructor = instructors[0];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
          Instructor Portal
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          Manage your LCarDrive profile
        </h1>

        <p className="mt-3 max-w-2xl text-slate-600">
          Update your profile, pricing, availability, and service areas after an
          admin approves your claim. The current screens are Phase 1 placeholder
          UI and do not write to a database yet.
        </p>
      </section>

      <ProfileCompletenessBar value={68} />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Public profile", value: instructor.name },
          { label: "Claim status", value: "Pending admin review" },
          { label: "Hourly rate", value: instructor.rate },
          { label: "Service areas", value: `${instructor.serviceAreas.length} suburbs` }
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">{item.label}</p>
            <p className="mt-2 text-xl font-bold text-slate-900">{item.value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold">Claim flow</h2>

        <div className="mt-4 grid gap-3 text-sm leading-6 text-slate-700 md:grid-cols-4">
          <p className="rounded-xl bg-slate-50 p-4">1. Find your listing.</p>
          <p className="rounded-xl bg-slate-50 p-4">
            2. Claim with email/password or Google SSO through Clerk.
          </p>
          <p className="rounded-xl bg-slate-50 p-4">
            3. Submit your ADI registration number.
          </p>
          <p className="rounded-xl bg-slate-50 p-4">
            4. Admin approval adds the verified badge later.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Link
          href="/portal/profile"
          className="rounded-2xl border bg-white p-5 shadow-sm hover:border-blue-600"
        >
          <h2 className="text-xl font-bold">Complete your profile</h2>
          <p className="mt-2 text-sm text-slate-600">
            Add bio, languages, specialisations, vehicle details, and links.
          </p>
        </Link>

        <Link
          href="/portal/service-areas"
          className="rounded-2xl border bg-white p-5 shadow-sm hover:border-blue-600"
        >
          <h2 className="text-xl font-bold">Check service areas</h2>
          <p className="mt-2 text-sm text-slate-600">
            Keep suburb coverage clear so learners can find you.
          </p>
        </Link>
      </section>
    </div>
  );
}
