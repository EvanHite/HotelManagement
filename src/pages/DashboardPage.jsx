import { DataTable } from "../components/DataTable";
import { KpiCard } from "../components/KpiCard";
import { Panel } from "../components/Panel";
import { SectionHeading } from "../components/SectionHeading";
import { StatusBadge } from "../components/StatusBadge";
import { useHotelApp } from "../context/HotelAppContext";
import { formatDate, formatDateRange, matchesSearch } from "../utils/formatters";

export function DashboardPage() {
  const {
    businessDate,
    businessDateLabel,
    housekeepingTasks,
    inventoryAlerts,
    maintenanceRequests,
    metrics,
    reservations,
    roomViews,
    searchQuery,
  } = useHotelApp();

  const arrivalsToday = reservations
    .filter((reservation) => reservation.checkIn === businessDate)
    .filter((reservation) =>
      matchesSearch(
        `${reservation.id} ${reservation.guestName} ${reservation.roomNumber}`,
        searchQuery,
      ),
    );

  const departuresToday = reservations
    .filter((reservation) => reservation.checkOut === businessDate)
    .filter((reservation) =>
      matchesSearch(
        `${reservation.id} ${reservation.guestName} ${reservation.roomNumber}`,
        searchQuery,
      ),
    );

  const filteredReservations = reservations
    .filter((reservation) =>
      matchesSearch(
        `${reservation.id} ${reservation.guestName} ${reservation.roomNumber} ${reservation.status}`,
        searchQuery,
      ),
    )
    .slice(0, 8);

  const filteredHousekeeping = housekeepingTasks
    .filter((task) =>
      matchesSearch(
        `${task.roomNumber} ${task.taskType} ${task.urgency} ${task.assignedTo}`,
        searchQuery,
      ),
    )
    .slice(0, 6);

  const filteredMaintenance = maintenanceRequests
    .filter((request) =>
      matchesSearch(
        `${request.roomNumber} ${request.issue} ${request.issueType} ${request.assignedTo}`,
        searchQuery,
      ),
    )
    .slice(0, 6);

  const filteredInventoryAlerts = inventoryAlerts
    .filter((item) => matchesSearch(`${item.name} ${item.category}`, searchQuery))
    .slice(0, 6);

  const roomStatusRows = ["available", "occupied", "cleaning", "maintenance"].map((status) => ({
    id: status,
    label: status[0].toUpperCase() + status.slice(1),
    count: roomViews.filter((room) => room.displayStatus === status).length,
  }));

  return (
    <>
      <SectionHeading
        title="Overview"
        actions={
          <div className="hidden h-9 items-center whitespace-nowrap rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-600 sm:inline-flex">
            {businessDateLabel}
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="Occupancy" value={`${metrics.occupancyRate}%`} />
        <KpiCard label="Arrivals" value={metrics.arrivalsToday} />
        <KpiCard label="Departures" value={metrics.departuresToday} />
        <KpiCard label="Cleaning" value={metrics.roomsNeedingCleaning} />
        <KpiCard label="Maintenance" value={metrics.openMaintenanceCount} />
        <KpiCard label="Low Stock" value={metrics.inventoryAlerts} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel
          title="Today's arrivals"
          action={<span className="text-sm text-slate-500">{arrivalsToday.length}</span>}
        >
          <DataTable
            compact
            columns={[
              {
                key: "id",
                header: "Booking ID",
                nowrap: true,
                minWidthClass: "min-w-[108px]",
                cellClassName: "font-medium text-slate-900",
              },
              {
                key: "guestName",
                header: "Guest",
                truncate: true,
                minWidthClass: "min-w-[164px]",
                cellClassName: "font-medium text-slate-900",
              },
              {
                key: "roomNumber",
                header: "Room",
                render: (row) => row.roomNumber,
                nowrap: true,
                minWidthClass: "min-w-[84px]",
              },
              {
                key: "status",
                header: "Status",
                render: (row) => <StatusBadge value={row.status} />,
                nowrap: true,
                minWidthClass: "min-w-[110px]",
              },
            ]}
            rows={arrivalsToday}
            emptyTitle="No arrivals scheduled"
            emptyDescription="There are no arrivals on the business date."
          />
        </Panel>

        <Panel
          title="Today's departures"
          action={<span className="text-sm text-slate-500">{departuresToday.length}</span>}
        >
          <DataTable
            compact
            columns={[
              {
                key: "id",
                header: "Booking ID",
                nowrap: true,
                minWidthClass: "min-w-[108px]",
                cellClassName: "font-medium text-slate-900",
              },
              {
                key: "guestName",
                header: "Guest",
                truncate: true,
                minWidthClass: "min-w-[164px]",
                cellClassName: "font-medium text-slate-900",
              },
              {
                key: "roomNumber",
                header: "Room",
                render: (row) => row.roomNumber,
                nowrap: true,
                minWidthClass: "min-w-[84px]",
              },
              {
                key: "status",
                header: "Status",
                render: (row) => <StatusBadge value={row.status} />,
                nowrap: true,
                minWidthClass: "min-w-[110px]",
              },
            ]}
            rows={departuresToday}
            emptyTitle="No departures scheduled"
            emptyDescription="There are no departures on the business date."
          />
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_320px]">
        <Panel
          title="Reservations"
          action={<span className="text-sm text-slate-500">{filteredReservations.length}</span>}
        >
          <DataTable
            compact
            columns={[
              {
                key: "id",
                header: "Booking ID",
                nowrap: true,
                minWidthClass: "min-w-[108px]",
                cellClassName: "font-medium text-slate-900",
              },
              {
                key: "guestName",
                header: "Guest",
                truncate: true,
                minWidthClass: "min-w-[172px]",
                cellClassName: "font-medium text-slate-900",
              },
              {
                key: "roomNumber",
                header: "Room",
                render: (row) => row.roomNumber,
                nowrap: true,
                minWidthClass: "min-w-[84px]",
              },
              {
                key: "dates",
                header: "Dates",
                render: (row) => formatDateRange(row.checkIn, row.checkOut),
                nowrap: true,
                minWidthClass: "min-w-[144px]",
              },
              {
                key: "status",
                header: "Reservation",
                render: (row) => <StatusBadge value={row.status} />,
                nowrap: true,
                minWidthClass: "min-w-[118px]",
              },
              {
                key: "paymentStatus",
                header: "Payment",
                render: (row) => <StatusBadge value={row.paymentStatus} />,
                nowrap: true,
                minWidthClass: "min-w-[110px]",
              },
            ]}
            rows={filteredReservations}
            emptyTitle="No reservations available"
            emptyDescription="Reservations will appear here as bookings are created."
          />
        </Panel>

        <div className="space-y-6">
          <Panel title="Room status">
            <div className="divide-y divide-slate-200">
              {roomStatusRows.map((row) => (
                <div
                  key={row.id}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3"
                >
                  <span className="text-sm font-medium text-slate-700">{row.label}</span>
                  <span className="text-sm font-semibold text-slate-950">{row.count}</span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Inventory alerts">
            {filteredInventoryAlerts.length ? (
              <div className="divide-y divide-slate-200">
                {filteredInventoryAlerts.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">{item.name}</p>
                      <p className="truncate text-xs leading-5 text-slate-500">
                        {item.stock} {item.unit} on hand / reorder at {item.reorderLevel}
                      </p>
                    </div>
                    <StatusBadge value="Low" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No low-stock items.</p>
            )}
          </Panel>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel
          title="Housekeeping"
          action={<span className="text-sm text-slate-500">{filteredHousekeeping.length}</span>}
        >
          <DataTable
            compact
            columns={[
              {
                key: "roomNumber",
                header: "Room",
                render: (row) => row.roomNumber,
                nowrap: true,
                minWidthClass: "min-w-[78px]",
                cellClassName: "font-medium text-slate-900",
              },
              {
                key: "taskType",
                header: "Task",
                truncate: true,
                minWidthClass: "min-w-[152px]",
              },
              {
                key: "urgency",
                header: "Priority",
                render: (row) => <StatusBadge value={row.urgency} />,
                nowrap: true,
                minWidthClass: "min-w-[96px]",
              },
              {
                key: "assignedTo",
                header: "Assigned",
                truncate: true,
                minWidthClass: "min-w-[132px]",
              },
              {
                key: "dueBy",
                header: "Due",
                nowrap: true,
                minWidthClass: "min-w-[84px]",
              },
              {
                key: "readiness",
                header: "Ready",
                render: (row) => <StatusBadge value={row.readiness} />,
                nowrap: true,
                minWidthClass: "min-w-[92px]",
              },
            ]}
            rows={filteredHousekeeping}
            emptyTitle="No housekeeping tasks"
            emptyDescription="Housekeeping work items will appear here."
          />
        </Panel>

        <Panel
          title="Maintenance"
          action={<span className="text-sm text-slate-500">{filteredMaintenance.length}</span>}
        >
          <DataTable
            compact
            columns={[
              {
                key: "roomNumber",
                header: "Room",
                render: (row) => row.roomNumber,
                nowrap: true,
                minWidthClass: "min-w-[78px]",
                cellClassName: "font-medium text-slate-900",
              },
              {
                key: "issue",
                header: "Issue",
                truncate: true,
                minWidthClass: "min-w-[176px]",
              },
              {
                key: "priority",
                header: "Priority",
                render: (row) => <StatusBadge value={row.priority} />,
                nowrap: true,
                minWidthClass: "min-w-[96px]",
              },
              {
                key: "assignedTo",
                header: "Assigned",
                truncate: true,
                minWidthClass: "min-w-[132px]",
              },
              {
                key: "submittedDate",
                header: "Submitted",
                render: (row) => formatDate(row.submittedDate),
                nowrap: true,
                minWidthClass: "min-w-[92px]",
              },
              {
                key: "status",
                header: "Status",
                render: (row) => <StatusBadge value={row.status} />,
                nowrap: true,
                minWidthClass: "min-w-[106px]",
              },
            ]}
            rows={filteredMaintenance}
            emptyTitle="No maintenance requests"
            emptyDescription="Maintenance requests will appear here."
          />
        </Panel>
      </div>
    </>
  );
}
