export default function ProfileCompletenessBar({ value = 0 }) {
  const safeValue = Math.max(0, Math.min(100, Number(value) || 0));

  return (
    <section className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Profile completeness
          </h2>

          <p className="mt-1 text-sm text-slate-600">
            Complete profiles rank higher in search results
          </p>
        </div>

        <p className="text-2xl font-bold text-blue-700">{safeValue} percent</p>
      </div>

      <div className="mt-4 h-3 rounded-full bg-slate-100">
        <div
          className="h-3 rounded-full bg-blue-600"
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </section>
  );
}
