"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { instructors } from "@/data/instructors";

function RatingBar({ label, value }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="text-slate-600">{value}</span>
      </div>

      <div className="h-2 rounded-full bg-slate-100">
        <div
          className="h-2 rounded-full bg-blue-600"
          style={{ width: `${Number(value) * 20}%` }}
        />
      </div>
    </div>
  );
}

export default function InstructorProfilePage() {
  const params = useParams();
  const slug = params?.slug;
  const instructor = instructors.find((item) => item.slug === slug);
  const [copied, setCopied] = useState(false);

  function handleShare() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1500);
  }

  if (!instructor) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-20 text-slate-900">
        <div className="mx-auto max-w-3xl rounded-2xl border bg-white p-8 text-center shadow-sm">
          <h1 className="text-3xl font-bold">Instructor not found</h1>

          <p className="mt-3 text-slate-600">
            The instructor profile you are looking for is not available.
          </p>

          <Link
            href="/search"
            className="mt-6 inline-block rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Back to Search
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-2xl font-bold text-blue-700">
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

            <Link href="/admin" className="hover:text-blue-700">
              Admin
            </Link>
          </nav>

          <Link
            href="/search"
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Back to Search
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-5">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-blue-100 text-3xl font-bold text-blue-700">
                {instructor.name.charAt(0)}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-bold">{instructor.name}</h1>

                  {instructor.verified && (
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                      Verified
                    </span>
                  )}
                </div>

                <p className="mt-2 text-slate-600">
                  Driving Instructor in {instructor.suburb}, {instructor.state}
                </p>

                <p className="mt-2 text-amber-600">
                  ★ {instructor.rating} • {instructor.reviews} reviews
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {instructor.transmission}
                  </span>

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
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleShare}
                className="rounded-xl border px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
              >
                {copied ? "Copied" : "Share Profile"}
              </button>

              <button
                type="button"
                className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
              >
                Contact Instructor
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            <section className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="mb-3 text-2xl font-bold">About</h2>

              <p className="leading-7 text-slate-600">
                {instructor.description}
              </p>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-500">Experience</p>
                  <p className="mt-1 font-bold">{instructor.experience}</p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-500">Languages</p>
                  <p className="mt-1 font-bold">{instructor.language}</p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-2xl font-bold">Pricing</h2>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border p-4">
                  <p className="text-sm text-slate-500">Hourly Rate</p>
                  <p className="mt-1 text-xl font-bold">{instructor.rate}</p>
                </div>

                {instructor.packageOptions.map((item) => (
                  <div key={item} className="rounded-xl border p-4">
                    <p className="text-sm text-slate-500">Package</p>
                    <p className="mt-1 font-bold">{item}</p>
                  </div>
                ))}
              </div>

              <p className="mt-4 text-sm text-slate-600">
                Lesson duration: {instructor.lessonDuration}
              </p>
            </section>

            <section className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-2xl font-bold">Availability</h2>

              <div className="flex flex-wrap gap-2">
                {instructor.availability.map((day) => (
                  <span
                    key={day}
                    className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700"
                  >
                    {day}
                  </span>
                ))}
              </div>

              <p className="mt-3 text-sm text-slate-500">
                Availability is self reported and not a live booking calendar.
              </p>
            </section>

            <section className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-2xl font-bold">Vehicle</h2>

              <div className="grid gap-4 md:grid-cols-2">
                <p><span className="font-semibold">Make:</span> {instructor.vehicle.make}</p>
                <p><span className="font-semibold">Model:</span> {instructor.vehicle.model}</p>
                <p><span className="font-semibold">Year:</span> {instructor.vehicle.year}</p>
                <p><span className="font-semibold">Transmission:</span> {instructor.vehicle.transmission}</p>
                <p><span className="font-semibold">Dual controls:</span> {instructor.vehicle.dualControls}</p>
              </div>
            </section>

            <section className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-2xl font-bold">Reviews</h2>

              <div className="space-y-4">
                <RatingBar label="Patience" value={instructor.reviewBreakdown.patience} />
                <RatingBar label="Communication" value={instructor.reviewBreakdown.communication} />
                <RatingBar label="Value for money" value={instructor.reviewBreakdown.value} />
                <RatingBar label="Punctuality" value={instructor.reviewBreakdown.punctuality} />
              </div>

              <div className="mt-6 rounded-xl bg-slate-50 p-4">
                <p className="font-semibold">Learner review</p>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {instructor.sampleReview}
                </p>

                <p className="mt-2 text-xs font-semibold text-green-700">
                  {instructor.passOutcome}
                </p>
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-bold">Lesson Pricing</h2>

              <p className="text-3xl font-bold text-blue-700">{instructor.rate}</p>

              <p className="mt-2 text-slate-600">{instructor.packagePrice}</p>

              <button className="mt-6 w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700">
                Contact Instructor
              </button>

              <Link
                href={`/claim/${instructor.slug}`}
                className="mt-3 block w-full rounded-xl border px-5 py-3 text-center font-semibold text-slate-700 hover:border-blue-600 hover:text-blue-700"
              >
                Claim this Profile
              </Link>

              <button
                type="button"
                onClick={handleShare}
                className="mt-3 w-full rounded-xl border px-5 py-3 font-semibold text-slate-700 hover:border-blue-600 hover:text-blue-700"
              >
                {copied ? "Copied" : "Share Profile"}
              </button>

              <p className="mt-5 text-sm text-slate-500">
                This is a Phase 1 listing for instructor discovery and profile claims.
              </p>
            </section>

            <section className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-bold">Coverage</h2>

              <p className="mb-2 text-sm font-semibold">Service suburbs</p>

              <div className="mb-5 flex flex-wrap gap-2">
                {instructor.serviceAreas.map((area) => (
                  <span
                    key={area}
                    className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700"
                  >
                    {area}
                  </span>
                ))}
              </div>

              <p className="mb-2 text-sm font-semibold">Known test centres</p>

              <div className="flex flex-wrap gap-2">
                {instructor.testCentre.split(", ").map((centre) => (
                  <span
                    key={centre}
                    className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700"
                  >
                    {centre}
                  </span>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-bold">Licence Details</h2>

              <p className="text-sm text-slate-500">ADI Registration Number</p>
              <p className="mt-1 font-bold">{instructor.adiRegistration}</p>

              <p className="mt-4 text-sm text-slate-500">State</p>
              <p className="mt-1 font-bold">{instructor.state}</p>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}
