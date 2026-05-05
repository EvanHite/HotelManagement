import { Panel } from "../components/Panel";
import { SectionHeading } from "../components/SectionHeading";
import { StatusBadge } from "../components/StatusBadge";
import { useHotelApp } from "../context/HotelAppContext";
import { formatDateRange } from "../utils/formatters";

export function CheckInPage() {
  const { guestReservations, updateReservationStatus } = useHotelApp();
  const actionableReservations = guestReservations.filter((reservation) =>
    ["confirmed", "checked-in"].includes(reservation.status),
  );

  return (
    <>
      <SectionHeading
        title="Check-In"
        description="Complete secure guest arrival and departure actions from active reservations."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_340px]">
        <Panel title="Active reservations" description="Reservations currently eligible for guest self-service.">
          {actionableReservations.length > 0 ? (
            <div className="space-y-3">
              {actionableReservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="rounded-md border border-slate-200 bg-slate-50 px-4 py-4"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        Reservation {reservation.id}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Room {reservation.roomNumber} / {reservation.roomType}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {formatDateRange(reservation.checkIn, reservation.checkOut)}
                      </p>
                    </div>
                    <StatusBadge value={reservation.status} />
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {reservation.status === "confirmed" && (
                      <button
                        className="btn-primary"
                        type="button"
                        onClick={() => updateReservationStatus(reservation.id, "checked-in")}
                      >
                        Complete check-in
                      </button>
                    )}

                    {reservation.status === "checked-in" && (
                      <button
                      className="btn-secondary"
                      type="button"
                      onClick={() => updateReservationStatus(reservation.id, "checked-out")}
                    >
                      Start check-out
                    </button>
                    )}
                  </div>
                  </div>
              ))}
              </div>
            ) : (
              <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-6">
                <p className="text-sm font-medium text-slate-900">No active reservations</p>
                <p className="mt-1 text-sm text-slate-500">
                  You do not have any reservations ready for check-in or check-out.
                </p>
              </div>
          )}

        </Panel>

        <Panel title="Stay details" description="Basic rules visible during self-service check-in.">
          <div className="space-y-4 text-sm text-slate-600">
            <p>Check-in starts at 3:00 PM and check-out is at 11:00 AM.</p>
            <p>Room access is issued after reservation status changes to checked-in.</p>
            <p>Check-out creates a room turnover task for housekeeping automatically.</p>
          </div>
        </Panel>
      </div>
    </>
  );
}
