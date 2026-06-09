"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export default function BookLessonClient({ instructor, slots }) {
  const [formData, setFormData] = useState({
    lessonType: "standard",
    scheduledStart: slots[0]?.start || "",
    learnerName: "",
    learnerEmail: "",
    learnerPhone: "",
    pickupSuburb: instructor.suburb,
    pickupAddress: "",
    notes: ""
  });
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const selectedSlot = useMemo(
    () => slots.find((slot) => slot.start === formData.scheduledStart),
    [formData.scheduledStart, slots]
  );

  function updateField(field, value) {
    setFormData((current) => ({
      ...current,
      [field]: value
    }));
  }

  async function submitBooking(event) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...formData,
          instructorSlug: instructor.slug
        })
      });
      const data = await response.json().catch(() => ({}));

      if (response.status === 401) {
        setStatus("auth");
        setMessage("Sign in as a learner before creating a booking request.");
        return;
      }

      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Booking failed");
      }

      setStatus("success");
      setMessage(
        data.booking?.paymentStatus === "requires_payment"
          ? "Booking request saved as pending. Payment checkout is available only after Stripe test setup is complete."
          : "Booking request saved as pending. No payment is required until payments are configured."
      );
    } catch {
      setStatus("error");
      setMessage("Booking request could not be saved. Please try again.");
    }
  }

  return (
    <form onSubmit={submitBooking} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold">Lesson type</span>
          <select
            value={formData.lessonType}
            onChange={(event) => updateField("lessonType", event.target.value)}
            className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-600"
          >
            <option value="standard">Standard lesson - {instructor.rate}</option>
            <option value="5-hour-pack">5 hour pack - {instructor.packageOptions[0] || instructor.packagePrice}</option>
            <option value="10-hour-pack">10 hour pack - {instructor.packageOptions[1] || "Ask instructor"}</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold">Preferred time</span>
          <select
            value={formData.scheduledStart}
            onChange={(event) => updateField("scheduledStart", event.target.value)}
            className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-600"
            required
          >
            {slots.length === 0 && <option value="">No slots available</option>}
            {slots.map((slot) => (
              <option key={slot.id} value={slot.start}>
                {slot.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold">Learner name</span>
          <input
            value={formData.learnerName}
            onChange={(event) => updateField("learnerName", event.target.value)}
            className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-600"
            required
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold">Email</span>
          <input
            type="email"
            value={formData.learnerEmail}
            onChange={(event) => updateField("learnerEmail", event.target.value)}
            className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-600"
            required
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold">Phone</span>
          <input
            value={formData.learnerPhone}
            onChange={(event) => updateField("learnerPhone", event.target.value)}
            className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-600"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold">Pickup suburb</span>
          <input
            value={formData.pickupSuburb}
            onChange={(event) => updateField("pickupSuburb", event.target.value)}
            className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-600"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold">Pickup address optional</span>
          <input
            value={formData.pickupAddress}
            onChange={(event) => updateField("pickupAddress", event.target.value)}
            className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-600"
          />
        </label>
      </div>

      <label className="block">
        <span className="mb-2 block text-sm font-semibold">Notes optional</span>
        <textarea
          rows={4}
          value={formData.notes}
          onChange={(event) => updateField("notes", event.target.value)}
          className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-600"
        />
      </label>

      {selectedSlot && (
        <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
          Selected slot: {selectedSlot.label}. The instructor can accept, decline,
          or propose an alternate time.
        </p>
      )}

      {message && (
        <div
          className={
            status === "error" || status === "auth"
              ? "rounded-xl border border-amber-100 bg-amber-50 p-4 text-sm font-semibold text-amber-800"
              : "rounded-xl border border-green-100 bg-green-50 p-4 text-sm font-semibold text-green-800"
          }
        >
          <p>{message}</p>
          {status === "auth" && (
            <Link href="/sign-in" className="mt-2 inline-block text-blue-700">
              Sign in
            </Link>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={status === "loading" || !formData.scheduledStart}
        className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "loading" ? "Submitting..." : "Request booking"}
      </button>
    </form>
  );
}
