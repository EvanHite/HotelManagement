import { Panel } from "../components/ui";
import { SectionHeading } from "../components/ui";
import { StatusBadge } from "../components/ui";
import { useHotelApp } from "../context/HotelAppContext";
import { formatDateRange } from "../utils/formatters";

export function CheckInPage() {
  const { guestReservations, updateReservationStatus } = useHotelApp();
  const actionableReservations = guestReservations.filter((reservation) =>
    ["confirmed", "checked-in"].includes(reservation.status),
  );

  return (
    <>
      <SectionHeading title="Check-In" />

      <div className="grid gap-6">
        <Panel title="Active reservations">
          {actionableReservations.length ? (
            <div className="space-y-3">
              {actionableReservations.map((reservation) => (
                <div key={reservation.id} className="rounded-md border border-slate-200 bg-slate-50 px-4 py-4">
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
                  {reservation.balanceDue > 0 && (
                    <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2">
                      <p className="text-sm font-medium text-amber-800">
                        Payment will be collected at the front desk.
                      </p>
                    </div>
                  )}
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
      </div>
    </>
  );
}
