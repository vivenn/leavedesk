export function Card({ title, action, className = '', children }) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between">
          {title && <h3 className="text-sm font-semibold text-slate-700">{title}</h3>}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

export function StatTile({ label, value, tone = 'default' }) {
  const toneClass =
    tone === 'brand'
      ? 'text-brand-600'
      : tone === 'warn'
        ? 'text-amber-600'
        : tone === 'danger'
          ? 'text-rose-600'
          : 'text-slate-900';
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${toneClass}`}>{value}</p>
    </div>
  );
}
