import { Link, Navigate } from "react-router-dom";
import { Panel } from "../components/ui";
import { SectionHeading } from "../components/ui";
import { StatusBadge } from "../components/ui";
import { useHotelApp } from "../context/HotelAppContext";
import { formatDateRange, formatMoney } from "../utils/formatters";

export function BookingConfirmationPage() {
  const { latestReservation } = useHotelApp();

  if (!latestReservation) {
    return <Navigate to="/app/book" replace />;
  }

  return (
    <>
      <SectionHeading title="Booking Confirmation" />

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
              <p className="text-xs font-medium text-slate-500">Payment</p>
              <div className="mt-1">
                <StatusBadge value={latestReservation.paymentStatus} />
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Card</p>
              <p className="mt-1 text-sm text-slate-700">
                {latestReservation.paymentMethod
                  ? `${latestReservation.paymentMethod.brand} ending ${latestReservation.paymentMethod.last4}`
                  : "No card on file"}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Guests</p>
              <p className="mt-1 text-sm text-slate-700">
                {latestReservation.adults} adult{latestReservation.adults === 1 ? "" : "s"}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Total</p>
              <p className="mt-1 text-sm text-slate-700">{formatMoney(latestReservation.total)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Paid</p>
              <p className="mt-1 text-sm text-slate-700">
                {formatMoney(latestReservation.amountPaid)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Balance due</p>
              <p className="mt-1 text-sm text-slate-700">
                {formatMoney(latestReservation.balanceDue)}
              </p>
            </div>
          </div>
        </Panel>

        <Panel title="Next steps">
          <div className="flex flex-wrap gap-2">
            <Link className="btn-secondary" to="/app/my-stays">
              Stay history
            </Link>
            <Link className="btn-primary" to="/app/check-in">
              Check in
            </Link>
          </div>
        </Panel>
      </div>
    </>
  );
}
