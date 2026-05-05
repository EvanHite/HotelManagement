import { Link } from "react-router-dom";
import { DataTable } from "../components/DataTable";
import { KpiCard } from "../components/ui";
import { Panel } from "../components/ui";
import { SectionHeading } from "../components/ui";
import { StatusBadge } from "../components/ui";
import { useHotelApp } from "../context/HotelAppContext";

function PanelLink({ to, children }) {
  return (
    <Link className="btn-secondary h-9 px-3" to={to}>
      {children}
    </Link>
  );
}

function AttentionRow({ title, detail, badge, to }) {
  const content = (
    <>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-slate-900">{title}</p>
        <p className="truncate text-xs leading-5 text-slate-500">{detail}</p>
      </div>
      <StatusBadge value={badge} />
    </>
  );

  if (!to) {
    return (
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3">
        {content}
      </div>
    );
  }

  return (
    <Link
      className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3 hover:bg-slate-50"
      to={to}
    >
      {content}
    </Link>
  );
}

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
    session,
  } = useHotelApp();

  const arrivalsToday = reservations.filter(
    (reservation) => reservation.checkIn === businessDate,
  );
  const departuresToday = reservations.filter(
    (reservation) => reservation.checkOut === businessDate,
  );
  const openHousekeeping = housekeepingTasks.filter((task) => task.status !== "completed");
  const openMaintenance = maintenanceRequests.filter((request) => request.status !== "resolved");
  const roomsNeedingWork = roomViews.filter((room) =>
    ["cleaning", "maintenance"].includes(room.displayStatus),
  );
  const canOpenOperations = ["housekeeping", "maintenance", "management"].includes(session.role);
  const operationsPath = canOpenOperations ? "/operations" : "";

  const attentionItems = [
    ...openHousekeeping
      .filter((task) => task.urgency === "high")
      .map((task) => ({
        id: task.id,
        title: `Room ${task.roomNumber}`,
        detail: `${task.taskType} due ${task.dueBy}`,
        badge: task.urgency,
        to: operationsPath,
      })),
    ...openMaintenance.map((request) => ({
      id: request.id,
      title: `Room ${request.roomNumber}`,
      detail: request.issue,
      badge: request.priority,
      to: operationsPath,
    })),
    ...inventoryAlerts.map((item) => ({
      id: item.id,
      title: item.name,
      detail: `${item.stock} ${item.unit} on hand`,
      badge: "Low",
      to: operationsPath,
    })),
  ].slice(0, 7);

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
        <KpiCard animate label="Occupancy" value={`${metrics.occupancyRate}%`} />
        <KpiCard animate label="Arrivals" value={arrivalsToday.length} />
        <KpiCard animate label="Departures" value={departuresToday.length} />
        <KpiCard animate label="Rooms Needing Work" value={roomsNeedingWork.length} />
        <KpiCard animate label="Open Maintenance" value={openMaintenance.length} />
        <KpiCard animate label="Low Stock" value={inventoryAlerts.length} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel
          title="Arrivals today"
          action={<PanelLink to="/app/front-desk">Front Desk</PanelLink>}
        >
          <DataTable
            compact
            columns={[
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
                minWidthClass: "min-w-[80px]",
              },
              {
                key: "roomType",
                header: "Type",
                truncate: true,
                minWidthClass: "min-w-[144px]",
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
          title="Departures today"
          action={<PanelLink to="/app/front-desk">Front Desk</PanelLink>}
        >
          <DataTable
            compact
            columns={[
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
                minWidthClass: "min-w-[80px]",
              },
              {
                key: "roomType",
                header: "Type",
                truncate: true,
                minWidthClass: "min-w-[144px]",
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

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Panel
          title="Attention"
          action={
            canOpenOperations ? <PanelLink to="/operations">Operations</PanelLink> : null
          }
        >
          {attentionItems.length ? (
            <div className="divide-y divide-slate-200">
              {attentionItems.map((item) => (
                <AttentionRow
                  key={item.id}
                  title={item.title}
                  detail={item.detail}
                  badge={item.badge}
                  to={item.to}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No urgent work items.</p>
          )}
        </Panel>

        <Panel title="Room status">
          <div className="divide-y divide-slate-200">
            {roomStatusRows.map((row) => (
              <Link
                key={row.id}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3 hover:bg-slate-50"
                to="/app/front-desk"
              >
                <span className="text-sm font-medium text-slate-700">{row.label}</span>
                <span className="text-sm font-semibold text-slate-950">{row.count}</span>
              </Link>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}
