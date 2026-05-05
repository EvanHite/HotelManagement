import { Link, NavLink } from "react-router-dom";
import { getNavigationForRole } from "../config/navigation";
import { useHotelApp } from "../context/HotelAppContext";
import { StatusBadge } from "./ui";

function NavIcon({ name }) {
  const icons = {
    amenities: (
      <path d="M6 10h12M8 6h8m-9 8h10l-1 5H8l-1-5Z" />
    ),
    book: (
      <path d="M7 4h10a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm0 12h12" />
    ),
    checkIn: (
      <path d="m5 12 4 4L19 6M5 20h14" />
    ),
    frontDesk: (
      <path d="M4 18h16M6 18v-6a6 6 0 0 1 12 0v6M8 12h8M12 6v2" />
    ),
    operations: (
      <path d="M14.5 6.5 17 4l3 3-2.5 2.5M4 20l5.5-1 8-8-4-4-8 8L4 20Zm8-10 4 4" />
    ),
    overview: (
      <path d="M4 13h6V4H4v9Zm10 7h6V4h-6v16ZM4 20h6v-3H4v3Z" />
    ),
    reports: (
      <path d="M6 20V4h8l4 4v12H6Zm8-16v5h4M9 15h6M9 11h3" />
    ),
    settings: (
      <path d="M9.6 3.4 9 5.6a7.4 7.4 0 0 0-1.8 1L5.1 6 3.4 9l1.6 1.6a7.4 7.4 0 0 0 0 2.1l-1.6 1.7 1.7 3 2.1-.6a7.4 7.4 0 0 0 1.8 1l.6 2.2h3.5l.6-2.2a7.4 7.4 0 0 0 1.8-1l2.1.6 1.7-3-1.6-1.7a7.4 7.4 0 0 0 0-2.1L19.3 9l-1.7-3-2.1.6a7.4 7.4 0 0 0-1.8-1l-.6-2.2H9.6Zm2.1 11.1a2.8 2.8 0 1 0 0-5.6 2.8 2.8 0 0 0 0 5.6Z" />
    ),
    stays: (
      <path d="M5 7h14M7 4v3m10-3v3M6 7v13h12V7M9 11h2m2 0h2m-6 4h2m2 0h2" />
    ),
  };

  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
    >
      <g
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      >
        {icons[name] ?? icons.overview}
      </g>
    </svg>
  );
}

export function Sidebar({ isMobile = false, onClose, onNavigate }) {
  const { notifications, notificationItems, session, roleLabels, logout } = useHotelApp();
  const navigation = getNavigationForRole(session.role);

  function linkClassName({ isActive }) {
    return `flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition ${
      isActive
        ? "bg-slate-900 text-white"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`;
  }

  return (
    <aside className="h-full border-slate-200 bg-white lg:border-r">
      <div className="flex h-full flex-col px-4 py-5 sm:px-5">
        <div className="border-b border-slate-200 pb-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-slate-300 bg-slate-900 text-sm font-semibold text-white">
                HH
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-950">Harbor House</p>
                <p className="text-sm text-slate-500">{roleLabels[session.role]}</p>
              </div>
            </div>
            {isMobile && (
              <button
                className="btn-ghost h-9 w-9 px-0"
                type="button"
                aria-label="Close navigation"
                onClick={onClose}
              >
                <svg
                  aria-hidden="true"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="m6 6 12 12M18 6 6 18"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="2"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        <nav className="mt-4 flex flex-col gap-1">
          {navigation.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={linkClassName}
              onClick={onNavigate}
            >
              <NavIcon name={item.icon} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {isMobile && (
          <div className="mt-auto border-t border-slate-200 pt-4">
            <div className="rounded-md border border-slate-200">
              <div className="flex h-10 items-center justify-between px-3 text-sm font-medium text-slate-700">
                <span className="inline-flex items-center gap-3">
                  <svg
                    aria-hidden="true"
                    className="h-4 w-4"
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
                  Notifications
                </span>
                {notifications > 0 && (
                  <span className="rounded-md bg-slate-900 px-1.5 py-1 text-[10px] leading-none font-semibold text-white">
                    {notifications}
                  </span>
                )}
              </div>
              <div className="max-h-48 overflow-y-auto border-t border-slate-200">
                {notificationItems.length ? (
                  notificationItems.slice(0, 5).map((item) => (
                    <Link
                      className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 border-b border-slate-100 px-3 py-2 last:border-b-0"
                      key={item.id}
                      to={item.path}
                      onClick={onNavigate}
                    >
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium text-slate-900">
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
                  <p className="px-3 py-3 text-sm text-slate-500">No open alerts.</p>
                )}
              </div>
            </div>

            <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-3">
              <p className="truncate text-sm font-medium text-slate-900">{session.name}</p>
              <p className="truncate text-xs leading-5 text-slate-500 capitalize">
                {session.role}
              </p>
              <button
                className="btn-secondary mt-3 w-full"
                type="button"
                onClick={() => {
                  logout();
                  onClose?.();
                }}
              >
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
