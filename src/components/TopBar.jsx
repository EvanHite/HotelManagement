import { useNavigate } from "react-router-dom";
import { useHotelApp } from "../context/HotelAppContext";

export function TopBar() {
  const {
    hotels,
    notifications,
    searchQuery,
    selectedHotelId,
    session,
    setSearchQuery,
    setSelectedHotelId,
    logout,
  } = useHotelApp();
  const navigate = useNavigate();

  const canCreateBooking = ["guest", "reception", "management"].includes(session.role);

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto grid max-w-[1440px] gap-3 px-4 py-4 sm:px-6 min-[1480px]:grid-cols-[minmax(0,1fr)_auto] min-[1480px]:items-center xl:px-8">
        <div className="grid gap-3 lg:grid-cols-[minmax(240px,1fr)_220px] lg:items-center">
          <input
            className="input-base min-w-0"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search reservations, guests, rooms"
          />
          <select
            className="input-base min-w-0"
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

        <div className="flex flex-wrap items-center gap-2 min-[1480px]:justify-end">
          <button className="btn-secondary" type="button">
            Alerts {notifications ? `(${notifications})` : ""}
          </button>
          {canCreateBooking && (
            <button
              className="btn-primary"
              type="button"
              onClick={() =>
                navigate(session.role === "guest" ? "/app/book" : "/app/reservations")
              }
            >
              New Reservation
            </button>
          )}
          <div className="grid min-w-[196px] grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-md border border-slate-300 bg-white px-3 py-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-900">{session.name}</p>
              <p className="text-xs text-slate-500 capitalize">{session.role}</p>
            </div>
            <button className="btn-ghost" type="button" onClick={logout}>
              Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
