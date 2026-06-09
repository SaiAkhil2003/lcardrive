"use client";

import { useState } from "react";

const actions = [
  { action: "accept", label: "Accept" },
  { action: "decline", label: "Decline" },
  { action: "cancel", label: "Cancel" }
];

export default function BookingActionsClient({ bookingId }) {
  const [alternateStart, setAlternateStart] = useState("");
  const [message, setMessage] = useState("");
  const [loadingAction, setLoadingAction] = useState("");

  async function submitAction(action) {
    setLoadingAction(action);
    setMessage("");

    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action,
          alternateStart: action === "propose_alternate" ? alternateStart : ""
        })
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Update failed");
      }

      setMessage(`Booking updated to ${data.booking.status}.`);
    } catch {
      setMessage("Booking update failed or you do not have permission.");
    } finally {
      setLoadingAction("");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        {actions.map((item) => (
          <button
            key={item.action}
            type="button"
            disabled={loadingAction === item.action}
            onClick={() => submitAction(item.action)}
            className="rounded-xl border px-4 py-2 text-sm font-semibold text-slate-700 hover:border-blue-600 hover:text-blue-700 disabled:opacity-60"
          >
            {loadingAction === item.action ? "Saving..." : item.label}
          </button>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_auto]">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold">Alternate time</span>
          <input
            type="datetime-local"
            value={alternateStart}
            onChange={(event) => setAlternateStart(event.target.value)}
            className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-600"
          />
        </label>

        <button
          type="button"
          disabled={!alternateStart || loadingAction === "propose_alternate"}
          onClick={() => submitAction("propose_alternate")}
          className="self-end rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Propose alternate
        </button>
      </div>

      {message && (
        <p className="rounded-xl bg-slate-50 p-4 text-sm font-semibold text-slate-700">
          {message}
        </p>
      )}
    </div>
  );
}
