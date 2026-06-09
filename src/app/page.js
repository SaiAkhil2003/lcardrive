"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const quickFilters = [
  "Car",
  "Motorbike",
  "Auto",
  "Manual",
  "Anxiety Friendly",
  "International Licence"
];

export default function Home() {
  const router = useRouter();

  const [suburb, setSuburb] = useState("");
  const [radius, setRadius] = useState("5");
  const [selectedFilters, setSelectedFilters] = useState([]);

  function toggleFilter(filter) {
    if (selectedFilters.includes(filter)) {
      setSelectedFilters(selectedFilters.filter((item) => item !== filter));
      return;
    }

    setSelectedFilters([...selectedFilters, filter]);
  }

  function handleSearch() {
    const params = new URLSearchParams();

    if (suburb.trim()) {
      params.set("suburb", suburb.trim());
    }

    params.set("radius", radius);

    if (selectedFilters.length > 0) {
      params.set("filters", selectedFilters.join(","));
    }

    router.push(`/search?${params.toString()}`);
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-2xl font-bold tracking-tight text-blue-700">
            LCarDrive
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-medium text-slate-700 md:flex">
            <Link href="/search" className="hover:text-blue-700">
              Find Instructors
            </Link>

            <Link href="/find-my-instructor" className="hover:text-blue-700">
              AI Match
            </Link>

            <Link href="/portal" className="hover:text-blue-700">
              Instructor Portal
            </Link>

            <Link href="/learner/dashboard" className="hover:text-blue-700">
              Learner Dashboard
            </Link>

            <Link href="/admin" className="hover:text-blue-700">
              Admin
            </Link>
          </nav>

          <button
            type="button"
            onClick={handleSearch}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            Search Now
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-12 md:py-14">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-blue-700">
              Driving Instructor Aggregator Platform
            </p>

            <h1 className="mb-5 max-w-2xl text-4xl font-bold leading-tight tracking-tight md:text-5xl">
              Find the right driving instructor near you
            </h1>

            <p className="mb-7 max-w-xl text-lg leading-8 text-slate-600">
              Search, compare, and contact qualified driving instructors based on suburb,
              price, transmission, language, specialisation, and learner needs.
            </p>

            <div className="rounded-2xl border bg-white p-4 shadow-sm">
              <div className="grid gap-3 md:grid-cols-[1fr_130px_120px]">
                <input
                  type="text"
                  value={suburb}
                  onChange={(event) => setSuburb(event.target.value)}
                  aria-label="Suburb or postcode"
                  placeholder="Enter suburb or postcode"
                  className="rounded-xl border px-4 py-3 text-slate-900 outline-none focus:border-blue-600"
                />

                <select
                  value={radius}
                  onChange={(event) => setRadius(event.target.value)}
                  aria-label="Search radius"
                  className="rounded-xl border px-4 py-3 text-slate-900 outline-none focus:border-blue-600"
                >
                  <option value="5">5 km</option>
                  <option value="10">10 km</option>
                  <option value="20">20 km</option>
                </select>

                <button
                  type="button"
                  onClick={handleSearch}
                  className="rounded-xl bg-blue-600 px-6 py-3 text-center font-semibold text-white hover:bg-blue-700"
                >
                  Search
                </button>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                {quickFilters.map((filter) => {
                  const isSelected = selectedFilters.includes(filter);

                  return (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => toggleFilter(filter)}
                      className={
                        isSelected
                          ? "rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white"
                          : "rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100"
                      }
                    >
                      {filter}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5">
              <h2 className="text-lg font-bold">
                Not sure who to pick?
              </h2>

              <p className="mt-2 max-w-xl leading-7 text-slate-600">
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
              LCarDrive Platform
            </h2>

            <div className="space-y-4">
              <div className="rounded-2xl border p-5">
                <h3 className="font-semibold">
                  Rich Instructor Profiles
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Show rates, vehicle details, languages, service areas, test centres,
                  reviews, and specialisations.
                </p>
              </div>

              <div className="rounded-2xl border p-5">
                <h3 className="font-semibold">
                  Instructor Claim Flow
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Instructors can claim seeded listings, update profile details,
                  and improve profile completeness.
                </p>
              </div>

              <div className="rounded-2xl border p-5">
                <h3 className="font-semibold">
                  Admin Quality Control
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Admin can import listings, approve claims, moderate reviews,
                  and monitor platform activity.
                </p>
              </div>

              <div className="rounded-2xl border p-5">
                <h3 className="font-semibold">
                  Booking And Learner Tools
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Learners can request lessons, save favourites, and track logbook
                  hours while payment features stay disabled until configured.
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
