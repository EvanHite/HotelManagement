export const staffNavigation = [
  {
    label: "Overview",
    path: "/app/overview",
    roles: ["reception", "housekeeping", "maintenance", "management"],
  },
  {
    label: "Reservations",
    path: "/app/reservations",
    roles: ["reception", "management"],
  },
  {
    label: "Guests",
    path: "/app/guests",
    roles: ["reception", "management"],
  },
  {
    label: "Rooms",
    path: "/app/rooms",
    roles: ["reception", "housekeeping", "maintenance", "management"],
  },
  {
    label: "Housekeeping",
    path: "/app/housekeeping",
    roles: ["housekeeping", "management"],
  },
  {
    label: "Maintenance",
    path: "/app/maintenance",
    roles: ["maintenance", "management"],
  },
  {
    label: "Inventory",
    path: "/app/inventory",
    roles: ["housekeeping", "maintenance", "management"],
  },
  {
    label: "Reports",
    path: "/app/reports",
    roles: ["management"],
  },
  {
    label: "Settings",
    path: "/app/settings",
    roles: ["management"],
  },
];

export const guestNavigation = [
  {
    label: "Book",
    path: "/app/book",
    roles: ["guest"],
  },
  {
    label: "Amenities",
    path: "/app/amenities",
    roles: ["guest"],
  },
  {
    label: "Stay History",
    path: "/app/my-stays",
    roles: ["guest"],
  },
  {
    label: "Check-In",
    path: "/app/check-in",
    roles: ["guest"],
  },
];

export function getNavigationForRole(role) {
  if (role === "guest") {
    return guestNavigation;
  }

  return staffNavigation.filter((item) => item.roles.includes(role));
}

export function getDefaultRoute(role) {
  const navigation = getNavigationForRole(role);
  return navigation[0]?.path ?? "/";
}
