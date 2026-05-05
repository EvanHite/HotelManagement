export const roleLabels = {
  guest: "Guest",
  reception: "Reception",
  housekeeping: "Housekeeping",
  maintenance: "Maintenance",
  management: "Management",
};

export function buildRoomViews(baseRooms, reservations, housekeepingTasks, maintenanceRequests) {
  return baseRooms.map((room) => {
    const activeReservation = reservations.find(
      (reservation) =>
        reservation.roomId === room.id &&
        ["confirmed", "checked-in", "pending"].includes(reservation.status),
    );
    const openHousekeeping = housekeepingTasks.filter(
      (task) => task.roomId === room.id && task.status !== "completed",
    );
    const openMaintenance = maintenanceRequests.filter(
      (request) => request.roomId === room.id && request.status !== "resolved",
    );

    let displayStatus = "available";
    if (openMaintenance.length) {
      displayStatus = "maintenance";
    } else if (openHousekeeping.length) {
      displayStatus = "cleaning";
    } else if (activeReservation?.status === "checked-in") {
      displayStatus = "occupied";
    }

    return {
      ...room,
      displayStatus,
      activeReservation,
      housekeepingState: openHousekeeping[0]?.taskType ?? "Ready",
      maintenanceState: openMaintenance[0]?.status ?? "Clear",
    };
  });
}
