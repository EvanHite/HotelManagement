import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiGet, apiPost } from "../api/hotelApi";
import { buildRoomViews, roleLabels } from "../config/hotelConfig";
import { formatLongDate, nightsBetween } from "../utils/formatters";

const SESSION_KEY = "hotel-management-session";
const HotelAppContext = createContext(null);

const defaultSettings = {
  hotelName: "Harbor House Milledgeville",
  contactEmail: "ops@harborhouse.example",
  checkInTime: "15:00",
  checkOutTime: "11:00",
  quietHours: "22:00",
  arrivalAlerts: true,
  inventoryAlerts: true,
  maintenanceAlerts: true,
};

function makePaymentHistory(action, amount, staffName = "System") {
  return {
    id: `pay-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    action,
    amount,
    staffName,
    createdAt: new Date().toISOString(),
  };
}

function calculateBalance(total, amountPaid) {
  return Math.max(0, (total ?? 0) - (amountPaid ?? 0));
}

function getPaymentStatus(reservation, amountPaid, authorizedAmount) {
  const total = reservation.total ?? 0;

  if (reservation.paymentStatus === "failed") {
    return "failed";
  }

  if (reservation.paymentStatus === "refunded") {
    return "refunded";
  }

  if (amountPaid >= total && total > 0) {
    return reservation.paymentStatus === "prepaid" ? "prepaid" : "captured";
  }

  if (amountPaid > 0) {
    return "partial";
  }

  if (authorizedAmount > 0) {
    return "authorized";
  }

  if (reservation.paymentMethod) {
    return "card-on-file";
  }

  return reservation.paymentStatus ?? "pending";
}

function normalizeReservationPayment(reservation) {
  const amountPaid =
    reservation.amountPaid ??
    (["captured", "prepaid"].includes(reservation.paymentStatus)
      ? reservation.total
      : 0);
  const authorizedAmount =
    reservation.authorizedAmount ??
    (reservation.paymentStatus === "authorized" ? reservation.total : 0);
  const nextReservation = {
    ...reservation,
    amountPaid,
    authorizedAmount,
    balanceDue:
      reservation.paymentStatus === "refunded"
        ? 0
        : calculateBalance(reservation.total, amountPaid),
    paymentHistory: reservation.paymentHistory ?? [],
    paymentMethod: reservation.paymentMethod ?? null,
  };

  return {
    ...nextReservation,
    paymentStatus: getPaymentStatus(nextReservation, amountPaid, authorizedAmount),
  };
}

const defaultHotelData = {
  businessDate: new Date().toISOString().slice(0, 10),
  hotels: [],
  amenities: [],
  guestProfiles: [],
  baseRooms: [],
  reservations: [],
  housekeepingTasks: [],
  maintenanceRequests: [],
  inventoryItems: [],
  latestReservationId: null,
};

function datesOverlap(firstStart, firstEnd, secondStart, secondEnd) {
  return firstStart < secondEnd && firstEnd > secondStart;
}

function isValidDateRange(checkIn, checkOut) {
  return Boolean(checkIn && checkOut && checkOut > checkIn);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPassword(password) {
  return password.length >= 6 && !/^[A-Za-z]+$/.test(password) && !/^\d+$/.test(password);
}

function getInitialSession() {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = window.localStorage.getItem(SESSION_KEY);
  return stored ? JSON.parse(stored) : null;
}

export function HotelAppProvider({ children }) {
  // Session and shared app data.
  const [session, setSession] = useState(getInitialSession);
  const [hotelData, setHotelData] = useState(defaultHotelData);
  const [settings, setSettings] = useState(defaultSettings);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [dataError, setDataError] = useState("");

  const {
    businessDate,
    hotels,
    amenities,
    guestProfiles,
    baseRooms,
    reservations,
    housekeepingTasks,
    maintenanceRequests,
    inventoryItems,
    latestReservationId,
  } = hotelData;

  useEffect(() => {
    let isMounted = true;

    async function loadDatabaseData() {
      setIsLoadingData(true);

      try {
        const data = await apiGet("data.php");

        if (!isMounted) {
          return;
        }

        setHotelData({
          businessDate: data.businessDate,
          hotels: data.hotels ?? [],
          amenities: data.amenities ?? [],
          guestProfiles: data.guestProfiles ?? [],
          baseRooms: data.baseRooms ?? [],
          reservations: (data.initialReservations ?? []).map(normalizeReservationPayment),
          housekeepingTasks: data.initialHousekeepingTasks ?? [],
          maintenanceRequests: data.initialMaintenanceRequests ?? [],
          inventoryItems: data.initialInventoryItems ?? [],
          latestReservationId: null,
        });
        setSettings({
          ...defaultSettings,
          ...(data.settings ?? {}),
        });
        setDataError("");
      } catch (error) {
        if (isMounted) {
          setDataError(
            "Database API is unavailable. Check the Hostinger upload, MySQL tables, and API configuration.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoadingData(false);
        }
      }
    }

    loadDatabaseData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Save the current login between page refreshes.
  useEffect(() => {
    if (session) {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      return;
    }

    window.localStorage.removeItem(SESSION_KEY);
  }, [session]);

  function updateHotelData(changes) {
    setHotelData((current) => ({
      ...current,
      ...changes,
    }));
  }

  function syncToDatabase(fileName, payload) {
    return apiPost(fileName, payload).catch((error) => {
      setDataError(error.message);
      return null;
    });
  }

  function updateSettings(changes) {
    const nextSettings = {
      ...settings,
      ...changes,
    };

    setSettings((current) => ({
      ...current,
      ...changes,
    }));
    syncToDatabase("operations.php", {
      action: "updateSettings",
      settings: nextSettings,
    });
  }

  // Derived data used by multiple pages.
  const roomViews = useMemo(
    () =>
      buildRoomViews(baseRooms, reservations, housekeepingTasks, maintenanceRequests).map(
        (room) => ({
          ...room,
          currentGuestName: room.activeReservation?.guestName ?? null,
          readiness:
            room.displayStatus === "available"
              ? "Ready"
              : room.displayStatus === "occupied"
                ? "In use"
                : room.displayStatus === "cleaning"
                  ? "Turnover"
                  : "Blocked",
        }),
      ),
    [baseRooms, housekeepingTasks, maintenanceRequests, reservations],
  );

  const currentGuest = session?.guestId
    ? guestProfiles.find((guest) => guest.id === session.guestId)
    : null;

  const guestReservations = currentGuest
    ? reservations.filter((reservation) => reservation.guestId === currentGuest.id)
    : [];

  const inventoryAlerts = inventoryItems.filter((item) => item.stock <= item.reorderLevel);
  const openMaintenance = maintenanceRequests.filter((request) => request.status !== "resolved");
  const openHousekeeping = housekeepingTasks.filter((task) => task.status !== "completed");
  const occupiedRooms = roomViews.filter((room) => room.displayStatus === "occupied");
  const activeBookings = reservations.filter((reservation) =>
    ["confirmed", "checked-in"].includes(reservation.status),
  );
  const arrivalsToday = reservations.filter((reservation) => reservation.checkIn === businessDate);
  const departuresToday = reservations.filter(
    (reservation) => reservation.checkOut === businessDate,
  );

  const metrics = {
    occupancyRate: roomViews.length ? Math.round((occupiedRooms.length / roomViews.length) * 100) : 0,
    activeBookings: activeBookings.length,
    arrivalsToday: arrivalsToday.length,
    departuresToday: departuresToday.length,
    roomsNeedingCleaning: openHousekeeping.length,
    openMaintenanceCount: openMaintenance.length,
    inventoryAlerts: inventoryAlerts.length,
  };

  const roomTypeOptions = Array.from(new Set(baseRooms.map((room) => room.type)));
  const latestReservation =
    reservations.find((reservation) => reservation.id === latestReservationId) ?? null;

  async function loginStaff(role, employeeId, password) {
    const cleanEmployeeId = employeeId.trim().toUpperCase();

    try {
      const data = await apiPost("auth.php", {
        action: "staffLogin",
        role,
        employeeId: cleanEmployeeId,
        password,
      });
      const user = data.user;

      setSession({
        role: user.role,
        name: user.name,
        guestId: null,
        token: data.token,
      });
      return user;
    } catch (error) {
      return null;
    }
  }

  async function loginManagement(email, password) {
    const cleanEmail = email.trim().toLowerCase();

    try {
      const data = await apiPost("auth.php", {
        action: "managementLogin",
        email: cleanEmail,
        password,
      });
      const user = data.user;

      setSession({
        role: "management",
        name: user.name,
        guestId: null,
        token: data.token,
      });
      return user;
    } catch (error) {
      return null;
    }
  }

  async function loginGuest(email, password) {
    const cleanEmail = email.trim().toLowerCase();

    try {
      const data = await apiPost("guests.php", {
        action: "login",
        email: cleanEmail,
        password,
      });
      const guest = data.guest;

      setSession({
        role: "guest",
        name: guest.name,
        guestId: guest.id,
        token: data.token,
      });
      return guest;
    } catch (error) {
      return null;
    }
  }

  function isRoomAvailable(roomId, checkIn, checkOut, ignoredReservationId = null) {
    const room = baseRooms.find((entry) => entry.id === roomId);

    if (!room || !isValidDateRange(checkIn, checkOut)) {
      return false;
    }

    const hasOpenMaintenance = maintenanceRequests.some(
      (request) => request.roomId === roomId && request.status !== "resolved",
    );

    if (hasOpenMaintenance) {
      return false;
    }

    return !reservations.some(
      (reservation) =>
        reservation.id !== ignoredReservationId &&
        reservation.roomId === roomId &&
        !["cancelled", "checked-out", "no-show"].includes(reservation.status) &&
        datesOverlap(checkIn, checkOut, reservation.checkIn, reservation.checkOut),
    );
  }

  function getAvailableRooms(checkIn, checkOut, adults = 1, ignoredReservationId = null) {
    return roomViews.filter(
      (room) =>
        room.capacity >= Number(adults || 1) &&
        isRoomAvailable(room.id, checkIn, checkOut, ignoredReservationId),
    );
  }

  function getBookingError({ roomId, checkIn, checkOut, adults }, ignoredReservationId = null) {
    const room = baseRooms.find((entry) => entry.id === roomId);

    if (!isValidDateRange(checkIn, checkOut)) {
      return "Check-out must be after check-in.";
    }

    if (!room) {
      return "Choose a room.";
    }

    if (Number(adults || 1) > room.capacity) {
      return `Room ${room.number} fits up to ${room.capacity} guests.`;
    }

    if (!isRoomAvailable(roomId, checkIn, checkOut, ignoredReservationId)) {
      return "That room is already booked or unavailable for those dates.";
    }

    return "";
  }

  function logout() {
    setSession(null);
    setSearchQuery("");
  }

  // Reservation actions.
  async function createBooking({
    guestId,
    roomId,
    checkIn,
    checkOut,
    adults,
    notes,
    paymentOption,
    paymentCard,
  }) {
    const guest = guestProfiles.find((profile) => profile.id === guestId);
    const room = baseRooms.find((entry) => entry.id === roomId);

    if (!guest || !room || getBookingError({ roomId, checkIn, checkOut, adults })) {
      return null;
    }

    const total = room.rate * nightsBetween(checkIn, checkOut);
    const source = session?.role === "guest" || !session ? "Guest Portal" : "Front Desk";
    const shouldPrepay = paymentOption === "prepaid";
    const shouldAuthorize = paymentOption === "card-on-file";
    const paymentMethod =
      shouldPrepay || shouldAuthorize
        ? {
            brand: paymentCard?.brand ?? "Visa",
            last4: paymentCard?.last4 ?? "4242",
            expiry: paymentCard?.expiry ?? "12/28",
            cardholderName: paymentCard?.cardholderName ?? guest.name,
          }
        : null;

    const reservation = normalizeReservationPayment({
      id: `res-${Date.now()}`,
      guestId,
      guestName: guest.name,
      roomId,
      roomNumber: room.number,
      roomType: room.type,
      checkIn,
      checkOut,
      status: "confirmed",
      paymentStatus: shouldPrepay ? "prepaid" : shouldAuthorize ? "authorized" : "pending",
      paymentMethod,
      amountPaid: shouldPrepay ? total : 0,
      authorizedAmount: shouldAuthorize ? total : 0,
      balanceDue: shouldPrepay ? 0 : total,
      paymentHistory:
        shouldPrepay || shouldAuthorize
          ? [
              makePaymentHistory(
                shouldPrepay ? "Marked prepaid" : "Authorized demo card",
                total,
                session?.name ?? source,
              ),
            ]
          : [],
      adults,
      total,
      source,
      createdAt: new Date().toISOString(),
      notes,
    });

    const saved = await syncToDatabase("reservations.php", {
      action: "create",
      ...reservation,
    });

    if (!saved) {
      return null;
    }

    updateHotelData({
      reservations: [reservation, ...reservations],
      latestReservationId: reservation.id,
    });
    return reservation;
  }

  function updateReservationStatus(reservationId, status) {
    const reservation = reservations.find((entry) => entry.id === reservationId);
    let syncedReservation = null;
    const updatedReservations = reservations.map((entry) => {
        if (entry.id !== reservationId) {
          return entry;
        }

        const hasPaidBalance = entry.amountPaid > 0;
        const isCancellation = status === "cancelled";

        syncedReservation = {
          ...entry,
          status,
          paymentStatus:
            isCancellation && hasPaidBalance
              ? "refunded"
              : entry.paymentStatus,
          amountPaid: isCancellation && hasPaidBalance ? 0 : entry.amountPaid,
          authorizedAmount:
            isCancellation ? 0 : entry.authorizedAmount,
          balanceDue:
            isCancellation
              ? 0
              : entry.balanceDue,
          paymentHistory:
            isCancellation && hasPaidBalance
              ? [
                  ...(entry.paymentHistory ?? []),
                  makePaymentHistory("Refunded on cancellation", entry.amountPaid, session?.name),
                ]
              : entry.paymentHistory,
        };
        return syncedReservation;
      });

    const updates = {
      reservations: updatedReservations,
    };

    if (status === "checked-out" && reservation) {
      const hasDepartureTask = housekeepingTasks.some(
        (task) =>
          task.roomId === reservation.roomId &&
          task.taskType === "Departure reset" &&
          task.status !== "completed",
      );

      if (!hasDepartureTask) {
        updates.housekeepingTasks = [
          {
            id: `hk-${Date.now()}`,
            roomId: reservation.roomId,
            roomNumber: reservation.roomNumber,
            taskType: "Departure reset",
            urgency: "high",
            status: "queued",
            assignedTo: "Marisol Diaz",
            dueBy: "12:00",
            readiness: "Blocked",
            suppliesNeeded: ["Fresh linens", "Bath towels"],
          },
          ...housekeepingTasks,
        ];
      }
    }

    updateHotelData(updates);
    if (syncedReservation) {
      syncToDatabase("reservations.php", {
        action: "status",
        reservationId,
        status,
        paymentStatus: syncedReservation.paymentStatus,
        amountPaid: syncedReservation.amountPaid,
        authorizedAmount: syncedReservation.authorizedAmount,
        balanceDue: syncedReservation.balanceDue,
        paymentHistory: syncedReservation.paymentHistory ?? [],
      });
    }
  }

  function updateReservation(reservationId, changes) {
    updateHotelData({
      reservations: reservations.map((entry) =>
        entry.id === reservationId
          ? {
              ...entry,
              ...changes,
            }
          : entry,
      ),
    });

    if (Object.prototype.hasOwnProperty.call(changes, "notes")) {
      syncToDatabase("reservations.php", {
        action: "notes",
        reservationId,
        notes: changes.notes,
      });
    }
  }

  function updateReservationDetails(reservationId, changes) {
    const reservation = reservations.find((entry) => entry.id === reservationId);

    if (!reservation) {
      return {
        ok: false,
        error: "Reservation was not found.",
      };
    }

    const nextRoomId = changes.roomId ?? reservation.roomId;
    const nextCheckIn = changes.checkIn ?? reservation.checkIn;
    const nextCheckOut = changes.checkOut ?? reservation.checkOut;
    const nextAdults = Number(changes.adults ?? reservation.adults ?? 1);
    const error = getBookingError(
      {
        roomId: nextRoomId,
        checkIn: nextCheckIn,
        checkOut: nextCheckOut,
        adults: nextAdults,
      },
      reservationId,
    );

    if (error) {
      return {
        ok: false,
        error,
      };
    }

    const room = baseRooms.find((entry) => entry.id === nextRoomId);
    const total = room.rate * nightsBetween(nextCheckIn, nextCheckOut);

    updateReservation(reservationId, {
      ...changes,
      roomId: nextRoomId,
      roomNumber: room.number,
      roomType: room.type,
      checkIn: nextCheckIn,
      checkOut: nextCheckOut,
      adults: nextAdults,
      total,
      balanceDue: calculateBalance(total, reservation.amountPaid),
    });
    syncToDatabase("reservations.php", {
      action: "details",
      reservationId,
      roomId: nextRoomId,
      checkIn: nextCheckIn,
      checkOut: nextCheckOut,
      adults: nextAdults,
      amountPaid: reservation.amountPaid,
      notes: changes.notes ?? reservation.notes ?? "",
    });

    return {
      ok: true,
      error: "",
    };
  }

  async function createGuest(profile) {
    const cleanName = profile.name?.trim();
    const cleanEmail = profile.email?.trim().toLowerCase() || "";

    if (!cleanName || !isValidEmail(cleanEmail)) {
      return null;
    }

    const guest = {
      id: `guest-${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      phone: profile.phone?.trim() || "",
      loyaltyTier: profile.loyaltyTier || "Standard",
      company: profile.company?.trim() || "Personal Travel",
      notes: profile.notes?.trim() || "",
    };

    const data = await syncToDatabase("guests.php", {
      action: "create",
      ...guest,
      password: "guest123",
    });

    if (!data) {
      return null;
    }

    const savedGuest = data.guest ?? guest;
    updateHotelData({
      guestProfiles: [savedGuest, ...guestProfiles],
    });
    return savedGuest;
  }

  async function createGuestAccount(profile) {
    const cleanName = profile.name?.trim();
    const cleanEmail = profile.email?.trim().toLowerCase();
    const cleanPassword = profile.password?.trim();

    if (!cleanName || !cleanEmail || !cleanPassword) {
      return {
        ok: false,
        guest: null,
        error: "Name, email, and password are required.",
      };
    }

    if (!isValidEmail(cleanEmail)) {
      return {
        ok: false,
        guest: null,
        error: "Enter a valid email address.",
      };
    }

    if (!isValidPassword(cleanPassword)) {
      return {
        ok: false,
        guest: null,
        error: "Password must be at least 6 characters and include both letters and numbers or symbols.",
      };
    }

    const existingGuest = guestProfiles.find(
      (guest) => guest.email.toLowerCase() === cleanEmail,
    );

    if (existingGuest) {
      return {
        ok: false,
        guest: null,
        error: "An account already exists for that email.",
      };
    }

    const guest = {
      id: `guest-${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      phone: profile.phone?.trim() || "",
      loyaltyTier: "Standard",
      company: "Personal Travel",
      notes: "",
      password: cleanPassword,
    };

    try {
      const data = await apiPost("guests.php", {
        action: "create",
        ...guest,
      });
      const savedGuest = data.guest;

      updateHotelData({
        guestProfiles: [savedGuest, ...guestProfiles],
      });
      setSession({
        role: "guest",
        name: savedGuest.name,
        guestId: savedGuest.id,
        token: data.token,
      });

      return {
        ok: true,
        guest: savedGuest,
        error: "",
      };
    } catch (error) {
      setDataError(error.message);
      return {
        ok: false,
        guest: null,
        error: error.message,
      };
    }
  }

  function updateGuest(guestId, changes) {
    updateHotelData({
      guestProfiles: guestProfiles.map((guest) =>
        guest.id === guestId
          ? {
              ...guest,
              ...changes,
            }
          : guest,
      ),
    });
    const currentGuestProfile = guestProfiles.find((guest) => guest.id === guestId);

    if (currentGuestProfile) {
      syncToDatabase("guests.php", {
        action: "update",
        guestId,
        ...currentGuestProfile,
        ...changes,
      });
    }
  }

  function updateReservationPayment(reservationId, updatePayment) {
    let syncedReservation = null;

    updateHotelData({
      reservations: reservations.map((reservation) => {
        if (reservation.id !== reservationId) {
          return reservation;
        }

        syncedReservation = normalizeReservationPayment(updatePayment(reservation));
        return syncedReservation;
      }),
    });

    if (syncedReservation) {
      syncToDatabase("reservations.php", {
        action: "payment",
        reservationId,
        paymentStatus: syncedReservation.paymentStatus,
        paymentMethod: syncedReservation.paymentMethod,
        amountPaid: syncedReservation.amountPaid,
        balanceDue: syncedReservation.balanceDue,
        authorizedAmount: syncedReservation.authorizedAmount,
        paymentHistory: syncedReservation.paymentHistory ?? [],
      });
    }
  }

  function addReservationCard(reservationId, card) {
    updateReservationPayment(reservationId, (reservation) => ({
      ...reservation,
      paymentMethod: {
        brand: card.brand,
        last4: card.last4,
        expiry: card.expiry,
        cardholderName: card.cardholderName,
      },
      paymentStatus:
        reservation.amountPaid > 0 || reservation.authorizedAmount > 0
          ? reservation.paymentStatus
          : "card-on-file",
      paymentHistory: [
        ...(reservation.paymentHistory ?? []),
        makePaymentHistory("Added demo card", 0, session?.name),
      ],
    }));
  }

  function authorizeReservationPayment(reservationId, amount) {
    updateReservationPayment(reservationId, (reservation) => ({
      ...reservation,
      authorizedAmount: Number(amount),
      paymentStatus: "authorized",
      paymentHistory: [
        ...(reservation.paymentHistory ?? []),
        makePaymentHistory("Authorized demo card", Number(amount), session?.name),
      ],
    }));
  }

  function captureReservationPayment(reservationId, amount) {
    updateReservationPayment(reservationId, (reservation) => {
      const capturedAmount = Math.min(
        Number(amount),
        calculateBalance(reservation.total, reservation.amountPaid),
      );
      const nextAmountPaid = Math.min(
        reservation.total ?? 0,
        (reservation.amountPaid ?? 0) + capturedAmount,
      );

      return {
        ...reservation,
        amountPaid: nextAmountPaid,
        authorizedAmount: 0,
        paymentStatus: nextAmountPaid >= reservation.total ? "captured" : "partial",
        paymentHistory: [
          ...(reservation.paymentHistory ?? []),
          makePaymentHistory("Captured payment", capturedAmount, session?.name),
        ],
      };
    });
  }

  function markReservationPrepaid(reservationId) {
    updateReservationPayment(reservationId, (reservation) => ({
      ...reservation,
      amountPaid: reservation.total,
      authorizedAmount: 0,
      paymentStatus: "prepaid",
      paymentHistory: [
        ...(reservation.paymentHistory ?? []),
        makePaymentHistory("Marked prepaid", reservation.total, session?.name),
      ],
    }));
  }

  function refundReservationPayment(reservationId, amount) {
    updateReservationPayment(reservationId, (reservation) => {
      const refundAmount = Math.min(Number(amount), reservation.amountPaid ?? 0);

      return {
        ...reservation,
        amountPaid: Math.max(0, (reservation.amountPaid ?? 0) - refundAmount),
        authorizedAmount: 0,
        paymentStatus: "refunded",
        paymentHistory: [
          ...(reservation.paymentHistory ?? []),
          makePaymentHistory("Refunded payment", refundAmount, session?.name),
        ],
      };
    });
  }

  function clearFailedReservationPayment(reservationId) {
    updateReservationPayment(reservationId, (reservation) => ({
      ...reservation,
      paymentStatus: reservation.paymentMethod ? "card-on-file" : "pending",
      paymentHistory: [
        ...(reservation.paymentHistory ?? []),
        makePaymentHistory("Cleared failed payment", 0, session?.name),
      ],
    }));
  }

  // Housekeeping, maintenance, and inventory actions.
  async function createHousekeepingTask({ roomId, taskType, urgency, assignedTo, dueBy, suppliesNeeded }) {
    const room = baseRooms.find((entry) => entry.id === roomId);

    if (!room) {
      return null;
    }

    const task = {
      id: `hk-${Date.now()}`,
      roomId,
      roomNumber: room.number,
      taskType,
      urgency,
      status: "queued",
      assignedTo,
      dueBy,
      readiness: "Blocked",
      suppliesNeeded: suppliesNeeded
        ? suppliesNeeded.split(",").map((item) => item.trim()).filter(Boolean)
        : [],
    };

    const saved = await syncToDatabase("operations.php", {
      action: "createHousekeeping",
      ...task,
    });

    if (!saved) {
      return null;
    }

    updateHotelData({
      housekeepingTasks: [task, ...housekeepingTasks],
    });
    return task;
  }

  function updateHousekeepingTask(taskId, status) {
    updateHotelData({
      housekeepingTasks: housekeepingTasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status,
              readiness:
                status === "completed"
                  ? "Ready"
                  : status === "in-progress"
                    ? "Partial"
                    : "Blocked",
            }
          : task,
      ),
    });
    syncToDatabase("operations.php", {
      action: "housekeepingStatus",
      taskId,
      status,
    });
  }

  async function createMaintenanceRequest({ roomId, issueType, issue, priority, assignedTo }) {
    const room = baseRooms.find((entry) => entry.id === roomId);

    if (!room || !issue.trim()) {
      return null;
    }

    const request = {
      id: `mx-${Date.now()}`,
      roomId,
      roomNumber: room.number,
      location: "Guest room",
      issueType,
      issue,
      priority,
      status: "open",
      assignedTo: assignedTo?.trim() || "Unassigned",
      reportedAt: "Just now",
      submittedDate: businessDate,
    };

    const saved = await syncToDatabase("operations.php", {
      action: "createMaintenance",
      ...request,
    });

    if (!saved) {
      return null;
    }

    updateHotelData({
      maintenanceRequests: [request, ...maintenanceRequests],
    });
    return request;
  }

  function updateMaintenanceRequest(requestId, status) {
    updateHotelData({
      maintenanceRequests: maintenanceRequests.map((request) =>
        request.id === requestId ? { ...request, status } : request,
      ),
    });
    syncToDatabase("operations.php", {
      action: "maintenanceStatus",
      requestId,
      status,
    });
  }

  function deleteMaintenanceRequest(requestId) {
    updateHotelData({
      maintenanceRequests: maintenanceRequests.filter((request) => request.id !== requestId),
    });
    syncToDatabase("operations.php", {
      action: "deleteMaintenance",
      requestId,
    });
  }

  function restockInventoryItem(itemId) {
    updateHotelData({
      inventoryItems: inventoryItems.map((item) =>
        item.id === itemId ? { ...item, stock: item.reorderLevel + 25 } : item,
      ),
    });
    syncToDatabase("operations.php", {
      action: "restockInventory",
      itemId,
    });
  }

  function updateInventoryItem(itemId, changes) {
    updateHotelData({
      inventoryItems: inventoryItems.map((item) =>
        item.id === itemId
          ? {
              ...item,
              ...changes,
              stock: Number(changes.stock ?? item.stock),
              reorderLevel: Number(changes.reorderLevel ?? item.reorderLevel),
            }
          : item,
      ),
    });
    const currentItem = inventoryItems.find((item) => item.id === itemId);

    if (currentItem) {
      syncToDatabase("operations.php", {
        action: "updateInventory",
        itemId,
        stock: Number(changes.stock ?? currentItem.stock),
        reorderLevel: Number(changes.reorderLevel ?? currentItem.reorderLevel),
      });
    }
  }

  function deleteInventoryItem(itemId) {
    updateHotelData({
      inventoryItems: inventoryItems.filter((item) => item.id !== itemId),
    });
    syncToDatabase("operations.php", {
      action: "deleteInventory",
      itemId,
    });
  }

  const staffArrivalNotifications = settings.arrivalAlerts
      ? [
          ...arrivalsToday.map((reservation) => ({
            id: `arrival-${reservation.id}`,
            title: `${reservation.guestName} arrives today`,
            detail: `Room ${reservation.roomNumber}`,
            type: "Arrival",
            path: "/app/front-desk",
          })),
          ...departuresToday.map((reservation) => ({
            id: `departure-${reservation.id}`,
            title: `${reservation.guestName} departs today`,
            detail: `Room ${reservation.roomNumber}`,
            type: "Departure",
            path: "/app/front-desk",
          })),
        ]
      : [];

  const staffMaintenanceNotifications = settings.maintenanceAlerts
      ? openMaintenance.map((request) => ({
          id: `maintenance-${request.id}`,
          title: `Maintenance in Room ${request.roomNumber}`,
          detail: request.issue,
          type: request.priority,
          path: "/operations",
        }))
      : [];

  const staffHousekeepingNotifications = openHousekeeping.map((task) => ({
    id: `housekeeping-${task.id}`,
    title: `Housekeeping in Room ${task.roomNumber}`,
    detail: task.taskType,
    type: task.urgency,
    path: "/operations",
  }));

  const staffInventoryNotifications = settings.inventoryAlerts
      ? inventoryAlerts.map((item) => ({
          id: `inventory-${item.id}`,
          title: `${item.name} is low`,
          detail: `${item.stock} ${item.unit} on hand`,
          type: "Low",
          path: "/operations",
        }))
      : [];

  const staffPaymentNotifications = reservations
      .filter(
        (reservation) =>
          ["pending", "failed"].includes(reservation.paymentStatus) &&
          reservation.balanceDue > 0 &&
          !["cancelled", "no-show", "checked-out"].includes(reservation.status),
      )
      .map((reservation) => ({
        id: `payment-${reservation.id}`,
        title: `${reservation.guestName} needs payment review`,
        detail: `Reservation ${reservation.id}`,
        type: reservation.paymentStatus,
        path: "/app/front-desk",
      }));

  const guestNotificationItems = guestReservations
    .filter((reservation) => !["cancelled", "checked-out", "no-show"].includes(reservation.status))
    .flatMap((reservation) => {
      const items = [];

      if (["pending", "failed"].includes(reservation.paymentStatus) && reservation.balanceDue > 0) {
        items.push({
          id: `guest-payment-${reservation.id}`,
          title: "Payment due",
          detail: `Reservation ${reservation.id}`,
          type: reservation.paymentStatus,
          path: "/app/my-stays",
        });
      }

      if (reservation.checkIn === businessDate && reservation.status === "confirmed") {
        items.push({
          id: `guest-checkin-${reservation.id}`,
          title: "Check-in available today",
          detail: `Room ${reservation.roomNumber}`,
          type: "Arrival",
          path: "/app/check-in",
        });
      }

      return items;
    });

  const staffNotificationItems =
    session?.role === "management"
      ? [
          ...staffArrivalNotifications,
          ...staffHousekeepingNotifications,
          ...staffMaintenanceNotifications,
          ...staffInventoryNotifications,
          ...staffPaymentNotifications,
        ]
      : session?.role === "reception"
        ? [...staffArrivalNotifications, ...staffPaymentNotifications]
        : session?.role === "housekeeping"
          ? staffHousekeepingNotifications
          : session?.role === "maintenance"
            ? staffMaintenanceNotifications
            : [];

  const notificationItems =
    session?.role === "guest" ? guestNotificationItems : staffNotificationItems;
  const notifications = notificationItems.length;

  function getReservationById(reservationId) {
    return reservations.find((reservation) => reservation.id === reservationId) ?? null;
  }

  const value = {
    businessDate,
    businessDateLabel: formatLongDate(businessDate),
    amenities,
    currentGuest,
    getReservationById,
    guestProfiles,
    guestReservations,
    housekeepingTasks,
    hotels,
    isLoadingData,
    inventoryAlerts,
    inventoryItems,
    latestReservation,
    latestReservationId,
    loginGuest,
    loginManagement,
    loginStaff,
    logout,
    maintenanceRequests,
    metrics,
    notifications,
    notificationItems,
    reservations,
    roleLabels,
    roomTypeOptions,
    roomViews,
    searchQuery,
    settings,
    session,
    dataError,
    setLatestReservationId: (id) => updateHotelData({ latestReservationId: id }),
    setSearchQuery,
    createGuest,
    createGuestAccount,
    deleteInventoryItem,
    deleteMaintenanceRequest,
    getAvailableRooms,
    getBookingError,
    isRoomAvailable,
    addReservationCard,
    authorizeReservationPayment,
    captureReservationPayment,
    clearFailedReservationPayment,
    createBooking,
    createHousekeepingTask,
    createMaintenanceRequest,
    markReservationPrepaid,
    refundReservationPayment,
    updateHousekeepingTask,
    updateMaintenanceRequest,
    updateGuest,
    updateInventoryItem,
    updateReservation,
    updateReservationDetails,
    updateReservationStatus,
    updateSettings,
    restockInventoryItem,
  };

  return <HotelAppContext.Provider value={value}>{children}</HotelAppContext.Provider>;
}

export function useHotelApp() {
  const context = useContext(HotelAppContext);

  if (!context) {
    throw new Error("useHotelApp must be used inside HotelAppProvider");
  }

  return context;
}
