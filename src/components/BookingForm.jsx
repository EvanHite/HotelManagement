import { useEffect, useMemo, useRef, useState } from "react";
import { Panel } from "./ui";
import { useHotelApp } from "../context/HotelAppContext";

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
}) {
  const { getAvailableRooms, getBookingError } = useHotelApp();
  const [guestId, setGuestId] = useState(currentGuest?.id ?? guests[0]?.id ?? "");
  const [roomId, setRoomId] = useState(rooms[0]?.id ?? "");
  const [checkIn, setCheckIn] = useState("2026-04-18");
  const [checkOut, setCheckOut] = useState("2026-04-20");
  const [adults, setAdults] = useState(2);
  const [paymentOption, setPaymentOption] = useState(currentGuest ? "card-on-file" : "pay-later");
  const [notes, setNotes] = useState("");
  const [feedback, setFeedback] = useState("");
  const lastAvailabilityKey = useRef("");

  useEffect(() => {
    if (currentGuest?.id) {
      setGuestId(currentGuest.id);
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
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid gap-4">
        <label>
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

        <label>
          <span className="field-label">Room</span>
          <select
            className="input-base"
            value={roomId}
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
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <label>
          <span className="field-label">Check-in</span>
          <input
            className="input-base"
            type="date"
            value={checkIn}
            onChange={(event) => handleCheckInChange(event.target.value)}
          />
        </label>

        <label>
          <span className="field-label">Check-out</span>
          <input
            className="input-base"
            type="date"
            min={checkIn}
            value={checkOut}
            onChange={(event) => setCheckOut(event.target.value)}
          />
        </label>

        <label>
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

      <label>
        <span className="field-label">Payment option</span>
        <select
          className="input-base"
          value={paymentOption}
          onChange={(event) => setPaymentOption(event.target.value)}
        >
          <option value="pay-later">Pay later</option>
          <option value="card-on-file">Card on file</option>
          <option value="prepaid">Prepaid</option>
        </select>
      </label>

      <label>
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
        <button className="btn-primary" type="submit">
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
