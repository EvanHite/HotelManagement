import { useState } from "react";
import { Link } from "react-router-dom";
import { StatusBadge } from "./ui";
import { useHotelApp } from "../context/HotelAppContext";

export function TopBar({ onMenuClick }) {
  const {
    notifications,
    notificationItems,
    session,
    logout,
  } = useHotelApp();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

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
          <div className="flex h-10 items-center rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-900">
            Harbor House
          </div>
        </div>

        <div className="hidden flex-wrap items-center gap-2 lg:flex min-[1120px]:justify-end">
          <div className="relative">
            <button
              className="btn-secondary relative w-10 px-0"
              type="button"
              aria-label={`${notifications} notifications`}
              title="Notifications"
              onClick={() => setIsNotificationsOpen((current) => !current)}
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
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-md bg-slate-900 px-1 text-[10px] leading-none font-semibold text-white">
                  {notifications}
                </span>
              )}
            </button>
            {isNotificationsOpen && (
              <div className="absolute right-0 top-12 z-30 w-[360px] rounded-md border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.12)]">
                <div className="border-b border-slate-200 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-900">Notifications</p>
                </div>
                <div className="max-h-[360px] overflow-y-auto">
                  {notificationItems.length ? (
                    notificationItems.slice(0, 8).map((item) => (
                      <Link
                        className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 border-b border-slate-100 px-4 py-3 last:border-b-0 hover:bg-slate-50"
                        key={item.id}
                        to={item.path}
                        onClick={() => setIsNotificationsOpen(false)}
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-900">
                            {item.title}
                          </p>
                          <p className="truncate text-xs leading-5 text-slate-500">
                            {item.detail}
                          </p>
                        </div>
                        <StatusBadge value={item.type} />
                      </Link>
                    ))
                  ) : (
                    <p className="px-4 py-6 text-sm text-slate-500">No open alerts.</p>
                  )}
                </div>
              </div>
            )}
          </div>
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
