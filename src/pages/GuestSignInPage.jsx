import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Panel } from "../components/ui";
import { useHotelApp } from "../context/HotelAppContext";
import { getDefaultRoute } from "../config/navigation";

export function GuestSignInPage() {
  const { guestProfiles, loginAs } = useHotelApp();
  const navigate = useNavigate();
  const [guestId, setGuestId] = useState(guestProfiles[0]?.id ?? "");
  const [bookingReference, setBookingReference] = useState("");
  const [error, setError] = useState("");

  const selectedGuest = guestProfiles.find((guest) => guest.id === guestId);

  function handleSubmit(event) {
    event.preventDefault();

    if (!guestId || !bookingReference.trim()) {
      setError("Select a guest and enter a booking reference.");
      return;
    }

    loginAs("guest", {
      guestId: selectedGuest.id,
      name: selectedGuest.name,
    });
    navigate(getDefaultRoute("guest"));
  }

  return (
    <div className="min-h-screen bg-[#f7f7f6] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[520px]">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-950">Guest Access</p>
            <p className="text-sm text-slate-500">Booking and check-in</p>
          </div>
          <Link className="btn-secondary" to="/">
            Staff portal
          </Link>
        </div>

        <Panel title="Guest Sign In">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <label>
              <span className="field-label">Guest</span>
              <select
                className="input-base"
                value={guestId}
                onChange={(event) => setGuestId(event.target.value)}
              >
                {guestProfiles.map((guest) => (
                  <option key={guest.id} value={guest.id}>
                    {guest.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="field-label">Booking reference</span>
              <input
                className="input-base"
                value={bookingReference}
                onChange={(event) => setBookingReference(event.target.value)}
                placeholder="Enter booking reference"
              />
            </label>

            <div className="flex items-center justify-between gap-3 pt-1">
              <p className="text-sm text-rose-600">{error}</p>
              <button className="btn-primary" type="submit">
                Continue
              </button>
            </div>
          </form>
        </Panel>
      </div>
    </div>
  );
}
