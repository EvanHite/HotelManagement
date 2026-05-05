import { useHotelApp } from "../context/HotelAppContext";

export function TopBar({ onMenuClick }) {
  const {
    hotels,
    notifications,
    selectedHotelId,
    session,
    setSelectedHotelId,
    logout,
  } = useHotelApp();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="app-container grid gap-3 py-4 min-[1120px]:grid-cols-[minmax(220px,260px)_minmax(0,1fr)] min-[1120px]:items-center">
        <div className="grid min-w-0 grid-cols-[40px_minmax(0,1fr)] gap-2 lg:block">
          <button
            className="btn-secondary w-10 px-0 lg:hidden"
            type="button"
            aria-label="Open navigation"
            onClick={onMenuClick}
          >
            <svg
              aria-hidden="true"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                d="M4 7h16M4 12h16M4 17h16"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="2"
              />
            </svg>
          </button>
          <select
            className="input-base w-full"
            value={selectedHotelId}
            onChange={(event) => setSelectedHotelId(event.target.value)}
          >
            {hotels.map((hotel) => (
              <option key={hotel.id} value={hotel.id}>
                {hotel.name}
              </option>
            ))}
          </select>
        </div>

        <div className="hidden flex-wrap items-center gap-2 lg:flex min-[1120px]:justify-end">
          <button
            className="btn-secondary relative w-10 px-0"
            type="button"
            aria-label={`${notifications} notifications`}
            title="Notifications"
          >
            <svg
              aria-hidden="true"
              className="mx-auto h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                d="M15 17H9m9-1.5V11a6 6 0 0 0-12 0v4.5L4.5 18h15L18 15.5ZM10 20h4"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
            {notifications > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-slate-900 px-1 text-[10px] leading-none font-semibold text-white">
                {notifications}
              </span>
            )}
          </button>
          <div className="grid h-10 min-w-[196px] grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-md border border-slate-300 bg-white px-3">
            <div className="min-w-0">
              <p className="truncate text-sm leading-4 font-medium text-slate-900">{session.name}</p>
              <p className="truncate text-[11px] leading-3 text-slate-500 capitalize">{session.role}</p>
            </div>
            <button className="btn-ghost h-8 px-2" type="button" onClick={logout}>
              Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
