const styles = {
  available: "border-emerald-200 bg-emerald-50 text-emerald-700",
  occupied: "border-slate-300 bg-slate-100 text-slate-700",
  cleaning: "border-amber-200 bg-amber-50 text-amber-700",
  maintenance: "border-rose-200 bg-rose-50 text-rose-700",
  confirmed: "border-sky-200 bg-sky-50 text-sky-700",
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  "checked-in": "border-emerald-200 bg-emerald-50 text-emerald-700",
  "checked-out": "border-slate-300 bg-slate-100 text-slate-700",
  cancelled: "border-rose-200 bg-rose-50 text-rose-700",
  authorized: "border-sky-200 bg-sky-50 text-sky-700",
  captured: "border-emerald-200 bg-emerald-50 text-emerald-700",
  refunded: "border-slate-300 bg-slate-100 text-slate-700",
  open: "border-rose-200 bg-rose-50 text-rose-700",
  "in-progress": "border-amber-200 bg-amber-50 text-amber-700",
  resolved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  high: "border-rose-200 bg-rose-50 text-rose-700",
  critical: "border-rose-300 bg-rose-100 text-rose-700",
  medium: "border-amber-200 bg-amber-50 text-amber-700",
  standard: "border-slate-300 bg-slate-100 text-slate-700",
  gold: "border-amber-200 bg-amber-50 text-amber-700",
  silver: "border-slate-300 bg-slate-100 text-slate-700",
  platinum: "border-violet-200 bg-violet-50 text-violet-700",
  low: "border-rose-200 bg-rose-50 text-rose-700",
  healthy: "border-emerald-200 bg-emerald-50 text-emerald-700",
  watch: "border-amber-200 bg-amber-50 text-amber-700",
  stable: "border-slate-300 bg-slate-100 text-slate-700",
  limited: "border-amber-200 bg-amber-50 text-amber-700",
  ready: "border-emerald-200 bg-emerald-50 text-emerald-700",
  blocked: "border-rose-200 bg-rose-50 text-rose-700",
  partial: "border-amber-200 bg-amber-50 text-amber-700",
  "in use": "border-slate-300 bg-slate-100 text-slate-700",
};

export function StatusBadge({ value, className = "" }) {
  const normalized = String(value).toLowerCase();

  return (
    <span
      className={`inline-flex h-6 shrink-0 items-center whitespace-nowrap rounded-md border px-2 text-xs leading-none font-medium ${styles[normalized] ?? "border-slate-300 bg-slate-100 text-slate-700"} ${className}`}
    >
      {value}
    </span>
  );
}
