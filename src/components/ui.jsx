import { useEffect, useState } from "react";

// Small shared UI components used across the app pages.
const badgeStyles = {
  available: "border-emerald-200 bg-emerald-50 text-emerald-700",
  booked: "border-amber-200 bg-amber-50 text-amber-700",
  occupied: "border-slate-300 bg-slate-100 text-slate-700",
  cleaning: "border-amber-200 bg-amber-50 text-amber-700",
  maintenance: "border-rose-200 bg-rose-50 text-rose-700",
  "out of service": "border-rose-200 bg-rose-50 text-rose-700",
  confirmed: "border-sky-200 bg-sky-50 text-sky-700",
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  "card-on-file": "border-slate-300 bg-slate-100 text-slate-700",
  "checked-in": "border-emerald-200 bg-emerald-50 text-emerald-700",
  "checked-out": "border-slate-300 bg-slate-100 text-slate-700",
  cancelled: "border-rose-200 bg-rose-50 text-rose-700",
  authorized: "border-sky-200 bg-sky-50 text-sky-700",
  captured: "border-emerald-200 bg-emerald-50 text-emerald-700",
  prepaid: "border-emerald-200 bg-emerald-50 text-emerald-700",
  failed: "border-rose-200 bg-rose-50 text-rose-700",
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

function prefersReducedMotion() {
  if (typeof window === "undefined") {
    return true;
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getNumberParts(value) {
  if (typeof value === "number") {
    return {
      number: value,
      prefix: "",
      suffix: "",
      decimalPlaces: Number.isInteger(value) ? 0 : 1,
    };
  }

  const match = String(value).match(/^([^0-9-]*)(-?\d+(?:\.\d+)?)(.*)$/);

  if (!match) {
    return null;
  }

  const rawNumber = match[2];

  return {
    number: Number(rawNumber),
    prefix: match[1],
    suffix: match[3],
    decimalPlaces: rawNumber.includes(".") ? rawNumber.split(".")[1].length : 0,
  };
}

function formatAnimatedValue(parts, number) {
  const rounded =
    parts.decimalPlaces === 0 ? Math.round(number) : number.toFixed(parts.decimalPlaces);

  return `${parts.prefix}${rounded}${parts.suffix}`;
}

export function AnimatedNumber({ value, duration = 950 }) {
  const parts = getNumberParts(value);
  const finalValue = String(value);
  const [displayValue, setDisplayValue] = useState(() => {
    if (!parts || prefersReducedMotion()) {
      return finalValue;
    }

    return formatAnimatedValue(parts, 0);
  });

  useEffect(() => {
    const nextParts = getNumberParts(value);

    if (!nextParts || prefersReducedMotion()) {
      setDisplayValue(String(value));
      return undefined;
    }

    let animationFrameId;
    let startTime;

    function step(timestamp) {
      if (!startTime) {
        startTime = timestamp;
      }

      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const nextValue = nextParts.number * easedProgress;

      setDisplayValue(formatAnimatedValue(nextParts, nextValue));

      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
        return;
      }

      setDisplayValue(String(value));
    }

    animationFrameId = window.requestAnimationFrame(step);

    return () => window.cancelAnimationFrame(animationFrameId);
  }, [duration, value]);

  return displayValue;
}

export function AnimatedProgressBar({ width, tone = "bg-slate-900", duration = 1100 }) {
  const [hasLoaded, setHasLoaded] = useState(() => prefersReducedMotion());

  useEffect(() => {
    if (prefersReducedMotion()) {
      setHasLoaded(true);
      return undefined;
    }

    const animationFrameId = window.requestAnimationFrame(() => setHasLoaded(true));
    return () => window.cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div
      className={`h-2 rounded-full ${tone}`}
      style={{
        transition: prefersReducedMotion() ? "none" : `width ${duration}ms ease-out`,
        width: hasLoaded ? `${width}%` : "0%",
      }}
    />
  );
}

export function Panel({
  title,
  description,
  action,
  children,
  className = "",
  contentClassName = "p-5",
}) {
  return (
    <section className={`panel ${className}`}>
      {(title || description || action) && (
        <div className="flex flex-col gap-2 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            {title && <h2 className="text-[15px] leading-5 font-semibold text-slate-900">{title}</h2>}
            {description && <p className="mt-1 text-sm leading-5 text-slate-500">{description}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={contentClassName}>{children}</div>
    </section>
  );
}

export function SectionHeading({ title, description, actions }) {
  return (
    <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        <h1 className="text-[26px] font-semibold tracking-[-0.02em] text-slate-950">
          {title}
        </h1>
        {description && <p className="mt-1.5 text-sm text-slate-500">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function KpiCard({ label, value, detail, animate = false }) {
  return (
    <div className="panel px-4 py-4">
      <p className="truncate text-[13px] leading-5 font-medium text-slate-600" title={label}>
        {label}
      </p>
      <p className="mt-2 text-[28px] font-semibold tracking-[-0.03em] text-slate-950">
        {animate ? <AnimatedNumber value={value} /> : value}
      </p>
      {detail && (
        <p className="mt-2 truncate text-xs leading-5 text-slate-500" title={detail}>
          {detail}
        </p>
      )}
    </div>
  );
}

export function StatusBadge({ value, className = "" }) {
  const normalized = String(value).toLowerCase();

  return (
    <span
      className={`inline-flex h-6 shrink-0 items-center whitespace-nowrap rounded-md border px-2 text-xs leading-none font-medium ${badgeStyles[normalized] ?? "border-slate-300 bg-slate-100 text-slate-700"} ${className}`}
    >
      {value}
    </span>
  );
}

export function SearchInput({ value, onChange, placeholder, className = "" }) {
  return (
    <div className={`relative min-w-0 ${className}`}>
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          d="m21 21-4.2-4.2m1.2-5.3a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
      <input
        className="input-base !pl-9"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  );
}

export function FilterTabs({ options, value, onChange, fill = false }) {
  const wrapperClass = fill ? "max-w-full min-w-0" : "max-w-full overflow-x-auto";
  const segmentClass = fill ? "segment w-full" : "segment";
  const buttonClass = fill ? "flex-1 justify-center" : "";

  return (
    <div className={wrapperClass}>
      <div className={segmentClass}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`segment-button ${buttonClass} ${
              value === option.value ? "segment-button-active" : ""
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function EmptyState({ title, description }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">{description}</p>
    </div>
  );
}
