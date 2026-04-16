import { Link, useNavigate } from "react-router-dom";
import { Panel } from "../components/Panel";
import { SectionHeading } from "../components/SectionHeading";
import { getDefaultRoute } from "../config/navigation";
import { useHotelApp } from "../context/HotelAppContext";

const accessCards = [
  {
    title: "Management",
    path: "/management/sign-in",
    detail: "Reports, settings, oversight",
  },
  {
    title: "Staff",
    path: "/staff/sign-in",
    detail: "Front desk, housekeeping, maintenance",
  },
];

export function LandingPage() {
  const { metrics, session } = useHotelApp();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f4f5f7] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1120px]">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-slate-900 text-sm font-semibold text-white">
              HH
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-950">Harbor House</p>
              <p className="text-sm text-slate-500">Operations</p>
            </div>
          </div>
          {session ? (
            <button
              className="btn-primary"
              type="button"
              onClick={() => navigate(getDefaultRoute(session.role))}
            >
              Continue
            </button>
          ) : null}
        </div>

        <div className="panel overflow-hidden">
          <div className="grid lg:grid-cols-[248px_minmax(0,1fr)]">
            <aside className="border-b border-slate-200 bg-slate-50 p-5 lg:border-b-0 lg:border-r">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Occupancy</span>
                  <span className="font-medium text-slate-900">{metrics.occupancyRate}%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Arrivals</span>
                  <span className="font-medium text-slate-900">{metrics.arrivalsToday}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Cleaning</span>
                  <span className="font-medium text-slate-900">{metrics.roomsNeedingCleaning}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Open issues</span>
                  <span className="font-medium text-slate-900">{metrics.openMaintenanceCount}</span>
                </div>
              </div>
            </aside>

            <main className="p-6 lg:p-8">
              <SectionHeading
                title="Operations Sign In"
                description="Select an internal access path."
              />

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {accessCards.map((card) => (
                  <Link
                    key={card.title}
                    to={card.path}
                    className="rounded-lg border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    <p className="text-base font-semibold text-slate-950">{card.title}</p>
                    <p className="mt-2 text-sm text-slate-500">{card.detail}</p>
                  </Link>
                ))}
              </div>

              <div className="mt-6 border-t border-slate-200 pt-4">
                <Link className="text-sm text-slate-500 hover:text-slate-900" to="/guest/sign-in">
                  Guest access
                </Link>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
