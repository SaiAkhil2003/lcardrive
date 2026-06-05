import ProfileCompletenessBar from "@/components/portal/ProfileCompletenessBar";
import { instructors } from "@/data/instructors";

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
];

export default function PortalAvailabilityPage() {
  const instructor = instructors[0];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
          Availability
        </p>

        <h1 className="mt-2 text-3xl font-bold">Weekly availability</h1>

        <p className="mt-3 max-w-2xl text-slate-600">
          Mark the days you usually teach. This is not a booking calendar and
          does not create live lesson slots.
        </p>
      </section>

      <ProfileCompletenessBar value={82} />

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2">
          {days.map((day) => (
            <label
              key={day}
              className="flex items-center justify-between rounded-xl border p-4"
            >
              <span className="font-semibold">{day}</span>
              <input
                type="checkbox"
                defaultChecked={instructor.availability.includes(day)}
              />
            </label>
          ))}
        </div>

        <button
          type="button"
          className="mt-6 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Save availability placeholder
        </button>
      </section>
    </div>
  );
}
