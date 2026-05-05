import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { BookingForm } from "../components/BookingForm";
import { DataTable } from "../components/DataTable";
import { Panel } from "../components/ui";
import { SectionHeading } from "../components/ui";
import { StatusBadge } from "../components/ui";
import { useHotelApp } from "../context/HotelAppContext";
import { formatMoney } from "../utils/formatters";

export function BookStayPage() {
  const { createBooking, currentGuest, guestProfiles, roomViews } = useHotelApp();
  const navigate = useNavigate();
  const [availabilityView, setAvailabilityView] = useState({
    checkIn: "2026-04-18",
    checkOut: "2026-04-20",
    adults: 2,
    rooms: roomViews.filter((room) => room.displayStatus !== "maintenance"),
  });
  const availableRooms = availabilityView.rooms;

  async function handleCreateBooking(payload) {
    const reservation = await createBooking(payload);

    if (reservation) {
      navigate("/app/booking-confirmation");
    }

    return reservation;
  }

  return (
    <>
      <SectionHeading title="Book" />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_360px]">
        <Panel
          title="Room availability"
          description={`${availabilityView.checkIn} to ${availabilityView.checkOut} / ${availabilityView.adults} guest(s)`}
        >
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
          onAvailabilityChange={setAvailabilityView}
          title="Reservation"
          submitLabel="Confirm booking"
        />
      </div>
    </>
  );
}
