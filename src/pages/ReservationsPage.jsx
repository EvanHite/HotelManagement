import { useMemo, useState } from "react";
import { BookingForm } from "../components/BookingForm";
import { DataTable } from "../components/DataTable";
import { Drawer } from "../components/Drawer";
import { FilterTabs } from "../components/FilterTabs";
import { Panel } from "../components/Panel";
import { SectionHeading } from "../components/SectionHeading";
import { StatusBadge } from "../components/StatusBadge";
import { useHotelApp } from "../context/HotelAppContext";
import {
  formatDateRange,
  formatMoney,
  matchesDateFilter,
  matchesSearch,
} from "../utils/formatters";

const statusOptions = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Checked In", value: "checked-in" },
  { label: "Checked Out", value: "checked-out" },
];

export function ReservationsPage() {
  const {
    businessDate,
    createBooking,
    guestProfiles,
    reservations,
    roomTypeOptions,
    roomViews,
    searchQuery,
    updateReservation,
    updateReservationStatus,
  } = useHotelApp();
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [roomTypeFilter, setRoomTypeFilter] = useState("all");
  const [localSearch, setLocalSearch] = useState("");
  const [selectedReservationId, setSelectedReservationId] = useState(null);
  const [draftNotes, setDraftNotes] = useState("");
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);

  const bookableRooms = roomViews.filter((room) => room.displayStatus !== "maintenance");

  const filteredReservations = useMemo(
    () =>
      reservations.filter((reservation) => {
        const matchesStatus =
          statusFilter === "all" ? true : reservation.status === statusFilter;
        const matchesDate = matchesDateFilter(
          reservation.checkIn,
          reservation.checkOut,
          businessDate,
          dateFilter,
        );
        const matchesRoomType =
          roomTypeFilter === "all" ? true : reservation.roomType === roomTypeFilter;
        const matchesTerm = matchesSearch(
          `${reservation.id} ${reservation.guestName} ${reservation.roomNumber}`,
          `${searchQuery} ${localSearch}`.trim(),
        );

        return matchesStatus && matchesDate && matchesRoomType && matchesTerm;
      }),
    [businessDate, dateFilter, localSearch, reservations, roomTypeFilter, searchQuery, statusFilter],
  );

  const selectedReservation =
    filteredReservations.find((reservation) => reservation.id === selectedReservationId) ??
    reservations.find((reservation) => reservation.id === selectedReservationId) ??
    null;

  function openReservation(reservation) {
    setSelectedReservationId(reservation.id);
    setDraftNotes(reservation.notes ?? "");
  }

  function stopClick(event, callback) {
    event.stopPropagation();
    callback();
  }

  return (
    <>
      <SectionHeading
        title="Reservations"
        actions={
          <button
            className="btn-primary"
            type="button"
            onClick={() => setIsCreateDrawerOpen(true)}
          >
            New reservation
          </button>
        }
      />

      <div className="grid gap-3 xl:grid-cols-[max-content_minmax(280px,1fr)_180px_220px] xl:items-center">
        <FilterTabs options={statusOptions} value={statusFilter} onChange={setStatusFilter} />
        <input
          className="input-base min-w-0"
          value={localSearch}
          onChange={(event) => setLocalSearch(event.target.value)}
          placeholder="Search guest or booking ID"
        />
        <select
          className="input-base min-w-0"
          value={dateFilter}
          onChange={(event) => setDateFilter(event.target.value)}
        >
          <option value="all">All dates</option>
          <option value="today">Today</option>
          <option value="arrivals">Arrivals</option>
          <option value="departures">Departures</option>
          <option value="in-house">In house</option>
          <option value="upcoming">Upcoming</option>
        </select>
        <select
          className="input-base min-w-0"
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

      <Panel
        title="Reservation queue"
        action={
          <span className="text-sm text-slate-500">
            {filteredReservations.length}{" "}
            {filteredReservations.length === 1 ? "booking" : "bookings"}
          </span>
        }
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
              cellClassName: "font-medium text-slate-900",
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
              minWidthClass: "min-w-[108px]",
            },
            {
              key: "total",
              header: "Total",
              render: (row) => formatMoney(row.total),
              nowrap: true,
              minWidthClass: "min-w-[92px]",
              cellClassName: "font-medium text-slate-900",
            },
            {
              key: "actions",
              header: "Actions",
              render: (row) => (
                <button
                  className="btn-ghost h-8 px-2 text-xs"
                  type="button"
                  onClick={(event) => stopClick(event, () => openReservation(row))}
                >
                  Open
                </button>
              ),
              nowrap: true,
              minWidthClass: "min-w-[84px]",
            },
          ]}
          rows={filteredReservations}
          onRowClick={openReservation}
          emptyTitle="No reservations match this view"
          emptyDescription="Adjust the filters or create a new reservation."
        />
      </Panel>

      <Drawer
        open={isCreateDrawerOpen}
        title="New reservation"
        subtitle="Front desk booking"
        onClose={() => setIsCreateDrawerOpen(false)}
      >
        <BookingForm
          guests={guestProfiles}
          rooms={bookableRooms}
          onSubmit={createBooking}
          onSuccess={(reservation) => {
            setIsCreateDrawerOpen(false);
            openReservation(reservation);
          }}
          submitLabel="Create reservation"
          showPanel={false}
        />
      </Drawer>

      <Drawer
        open={Boolean(selectedReservation)}
        title={selectedReservation ? `Reservation ${selectedReservation.id}` : ""}
        subtitle={
          selectedReservation
            ? `${selectedReservation.guestName} / Room ${selectedReservation.roomNumber}`
            : ""
        }
        onClose={() => setSelectedReservationId(null)}
        footer={
          selectedReservation ? (
            <div className="flex flex-wrap justify-between gap-2">
              <div className="flex flex-wrap gap-2">
                {selectedReservation.status === "confirmed" && (
                  <button
                    className="btn-primary"
                    type="button"
                    onClick={() =>
                      updateReservationStatus(selectedReservation.id, "checked-in")
                    }
                  >
                    Check in
                  </button>
                )}
                {selectedReservation.status === "checked-in" && (
                  <button
                    className="btn-primary"
                    type="button"
                    onClick={() =>
                      updateReservationStatus(selectedReservation.id, "checked-out")
                    }
                  >
                    Check out
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  className="btn-secondary"
                  type="button"
                  onClick={() =>
                    updateReservation(selectedReservation.id, { notes: draftNotes })
                  }
                >
                  Save changes
                </button>
                {!["checked-out", "cancelled"].includes(selectedReservation.status) && (
                  <button
                    className="btn-danger"
                    type="button"
                    onClick={() =>
                      updateReservationStatus(selectedReservation.id, "cancelled")
                    }
                  >
                    Cancel reservation
                  </button>
                )}
              </div>
            </div>
          ) : null
        }
      >
        {selectedReservation && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium text-slate-500">Guest</p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {selectedReservation.guestName}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Booking</p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {selectedReservation.id}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Stay dates</p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {formatDateRange(
                    selectedReservation.checkIn,
                    selectedReservation.checkOut,
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Room</p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {selectedReservation.roomNumber} / {selectedReservation.roomType}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Reservation</p>
                <div className="mt-1">
                  <StatusBadge value={selectedReservation.status} />
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Payment</p>
                <div className="mt-1">
                  <StatusBadge value={selectedReservation.paymentStatus} />
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Adults</p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {selectedReservation.adults}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Source</p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {selectedReservation.source}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Total</p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {formatMoney(selectedReservation.total)}
                </p>
              </div>
            </div>

            <label>
              <span className="field-label">Reservation notes</span>
              <textarea
                className="textarea-base min-h-32 resize-none"
                value={draftNotes}
                onChange={(event) => setDraftNotes(event.target.value)}
              />
            </label>
          </div>
        )}
      </Drawer>
    </>
  );
}
