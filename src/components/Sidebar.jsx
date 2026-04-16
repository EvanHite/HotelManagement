import { NavLink } from "react-router-dom";
import { getNavigationForRole } from "../config/navigation";
import { useHotelApp } from "../context/HotelAppContext";

export function Sidebar() {
  const { session, roleLabels } = useHotelApp();
  const navigation = getNavigationForRole(session.role);

  function linkClassName({ isActive }) {
    return `flex items-center rounded-md px-3 py-2 text-sm font-medium transition ${
      isActive
        ? "bg-slate-900 text-white"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`;
  }

  return (
    <aside className="border-b border-slate-200 bg-white lg:border-b-0 lg:border-r">
      <div className="flex h-full flex-col px-4 py-5 sm:px-5">
        <div className="border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-slate-900 text-sm font-semibold text-white">
              HH
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-950">Harbor House</p>
              <p className="text-sm text-slate-500">{roleLabels[session.role]}</p>
            </div>
          </div>
        </div>

        <nav className="mt-4 hidden flex-col gap-1 lg:flex">
          {navigation.map((item) => (
            <NavLink key={item.path} to={item.path} className={linkClassName}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <nav className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
          {navigation.map((item) => (
            <NavLink key={item.path} to={item.path} className={linkClassName}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
}
