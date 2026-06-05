import ProfileCompletenessBar from "@/components/portal/ProfileCompletenessBar";
import { instructors } from "@/data/instructors";

export default function PortalPricingPage() {
  const instructor = instructors[0];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
          Pricing
        </p>

        <h1 className="mt-2 text-3xl font-bold">Lesson pricing</h1>

        <p className="mt-3 max-w-2xl text-slate-600">
          Set clear public pricing for hourly lessons and prepaid packs. This is
          UI-only for Phase 1.
        </p>
      </section>

      <ProfileCompletenessBar value={78} />

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-4">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold">Hourly rate</span>
            <input
              defaultValue={instructor.rate.replace("/hr", "")}
              className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-600"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold">
              5 hour pack price
            </span>
            <input
              defaultValue="$350"
              className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-600"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold">
              10 hour pack price
            </span>
            <input
              defaultValue="$680"
              className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-600"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold">
              Lesson duration
            </span>
            <select
              defaultValue="60"
              className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-600"
            >
              <option value="60">60 minutes</option>
              <option value="90">90 minutes</option>
            </select>
          </label>
        </div>

        <button
          type="button"
          className="mt-6 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Save pricing
        </button>
      </section>
    </div>
  );
}
