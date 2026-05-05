import { useEffect, useMemo, useState } from "react";
import { BookingForm } from "../components/BookingForm";
import { DataTable } from "../components/DataTable";
import { Drawer } from "../components/Drawer";
import { FilterTabs } from "../components/ui";
import { Panel } from "../components/ui";
import { SearchInput } from "../components/ui";
import { SectionHeading } from "../components/ui";
import { StatusBadge } from "../components/ui";
import { useHotelApp } from "../context/HotelAppContext";
import {
  formatDateRange,
  formatMoney,
  matchesDateFilter,
  matchesSearch,
  nightsBetween,
} from "../utils/formatters";

const statusOptions = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Checked In", value: "checked-in" },
  { label: "Checked Out", value: "checked-out" },
  { label: "No-show", value: "no-show" },
  { label: "Cancelled", value: "cancelled" },
];

const reservationDetailTabs = [
  { label: "Summary", value: "summary" },
  { label: "Payment", value: "payment" },
  { label: "Notes", value: "notes" },
];

function DetailItem({ label, children }) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <div className="mt-1 text-sm font-medium text-slate-900">{children}</div>
    </div>
  );
}

export function ReservationsSection({ showHeading = true } = {}) {
  const {
    addReservationCard,
    authorizeReservationPayment,
    businessDate,
    captureReservationPayment,
    clearFailedReservationPayment,
    createBooking,
    getAvailableRooms,
    guestProfiles,
    markReservationPrepaid,
    refundReservationPayment,
    reservations,
    roomTypeOptions,
    roomViews,
    searchQuery,
    updateReservation,
    updateReservationDetails,
    updateReservationStatus,
  } = useHotelApp();
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [roomTypeFilter, setRoomTypeFilter] = useState("all");
  const [localSearch, setLocalSearch] = useState("");
  const [selectedReservationId, setSelectedReservationId] = useState(null);
  const [activeReservationTab, setActiveReservationTab] = useState("summary");
  const [draftNotes, setDraftNotes] = useState("");
  const [cardBrand, setCardBrand] = useState("Visa");
  const [cardLast4, setCardLast4] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentAction, setPaymentAction] = useState("capture");
  const [paymentFeedback, setPaymentFeedback] = useState("");
  const [isCardFormOpen, setIsCardFormOpen] = useState(false);
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [editRoomId, setEditRoomId] = useState("");
  const [editCheckIn, setEditCheckIn] = useState("");
  const [editCheckOut, setEditCheckOut] = useState("");
  const [editAdults, setEditAdults] = useState(1);
  const [editFeedback, setEditFeedback] = useState("");

  const bookableRooms = roomViews;

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
    setActiveReservationTab("summary");
    setDraftNotes(reservation.notes ?? "");
  }

  useEffect(() => {
    if (!selectedReservation) {
      return;
    }

    setPaymentFeedback("");
    setCardBrand(selectedReservation.paymentMethod?.brand ?? "Visa");
    setCardLast4(selectedReservation.paymentMethod?.last4 ?? "");
    setCardExpiry(selectedReservation.paymentMethod?.expiry ?? "");
    setCardholderName(
      selectedReservation.paymentMethod?.cardholderName ?? selectedReservation.guestName,
    );
    setPaymentAction(selectedReservation.balanceDue > 0 ? "capture" : "refund");
    setPaymentAmount(
      String(
        selectedReservation.balanceDue ||
          selectedReservation.authorizedAmount ||
          selectedReservation.amountPaid ||
          0,
      ),
    );
    setIsCardFormOpen(!selectedReservation.paymentMethod);
    setEditRoomId(selectedReservation.roomId);
    setEditCheckIn(selectedReservation.checkIn);
    setEditCheckOut(selectedReservation.checkOut);
    setEditAdults(selectedReservation.adults ?? 1);
    setEditFeedback("");
    setIsEditingSummary(false);
  }, [selectedReservation]);

  function stopClick(event, callback) {
    event.stopPropagation();
    callback();
  }

  function saveDemoCard() {
    const cleanLast4 = cardLast4.replace(/\D/g, "").slice(-4);

    if (cleanLast4.length !== 4 || !cardExpiry.trim() || !cardholderName.trim()) {
      setPaymentFeedback("Enter cardholder, last 4, and expiry.");
      return;
    }

    addReservationCard(selectedReservation.id, {
      brand: cardBrand,
      last4: cleanLast4,
      expiry: cardExpiry.trim(),
      cardholderName: cardholderName.trim(),
    });
    setCardLast4(cleanLast4);
    setPaymentFeedback("Demo card saved.");
    setIsCardFormOpen(false);
  }

  function runPaymentAction(callback, successMessage) {
    callback();
    setPaymentFeedback(successMessage);
  }

  function runCardPaymentAction(callback, successMessage) {
    if (!selectedReservation.paymentMethod) {
      setPaymentFeedback("Save a demo card first.");
      return;
    }

    runPaymentAction(callback, successMessage);
  }

  function moneyInputValue(value) {
    return Math.max(0, Number(value) || 0);
  }

  function selectPaymentAction(action) {
    setPaymentAction(action);

    if (action === "capture" || action === "authorize") {
      setPaymentAmount(String(selectedReservation.balanceDue || selectedReservation.total || 0));
    }

    if (action === "incidentals") {
      setPaymentAmount("100");
    }

    if (action === "refund") {
      setPaymentAmount(String(selectedReservation.amountPaid || 0));
    }
  }

  function runSelectedPaymentAction() {
    const amount = moneyInputValue(paymentAmount);

    if (paymentAction === "capture") {
      runCardPaymentAction(
        () => captureReservationPayment(selectedReservation.id, amount),
        "Payment captured.",
      );
      return;
    }

    if (paymentAction === "authorize") {
      runCardPaymentAction(
        () => authorizeReservationPayment(selectedReservation.id, amount),
        "Authorization recorded.",
      );
      return;
    }

    if (paymentAction === "incidentals") {
      runCardPaymentAction(
        () => authorizeReservationPayment(selectedReservation.id, amount),
        "Incidentals hold recorded.",
      );
      return;
    }

    if (paymentAction === "refund") {
      runPaymentAction(
        () => refundReservationPayment(selectedReservation.id, amount),
        "Refund recorded.",
      );
    }
  }

  function handleEditCheckInChange(value) {
    setEditCheckIn(value);

    if (editCheckOut <= value) {
      const nextDate = new Date(`${value}T12:00:00`);
      nextDate.setDate(nextDate.getDate() + 1);
      setEditCheckOut(nextDate.toISOString().slice(0, 10));
    }
  }

  function getEditableRoomOptions() {
    const availableRooms = getAvailableRooms(
      editCheckIn,
      editCheckOut,
      editAdults,
      selectedReservation.id,
    );
    const currentRoom = roomViews.find((room) => room.id === selectedReservation.roomId);

    return [currentRoom, ...availableRooms].filter(
      (room, index, allRooms) =>
        room && allRooms.findIndex((entry) => entry?.id === room.id) === index,
    );
  }

  function saveReservationSummary() {
    const result = updateReservationDetails(selectedReservation.id, {
      roomId: editRoomId,
      checkIn: editCheckIn,
      checkOut: editCheckOut,
      adults: Number(editAdults),
      notes: draftNotes,
    });

    if (!result.ok) {
      setEditFeedback(result.error);
      return;
    }

    setEditFeedback("Reservation updated.");
    setIsEditingSummary(false);
  }

  const newReservationButton = (
    <button
      className="btn-primary"
      type="button"
      onClick={() => setIsCreateDrawerOpen(true)}
    >
      New reservation
    </button>
  );

  return (
    <>
      {showHeading && (
        <SectionHeading
          title="Reservations"
          actions={newReservationButton}
        />
      )}

      {!showHeading && <div className="flex justify-end">{newReservationButton}</div>}

      <div className="grid gap-3 xl:grid-cols-[max-content_minmax(280px,1fr)_180px_220px] xl:items-center">
        <FilterTabs options={statusOptions} value={statusFilter} onChange={setStatusFilter} />
        <SearchInput
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
      >
        {selectedReservation && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge value={selectedReservation.status} />
              <StatusBadge value={selectedReservation.paymentStatus} />
              {["pending", "failed"].includes(selectedReservation.paymentStatus) && (
                <span className="text-sm text-amber-700">Payment needs attention.</span>
              )}
            </div>

            <FilterTabs
              fill
              options={reservationDetailTabs}
              value={activeReservationTab}
              onChange={setActiveReservationTab}
            />

            {activeReservationTab === "summary" && (
              <div className="space-y-5">
                {!isEditingSummary ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <DetailItem label="Guest">{selectedReservation.guestName}</DetailItem>
                    <DetailItem label="Booking">{selectedReservation.id}</DetailItem>
                    <DetailItem label="Stay dates">
                      {formatDateRange(
                        selectedReservation.checkIn,
                        selectedReservation.checkOut,
                      )}
                    </DetailItem>
                    <DetailItem label="Nights">
                      {nightsBetween(selectedReservation.checkIn, selectedReservation.checkOut)}
                    </DetailItem>
                    <DetailItem label="Room">
                      {selectedReservation.roomNumber} / {selectedReservation.roomType}
                    </DetailItem>
                    <DetailItem label="Adults">{selectedReservation.adults}</DetailItem>
                    <DetailItem label="Source">{selectedReservation.source}</DetailItem>
                    <DetailItem label="Total">{formatMoney(selectedReservation.total)}</DetailItem>
                    <DetailItem label="Balance due">
                      {formatMoney(selectedReservation.balanceDue)}
                    </DetailItem>
                  </div>
                ) : (
                  <div className="rounded-md border border-slate-200 p-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label>
                        <span className="field-label">Check-in</span>
                        <input
                          className="input-base"
                          type="date"
                          value={editCheckIn}
                          onChange={(event) => handleEditCheckInChange(event.target.value)}
                        />
                      </label>
                      <label>
                        <span className="field-label">Check-out</span>
                        <input
                          className="input-base"
                          type="date"
                          min={editCheckIn}
                          value={editCheckOut}
                          onChange={(event) => setEditCheckOut(event.target.value)}
                        />
                      </label>
                      <label>
                        <span className="field-label">Adults</span>
                        <input
                          className="input-base"
                          type="number"
                          min="1"
                          max="6"
                          value={editAdults}
                          onChange={(event) => setEditAdults(event.target.value)}
                        />
                      </label>
                      <label>
                        <span className="field-label">Room</span>
                        <select
                          className="input-base"
                          value={editRoomId}
                          onChange={(event) => setEditRoomId(event.target.value)}
                        >
                          {getEditableRoomOptions().map((room) => (
                            <option key={room.id} value={room.id}>
                              Room {room.number} - {room.type}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <button className="btn-primary" type="button" onClick={saveReservationSummary}>
                        Save changes
                      </button>
                      <button
                        className="btn-secondary"
                        type="button"
                        onClick={() => setIsEditingSummary(false)}
                      >
                        Cancel edit
                      </button>
                      {editFeedback && <p className="text-sm text-slate-500">{editFeedback}</p>}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 border-t border-slate-200 pt-4">
                  {!isEditingSummary && (
                    <button
                      className="btn-secondary"
                      type="button"
                      onClick={() => setIsEditingSummary(true)}
                    >
                      Edit reservation
                    </button>
                  )}
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
                  {selectedReservation.status === "confirmed" && (
                    <button
                      className="btn-secondary"
                      type="button"
                      onClick={() =>
                        updateReservationStatus(selectedReservation.id, "no-show")
                      }
                    >
                      Mark no-show
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
                  {!["checked-out", "cancelled", "no-show"].includes(selectedReservation.status) && (
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
            )}

            {activeReservationTab === "payment" && (
              <div className="space-y-5">
                <div className="grid gap-3 sm:grid-cols-4">
                  <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs font-medium text-slate-500">Total</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {formatMoney(selectedReservation.total)}
                    </p>
                  </div>
                  <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs font-medium text-slate-500">Paid</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {formatMoney(selectedReservation.amountPaid)}
                    </p>
                  </div>
                  <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs font-medium text-slate-500">Balance</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {formatMoney(selectedReservation.balanceDue)}
                    </p>
                  </div>
                  <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs font-medium text-slate-500">Hold</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {formatMoney(selectedReservation.authorizedAmount)}
                    </p>
                  </div>
                </div>

                <div className="rounded-md border border-slate-200 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-slate-900">Demo card</h3>
                      <p className="mt-1 truncate text-sm text-slate-500">
                        {selectedReservation.paymentMethod
                          ? `${selectedReservation.paymentMethod.brand} ending ${selectedReservation.paymentMethod.last4} / ${selectedReservation.paymentMethod.expiry}`
                          : "No card on file."}
                      </p>
                    </div>
                    {selectedReservation.paymentMethod && (
                      <button
                        className="btn-secondary h-9"
                        type="button"
                        onClick={() => setIsCardFormOpen((current) => !current)}
                      >
                        {isCardFormOpen ? "Hide card form" : "Replace card"}
                      </button>
                    )}
                  </div>

                  {isCardFormOpen && (
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <label>
                        <span className="field-label">Brand</span>
                        <select
                          className="input-base"
                          value={cardBrand}
                          onChange={(event) => setCardBrand(event.target.value)}
                        >
                          <option>Visa</option>
                          <option>Mastercard</option>
                          <option>Amex</option>
                          <option>Discover</option>
                        </select>
                      </label>
                      <label>
                        <span className="field-label">Cardholder</span>
                        <input
                          className="input-base"
                          value={cardholderName}
                          onChange={(event) => setCardholderName(event.target.value)}
                        />
                      </label>
                      <label>
                        <span className="field-label">Last 4</span>
                        <input
                          className="input-base"
                          inputMode="numeric"
                          maxLength="4"
                          value={cardLast4}
                          onChange={(event) =>
                            setCardLast4(event.target.value.replace(/\D/g, ""))
                          }
                        />
                      </label>
                      <label>
                        <span className="field-label">Expiry</span>
                        <input
                          className="input-base"
                          placeholder="12/28"
                          value={cardExpiry}
                          onChange={(event) => setCardExpiry(event.target.value)}
                        />
                      </label>
                      <div className="sm:col-span-2">
                        <button className="btn-secondary" type="button" onClick={saveDemoCard}>
                          Save demo card
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="rounded-md border border-slate-200 p-4">
                  <h3 className="text-sm font-semibold text-slate-900">Next payment action</h3>
                  <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                    {!selectedReservation.paymentMethod &&
                    selectedReservation.paymentStatus !== "prepaid" ? (
                      <button
                        className="btn-primary"
                        type="button"
                        onClick={() => setIsCardFormOpen(true)}
                      >
                        Add demo card
                      </button>
                    ) : selectedReservation.balanceDue > 0 ? (
                      <>
                        <label>
                          <span className="field-label">Amount</span>
                          <input
                            className="input-base"
                            type="number"
                            min="0"
                            value={paymentAmount}
                            onChange={(event) => setPaymentAmount(event.target.value)}
                          />
                        </label>
                        <button
                          className="btn-primary"
                          type="button"
                          onClick={() => {
                            selectPaymentAction("capture");
                            runCardPaymentAction(
                              () =>
                                captureReservationPayment(
                                  selectedReservation.id,
                                  moneyInputValue(paymentAmount),
                                ),
                              "Payment captured.",
                            );
                          }}
                        >
                          Capture balance
                        </button>
                      </>
                    ) : selectedReservation.amountPaid > 0 ? (
                      <p className="text-sm text-slate-500">Payment is settled.</p>
                    ) : (
                      <button
                        className="btn-primary"
                        type="button"
                        onClick={() =>
                          runPaymentAction(
                            () => markReservationPrepaid(selectedReservation.id),
                            "Reservation marked prepaid.",
                          )
                        }
                      >
                        Mark prepaid
                      </button>
                    )}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      className="btn-secondary h-9"
                      type="button"
                      onClick={() => selectPaymentAction("authorize")}
                    >
                      Authorize hold
                    </button>
                    <button
                      className="btn-secondary h-9"
                      type="button"
                      onClick={() => selectPaymentAction("incidentals")}
                    >
                      Incidentals
                    </button>
                    <button
                      className="btn-secondary h-9"
                      type="button"
                      onClick={() =>
                        runPaymentAction(
                          () => markReservationPrepaid(selectedReservation.id),
                          "Reservation marked prepaid.",
                        )
                      }
                    >
                      Mark prepaid
                    </button>
                    {selectedReservation.amountPaid > 0 && (
                      <button
                        className="btn-danger h-9"
                        type="button"
                        onClick={() => selectPaymentAction("refund")}
                      >
                        Refund
                      </button>
                    )}
                    {selectedReservation.paymentStatus === "failed" && (
                      <button
                        className="btn-secondary h-9"
                        type="button"
                        onClick={() =>
                          runPaymentAction(
                            () => clearFailedReservationPayment(selectedReservation.id),
                            "Failed payment cleared.",
                          )
                        }
                      >
                        Clear failed
                      </button>
                    )}
                  </div>

                  {["authorize", "incidentals", "refund"].includes(paymentAction) && (
                    <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                      <label>
                        <span className="field-label">
                          {paymentAction === "refund" ? "Refund amount" : "Amount"}
                        </span>
                        <input
                          className="input-base"
                          type="number"
                          min="0"
                          value={paymentAmount}
                          onChange={(event) => setPaymentAmount(event.target.value)}
                        />
                      </label>
                      <button
                        className={paymentAction === "refund" ? "btn-danger" : "btn-secondary"}
                        type="button"
                        onClick={runSelectedPaymentAction}
                      >
                        {paymentAction === "refund"
                          ? "Record refund"
                          : paymentAction === "incidentals"
                            ? "Authorize incidentals"
                            : "Authorize hold"}
                      </button>
                    </div>
                  )}
                </div>

                {paymentFeedback && <p className="text-sm text-slate-500">{paymentFeedback}</p>}

                <div className="rounded-md border border-slate-200 p-4">
                  <h3 className="text-sm font-semibold text-slate-900">Folio</h3>
                  <div className="mt-3 divide-y divide-slate-200 text-sm">
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 py-2">
                      <span className="text-slate-600">
                        Room {selectedReservation.roomNumber} /{" "}
                        {nightsBetween(
                          selectedReservation.checkIn,
                          selectedReservation.checkOut,
                        )}{" "}
                        night(s)
                      </span>
                      <span className="font-medium text-slate-900">
                        {formatMoney(selectedReservation.total)}
                      </span>
                    </div>
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 py-2">
                      <span className="text-slate-600">Recorded payments</span>
                      <span className="font-medium text-slate-900">
                        -{formatMoney(selectedReservation.amountPaid)}
                      </span>
                    </div>
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 pt-2">
                      <span className="font-medium text-slate-900">Balance due</span>
                      <span className="font-semibold text-slate-900">
                        {formatMoney(selectedReservation.balanceDue)}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="field-label">Payment history</p>
                  {selectedReservation.paymentHistory?.length ? (
                    <div className="divide-y divide-slate-200 rounded-md border border-slate-200">
                      {selectedReservation.paymentHistory.map((entry) => (
                        <div
                          className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 px-3 py-2"
                          key={entry.id}
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-slate-900">
                              {entry.action}
                            </p>
                            <p className="truncate text-xs leading-5 text-slate-500">
                              {entry.staffName} / {new Date(entry.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <p className="text-sm font-medium text-slate-900">
                            {formatMoney(entry.amount)}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">No payment actions recorded.</p>
                  )}
                </div>
              </div>
            )}

            {activeReservationTab === "notes" && (
              <div className="space-y-4">
                <label>
                  <span className="field-label">Reservation notes</span>
                  <textarea
                    className="textarea-base min-h-40 resize-none"
                    value={draftNotes}
                    onChange={(event) => setDraftNotes(event.target.value)}
                  />
                </label>
                <button
                  className="btn-primary"
                  type="button"
                  onClick={() =>
                    updateReservation(selectedReservation.id, { notes: draftNotes })
                  }
                >
                  Save notes
                </button>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </>
  );
}
