import { Link, Navigate } from "react-router-dom";
import { Panel } from "../components/Panel";
import { SectionHeading } from "../components/SectionHeading";
import { StatusBadge } from "../components/StatusBadge";
import { useHotelApp } from "../context/HotelAppContext";
import { formatDateRange, formatMoney } from "../utils/formatters";

export function BookingConfirmationPage() {
  const { latestReservation } = useHotelApp();

  if (!latestReservation) {
    return <Navigate to="/app/book" replace />;
  }

  return (
    <>
      <SectionHeading
        title="Booking Confirmation"
        description="Reservation created successfully in the guest portal."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_340px]">
        <Panel title={latestReservation.id} description={latestReservation.guestName}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-slate-500">Room</p>
              <p className="mt-1 text-sm text-slate-700">
                Room {latestReservation.roomNumber} / {latestReservation.roomType}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Stay dates</p>
              <p className="mt-1 text-sm text-slate-700">
                {formatDateRange(latestReservation.checkIn, latestReservation.checkOut)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Status</p>
              <div className="mt-1">
                <StatusBadge value={latestReservation.status} />
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Total</p>
              <p className="mt-1 text-sm text-slate-700">{formatMoney(latestReservation.total)}</p>
            </div>
          </div>
        </Panel>

        <Panel title="Next steps">
          <div className="space-y-3 text-sm text-slate-600">
            <p>Your reservation is stored in the stay history screen.</p>
            <p>Use the Check-In page when your arrival date begins.</p>
            <p>Property staff can also see this reservation in Reservations.</p>

            <Link
              to="/app/my-stays"
              className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
            >
              View my stays
            </Link>
          </div>
        </Panel>
      </div>
    </>
  );
}
