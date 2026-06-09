"use client";

import { useState } from "react";

export default function LogbookClient({ initialEntries, totalMinutes }) {
  const [entries, setEntries] = useState(initialEntries);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    date: new Date().toISOString().slice(0, 10),
    durationMinutes: "60",
    instructor: "",
    suburb: "",
    skillsPracticed: "",
    notes: "",
    supervisorType: "instructor"
  });
  const total = entries.reduce(
    (minutes, entry) => minutes + Number(entry.durationMinutes || 0),
    0
  );

  function updateField(field, value) {
    setFormData((current) => ({
      ...current,
      [field]: value
    }));
  }

  async function addEntry(event) {
    event.preventDefault();
    setMessage("Saving...");

    try {
      const response = await fetch("/api/logbook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Logbook save failed");
      }

      setEntries((current) => [data.entry, ...current]);
      setMessage(
        data.mode === "development"
          ? "Entry accepted in local fallback mode. Configure Supabase to persist."
          : "Logbook entry saved."
      );
    } catch {
      setMessage("Logbook entry could not be saved. Sign in and try again.");
    }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold">Progress summary</h2>
        <p className="mt-3 text-3xl font-bold text-blue-700">
          {(total / 60).toFixed(1)} hours
        </p>
        <p className="mt-2 text-sm text-slate-600">
          {entries.length} logbook entries recorded.
        </p>
      </section>

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold">Add logbook entry</h2>

        <form onSubmit={addEntry} className="mt-5 space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold">Date</span>
              <input
                type="date"
                value={formData.date}
                onChange={(event) => updateField("date", event.target.value)}
                className="w-full rounded-xl border px-4 py-3"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold">Duration minutes</span>
              <input
                type="number"
                min="1"
                value={formData.durationMinutes}
                onChange={(event) => updateField("durationMinutes", event.target.value)}
                className="w-full rounded-xl border px-4 py-3"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold">Supervisor type</span>
              <select
                value={formData.supervisorType}
                onChange={(event) => updateField("supervisorType", event.target.value)}
                className="w-full rounded-xl border px-4 py-3"
              >
                <option value="instructor">Instructor</option>
                <option value="parent">Parent or guardian</option>
                <option value="other">Other supervisor</option>
              </select>
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold">Instructor</span>
              <input
                value={formData.instructor}
                onChange={(event) => updateField("instructor", event.target.value)}
                className="w-full rounded-xl border px-4 py-3"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold">Suburb</span>
              <input
                value={formData.suburb}
                onChange={(event) => updateField("suburb", event.target.value)}
                className="w-full rounded-xl border px-4 py-3"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold">Skills practised</span>
            <input
              value={formData.skillsPracticed}
              onChange={(event) => updateField("skillsPracticed", event.target.value)}
              placeholder="Parking, lane changes, test route"
              className="w-full rounded-xl border px-4 py-3"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold">Notes</span>
            <textarea
              rows={4}
              value={formData.notes}
              onChange={(event) => updateField("notes", event.target.value)}
              className="w-full rounded-xl border px-4 py-3"
            />
          </label>

          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Add entry
          </button>
        </form>
      </section>

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold">History</h2>
        <div className="mt-4 space-y-3">
          {entries.length === 0 && (
            <p className="text-sm text-slate-600">No logbook entries yet.</p>
          )}
          {entries.map((entry) => (
            <div key={entry.id} className="rounded-xl border p-4">
              <p className="font-semibold">
                {entry.date} - {entry.durationMinutes} minutes
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {entry.instructorName || entry.instructor || "Supervisor"} in {entry.suburb || "suburb not listed"}
              </p>
              {entry.skillsPracticed?.length > 0 && (
                <p className="mt-1 text-sm text-slate-600">
                  Skills: {entry.skillsPracticed.join(", ")}
                </p>
              )}
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
