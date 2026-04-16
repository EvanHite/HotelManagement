import { DataTable } from "../components/DataTable";
import { KpiCard } from "../components/KpiCard";
import { Panel } from "../components/Panel";
import { SectionHeading } from "../components/SectionHeading";
import { StatusBadge } from "../components/StatusBadge";
import { useHotelApp } from "../context/HotelAppContext";
import { formatDateRange, formatMoney } from "../utils/formatters";

export function MyStaysPage() {
  const { currentGuest, guestReservations } = useHotelApp();
  const activeStays = guestReservations.filter((reservation) =>
    ["confirmed", "checked-in"].includes(reservation.status),
  );

  return (
    <>
      <SectionHeading
        title="Stay History"
        description="Current reservations, completed stays, and guest profile information."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard label="Loyalty Tier" value={currentGuest?.loyaltyTier ?? "-"} detail="Current guest status" />
        <KpiCard label="Active Stays" value={activeStays.length} detail="Confirmed or checked in" />
        <KpiCard label="Stay Count" value={guestReservations.length} detail="Visible reservations" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_340px]">
        <Panel title="Reservation history" description="Guest-facing record of past and upcoming stays.">
          <DataTable
            columns={[
              { key: "id", header: "Booking ID" },
              { key: "roomNumber", header: "Room", render: (row) => `Room ${row.roomNumber}` },
              { key: "roomType", header: "Type" },
              {
                key: "dates",
                header: "Dates",
                render: (row) => formatDateRange(row.checkIn, row.checkOut),
              },
              { key: "status", header: "Status", render: (row) => <StatusBadge value={row.status} /> },
              { key: "total", header: "Total", render: (row) => formatMoney(row.total) },
            ]}
            rows={guestReservations}
            emptyTitle="No reservations"
            emptyDescription="Your reservation history will appear here."
          />
        </Panel>

        <Panel title="Profile" description="Guest preferences and contact details.">
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-slate-500">Email</p>
              <p className="mt-1 text-sm text-slate-700">{currentGuest?.email}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Phone</p>
              <p className="mt-1 text-sm text-slate-700">{currentGuest?.phone}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Preferences</p>
              <p className="mt-1 text-sm text-slate-700">{currentGuest?.notes}</p>
            </div>
          </div>
        </Panel>
      </div>
    </>
  );
}
