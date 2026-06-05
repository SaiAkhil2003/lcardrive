import ProfileCompletenessBar from "@/components/portal/ProfileCompletenessBar";
import { instructors } from "@/data/instructors";

export default function PortalServiceAreasPage() {
  const instructor = instructors[0];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
          Service Areas
        </p>

        <h1 className="mt-2 text-3xl font-bold">Suburbs and test centres</h1>

        <p className="mt-3 max-w-2xl text-slate-600">
          Keep your suburb coverage and familiar test centres accurate so the
          search page can rank relevant instructors later.
        </p>
      </section>

      <ProfileCompletenessBar value={86} />

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold">Service suburb tag input</h2>

        <div className="mt-5 flex flex-wrap gap-3">
          {instructor.serviceAreas.map((area) => (
            <span
              key={area}
              className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700"
            >
              {area}
            </span>
          ))}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto]">
          <input
            placeholder="Add suburb tag"
            className="rounded-xl border px-4 py-3 outline-none focus:border-blue-600"
          />

          <button
            type="button"
            className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Add suburb
          </button>
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold">Familiar test centres</h2>

        <select
          multiple
          defaultValue={instructor.testCentre.split(", ")}
          className="mt-5 min-h-40 w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-600"
        >
          {[
            "Sunshine",
            "Werribee",
            "Moorabbin",
            "Bundoora",
            "Broadmeadows",
            "Carlton"
          ].map((centre) => (
            <option key={centre} value={centre}>
              {centre}
            </option>
          ))}
        </select>

        <button
          type="button"
          className="mt-6 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Save service areas
        </button>
      </section>
    </div>
  );
}
