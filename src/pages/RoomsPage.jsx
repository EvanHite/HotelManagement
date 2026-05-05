import { useMemo, useState } from "react";
import { DataTable } from "../components/DataTable";
import { FilterTabs } from "../components/ui";
import { Panel } from "../components/ui";
import { SectionHeading } from "../components/ui";
import { StatusBadge } from "../components/ui";
import { useHotelApp } from "../context/HotelAppContext";
import { formatDateRange, formatMoney, matchesSearch } from "../utils/formatters";

const statusOptions = [
  { label: "All", value: "all" },
  { label: "Available", value: "available" },
  { label: "Booked", value: "booked" },
  { label: "Cleaning", value: "cleaning" },
  { label: "Out of Service", value: "maintenance" },
];

function addDays(dateValue, days) {
  const date = new Date(`${dateValue}T12:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function datesOverlap(firstStart, firstEnd, secondStart, secondEnd) {
  return firstStart < secondEnd && firstEnd > secondStart;
}

function getRoomAvailability(room, reservations, checkIn, checkOut) {
  if (room.displayStatus === "maintenance") {
    return {
      availability: "maintenance",
      matchingReservation: null,
    };
  }

  const matchingReservation = reservations.find(
    (reservation) =>
      reservation.roomId === room.id &&
      ["pending", "confirmed", "checked-in"].includes(reservation.status) &&
      datesOverlap(checkIn, checkOut, reservation.checkIn, reservation.checkOut),
  );

  return {
    availability: matchingReservation ? "booked" : "available",
    matchingReservation,
  };
}

export function RoomsSection({ showHeading = true } = {}) {
  const { businessDate, reservations, roomTypeOptions, roomViews, searchQuery } = useHotelApp();
  const [statusFilter, setStatusFilter] = useState("all");
  const [roomTypeFilter, setRoomTypeFilter] = useState("all");
  const [checkIn, setCheckIn] = useState(businessDate);
  const [checkOut, setCheckOut] = useState(addDays(businessDate, 2));
  const [selectedRoomId, setSelectedRoomId] = useState(roomViews[0]?.id ?? "");

  const roomRows = useMemo(
    () =>
      roomViews.map((room) => {
        const { availability, matchingReservation } = getRoomAvailability(
          room,
          reservations,
          checkIn,
          checkOut,
        );

        return {
          ...room,
          dateAvailability: availability,
          matchingReservation,
        };
      }),
    [checkIn, checkOut, reservations, roomViews],
  );

  const filteredRooms = useMemo(
    () =>
      roomRows.filter((room) => {
        const matchesStatus =
          statusFilter === "all"
            ? true
            : statusFilter === "cleaning"
              ? room.displayStatus === "cleaning"
              : room.dateAvailability === statusFilter;
        const matchesRoomType =
          roomTypeFilter === "all" ? true : room.type === roomTypeFilter;
        const matchesTerm = matchesSearch(
          `${room.number} ${room.type} ${room.displayStatus} ${room.dateAvailability} ${room.notes}`,
          searchQuery,
        );
        return matchesStatus && matchesRoomType && matchesTerm;
      }),
    [roomRows, roomTypeFilter, searchQuery, statusFilter],
  );

  const selectedRoom =
    filteredRooms.find((room) => room.id === selectedRoomId) ??
    roomRows.find((room) => room.id === selectedRoomId) ??
    filteredRooms[0] ??
    null;

  function handleCheckInChange(nextCheckIn) {
    setCheckIn(nextCheckIn);

    if (checkOut <= nextCheckIn) {
      setCheckOut(addDays(nextCheckIn, 1));
    }
  }

  return (
    <>
      {showHeading && <SectionHeading title="Rooms" />}

      <div className="grid gap-3 xl:grid-cols-[max-content_150px_150px_220px] xl:items-center">
        <FilterTabs
          options={statusOptions}
          value={statusFilter}
          onChange={setStatusFilter}
        />
        <input
          className="input-base"
          type="date"
          value={checkIn}
          onChange={(event) => handleCheckInChange(event.target.value)}
        />
        <input
          className="input-base"
          type="date"
          min={checkIn}
          value={checkOut}
          onChange={(event) => setCheckOut(event.target.value)}
        />
        <select
          className="input-base"
          value={roomTypeFilter}
          onChange={(event) => setRoomTypeFilter(event.target.value)}
        >
          <option value="all">All room types</option>
          {roomTypeOptions.map((roomType) => (
            <option key={roomType} value={roomType}>
              {roomType}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_380px]">
        <Panel title="Room inventory">
          <DataTable
            columns={[
              { key: "number", header: "Room", render: (row) => `Room ${row.number}` },
              { key: "type", header: "Type" },
              {
                key: "dateAvailability",
                header: "Availability",
                render: (row) => (
                  <StatusBadge
                    value={
                      row.dateAvailability === "maintenance"
                        ? "Out of service"
                        : row.dateAvailability
                    }
                  />
                ),
              },
              {
                key: "matchingReservation",
                header: "Stay guest",
                render: (row) => row.matchingReservation?.guestName ?? "Open",
              },
              {
                key: "displayStatus",
                header: "Current status",
                render: (row) => <StatusBadge value={row.displayStatus} />,
              },
              {
                key: "rate",
                header: "Rate",
                render: (row) => formatMoney(row.rate),
              },
            ]}
            rows={filteredRooms}
            onRowClick={(row) => setSelectedRoomId(row.id)}
            emptyTitle="No rooms match"
            emptyDescription="Adjust the filters to review room inventory."
          />
        </Panel>

        {selectedRoom && (
          <Panel title={`Room ${selectedRoom.number}`} description={selectedRoom.type}>
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium text-slate-500">Availability</p>
                  <div className="mt-1">
                    <StatusBadge
                      value={
                        selectedRoom.dateAvailability === "maintenance"
                          ? "Out of service"
                          : selectedRoom.dateAvailability
                      }
                    />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Selected dates</p>
                  <p className="mt-1 text-sm text-slate-700">
                    {formatDateRange(checkIn, checkOut)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Current status</p>
                  <div className="mt-1">
                    <StatusBadge value={selectedRoom.displayStatus} />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Readiness</p>
                  <div className="mt-1">
                    <StatusBadge value={selectedRoom.readiness} />
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Capacity</p>
                <p className="mt-1 text-sm text-slate-700">
                  {selectedRoom.capacity} guests / {selectedRoom.beds} bed(s)
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Current guest today</p>
                <p className="mt-1 text-sm text-slate-700">
                  {selectedRoom.currentGuestName ?? "No active guest"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Housekeeping</p>
                <p className="mt-1 text-sm text-slate-700">{selectedRoom.housekeepingState}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Maintenance</p>
                <p className="mt-1 text-sm text-slate-700">{selectedRoom.maintenanceState}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Booking in selected dates</p>
                <p className="mt-1 text-sm text-slate-700">
                  {selectedRoom.matchingReservation
                    ? formatDateRange(
                        selectedRoom.matchingReservation.checkIn,
                        selectedRoom.matchingReservation.checkOut,
                      )
                    : "No booking in this date range"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Notes</p>
                <p className="mt-1 text-sm text-slate-700">{selectedRoom.notes}</p>
              </div>
            </div>
          </Panel>
        )}
      </div>
    </>
  );
}
