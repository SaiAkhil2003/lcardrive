import Link from "next/link";
import { getSuburbSlug } from "@/lib/instructors";
import {
  getBooleanParam,
  getLicenceTypeFilter,
  getParam,
  getSearchResults,
  getTransmissionFilter,
  languageOptions,
  testCentreOptions
} from "@/lib/search";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Find Driving Instructors | LCarDrive",
  description:
    "Search and compare driving instructors by suburb, price, transmission, language, specialisation, and learner needs."
};

export default async function SearchPage({ searchParams }) {
  const suburb = getParam(searchParams, "suburb", "Melbourne west");
  const radius = getParam(searchParams, "radius", "10");
  const licenceType = getLicenceTypeFilter(searchParams);
  const transmission = getTransmissionFilter(searchParams);
  const maxPrice = getParam(searchParams, "maxPrice", "150");
  const language = getParam(searchParams, "language");
  const gender = getParam(searchParams, "gender");
  const testCentre = getParam(searchParams, "testCentre");
  const sort = getParam(searchParams, "sort", "relevance");
  const anxietyFriendly = getBooleanParam(
    searchParams,
    "anxietyFriendly",
    "Anxiety Friendly"
  );
  const internationalLicence = getBooleanParam(
    searchParams,
    "internationalLicence",
    "International Licence"
  );
  const { results, source, hasGeoRadius } = await getSearchResults(searchParams);

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
            {hasGeoRadius
              ? `Showing results within ${radius} km using stored coordinates.`
              : source === "sample" || source === "sample-empty"
                ? `Showing sample results within ${radius} km. Configure Supabase and Google Maps for live radius search.`
                : `Showing results within ${radius} km. Add coordinates and Google Maps geocoding for exact radius search.`}
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
          <aside className="h-fit rounded-2xl border bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold">Filters</h2>

              <Link href="/search" className="text-sm font-semibold text-blue-700">
                Clear
              </Link>
            </div>

            <form id="search-filters-form" method="GET" className="space-y-5">
              <input type="hidden" name="suburb" value={suburb} />
              <input type="hidden" name="radius" value={radius} />

              <div>
                <label className="mb-2 block text-sm font-semibold" htmlFor="licenceType">
                  Licence Type
                </label>

                <select
                  id="licenceType"
                  name="licenceType"
                  defaultValue={licenceType}
                  className="w-full rounded-xl border px-3 py-3"
                >
                  <option value="">Any licence</option>
                  <option value="Car">Car</option>
                  <option value="Motorbike">Motorbike</option>
                  <option value="Truck">Truck</option>
                  <option value="Bus">Bus</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold" htmlFor="transmission">
                  Transmission
                </label>

                <select
                  id="transmission"
                  name="transmission"
                  defaultValue={transmission}
                  className="w-full rounded-xl border px-3 py-3"
                >
                  <option value="">Any transmission</option>
                  <option value="Auto">Automatic</option>
                  <option value="Manual">Manual</option>
                  <option value="Both">Both</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold" htmlFor="maxPrice">
                  Max Price
                </label>

                <input
                  id="maxPrice"
                  name="maxPrice"
                  type="number"
                  min="0"
                  max="150"
                  step="5"
                  defaultValue={maxPrice}
                  className="w-full rounded-xl border px-3 py-3"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold" htmlFor="language">
                  Language Spoken
                </label>

                <select
                  id="language"
                  name="language"
                  defaultValue={language}
                  className="w-full rounded-xl border px-3 py-3"
                >
                  <option value="">Any language</option>
                  {languageOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold" htmlFor="gender">
                  Gender Preference
                </label>

                <select
                  id="gender"
                  name="gender"
                  defaultValue={gender}
                  className="w-full rounded-xl border px-3 py-3"
                >
                  <option value="">No preference</option>
                  <option value="Female">Female instructor</option>
                  <option value="Male">Male instructor</option>
                </select>
              </div>

              <label className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  name="anxietyFriendly"
                  defaultChecked={anxietyFriendly}
                />
                Anxiety friendly
              </label>

              <label className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  name="internationalLicence"
                  defaultChecked={internationalLicence}
                />
                International licence conversion
              </label>

              <div>
                <label className="mb-2 block text-sm font-semibold" htmlFor="testCentre">
                  Test Centre Familiarity
                </label>

                <select
                  id="testCentre"
                  name="testCentre"
                  defaultValue={testCentre}
                  className="w-full rounded-xl border px-3 py-3"
                >
                  <option value="">Any test centre</option>
                  {testCentreOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold" htmlFor="sort">
                  Sort
                </label>

                <select
                  id="sort"
                  name="sort"
                  defaultValue={sort}
                  className="w-full rounded-xl border px-3 py-3"
                >
                  <option value="relevance">Relevance</option>
                  <option value="price">Price low to high</option>
                  <option value="rating">Rating</option>
                  <option value="newest">Newest</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
              >
                Apply Filters
              </button>
            </form>
          </aside>

          <div>
            <div className="mb-5 flex flex-col gap-3 rounded-2xl border bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-slate-600">
                {results.length} instructors found
              </p>

              <p className="text-sm font-semibold text-slate-700">
                Sorted by {sort === "price" ? "price" : sort}
              </p>
            </div>

            {results.length === 0 && (
              <div className="rounded-2xl border bg-white p-8 text-center shadow-sm">
                <h2 className="text-2xl font-bold">No instructors found</h2>

                <p className="mx-auto mt-3 max-w-xl text-slate-600">
                  Try widening your filters or clearing them to see all sample
                  instructors.
                </p>

                <Link
                  href="/search"
                  className="mt-6 inline-block rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
                >
                  Clear Filters
                </Link>
              </div>
            )}

            {results.length > 0 && (
              <div className="grid gap-5 md:grid-cols-2">
                {results.map((instructor) => (
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
                        <h3 className="text-xl font-bold">{instructor.name}</h3>

                        <p className="text-sm text-slate-600">
                          {instructor.suburb} - {instructor.distance}
                        </p>

                        <p className="mt-1 text-sm text-amber-600">
                          Rating {instructor.rating} - {instructor.reviews} reviews
                        </p>
                      </div>
                    </div>

                    <div className="mb-4 flex flex-wrap gap-2">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {instructor.transmission}
                      </span>

                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {instructor.licenceTypes.join(", ")}
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
                      <p className="font-bold text-slate-900">{instructor.rate}</p>

                      <p className="mt-1 text-sm text-slate-600">
                        {instructor.packagePrice}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
