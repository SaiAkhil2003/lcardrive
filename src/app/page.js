import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-2xl font-bold text-blue-700">
            LCarDrive
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-700 md:flex">
            <Link href="/search" className="hover:text-blue-700">
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
            href="/search"
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Search Now
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-blue-700">
              Driving Instructor Aggregator Platform
            </p>

            <h1 className="mb-6 text-4xl font-bold leading-tight md:text-5xl">
              Find the right driving instructor near you
            </h1>

            <p className="mb-8 max-w-xl text-lg text-slate-600">
              Search, compare, and contact qualified driving instructors based on suburb,
              price, transmission, language, specialisation, and learner needs.
            </p>

            <div className="rounded-2xl border bg-white p-4 shadow-sm">
              <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
                <input
                  type="text"
                  placeholder="Enter suburb or postcode"
                  className="rounded-xl border px-4 py-3 outline-none focus:border-blue-600"
                />

                <select className="rounded-xl border px-4 py-3 outline-none focus:border-blue-600">
                  <option>5 km</option>
                  <option>10 km</option>
                  <option>20 km</option>
                </select>

                <Link
                  href="/search"
                  className="rounded-xl bg-blue-600 px-6 py-3 text-center font-semibold text-white hover:bg-blue-700"
                >
                  Search
                </Link>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
                  Car
                </span>

                <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
                  Motorbike
                </span>

                <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
                  Auto
                </span>

                <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
                  Manual
                </span>

                <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
                  Anxiety Friendly
                </span>

                <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
                  International Licence
                </span>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5">
              <h2 className="text-lg font-bold">
                Not sure who to pick?
              </h2>

              <p className="mt-2 text-slate-600">
                Answer 5 simple questions and let AI recommend your best instructor match.
              </p>

              <Link
                href="/find-my-instructor"
                className="mt-4 inline-block rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800"
              >
                Find My Instructor
              </Link>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-8 shadow-sm">
            <h2 className="mb-6 text-2xl font-bold">
              Phase 1 Platform Focus
            </h2>

            <div className="space-y-4">
              <div className="rounded-2xl border p-5">
                <h3 className="font-semibold">
                  Rich Instructor Profiles
                </h3>

                <p className="mt-2 text-sm text-slate-600">
                  Show rates, vehicle details, languages, service areas, test centres,
                  reviews, and specialisations.
                </p>
              </div>

              <div className="rounded-2xl border p-5">
                <h3 className="font-semibold">
                  Instructor Claim Flow
                </h3>

                <p className="mt-2 text-sm text-slate-600">
                  Instructors can claim seeded listings, update profile details,
                  and improve profile completeness.
                </p>
              </div>

              <div className="rounded-2xl border p-5">
                <h3 className="font-semibold">
                  Admin Quality Control
                </h3>

                <p className="mt-2 text-sm text-slate-600">
                  Admin can import listings, approve claims, moderate reviews,
                  and monitor platform activity.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t bg-white px-6 py-6 text-center text-sm text-slate-500">
        © 2026 LCarDrive. All rights reserved.
      </footer>
    </main>
  );
}
