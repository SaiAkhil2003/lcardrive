import Link from "next/link";
import { instructors } from "@/data/instructors";

function getSuburbSlug(suburb) {
  return suburb.toLowerCase().replaceAll(" ", "-");
}

export default function SearchPage({ searchParams }) {
  const suburb = searchParams?.suburb || "Melbourne west";
  const radius = searchParams?.radius || "10";
  const filters = searchParams?.filters || "";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-2xl font-bold tracking-tight text-blue-700">
            LCarDrive
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-medium text-slate-700 md:flex">
            <Link href="/search" className="text-blue-700">
              Find Instructors
            </Link>

            <Link href="/find-my-instructor" className="hover:text-blue-700">
              AI Match
            </Link>

            <Link href="/portal" className="hover:text-blue-700">
              Instructor Portal
            </Link>

            <Link href="/admin" className="hover:text-blue-700">
              Admin
            </Link>
          </nav>

          <Link
            href="/"
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            New Search
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-700">
            Search Results
          </p>

          <h1 className="text-3xl font-bold">
            Driving instructors near {suburb}
          </h1>

          <p className="mt-2 text-slate-600">
            Showing sample results within {radius} km
            {filters ? ` with filters: ${filters}` : ""}
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
          <aside className="h-fit rounded-2xl border bg-white p-5 shadow-sm">
            <h2 className="mb-5 text-lg font-bold">
              Filters
            </h2>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Licence Type
                </label>

                <select className="w-full rounded-xl border px-3 py-3">
                  <option>Car</option>
                  <option>Motorbike</option>
                  <option>Truck</option>
                  <option>Bus</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Transmission
                </label>

                <select className="w-full rounded-xl border px-3 py-3">
                  <option>Automatic</option>
                  <option>Manual</option>
                  <option>Both</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Price Range
                </label>

                <input
                  type="range"
                  min="0"
                  max="150"
                  defaultValue="100"
                  className="w-full"
                />

                <div className="mt-1 flex justify-between text-xs text-slate-500">
                  <span>$0</span>
                  <span>$150/hr</span>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Language Spoken
                </label>

                <select className="w-full rounded-xl border px-3 py-3">
                  <option>Any language</option>
                  <option>English</option>
                  <option>Hindi</option>
                  <option>Tamil</option>
                  <option>Arabic</option>
                  <option>Mandarin</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Gender Preference
                </label>

                <select className="w-full rounded-xl border px-3 py-3">
                  <option>No preference</option>
                  <option>Female instructor</option>
                  <option>Male instructor</option>
                </select>
              </div>

              <label className="flex items-center gap-3 text-sm">
                <input type="checkbox" />
                Anxiety friendly
              </label>

              <label className="flex items-center gap-3 text-sm">
                <input type="checkbox" />
                International licence conversion
              </label>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Test Centre Familiarity
                </label>

                <select className="w-full rounded-xl border px-3 py-3">
                  <option>Any test centre</option>
                  <option>Sunshine</option>
                  <option>Werribee</option>
                  <option>Moorabbin</option>
                  <option>Bundoora</option>
                  <option>Broadmeadows</option>
                </select>
              </div>
            </div>
          </aside>

          <div>
            <div className="mb-5 flex flex-col gap-3 rounded-2xl border bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-slate-600">
                {instructors.length} instructors found
              </p>

              <select className="rounded-xl border px-3 py-2 text-sm">
                <option>Sort by Relevance</option>
                <option>Price low to high</option>
                <option>Rating</option>
                <option>Newest</option>
              </select>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {instructors.map((instructor) => (
                <Link
                  key={instructor.slug}
                  href={`/instructors/${getSuburbSlug(instructor.suburb)}/${instructor.slug}`}
                  className="rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="mb-4 flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-700">
                      {instructor.name.charAt(0)}
                    </div>

                    <div>
                      <h3 className="text-xl font-bold">
                        {instructor.name}
                      </h3>

                      <p className="text-sm text-slate-600">
                        {instructor.suburb} • {instructor.distance}
                      </p>

                      <p className="mt-1 text-sm text-amber-600">
                        ★ {instructor.rating} • {instructor.reviews} reviews
                      </p>
                    </div>
                  </div>

                  <div className="mb-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      {instructor.transmission}
                    </span>

                    {instructor.verified && (
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                        Verified
                      </span>
                    )}

                    {instructor.anxietyFriendly && (
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                        Anxiety Friendly
                      </span>
                    )}

                    {instructor.internationalLicence && (
                      <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                        International Licence
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 text-sm text-slate-600">
                    <p>
                      <span className="font-semibold text-slate-900">
                        Languages:
                      </span>{" "}
                      {instructor.language}
                    </p>

                    <p>
                      <span className="font-semibold text-slate-900">
                        Test centres:
                      </span>{" "}
                      {instructor.testCentre}
                    </p>

                    <p>
                      <span className="font-semibold text-slate-900">
                        Experience:
                      </span>{" "}
                      {instructor.experience}
                    </p>
                  </div>

                  <div className="mt-4 border-t pt-4">
                    <p className="font-bold text-slate-900">
                      {instructor.rate}
                    </p>

                    <p className="mt-1 text-sm text-slate-600">
                      {instructor.packagePrice}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
