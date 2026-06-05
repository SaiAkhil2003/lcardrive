"use client";

import { useState } from "react";
import ProfileCompletenessBar from "@/components/portal/ProfileCompletenessBar";
import { instructors } from "@/data/instructors";

export default function PortalProfilePage() {
  const instructor = instructors[0];
  const [showAiNotice, setShowAiNotice] = useState(false);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
          My Profile
        </p>

        <h1 className="mt-2 text-3xl font-bold">Profile details</h1>

        <p className="mt-3 max-w-2xl text-slate-600">
          These Phase 1 fields are UI-only placeholders for the future
          instructor profile editor.
        </p>
      </section>

      <ProfileCompletenessBar value={72} />

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold">Profile photo and bio</h2>

        <div className="mt-5 grid gap-6 lg:grid-cols-[180px_1fr]">
          <div className="rounded-2xl border border-dashed p-5 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-3xl font-bold text-blue-700">
              {instructor.name.charAt(0)}
            </div>

            <button
              type="button"
              className="mt-4 rounded-xl border px-4 py-2 text-sm font-semibold text-slate-700"
            >
              Upload photo
            </button>

            <p className="mt-2 text-xs text-slate-500">
              Placeholder only. Real uploads come later.
            </p>
          </div>

          <div>
            <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <label className="text-sm font-semibold">Bio</label>

              <button
                type="button"
                onClick={() => setShowAiNotice(true)}
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Generate bio with AI
              </button>
            </div>

            <textarea
              defaultValue={instructor.description}
              rows={6}
              className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-600"
            />

            {showAiNotice && (
              <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-slate-700">
                AI bio writer will connect to /api/ai/bio later.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold">Contact details</h2>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold">First name</span>
            <input
              defaultValue="Sarah"
              className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-600"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold">Last name</span>
            <input
              defaultValue="M."
              className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-600"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold">Phone</span>
            <input
              defaultValue="0400 000 000"
              className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-600"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold">Email</span>
            <input
              defaultValue="sarah@example.com"
              className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-600"
            />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold">Teaching profile</h2>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold">
              Languages spoken
            </span>
            <input
              defaultValue={instructor.language}
              className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-600"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold">
              Specialisations
            </span>
            <input
              defaultValue="Nervous learners, test preparation"
              className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-600"
            />
          </label>

          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm font-semibold">
              Familiar test centres
            </span>
            <input
              defaultValue={instructor.testCentre}
              className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-600"
            />
          </label>

          <label className="flex items-center gap-3 rounded-xl border p-4 text-sm font-semibold">
            <input type="checkbox" defaultChecked={instructor.anxietyFriendly} />
            Anxiety friendly
          </label>

          <label className="flex items-center gap-3 rounded-xl border p-4 text-sm font-semibold">
            <input
              type="checkbox"
              defaultChecked={instructor.internationalLicence}
            />
            International licence conversion
          </label>
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold">Vehicle details</h2>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {[
            ["Vehicle make", instructor.vehicle.make],
            ["Vehicle model", instructor.vehicle.model],
            ["Vehicle year", instructor.vehicle.year],
            ["Transmission", instructor.vehicle.transmission],
            ["Dual controls", instructor.vehicle.dualControls],
            ["Service areas", instructor.serviceAreas.join(", ")]
          ].map(([label, value]) => (
            <label key={label} className="block">
              <span className="mb-2 block text-sm font-semibold">{label}</span>
              <input
                defaultValue={value}
                className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-600"
              />
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold">Optional public links</h2>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold">
              Facebook link optional
            </span>
            <input
              placeholder="https://facebook.com/your-page"
              className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-600"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold">
              Google Business link optional
            </span>
            <input
              placeholder="https://maps.google.com/your-business"
              className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-600"
            />
          </label>
        </div>
      </section>
    </div>
  );
}
