"use client";

import Link from "next/link";
import { useState } from "react";

export default function FavouritesClient({ initialFavourites, instructors }) {
  const [favourites, setFavourites] = useState(initialFavourites);
  const [message, setMessage] = useState("");
  const favouriteSlugs = new Set(favourites.map((item) => item.instructorSlug));

  function getSuburbPath(instructor) {
    return String(instructor?.suburb || "melbourne")
      .toLowerCase()
      .replaceAll(" ", "-");
  }

  async function saveFavourite(instructorSlug) {
    setMessage("");

    try {
      const response = await fetch("/api/favourites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ instructorSlug })
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Favourite save failed");
      }

      setFavourites((current) =>
        current.some((item) => item.instructorSlug === instructorSlug)
          ? current
          : [...current, { instructorSlug, instructor: instructors.find((item) => item.slug === instructorSlug) }]
      );
      setMessage("Favourite saved.");
    } catch {
      setMessage("Favourite could not be saved. Sign in and try again.");
    }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold">Saved favourites</h2>

        {favourites.length === 0 ? (
          <p className="mt-3 text-sm text-slate-600">No favourite instructors saved yet.</p>
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {favourites.map((item) => (
              <Link
                key={item.instructorSlug}
                href={`/instructors/${getSuburbPath(item.instructor)}/${item.instructorSlug}`}
                className="rounded-xl border p-4 font-semibold text-slate-800 hover:border-blue-600"
              >
                {item.instructor?.name || item.instructorSlug}
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold">Find instructors to save</h2>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {instructors.map((instructor) => (
            <div key={instructor.slug} className="rounded-xl border p-4">
              <p className="font-semibold">{instructor.name}</p>
              <p className="mt-1 text-sm text-slate-600">
                {instructor.suburb} - {instructor.rate}
              </p>
              <button
                type="button"
                disabled={favouriteSlugs.has(instructor.slug)}
                onClick={() => saveFavourite(instructor.slug)}
                className="mt-3 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {favouriteSlugs.has(instructor.slug) ? "Saved" : "Save"}
              </button>
            </div>
          ))}
        </div>
      </section>

      {message && (
        <p className="rounded-xl bg-slate-50 p-4 text-sm font-semibold text-slate-700">
          {message}
        </p>
      )}
    </div>
  );
}
