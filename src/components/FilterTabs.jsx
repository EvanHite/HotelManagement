export function FilterTabs({ options, value, onChange }) {
  return (
    <div className="max-w-full overflow-x-auto pb-1">
      <div className="segment">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`segment-button ${value === option.value ? "segment-button-active" : ""}`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
