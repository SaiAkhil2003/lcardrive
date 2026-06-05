"use client";

import { SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { instructors } from "@/data/instructors";

function ClaimSignInPrompt() {
  return (
    <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6 text-center">
      <h2 className="text-2xl font-bold text-slate-900">
        Please sign in or create an account to claim this profile.
      </h2>

      <p className="mx-auto mt-3 max-w-xl text-slate-600">
        Instructor claims use Clerk authentication. You can sign up with
        email/password or Google SSO once Google is enabled in the Clerk
        dashboard.
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          href="/sign-in"
          className="rounded-xl border bg-white px-5 py-3 font-semibold text-slate-700 hover:border-blue-600 hover:text-blue-700"
        >
          Sign in
        </Link>

        <Link
          href="/sign-up"
          className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Sign up
        </Link>
      </div>
    </div>
  );
}

export default function ClaimProfilePage() {
  const params = useParams();
  const instructorId = params?.instructorId;
  const hasClerkConfigured = Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  );

  const instructor = instructors.find((item) => item.slug === instructorId);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    adiRegistration: ""
  });

  const [submitted, setSubmitted] = useState(false);

  function updateField(field, value) {
    setFormData((previous) => ({
      ...previous,
      [field]: value
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setSubmitted(true);
  }

  if (!instructor) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-20 text-slate-900">
        <section className="mx-auto max-w-3xl rounded-2xl border bg-white p-8 text-center shadow-sm">
          <h1 className="text-3xl font-bold">Profile not found</h1>

          <p className="mt-3 text-slate-600">
            The instructor profile you are trying to claim is not available.
          </p>

          <Link
            href="/search"
            className="mt-6 inline-block rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Back to Search
          </Link>
        </section>
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
            href={`/instructors/${instructor.suburb.toLowerCase().replaceAll(" ", "-")}/${instructor.slug}`}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Back to Profile
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-700">
            Instructor Claim Flow
          </p>

          <h1 className="text-4xl font-bold">
            Claim your LCarDrive profile
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-slate-600">
            Find your listing, sign up through Clerk, enter your ADI
            registration number, and wait for admin approval. Once approved,
            your profile can show as verified.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <section className="rounded-3xl border bg-white p-6 shadow-sm">
            {!hasClerkConfigured && <ClaimSignInPrompt />}

            {hasClerkConfigured && (
              <>
                <SignedOut>
                  <ClaimSignInPrompt />
                </SignedOut>

                <SignedIn>
                  {!submitted && (
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div>
                        <label className="mb-2 block text-sm font-semibold">
                          Full Name
                        </label>

                        <input
                          type="text"
                          value={formData.fullName}
                          onChange={(event) =>
                            updateField("fullName", event.target.value)
                          }
                          placeholder="Enter your full name"
                          required
                          className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-600"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold">
                          Email Address
                        </label>

                        <input
                          type="email"
                          value={formData.email}
                          onChange={(event) =>
                            updateField("email", event.target.value)
                          }
                          placeholder="Enter your email"
                          required
                          className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-600"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold">
                          Phone Number
                        </label>

                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(event) =>
                            updateField("phone", event.target.value)
                          }
                          placeholder="Enter your phone number"
                          required
                          className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-600"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold">
                          ADI Registration Number
                        </label>

                        <input
                          type="text"
                          value={formData.adiRegistration}
                          onChange={(event) =>
                            updateField("adiRegistration", event.target.value)
                          }
                          placeholder="Example: ADI-VIC-10291"
                          required
                          className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-600"
                        />

                        <p className="mt-2 text-sm text-slate-500">
                          This will be checked by the admin before verification.
                        </p>
                      </div>

                      <button
                        type="submit"
                        className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
                      >
                        Submit Claim Request
                      </button>
                    </form>
                  )}

                  {submitted && (
                    <div className="rounded-2xl border border-green-100 bg-green-50 p-6 text-center">
                      <h2 className="text-2xl font-bold text-green-800">
                        Claim request submitted
                      </h2>

                      <p className="mt-3 text-green-700">
                        Your request has been received. The admin will review
                        your ADI registration details before approving the
                        profile claim.
                      </p>

                      <Link
                        href="/search"
                        className="mt-6 inline-block rounded-xl bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800"
                      >
                        Back to Search
                      </Link>
                    </div>
                  )}
                </SignedIn>
              </>
            )}
          </section>

          <aside className="space-y-6">
            <section className="rounded-3xl border bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold">Profile being claimed</h2>

              <div className="mt-5 flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-700">
                  {instructor.name.charAt(0)}
                </div>

                <div>
                  <h3 className="text-lg font-bold">{instructor.name}</h3>

                  <p className="text-sm text-slate-600">
                    {instructor.suburb}, {instructor.state}
                  </p>

                  <p className="mt-1 text-sm text-amber-600">
                    ★ {instructor.rating} • {instructor.reviews} reviews
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-500">
                  Current ADI registration shown
                </p>

                <p className="mt-1 font-bold">
                  {instructor.adiRegistration}
                </p>
              </div>
            </section>

            <section className="rounded-3xl border border-blue-100 bg-blue-50 p-6">
              <h2 className="text-xl font-bold">What happens next?</h2>

              <div className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
                <p>1. You submit your claim request.</p>
                <p>2. Admin checks your ADI registration details.</p>
                <p>3. Once approved, your profile becomes verified.</p>
                <p>4. You can later update profile, pricing, availability, and service areas.</p>
              </div>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}
