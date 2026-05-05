import { useEffect, useMemo, useRef, useState } from "react";
import { Panel } from "./ui";
import { useHotelApp } from "../context/HotelAppContext";
import { formatMoney, nightsBetween } from "../utils/formatters";

export function BookingForm({
  guests,
  rooms,
  currentGuest,
  onSubmit,
  onSuccess,
  title = "Reservation details",
  description = "Create a reservation using the current room inventory.",
  submitLabel = "Create reservation",
  showPanel = true,
  onAvailabilityChange,
  mode = "staff",
}) {
  const { getAvailableRooms, getBookingError } = useHotelApp();
  const isGuestMode = mode === "guest";
  const [guestId, setGuestId] = useState(currentGuest?.id ?? guests[0]?.id ?? "");
  const [roomId, setRoomId] = useState(rooms[0]?.id ?? "");
  const [checkIn, setCheckIn] = useState("2026-04-18");
  const [checkOut, setCheckOut] = useState("2026-04-20");
  const [adults, setAdults] = useState(2);
  const [paymentOption, setPaymentOption] = useState(isGuestMode ? "pay-later" : "pay-later");
  const [cardBrand, setCardBrand] = useState("Visa");
  const [cardLast4, setCardLast4] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardholderName, setCardholderName] = useState(currentGuest?.name ?? "");
  const [notes, setNotes] = useState("");
  const [feedback, setFeedback] = useState("");
  const lastAvailabilityKey = useRef("");

  useEffect(() => {
    if (currentGuest?.id) {
      setGuestId(currentGuest.id);
      setCardholderName(currentGuest.name);
    }
  }, [currentGuest]);

  const availableRooms = useMemo(
    () =>
      getAvailableRooms(checkIn, checkOut, adults).filter((room) =>
        rooms.some((entry) => entry.id === room.id),
      ),
    [adults, checkIn, checkOut, getAvailableRooms, rooms],
  );
  const roomOptions = availableRooms;
  const selectedRoom = roomOptions.find((room) => room.id === roomId) ?? null;
  const nights = nightsBetween(checkIn, checkOut);
  const estimatedTotal = selectedRoom ? selectedRoom.rate * nights : 0;
  const needsDemoCard = ["card-on-file", "prepaid"].includes(paymentOption);

  useEffect(() => {
    const availabilityKey = `${checkIn}|${checkOut}|${adults}|${availableRooms
      .map((room) => room.id)
      .join(",")}`;

    if (availabilityKey === lastAvailabilityKey.current) {
      return;
    }

    lastAvailabilityKey.current = availabilityKey;
    onAvailabilityChange?.({
      checkIn,
      checkOut,
      adults,
      rooms: availableRooms,
    });
  }, [adults, availableRooms, checkIn, checkOut, onAvailabilityChange]);

  useEffect(() => {
    if (roomOptions.length && !roomOptions.some((room) => room.id === roomId)) {
      setRoomId(roomOptions[0].id);
    }
  }, [roomId, roomOptions]);

  function handleCheckInChange(value) {
    setCheckIn(value);

    if (checkOut <= value) {
      const nextDate = new Date(`${value}T12:00:00`);
      nextDate.setDate(nextDate.getDate() + 1);
      setCheckOut(nextDate.toISOString().slice(0, 10));
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!guestId || !roomId || !checkIn || !checkOut) {
      setFeedback("Complete the required reservation fields.");
      return;
    }

    const bookingError = getBookingError({ roomId, checkIn, checkOut, adults });

    if (bookingError) {
      setFeedback(bookingError);
      return;
    }

    if (needsDemoCard) {
      const cleanLast4 = cardLast4.replace(/\D/g, "").slice(-4);

      if (
        !cardholderName.trim() ||
        cleanLast4.length !== 4 ||
        !/^\d{2}\/\d{2}$/.test(cardExpiry.trim())
      ) {
        setFeedback("Enter cardholder, 4 digits, and expiry as MM/YY.");
        return;
      }
    }

    let result = null;

    try {
      result = await onSubmit({
        guestId,
        roomId,
        checkIn,
        checkOut,
        adults: Number(adults),
        notes,
        paymentOption,
        paymentCard: needsDemoCard
          ? {
              brand: cardBrand,
              last4: cardLast4.replace(/\D/g, "").slice(-4),
              expiry: cardExpiry.trim(),
              cardholderName: cardholderName.trim(),
            }
          : null,
      });
    } catch (error) {
      setFeedback("Reservation could not be created.");
      return;
    }

    if (!result) {
      setFeedback("Reservation could not be created.");
      return;
    }

    setFeedback("Reservation saved.");
    setNotes("");
    onSuccess?.(result);
  }

  const form = (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="grid gap-4">
        {!isGuestMode && (
          <label className="block">
            <span className="field-label">Guest</span>
            <select
              className="input-base"
              value={guestId}
              disabled={Boolean(currentGuest)}
              onChange={(event) => setGuestId(event.target.value)}
            >
              {guests.map((guest) => (
                <option key={guest.id} value={guest.id}>
                  {guest.name}
                </option>
              ))}
            </select>
          </label>
        )}

        {isGuestMode && currentGuest && (
          <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
            <p className="text-xs font-medium text-slate-500">Booking for</p>
            <p className="mt-1 text-sm font-medium text-slate-900">{currentGuest.name}</p>
          </div>
        )}
      </div>

      <div className="grid gap-4 min-[520px]:grid-cols-2 xl:grid-cols-1 min-[1380px]:grid-cols-[minmax(150px,1fr)_minmax(150px,1fr)_120px]">
        <label className="block">
          <span className="field-label">Check-in</span>
          <input
            className="input-base"
            type="date"
            value={checkIn}
            onChange={(event) => handleCheckInChange(event.target.value)}
          />
        </label>

        <label className="block">
          <span className="field-label">Check-out</span>
          <input
            className="input-base"
            type="date"
            min={checkIn}
            value={checkOut}
            onChange={(event) => setCheckOut(event.target.value)}
          />
        </label>

        <label className="block">
          <span className="field-label">Adults</span>
          <input
            className="input-base"
            type="number"
            min="1"
            max="6"
            value={adults}
            onChange={(event) => setAdults(event.target.value)}
          />
        </label>
      </div>

      <label className="block">
        <span className="field-label">Available room</span>
        <select
          className="input-base"
          value={roomId}
          disabled={!roomOptions.length}
          onChange={(event) => setRoomId(event.target.value)}
        >
          {roomOptions.map((room) => (
            <option key={room.id} value={room.id}>
              Room {room.number} - {room.type} / {room.capacity} guests
            </option>
          ))}
        </select>
        {!availableRooms.length && (
          <p className="mt-2 text-xs text-amber-700">
            No rooms are open for the selected dates and guest count.
          </p>
        )}
      </label>

      {selectedRoom && (
        <div className="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-3 sm:grid-cols-3">
          <div>
            <p className="text-xs font-medium text-slate-500">Nights</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{nights}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Rate</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {formatMoney(selectedRoom.rate)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Estimated total</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {formatMoney(estimatedTotal)}
            </p>
          </div>
        </div>
      )}

      <label className="block">
        <span className="field-label">Payment option</span>
        <select
          className="input-base"
          value={paymentOption}
          onChange={(event) => setPaymentOption(event.target.value)}
        >
          <option value="pay-later">Pay at hotel</option>
          <option value="card-on-file">Add demo card</option>
          <option value="prepaid">Prepay online</option>
        </select>
      </label>

      {isGuestMode && needsDemoCard && (
        <div className="rounded-md border border-slate-200 p-4">
          <h3 className="text-sm font-semibold text-slate-900">Demo card</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="field-label">Cardholder</span>
              <input
                className="input-base"
                value={cardholderName}
                onChange={(event) => setCardholderName(event.target.value)}
              />
            </label>
            <label className="block">
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
            <label className="block">
              <span className="field-label">Last 4</span>
              <input
                className="input-base"
                inputMode="numeric"
                maxLength="4"
                value={cardLast4}
                onChange={(event) => setCardLast4(event.target.value.replace(/\D/g, ""))}
              />
            </label>
            <label className="block">
              <span className="field-label">Expiry</span>
              <input
                className="input-base"
                placeholder="12/28"
                value={cardExpiry}
                onChange={(event) => setCardExpiry(event.target.value)}
              />
            </label>
          </div>
        </div>
      )}

      <label className="block">
        <span className="field-label">Notes</span>
        <textarea
          className="textarea-base min-h-24 resize-none"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Arrival notes, preferences, or room setup details"
        />
      </label>

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-slate-500">{feedback}</p>
        <button className="btn-primary" type="submit" disabled={!roomOptions.length}>
          {submitLabel}
        </button>
      </div>
    </form>
  );

  if (!showPanel) {
    return form;
  }

  return (
    <Panel title={title} description={description}>
      {form}
    </Panel>
  );
}
