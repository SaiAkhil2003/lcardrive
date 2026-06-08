"use client";

import { SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import { useState } from "react";

function getSuburbSlug(suburb = "") {
  return suburb.toLowerCase().replaceAll(" ", "-");
}

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

function LocalDevelopmentNotice() {
  return (
    <div className="mb-5 rounded-2xl border border-amber-100 bg-amber-50 p-5 text-sm leading-6 text-amber-800">
      Clerk keys are missing in local development. Public pages stay available,
      and this form is shown so the manual claim flow can be tested without a
      Clerk session.
    </div>
  );
}

function ClaimForm({ formData, submitStatus, onSubmit, onUpdateField }) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label className="mb-2 block text-sm font-semibold">Full Name</label>

        <input
          type="text"
          value={formData.fullName}
          onChange={(event) => onUpdateField("fullName", event.target.value)}
          placeholder="Enter your full name"
          required
          className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-600"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold">Email Address</label>

        <input
          type="email"
          value={formData.email}
          onChange={(event) => onUpdateField("email", event.target.value)}
          placeholder="Enter your email"
          required
          className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-600"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold">Phone Number</label>

        <input
          type="tel"
          value={formData.phone}
          onChange={(event) => onUpdateField("phone", event.target.value)}
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
            onUpdateField("adiRegistration", event.target.value)
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
        disabled={submitStatus === "loading"}
        className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitStatus === "loading" ? "Submitting..." : "Submit Claim Request"}
      </button>

      {submitStatus === "error" && (
        <p className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">
          The claim request could not be submitted. Please try again.
        </p>
      )}
    </form>
  );
}

function ClaimConfirmation() {
  return (
    <div className="rounded-2xl border border-green-100 bg-green-50 p-6 text-center">
      <h2 className="text-2xl font-bold text-green-800">
        Claim request submitted for admin review.
      </h2>

      <p className="mt-3 text-green-700">
        Admin will manually review your ADI registration number before approving
        the profile claim.
      </p>

      <Link
        href="/search"
        className="mt-6 inline-block rounded-xl bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800"
      >
        Back to Search
      </Link>
    </div>
  );
}

export default function ClaimProfileClient({ instructor, hasClerkConfigured }) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    adiRegistration: ""
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitStatus, setSubmitStatus] = useState("idle");
  const profilePath = `/instructors/${getSuburbSlug(instructor.suburb)}/${instructor.slug}`;

  function updateField(field, value) {
    setFormData((previous) => ({
      ...previous,
      [field]: value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitStatus("loading");

    try {
      const response = await fetch("/api/claims", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          instructorId: instructor.slug,
          ...formData
        })
      });

      if (!response.ok) {
        throw new Error("Claim submission failed");
      }

      setSubmitted(true);
      setSubmitStatus("success");
    } catch {
      setSubmitStatus("error");
    }
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
            href={profilePath}
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

          <h1 className="text-4xl font-bold">Claim your LCarDrive profile</h1>

          <p className="mx-auto mt-3 max-w-2xl text-slate-600">
            Find your listing, sign up through Clerk, enter your ADI
            registration number, and wait for admin approval. Once approved,
            your profile can show as verified.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <section className="rounded-3xl border bg-white p-6 shadow-sm">
            {!hasClerkConfigured && (
              <>
                <LocalDevelopmentNotice />
                {!submitted && (
                  <ClaimForm
                    formData={formData}
                    submitStatus={submitStatus}
                    onSubmit={handleSubmit}
                    onUpdateField={updateField}
                  />
                )}
                {submitted && <ClaimConfirmation />}
              </>
            )}

            {hasClerkConfigured && (
              <>
                <SignedOut>
                  <ClaimSignInPrompt />
                </SignedOut>

                <SignedIn>
                  {!submitted && (
                    <ClaimForm
                      formData={formData}
                      submitStatus={submitStatus}
                      onSubmit={handleSubmit}
                      onUpdateField={updateField}
                    />
                  )}

                  {submitted && <ClaimConfirmation />}
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
                    Rating {instructor.rating} - {instructor.reviews} reviews
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-500">
                  Current ADI registration shown
                </p>

                <p className="mt-1 font-bold">{instructor.adiRegistration}</p>
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
