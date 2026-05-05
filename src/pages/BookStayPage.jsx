import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { DataTable } from "../components/DataTable";
import { Drawer } from "../components/Drawer";
import { FilterTabs } from "../components/ui";
import { Panel } from "../components/ui";
import { SectionHeading } from "../components/ui";
import { StatusBadge } from "../components/ui";
import { useHotelApp } from "../context/HotelAppContext";
import { formatDateRange, formatMoney, nightsBetween } from "../utils/formatters";

const accountTabs = [
  { label: "Sign in", value: "sign-in" },
  { label: "Create account", value: "create" },
];

function addDays(dateValue, days) {
  const date = new Date(`${dateValue}T12:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function SearchPageShell({ isPublic, children }) {
  if (!isPublic) {
    return children;
  }

  return (
    <div className="min-h-screen bg-[#f4f5f7]">
      <header className="border-b border-slate-200 bg-white">
        <div className="app-container flex h-16 items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-slate-300 bg-slate-900 text-sm font-semibold text-white">
              HH
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-950">Harbor House</p>
              <p className="truncate text-sm text-slate-500">Milledgeville</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link className="btn-secondary" to="/guest/sign-in">
              Guest sign in
            </Link>
            <Link className="btn-secondary hidden sm:inline-flex" to="/staff/sign-in">
              Staff portal
            </Link>
          </div>
        </div>
      </header>
      <main className="py-4 lg:py-6">
        <div className="app-container flex flex-col gap-5">{children}</div>
      </main>
    </div>
  );
}

export function BookStayPage({ isPublic = false }) {
  const {
    businessDate,
    createBooking,
    createGuestAccount,
    currentGuest,
    dataError,
    getAvailableRooms,
    isLoadingData,
    loginGuest,
    roomTypeOptions,
  } = useHotelApp();
  const navigate = useNavigate();
  const [checkIn, setCheckIn] = useState(addDays(businessDate, 3));
  const [checkOut, setCheckOut] = useState(addDays(businessDate, 5));
  const [adults, setAdults] = useState(2);
  const [roomType, setRoomType] = useState("all");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [drawerGuest, setDrawerGuest] = useState(null);
  const [accountTab, setAccountTab] = useState("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newGuest, setNewGuest] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [paymentOption, setPaymentOption] = useState("pay-later");
  const [cardBrand, setCardBrand] = useState("Visa");
  const [cardLast4, setCardLast4] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [notes, setNotes] = useState("");
  const [feedback, setFeedback] = useState("");

  const activeGuest = currentGuest ?? drawerGuest;
  const needsAccount = !activeGuest;
  const needsDemoCard = ["card-on-file", "prepaid"].includes(paymentOption);
  const stayNights = nightsBetween(checkIn, checkOut);
  const estimatedTotal = selectedRoom ? selectedRoom.rate * stayNights : 0;

  const availableRooms = useMemo(() => {
    const maxRate = Number(maxPrice);

    return getAvailableRooms(checkIn, checkOut, adults).filter((room) => {
      const matchesType = roomType === "all" ? true : room.type === roomType;
      const matchesPrice = maxPrice ? room.rate <= maxRate : true;

      return matchesType && matchesPrice;
    });
  }, [adults, checkIn, checkOut, getAvailableRooms, maxPrice, roomType]);

  function handleCheckInChange(value) {
    setCheckIn(value);

    if (checkOut <= value) {
      setCheckOut(addDays(value, 1));
    }
  }

  function openReservation(room) {
    setSelectedRoom(room);
    setDrawerGuest(currentGuest ?? null);
    setAccountTab("sign-in");
    setEmail("");
    setPassword("");
    setNewGuest({ name: "", email: "", phone: "", password: "" });
    setPaymentOption("pay-later");
    setCardBrand("Visa");
    setCardLast4("");
    setCardExpiry("");
    setCardholderName(currentGuest?.name ?? "");
    setNotes("");
    setFeedback("");
  }

  async function handleReturningGuest(event) {
    event.preventDefault();
    const guest = await loginGuest(email, password);

    if (!guest) {
      setFeedback("Email or password did not match.");
      return;
    }

    setDrawerGuest(guest);
    setCardholderName(guest.name);
    setFeedback("");
  }

  async function handleCreateAccount(event) {
    event.preventDefault();
    const result = await createGuestAccount(newGuest);

    if (!result.ok) {
      setFeedback(result.error);
      return;
    }

    setDrawerGuest(result.guest);
    setCardholderName(result.guest.name);
    setFeedback("");
  }

  async function confirmBooking(event) {
    event.preventDefault();

    if (!activeGuest || !selectedRoom) {
      setFeedback("Sign in or create an account first.");
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

    const reservation = await createBooking({
      guestId: activeGuest.id,
      roomId: selectedRoom.id,
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

    if (!reservation) {
      setFeedback("Reservation could not be created.");
      return;
    }

    navigate("/app/booking-confirmation");
  }

  const page = (
    <>
      <SectionHeading title={isPublic ? "Book a Room" : "Book"} />

      {dataError ? (
        <Panel title="Database connection needed">
          <p className="text-sm text-slate-600">{dataError}</p>
        </Panel>
      ) : null}

      {isLoadingData ? (
        <Panel title="Loading rooms">
          <p className="text-sm text-slate-600">Checking current room availability.</p>
        </Panel>
      ) : null}

      <Panel title="Search rooms">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[150px_150px_100px_minmax(180px,1fr)_140px]">
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
            <span className="field-label">Guests</span>
            <input
              className="input-base"
              type="number"
              min="1"
              max="6"
              value={adults}
              onChange={(event) => setAdults(event.target.value)}
            />
          </label>
          <label className="block">
            <span className="field-label">Room type</span>
            <select
              className="input-base"
              value={roomType}
              onChange={(event) => setRoomType(event.target.value)}
            >
              <option value="all">All room types</option>
              {roomTypeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="field-label">Max price</span>
            <input
              className="input-base"
              type="number"
              min="0"
              placeholder="Any"
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
            />
          </label>
        </div>
      </Panel>

      <Panel
        title="Available rooms"
        description={`${formatDateRange(checkIn, checkOut)} / ${adults} guest${
          Number(adults) === 1 ? "" : "s"
        }`}
        action={
          <span className="text-sm text-slate-500">
            {availableRooms.length} {availableRooms.length === 1 ? "room" : "rooms"}
          </span>
        }
      >
        <DataTable
          columns={[
            { key: "number", header: "Room", render: (row) => `Room ${row.number}` },
            { key: "type", header: "Type" },
            {
              key: "displayStatus",
              header: "Availability",
              render: (row) => (
                <StatusBadge value={row.displayStatus === "cleaning" ? "Limited" : "Ready"} />
              ),
            },
            { key: "capacity", header: "Capacity", render: (row) => `${row.capacity} guests` },
            { key: "rate", header: "Rate", render: (row) => formatMoney(row.rate) },
            {
              key: "actions",
              header: "Actions",
              render: (row) => (
                <button
                  className="btn-secondary h-8 px-2 text-xs"
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    openReservation(row);
                  }}
                >
                  Select
                </button>
              ),
            },
          ]}
          rows={availableRooms}
          onRowClick={openReservation}
          emptyTitle="No rooms match this search"
          emptyDescription="Try different dates, guest count, room type, or price."
        />
      </Panel>

      <Drawer
        open={Boolean(selectedRoom)}
        title="Reserve room"
        subtitle={selectedRoom ? `Room ${selectedRoom.number} / ${selectedRoom.type}` : ""}
        onClose={() => setSelectedRoom(null)}
      >
        {selectedRoom && (
          <div className="space-y-5">
            <div className="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-3 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium text-slate-500">Guest</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {activeGuest?.name ?? "Account required"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Stay dates</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {formatDateRange(checkIn, checkOut)}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Guests</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{adults}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Nights</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{stayNights}</p>
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

            {needsAccount ? (
              <div className="space-y-4">
                <FilterTabs
                  fill
                  options={accountTabs}
                  value={accountTab}
                  onChange={(value) => {
                    setAccountTab(value);
                    setFeedback("");
                  }}
                />

                {accountTab === "sign-in" ? (
                  <form className="space-y-4" onSubmit={handleReturningGuest}>
                    <label className="block">
                      <span className="field-label">Email</span>
                      <input
                        className="input-base"
                        type="email"
                        required
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="ava.bennett@example.com"
                      />
                    </label>
                    <label className="block">
                      <span className="field-label">Password</span>
                      <input
                        className="input-base"
                        type="password"
                        required
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="guest123"
                      />
                    </label>
                    <button className="btn-primary" type="submit">
                      Continue
                    </button>
                  </form>
                ) : (
                  <form className="space-y-4" onSubmit={handleCreateAccount}>
                    <label className="block">
                      <span className="field-label">Name</span>
                      <input
                        className="input-base"
                        required
                        value={newGuest.name}
                        onChange={(event) =>
                          setNewGuest((current) => ({ ...current, name: event.target.value }))
                        }
                      />
                    </label>
                    <label className="block">
                      <span className="field-label">Email</span>
                      <input
                        className="input-base"
                        type="email"
                        required
                        value={newGuest.email}
                        onChange={(event) =>
                          setNewGuest((current) => ({ ...current, email: event.target.value }))
                        }
                      />
                    </label>
                    <label className="block">
                      <span className="field-label">Phone</span>
                      <input
                        className="input-base"
                        value={newGuest.phone}
                        onChange={(event) =>
                          setNewGuest((current) => ({ ...current, phone: event.target.value }))
                        }
                      />
                    </label>
                    <label className="block">
                      <span className="field-label">Password</span>
                      <input
                        className="input-base"
                        type="password"
                        required
                        minLength="6"
                        value={newGuest.password}
                        onChange={(event) =>
                          setNewGuest((current) => ({ ...current, password: event.target.value }))
                        }
                      />
                    </label>
                    <button className="btn-primary" type="submit">
                      Create account
                    </button>
                  </form>
                )}
              </div>
            ) : (
              <form className="space-y-5" onSubmit={confirmBooking}>
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

                {needsDemoCard && (
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

                <button className="btn-primary" type="submit">
                  Confirm booking
                </button>
              </form>
            )}

            {feedback && <p className="text-sm text-rose-600">{feedback}</p>}
          </div>
        )}
      </Drawer>
    </>
  );

  return <SearchPageShell isPublic={isPublic}>{page}</SearchPageShell>;
}
