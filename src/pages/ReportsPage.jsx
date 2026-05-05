import { AnimatedNumber } from "../components/ui";
import { AnimatedProgressBar } from "../components/ui";
import { KpiCard } from "../components/ui";
import { Panel } from "../components/ui";
import { SectionHeading } from "../components/ui";
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
        <AnimatedProgressBar width={width} tone={tone} />
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
      <SectionHeading title="Reports" />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard animate label="Occupancy" value={`${metrics.occupancyRate}%`} detail={`${inUseRooms} rooms in use`} />
        <KpiCard animate label="Bookings" value={metrics.activeBookings} detail={`${reservations.length} total reservations`} />
        <KpiCard animate label="Housekeeping Completion" value={`${Math.round((completedHousekeeping / housekeepingTasks.length) * 100)}%`} detail={`${completedHousekeeping} completed`} />
        <KpiCard animate label="Maintenance Load" value={metrics.openMaintenanceCount} detail={`${inventoryAlerts.length} inventory alerts`} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_340px]">
        <Panel title="Operational ratios">
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

        <Panel title="Daily summary">
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-slate-500">Arrivals today</p>
              <p className="mt-1 text-[24px] font-semibold tracking-[-0.03em] text-slate-950">
                <AnimatedNumber value={metrics.arrivalsToday} />
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Departures today</p>
              <p className="mt-1 text-[24px] font-semibold tracking-[-0.03em] text-slate-950">
                <AnimatedNumber value={metrics.departuresToday} />
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Low-stock alerts</p>
              <p className="mt-1 text-[24px] font-semibold tracking-[-0.03em] text-slate-950">
                <AnimatedNumber value={metrics.inventoryAlerts} />
              </p>
            </div>
          </div>
        </Panel>
      </div>
    </>
  );
}
