import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  baseRooms,
  buildRoomViews,
  businessDate,
  demoUsers,
  guestProfiles,
  hotels,
  initialHousekeepingTasks,
  initialInventoryItems,
  initialMaintenanceRequests,
  initialReservations,
  roleLabels,
} from "../data/mockData";
import { formatLongDate, nightsBetween } from "../utils/formatters";

const SESSION_KEY = "hotel-management-session";
const HotelAppContext = createContext(null);

function getInitialSession() {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = window.localStorage.getItem(SESSION_KEY);
  return stored ? JSON.parse(stored) : null;
}

export function HotelAppProvider({ children }) {
  const [session, setSession] = useState(getInitialSession);
  const [selectedHotelId, setSelectedHotelId] = useState(hotels[0].id);
  const [searchQuery, setSearchQuery] = useState("");
  const [reservations, setReservations] = useState(initialReservations);
  const [housekeepingTasks, setHousekeepingTasks] = useState(initialHousekeepingTasks);
  const [maintenanceRequests, setMaintenanceRequests] = useState(initialMaintenanceRequests);
  const [inventoryItems, setInventoryItems] = useState(initialInventoryItems);
  const [latestReservationId, setLatestReservationId] = useState(null);

  useEffect(() => {
    if (session) {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      return;
    }

    window.localStorage.removeItem(SESSION_KEY);
  }, [session]);

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
    [housekeepingTasks, maintenanceRequests, reservations],
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
    occupancyRate: Math.round((occupiedRooms.length / roomViews.length) * 100),
    activeBookings: activeBookings.length,
    arrivalsToday: arrivalsToday.length,
    departuresToday: departuresToday.length,
    roomsNeedingCleaning: openHousekeeping.length,
    openMaintenanceCount: openMaintenance.length,
    inventoryAlerts: inventoryAlerts.length,
  };

  const notifications = inventoryAlerts.length + openMaintenance.length;
  const roomTypeOptions = Array.from(new Set(baseRooms.map((room) => room.type)));
  const latestReservation =
    reservations.find((reservation) => reservation.id === latestReservationId) ?? null;

  function loginAs(role, overrides = {}) {
    const demoUser = demoUsers.find((user) => user.role === role);
    setSession({
      role,
      name: overrides.name ?? demoUser?.name ?? roleLabels[role],
      guestId: overrides.guestId ?? demoUser?.guestId ?? null,
    });
  }

  function logout() {
    setSession(null);
    setSearchQuery("");
  }

  function createBooking({ guestId, roomId, checkIn, checkOut, adults, notes }) {
    const guest = guestProfiles.find((profile) => profile.id === guestId);
    const room = baseRooms.find((entry) => entry.id === roomId);

    if (!guest || !room) {
      return null;
    }

    const reservation = {
      id: `res-${Date.now()}`,
      guestId,
      guestName: guest.name,
      roomId,
      roomNumber: room.number,
      roomType: room.type,
      checkIn,
      checkOut,
      status: "confirmed",
      paymentStatus: "authorized",
      adults,
      total: room.rate * nightsBetween(checkIn, checkOut),
      source: session?.role === "guest" ? "Guest Portal" : "Front Desk",
      createdAt: new Date().toISOString(),
      notes,
    };

    setReservations((current) => [reservation, ...current]);
    setLatestReservationId(reservation.id);
    return reservation;
  }

  function updateReservationStatus(reservationId, status) {
    const reservation = reservations.find((entry) => entry.id === reservationId);

    setReservations((current) =>
      current.map((entry) => {
        if (entry.id !== reservationId) {
          return entry;
        }

        return {
          ...entry,
          status,
          paymentStatus:
            status === "checked-in"
              ? "captured"
              : status === "cancelled"
                ? "refunded"
                : entry.paymentStatus,
        };
      }),
    );

    if (status === "checked-out" && reservation) {
      const hasDepartureReset = housekeepingTasks.some(
        (task) =>
          task.roomId === reservation.roomId &&
          task.taskType === "Departure reset" &&
          task.status !== "completed",
      );

      if (!hasDepartureReset) {
        setHousekeepingTasks((current) => [
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
          ...current,
        ]);
      }
    }
  }

  function updateReservation(reservationId, changes) {
    setReservations((current) =>
      current.map((entry) =>
        entry.id === reservationId
          ? {
              ...entry,
              ...changes,
            }
          : entry,
      ),
    );
  }

  function updateHousekeepingTask(taskId, status) {
    setHousekeepingTasks((current) =>
      current.map((task) =>
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
    );
  }

  function createMaintenanceRequest({ roomId, issueType, issue, priority}) {
    const room = baseRooms.find((entry) => entry.id === roomId);

    if (!room) {
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
      assignedTo: "Unassigned",
      reportedAt: "Just now",
      submittedDate: businessDate,
    };

    setMaintenanceRequests((current) => [request, ...current]);

    return request;
  }

  function updateMaintenanceRequest(requestId, status) {
    setMaintenanceRequests((current) =>
      current.map((request) =>
        request.id === requestId ? { ...request, status } : request,
      ),
    );
  }

  function restockInventoryItem(itemId) {
    setInventoryItems((current) =>
      current.map((item) =>
        item.id === itemId ? { ...item, stock: item.reorderLevel + 25 } : item,
      ),
    );
  }

  function getReservationById(reservationId) {
    return reservations.find((reservation) => reservation.id === reservationId) ?? null;
  }

  const value = {
    businessDate,
    businessDateLabel: formatLongDate(businessDate),
    currentGuest,
    getReservationById,
    guestProfiles,
    guestReservations,
    housekeepingTasks,
    hotels,
    inventoryAlerts,
    inventoryItems,
    latestReservation,
    latestReservationId,
    loginAs,
    logout,
    maintenanceRequests,
    metrics,
    notifications,
    reservations,
    roleLabels,
    roomTypeOptions,
    roomViews,
    searchQuery,
    selectedHotelId,
    session,
    setLatestReservationId,
    setSearchQuery,
    setSelectedHotelId,
    createBooking,
    createMaintenanceRequest,
    updateHousekeepingTask,
    updateMaintenanceRequest,
    updateReservation,
    updateReservationStatus,
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
