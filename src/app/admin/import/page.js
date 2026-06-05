export default function AdminImportPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
          CSV Import
        </p>

        <h1 className="mt-2 text-3xl font-bold">Bulk import listings</h1>

        <p className="mt-3 max-w-2xl text-slate-600">
          Placeholder for importing seeded unclaimed instructor listings. Real
          CSV parsing and database writes are intentionally not implemented yet.
        </p>
      </section>

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="rounded-2xl border border-dashed p-8 text-center">
          <h2 className="text-xl font-bold">Upload CSV placeholder</h2>

          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600">
            Expected future columns: name, suburb, state, transmission,
            languages, ADI number, phone, email, service areas.
          </p>

          <input
            type="file"
            accept=".csv"
            className="mt-6 rounded-xl border bg-white px-4 py-3 text-sm"
          />

          <button
            type="button"
            className="mt-5 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Preview import placeholder
          </button>
        </div>
      </section>
    </div>
  );
}
