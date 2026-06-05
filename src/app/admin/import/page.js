const expectedColumns = [
  "first_name",
  "last_name",
  "suburb",
  "postcode",
  "state",
  "phone",
  "adi_registration",
  "licence_types",
  "transmission"
];

export default function AdminImportPage() {
  const hasGoogleMapsKey = Boolean(process.env.GOOGLE_MAPS_API_KEY);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
          CSV Import
        </p>

        <h1 className="mt-2 text-3xl font-bold">Bulk import listings</h1>

        <p className="mt-3 max-w-2xl text-slate-600">
          Bulk import creates unclaimed listings.
        </p>

        {!hasGoogleMapsKey && (
          <p className="mt-4 rounded-xl bg-amber-50 p-4 text-sm font-semibold text-amber-800">
            Geocoding pending placeholder. Add GOOGLE_MAPS_API_KEY before
            enriching imported rows with coordinates.
          </p>
        )}
      </section>

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="rounded-2xl border border-dashed p-8 text-center">
          <h2 className="text-xl font-bold">Upload CSV</h2>

          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600">
            Expected CSV columns:
          </p>

          <div className="mx-auto mt-4 flex max-w-3xl flex-wrap justify-center gap-2">
            {expectedColumns.map((column) => (
              <span
                key={column}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
              >
                {column}
              </span>
            ))}
          </div>

          <input
            type="file"
            accept=".csv"
            className="mt-6 rounded-xl border bg-white px-4 py-3 text-sm"
          />

          <button
            type="button"
            className="mt-5 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Preview import
          </button>
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold">Placeholder parse preview</h2>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                {expectedColumns.slice(0, 5).map((column) => (
                  <th key={column} className="px-4 py-3 font-semibold">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-4 py-3">Sample</td>
                <td className="px-4 py-3">Instructor</td>
                <td className="px-4 py-3">Footscray</td>
                <td className="px-4 py-3">3011</td>
                <td className="px-4 py-3">VIC</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
