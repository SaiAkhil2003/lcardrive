"use client";

import { useState } from "react";

const editableFields = [
  { key: "name", label: "Name", type: "text" },
  { key: "suburb", label: "Suburb", type: "text" },
  { key: "claimStatus", label: "Claim status", type: "text" },
  { key: "rate", label: "Hourly rate", type: "text" },
  { key: "rating", label: "Rating", type: "text" },
  { key: "transmission", label: "Transmission", type: "text" },
  { key: "language", label: "Languages", type: "text" }
];

function getBooleanLabel(value) {
  return value ? "Yes" : "No";
}

function EditModal({ draft, saveMessage, onChange, onClose, onSave }) {
  if (!draft) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 px-4 py-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-listing-edit-title"
        className="max-h-full w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
              Admin Listing Edit
            </p>
            <h2 id="admin-listing-edit-title" className="mt-1 text-2xl font-bold">
              Edit {draft.name}
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Phase 1 edits are saved only in this admin browser session.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border px-3 py-2 text-sm font-semibold text-slate-700 hover:border-blue-600 hover:text-blue-700"
          >
            Close
          </button>
        </div>

        <form onSubmit={onSave} className="mt-6 space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            {editableFields.map((field) => (
              <label key={field.key} className="block">
                <span className="mb-2 block text-sm font-semibold">
                  {field.label}
                </span>
                <input
                  type={field.type}
                  value={draft[field.key] || ""}
                  onChange={(event) => onChange(field.key, event.target.value)}
                  className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-600"
                />
              </label>
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="flex items-center gap-3 rounded-xl border p-4 text-sm font-semibold">
              <input
                type="checkbox"
                checked={draft.anxietyFriendly}
                onChange={(event) =>
                  onChange("anxietyFriendly", event.target.checked)
                }
              />
              Anxiety friendly
            </label>

            <label className="flex items-center gap-3 rounded-xl border p-4 text-sm font-semibold">
              <input
                type="checkbox"
                checked={draft.internationalLicence}
                onChange={(event) =>
                  onChange("internationalLicence", event.target.checked)
                }
              />
              International licence
            </label>
          </div>

          {saveMessage && (
            <p className="rounded-xl border border-green-100 bg-green-50 p-3 text-sm font-semibold text-green-800">
              {saveMessage}
            </p>
          )}

          <div className="flex flex-wrap justify-end gap-3 border-t pt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border px-5 py-3 font-semibold text-slate-700 hover:border-blue-600 hover:text-blue-700"
            >
              Close
            </button>

            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Save draft
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminListingsClient({ initialListings }) {
  const [listings, setListings] = useState(initialListings);
  const [selectedListing, setSelectedListing] = useState(null);
  const [draft, setDraft] = useState(null);
  const [saveMessage, setSaveMessage] = useState("");

  function openEditor(listing) {
    setSelectedListing(listing);
    setDraft({ ...listing });
    setSaveMessage("");
  }

  function updateDraft(field, value) {
    setDraft((current) => ({
      ...current,
      [field]: value
    }));
  }

  function saveDraft(event) {
    event.preventDefault();

    setListings((currentListings) =>
      currentListings.map((listing) =>
        listing.slug === draft.slug ? { ...listing, ...draft } : listing
      )
    );
    setSelectedListing({ ...selectedListing, ...draft });
    setSaveMessage(
      "Saved in this admin session. Database persistence will be enabled when Supabase production is connected."
    );
  }

  function closeEditor() {
    setSelectedListing(null);
    setDraft(null);
    setSaveMessage("");
  }

  return (
    <>
      <section className="rounded-2xl border bg-white shadow-sm">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="sticky left-0 z-10 bg-slate-50 px-5 py-4 font-semibold">
                  Name
                </th>
                <th className="px-5 py-4 font-semibold">Suburb</th>
                <th className="px-5 py-4 font-semibold">Claim status</th>
                <th className="px-5 py-4 font-semibold">Hourly rate</th>
                <th className="px-5 py-4 font-semibold">Rating</th>
                <th className="px-5 py-4 font-semibold">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {listings.map((listing) => (
                <tr key={listing.slug}>
                  <td className="sticky left-0 z-10 bg-white px-5 py-4 font-semibold">
                    {listing.name}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {listing.suburb}, {listing.state}
                  </td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      {listing.claimStatus}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-semibold">{listing.rate}</td>
                  <td className="px-5 py-4 text-slate-600">{listing.rating}</td>
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() => openEditor(listing)}
                      className="rounded-xl border px-4 py-2 font-semibold text-slate-700 hover:border-blue-600 hover:text-blue-700"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <EditModal
        draft={draft}
        saveMessage={saveMessage}
        onChange={updateDraft}
        onClose={closeEditor}
        onSave={saveDraft}
      />

      <p className="sr-only" aria-live="polite">
        {selectedListing
          ? `Editing ${selectedListing.name}. Anxiety friendly: ${getBooleanLabel(
              selectedListing.anxietyFriendly
            )}. International licence: ${getBooleanLabel(
              selectedListing.internationalLicence
            )}.`
          : ""}
      </p>
    </>
  );
}
