import { KpiCard } from "../components/KpiCard";
import { Panel } from "../components/Panel";
import { SectionHeading } from "../components/SectionHeading";
import { useHotelApp } from "../context/HotelAppContext";

function ProgressRow({ label, value, total, tone = "bg-slate-900" }) {
  const width = total ? Math.max(6, Math.round((value / total) * 100)) : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-700">{label}</span>
        <span className="font-medium text-slate-900">
          {value}/{total}
        </span>
      </div>
      <div className="h-2 rounded-full bg-slate-100">
        <div className={`h-2 rounded-full ${tone}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

export function ReportsPage() {
  const { housekeepingTasks, inventoryAlerts, maintenanceRequests, metrics, reservations, roomViews } =
    useHotelApp();

  const completedHousekeeping = housekeepingTasks.filter((task) => task.status === "completed").length;
  const resolvedMaintenance = maintenanceRequests.filter((request) => request.status === "resolved").length;
  const inUseRooms = roomViews.filter((room) => room.displayStatus === "occupied").length;

  return (
    <>
      <SectionHeading
        title="Reports"
        description="Compact reporting for occupancy, booking activity, service completion, and alert load."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Occupancy" value={`${metrics.occupancyRate}%`} detail={`${inUseRooms} rooms in use`} />
        <KpiCard label="Bookings" value={metrics.activeBookings} detail={`${reservations.length} total reservations`} />
        <KpiCard label="Housekeeping Completion" value={`${Math.round((completedHousekeeping / housekeepingTasks.length) * 100)}%`} detail={`${completedHousekeeping} completed`} />
        <KpiCard label="Maintenance Load" value={metrics.openMaintenanceCount} detail={`${inventoryAlerts.length} inventory alerts`} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_340px]">
        <Panel title="Operational ratios" description="Small reporting blocks instead of heavy charting.">
          <div className="space-y-5">
            <ProgressRow label="Occupied rooms" value={inUseRooms} total={roomViews.length} />
            <ProgressRow
              label="Completed housekeeping tasks"
              value={completedHousekeeping}
              total={housekeepingTasks.length}
              tone="bg-emerald-600"
            />
            <ProgressRow
              label="Resolved maintenance requests"
              value={resolvedMaintenance}
              total={maintenanceRequests.length}
              tone="bg-amber-600"
            />
            <ProgressRow
              label="Reservations active"
              value={metrics.activeBookings}
              total={reservations.length}
              tone="bg-sky-700"
            />
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel title="Daily summary">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-slate-500">Arrivals today</p>
                <p className="mt-1 text-[24px] font-semibold tracking-[-0.03em] text-slate-950">
                  {metrics.arrivalsToday}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Departures today</p>
                <p className="mt-1 text-[24px] font-semibold tracking-[-0.03em] text-slate-950">
                  {metrics.departuresToday}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Low-stock alerts</p>
                <p className="mt-1 text-[24px] font-semibold tracking-[-0.03em] text-slate-950">
                  {metrics.inventoryAlerts}
                </p>
              </div>
            </div>
          </Panel>

          <Panel title="Notes">
            <p className="text-sm text-slate-500">
              The reporting screen stays intentionally lightweight. Readable numbers and small progress visuals carry the page instead of oversized charts.
            </p>
          </Panel>
        </div>
      </div>
    </>
  );
}
