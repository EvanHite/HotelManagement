const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

const longDateFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
});

const moneyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function formatDate(value) {
  if (!value) {
    return "—";
  }

  return dateFormatter.format(new Date(`${value}T12:00:00`));
}

export function formatDateRange(start, end) {
  return `${formatDate(start)} - ${formatDate(end)}`;
}

export function formatLongDate(value) {
  if (!value) {
    return "—";
  }

  return longDateFormatter.format(new Date(`${value}T12:00:00`));
}

export function formatMoney(value) {
  return moneyFormatter.format(value ?? 0);
}

export function titleCase(value) {
  if (!value) {
    return "";
  }

  return value
    .split("-")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

export function nightsBetween(start, end) {
  const startDate = new Date(`${start}T12:00:00`);
  const endDate = new Date(`${end}T12:00:00`);
  const diff = endDate.getTime() - startDate.getTime();
  return Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)));
}

export function matchesSearch(value, searchQuery) {
  if (!searchQuery) {
    return true;
  }

  return String(value).toLowerCase().includes(searchQuery.toLowerCase());
}

export function matchesDateFilter(checkIn, checkOut, today, filter) {
  if (!filter || filter === "all") {
    return true;
  }

  if (filter === "today") {
    return checkIn === today || checkOut === today;
  }

  if (filter === "arrivals") {
    return checkIn === today;
  }

  if (filter === "departures") {
    return checkOut === today;
  }

  if (filter === "in-house") {
    return checkIn <= today && checkOut >= today;
  }

  if (filter === "upcoming") {
    return checkIn > today;
  }

  return true;
}
