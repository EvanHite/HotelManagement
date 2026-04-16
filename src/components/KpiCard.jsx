export function KpiCard({ label, value, detail }) {
  return (
    <div className="panel px-4 py-4">
      <p className="truncate text-[13px] leading-5 font-medium text-slate-600" title={label}>
        {label}
      </p>
      <p className="mt-2 text-[28px] font-semibold tracking-[-0.03em] text-slate-950">
        {value}
      </p>
      {detail && (
        <p className="mt-2 truncate text-xs leading-5 text-slate-500" title={detail}>
          {detail}
        </p>
      )}
    </div>
  );
}
