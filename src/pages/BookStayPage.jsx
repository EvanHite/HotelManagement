import { useNavigate } from "react-router-dom";
import { BookingForm } from "../components/BookingForm";
import { DataTable } from "../components/DataTable";
import { Panel } from "../components/Panel";
import { SectionHeading } from "../components/SectionHeading";
import { StatusBadge } from "../components/StatusBadge";
import { useHotelApp } from "../context/HotelAppContext";
import { formatMoney } from "../utils/formatters";

export function BookStayPage() {
  const { createBooking, currentGuest, guestProfiles, roomViews } = useHotelApp();
  const navigate = useNavigate();
  const availableRooms = roomViews.filter((room) => room.displayStatus !== "maintenance");

  function handleCreateBooking(payload) {
    const reservation = createBooking(payload);

    if (reservation) {
      navigate("/app/booking-confirmation");
    }

    return reservation;
  }

  return (
    <>
      <SectionHeading
        title="Book"
        description="Browse room availability and create a guest reservation."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_360px]">
        <Panel title="Room availability" description="Current room inventory available for booking.">
          <DataTable
            columns={[
              { key: "number", header: "Room", render: (row) => `Room ${row.number}` },
              { key: "type", header: "Type" },
              {
                key: "displayStatus",
                header: "Availability",
                render: (row) => <StatusBadge value={row.displayStatus === "cleaning" ? "Limited" : "Ready"} />,
              },
              {
                key: "capacity",
                header: "Capacity",
                render: (row) => `${row.capacity} guests`,
              },
              {
                key: "rate",
                header: "Rate",
                render: (row) => formatMoney(row.rate),
              },
            ]}
            rows={availableRooms}
            emptyTitle="No available rooms"
            emptyDescription="Room inventory will appear here when rooms are available."
          />
        </Panel>

        <BookingForm
          guests={guestProfiles}
          rooms={availableRooms}
          currentGuest={currentGuest}
          onSubmit={handleCreateBooking}
          title="Reservation"
          description="Complete booking details for the selected guest."
          submitLabel="Confirm booking"
        />
      </div>
    </>
  );
}
