import { useEffect, useState } from "react";
import { Panel } from "./Panel";

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
}) {
  const [guestId, setGuestId] = useState(currentGuest?.id ?? guests[0]?.id ?? "");
  const [roomId, setRoomId] = useState(rooms[0]?.id ?? "");
  const [checkIn, setCheckIn] = useState("2026-04-18");
  const [checkOut, setCheckOut] = useState("2026-04-20");
  const [adults, setAdults] = useState(2);
  const [notes, setNotes] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (currentGuest?.id) {
      setGuestId(currentGuest.id);
    }
  }, [currentGuest]);

  useEffect(() => {
    if (rooms.length && !rooms.some((room) => room.id === roomId)) {
      setRoomId(rooms[0].id);
    }
  }, [roomId, rooms]);

  function handleSubmit(event) {
    event.preventDefault();

    if (!guestId || !roomId || !checkIn || !checkOut) {
      setFeedback("Complete the required reservation fields.");
      return;
    }

    const result = onSubmit({
      guestId,
      roomId,
      checkIn,
      checkOut,
      adults: Number(adults),
      notes,
    });

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
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                Room {room.number} - {room.type}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <label>
          <span className="field-label">Check-in</span>
          <input
            className="input-base"
            type="date"
            value={checkIn}
            onChange={(event) => setCheckIn(event.target.value)}
          />
        </label>

        <label>
          <span className="field-label">Check-out</span>
          <input
            className="input-base"
            type="date"
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
