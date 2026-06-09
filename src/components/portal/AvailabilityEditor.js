"use client";

import { useState } from "react";

const days = [
  ["1", "Monday"],
  ["2", "Tuesday"],
  ["3", "Wednesday"],
  ["4", "Thursday"],
  ["5", "Friday"],
  ["6", "Saturday"],
  ["0", "Sunday"]
];

function buildInitialRows(records) {
  const byWeekday = new Map(records.map((record) => [String(record.weekday), record]));

  return days.map(([weekday, day]) => {
    const record = byWeekday.get(weekday);

    return {
      weekday,
      day,
      enabled: Boolean(record),
      startTime: record?.startTime || "09:00",
      endTime: record?.endTime || "16:00",
      slotMinutes: record?.slotMinutes || 60
    };
  });
}

export default function AvailabilityEditor({ instructorSlug, records }) {
  const [rows, setRows] = useState(buildInitialRows(records));
  const [message, setMessage] = useState("");

  function updateRow(weekday, field, value) {
    setRows((current) =>
      current.map((row) =>
        row.weekday === weekday
          ? {
              ...row,
              [field]: value
            }
          : row
      )
    );
  }

  async function saveAvailability() {
    setMessage("Saving...");

    try {
      const response = await fetch("/api/availability", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          instructorSlug,
          records: rows
            .filter((row) => row.enabled)
            .map((row) => ({
              weekday: Number(row.weekday),
              startTime: row.startTime,
              endTime: row.endTime,
              slotMinutes: Number(row.slotMinutes)
            }))
        })
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Availability save failed");
      }

      setMessage(
        data.mode === "development"
          ? "Availability accepted in local fallback mode. Configure Supabase and approved claim ownership to persist."
          : "Availability saved."
      );
    } catch {
      setMessage("Availability could not be saved. Confirm this account owns the claimed instructor listing.");
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3">
        {rows.map((row) => (
          <div
            key={row.weekday}
            className="grid gap-3 rounded-xl border p-4 md:grid-cols-[160px_1fr_1fr_120px]"
          >
            <label className="flex items-center gap-3 font-semibold">
              <input
                type="checkbox"
                checked={row.enabled}
                onChange={(event) => updateRow(row.weekday, "enabled", event.target.checked)}
              />
              {row.day}
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-slate-500">Start</span>
              <input
                type="time"
                value={row.startTime}
                onChange={(event) => updateRow(row.weekday, "startTime", event.target.value)}
                className="w-full rounded-xl border px-3 py-2"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-slate-500">End</span>
              <input
                type="time"
                value={row.endTime}
                onChange={(event) => updateRow(row.weekday, "endTime", event.target.value)}
                className="w-full rounded-xl border px-3 py-2"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-slate-500">Minutes</span>
              <input
                type="number"
                min="30"
                step="15"
                value={row.slotMinutes}
                onChange={(event) => updateRow(row.weekday, "slotMinutes", event.target.value)}
                className="w-full rounded-xl border px-3 py-2"
              />
            </label>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={saveAvailability}
        className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
      >
        Save availability
      </button>

      {message && (
        <p className="rounded-xl bg-slate-50 p-4 text-sm font-semibold text-slate-700">
          {message}
        </p>
      )}
    </div>
  );
}
