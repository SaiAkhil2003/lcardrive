"use client";

import { useState } from "react";

export default function AdminBookingActionsClient({ bookingId }) {
  const [alternateStart, setAlternateStart] = useState("");
  const [message, setMessage] = useState("");

  async function submit(action) {
    setMessage("Saving...");

    try {
      const response = await fetch("/api/admin/bookings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          bookingId,
          action,
          alternateStart: action === "propose_alternate" ? alternateStart : ""
        })
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Update failed");
      }

      setMessage(`Updated to ${data.booking.status}.`);
    } catch {
      setMessage("Update failed or admin permission is missing.");
    }
  }

  return (
    <div className="min-w-[260px] space-y-2">
      <div className="flex flex-wrap gap-2">
        {[
          ["accept", "Accept"],
          ["decline", "Decline"],
          ["cancel", "Cancel"]
        ].map(([action, label]) => (
          <button
            key={action}
            type="button"
            onClick={() => submit(action)}
            className="rounded-lg border px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-blue-600 hover:text-blue-700"
          >
            {label}
          </button>
        ))}
      </div>
      <div className="grid gap-2">
        <input
          type="datetime-local"
          value={alternateStart}
          onChange={(event) => setAlternateStart(event.target.value)}
          className="rounded-lg border px-3 py-2 text-xs"
          aria-label="Alternate booking time"
        />
        <button
          type="button"
          disabled={!alternateStart}
          onClick={() => submit("propose_alternate")}
          className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
        >
          Propose alternate
        </button>
      </div>
      {message && <p className="text-xs font-semibold text-slate-600">{message}</p>}
    </div>
  );
}
