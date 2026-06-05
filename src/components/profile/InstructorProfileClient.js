"use client";

import Link from "next/link";
import { useState } from "react";

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

function ContactModal({ instructor, onClose }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: `Hi ${instructor.firstName}, I would like to ask about driving lessons.`
  });
  const [status, setStatus] = useState("idle");

  function updateField(field, value) {
    setFormData((previous) => ({
      ...previous,
      [field]: value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("loading");

    try {
      const response = await fetch("/api/contact-instructor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          instructorId: instructor.slug,
          instructorName: instructor.name,
          ...formData
        })
      });

      if (!response.ok) {
        throw new Error("Contact request failed");
      }

      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 px-4 py-6">
      <div className="max-h-full w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
              Contact Instructor
            </p>
            <h2 className="mt-1 text-2xl font-bold">{instructor.name}</h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border px-3 py-2 text-sm font-semibold text-slate-700"
          >
            Close
          </button>
        </div>

        {status === "success" ? (
          <div className="mt-6 rounded-2xl border border-green-100 bg-green-50 p-5">
            <h3 className="text-xl font-bold text-green-800">
              Contact request received
            </h3>
            <p className="mt-2 text-sm leading-6 text-green-700">
              Your message has been captured. Email delivery uses Resend when
              the server key and sender setup are available.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold">Name</span>
              <input
                value={formData.name}
                onChange={(event) => updateField("name", event.target.value)}
                required
                className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-600"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold">Email</span>
              <input
                type="email"
                value={formData.email}
                onChange={(event) => updateField("email", event.target.value)}
                required
                className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-600"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold">Phone</span>
              <input
                type="tel"
                value={formData.phone}
                onChange={(event) => updateField("phone", event.target.value)}
                className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-600"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold">Message</span>
              <textarea
                value={formData.message}
                onChange={(event) => updateField("message", event.target.value)}
                rows={5}
                required
                className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-600"
              />
            </label>

            {status === "error" && (
              <p className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">
                The message could not be submitted. Please try again.
              </p>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === "loading" ? "Sending..." : "Send Message"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function ReviewForm({ instructor }) {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-green-100 bg-green-50 p-5">
        <h3 className="text-xl font-bold text-green-800">
          Review submitted for moderation.
        </h3>
        <p className="mt-2 text-sm text-green-700">
          Reviews are checked before they appear publicly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold">First name</span>
          <input
            name="firstName"
            required
            className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-600"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold">
            Email, not displayed publicly
          </span>
          <input
            name="email"
            type="email"
            required
            className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-600"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        {[
          ["ratingOverall", "Overall"],
          ["ratingPatience", "Patience"],
          ["ratingCommunication", "Communication"],
          ["ratingValue", "Value"],
          ["ratingPunctuality", "Punctuality"]
        ].map(([name, label]) => (
          <label key={name} className="block">
            <span className="mb-2 block text-sm font-semibold">{label}</span>
            <select
              name={name}
              defaultValue="5"
              className="w-full rounded-xl border px-3 py-3"
            >
              {["5", "4", "3", "2", "1"].map((rating) => (
                <option key={rating} value={rating}>
                  {rating}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>

      <label className="block">
        <span className="mb-2 block text-sm font-semibold">Pass outcome</span>
        <select name="passOutcome" className="w-full rounded-xl border px-3 py-3">
          <option>Passed first attempt</option>
          <option>Passed after retries</option>
          <option>Still learning</option>
          <option>Test not taken yet</option>
        </select>
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-semibold">
          Free text comment
        </span>
        <textarea
          name="comment"
          rows={5}
          placeholder={`Share your experience with ${instructor.firstName}`}
          required
          className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-600"
        />
      </label>

      <button
        type="submit"
        className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
      >
        Submit Review
      </button>
    </form>
  );
}

export default function InstructorProfileClient({ instructor }) {
  const [copied, setCopied] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const isUnclaimed = instructor.claimStatus === "Unclaimed";

  function handleShare() {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(window.location.href);
    }

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1500);
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {isContactOpen && (
        <ContactModal
          instructor={instructor}
          onClose={() => setIsContactOpen(false)}
        />
      )}

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

                  {!instructor.verified && (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                      {instructor.claimStatus}
                    </span>
                  )}
                </div>

                <p className="mt-2 text-slate-600">
                  Driving Instructor in {instructor.suburb}, {instructor.state}
                </p>

                <p className="mt-2 text-amber-600">
                  Rating {instructor.rating} - {instructor.reviews} reviews
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {instructor.transmission}
                  </span>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {instructor.licenceTypes.join(", ")}
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
                onClick={() => setIsContactOpen(true)}
                className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
              >
                Contact Instructor
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="rounded-xl border px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
              >
                {copied ? "Copied" : "Share Profile"}
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
                  <p className="text-sm font-semibold text-slate-500">
                    Experience
                  </p>
                  <p className="mt-1 font-bold">{instructor.experience}</p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-500">
                    Languages
                  </p>
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
                Availability is self-reported and not a live booking calendar.
              </p>
            </section>

            <section className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-2xl font-bold">Vehicle</h2>

              <div className="grid gap-4 md:grid-cols-2">
                <p>
                  <span className="font-semibold">Make:</span>{" "}
                  {instructor.vehicle.make}
                </p>
                <p>
                  <span className="font-semibold">Model:</span>{" "}
                  {instructor.vehicle.model}
                </p>
                <p>
                  <span className="font-semibold">Year:</span>{" "}
                  {instructor.vehicle.year}
                </p>
                <p>
                  <span className="font-semibold">Transmission:</span>{" "}
                  {instructor.vehicle.transmission}
                </p>
                <p>
                  <span className="font-semibold">Dual controls:</span>{" "}
                  {instructor.vehicle.dualControls}
                </p>
              </div>
            </section>

            <section className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-2xl font-bold">Coverage</h2>

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
              <h2 className="mb-4 text-2xl font-bold">Reviews</h2>

              <div className="space-y-4">
                <RatingBar
                  label="Patience"
                  value={instructor.reviewBreakdown.patience}
                />
                <RatingBar
                  label="Communication"
                  value={instructor.reviewBreakdown.communication}
                />
                <RatingBar
                  label="Value for money"
                  value={instructor.reviewBreakdown.value}
                />
                <RatingBar
                  label="Punctuality"
                  value={instructor.reviewBreakdown.punctuality}
                />
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

            <section className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-2xl font-bold">Submit a Review</h2>

              <p className="mb-5 text-sm text-slate-600">
                Learners can submit reviews without creating an account. Email
                is collected for moderation and is not displayed publicly.
              </p>

              <ReviewForm instructor={instructor} />
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-bold">Lesson Pricing</h2>

              <p className="text-3xl font-bold text-blue-700">
                {instructor.rate}
              </p>

              <p className="mt-2 text-slate-600">{instructor.packagePrice}</p>

              <button
                type="button"
                onClick={() => setIsContactOpen(true)}
                className="mt-6 w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
              >
                Contact Instructor
              </button>

              {isUnclaimed && (
                <Link
                  href={`/claim/${instructor.slug}`}
                  className="mt-3 block w-full rounded-xl border px-5 py-3 text-center font-semibold text-slate-700 hover:border-blue-600 hover:text-blue-700"
                >
                  Claim this Profile
                </Link>
              )}

              {!isUnclaimed && (
                <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                  Claim status: {instructor.claimStatus}
                </p>
              )}

              <button
                type="button"
                onClick={handleShare}
                className="mt-3 w-full rounded-xl border px-5 py-3 font-semibold text-slate-700 hover:border-blue-600 hover:text-blue-700"
              >
                {copied ? "Copied" : "Share Profile"}
              </button>

              <p className="mt-5 text-sm text-slate-500">
                This is a Phase 1 listing for instructor discovery and profile
                claims.
              </p>
            </section>

            <section className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-bold">Licence Details</h2>

              <p className="text-sm text-slate-500">ADI Registration Number</p>
              <p className="mt-1 font-bold">{instructor.adiRegistration}</p>

              <p className="mt-4 text-sm text-slate-500">Licence types taught</p>
              <p className="mt-1 font-bold">{instructor.licenceTypes.join(", ")}</p>

              <p className="mt-4 text-sm text-slate-500">State</p>
              <p className="mt-1 font-bold">{instructor.state}</p>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}
