"use client";

import { useState } from "react";
import ProfileCompletenessBar from "@/components/portal/ProfileCompletenessBar";
import { instructors } from "@/data/instructors";

const languageOptions = ["English", "Hindi", "Tamil", "Arabic", "Mandarin"];
const testCentreOptions = [
  "Sunshine",
  "Werribee",
  "Moorabbin",
  "Bundoora",
  "Broadmeadows",
  "Carlton"
];

function AiBioModal({ onClose, onBioGenerated }) {
  const [formData, setFormData] = useState({
    years_experience: "",
    licence_types: "Car",
    teaching_style: "",
    learner_types: "",
    proud_of: "",
    specialisations: ""
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
      const response = await fetch("/api/ai/bio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Bio generation failed");
      }

      onBioGenerated(data.bio);
      onClose();
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 px-4 py-6">
      <div className="max-h-full w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
              AI Bio Writer
            </p>
            <h2 className="mt-1 text-2xl font-bold">Generate profile bio</h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border px-3 py-2 text-sm font-semibold text-slate-700"
          >
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold">
                Years experience
              </span>
              <input
                value={formData.years_experience}
                onChange={(event) =>
                  updateField("years_experience", event.target.value)
                }
                className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-600"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold">
                Licence types taught
              </span>
              <input
                value={formData.licence_types}
                onChange={(event) =>
                  updateField("licence_types", event.target.value)
                }
                className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-600"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold">
                Teaching style in 5 words
              </span>
              <input
                value={formData.teaching_style}
                onChange={(event) =>
                  updateField("teaching_style", event.target.value)
                }
                className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-600"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold">
                Types of learners they enjoy
              </span>
              <input
                value={formData.learner_types}
                onChange={(event) =>
                  updateField("learner_types", event.target.value)
                }
                className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-600"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold">
              Something they are proud of
            </span>
            <input
              value={formData.proud_of}
              onChange={(event) => updateField("proud_of", event.target.value)}
              className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-600"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold">
              Specialisations
            </span>
            <input
              value={formData.specialisations}
              onChange={(event) =>
                updateField("specialisations", event.target.value)
              }
              className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-600"
            />
          </label>

          {status === "error" && (
            <p className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">
              Bio generation failed. Please try again.
            </p>
          )}

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "loading" ? "Generating..." : "Generate Bio"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function PortalProfilePage() {
  const instructor = instructors[0];
  const [bio, setBio] = useState(instructor.description);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const defaultLanguages = instructor.language.split(", ");
  const defaultTestCentres = instructor.testCentre.split(", ");

  return (
    <div className="space-y-6">
      {isAiOpen && (
        <AiBioModal
          onClose={() => setIsAiOpen(false)}
          onBioGenerated={(generatedBio) => setBio(generatedBio)}
        />
      )}

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
          My Profile
        </p>

        <h1 className="mt-2 text-3xl font-bold">Profile details</h1>

        <p className="mt-3 max-w-2xl text-slate-600">
          Complete profiles rank higher in search results.
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
              Profile photo upload placeholder
            </p>
          </div>

          <div>
            <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <label className="text-sm font-semibold" htmlFor="bio">
                Bio
              </label>

              <button
                type="button"
                onClick={() => setIsAiOpen(true)}
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Generate bio with AI
              </button>
            </div>

            <textarea
              id="bio"
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              rows={7}
              className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-600"
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold">Contact details</h2>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold">First name</span>
            <input
              defaultValue={instructor.firstName}
              className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-600"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold">Last name</span>
            <input
              defaultValue={instructor.lastInitial}
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
              defaultValue="sample-instructor@example.com"
              className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-600"
            />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold">Teaching profile</h2>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-semibold">Languages spoken</p>
            <div className="grid gap-2">
              {languageOptions.map((language) => (
                <label
                  key={language}
                  className="flex items-center gap-3 rounded-xl border p-3 text-sm font-semibold"
                >
                  <input
                    type="checkbox"
                    defaultChecked={defaultLanguages.includes(language)}
                  />
                  {language}
                </label>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold">
              Familiar test centres
            </p>
            <div className="grid gap-2">
              {testCentreOptions.map((centre) => (
                <label
                  key={centre}
                  className="flex items-center gap-3 rounded-xl border p-3 text-sm font-semibold"
                >
                  <input
                    type="checkbox"
                    defaultChecked={defaultTestCentres.includes(centre)}
                  />
                  {centre}
                </label>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-3 rounded-xl border p-4 text-sm font-semibold">
            <input type="checkbox" defaultChecked={instructor.anxietyFriendly} />
            Specialisation: anxiety friendly
          </label>

          <label className="flex items-center gap-3 rounded-xl border p-4 text-sm font-semibold">
            <input
              type="checkbox"
              defaultChecked={instructor.internationalLicence}
            />
            Accepts international licence conversion
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
            ["Dual controls", instructor.vehicle.dualControls]
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

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <button
          type="button"
          className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Save profile placeholder
        </button>
      </section>
    </div>
  );
}
