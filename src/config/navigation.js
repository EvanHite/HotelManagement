export const staffNavigation = [
  {
    label: "Overview",
    path: "/app/overview",
    icon: "overview",
    roles: ["reception", "housekeeping", "maintenance", "management"],
  },
  {
    label: "Front Desk",
    path: "/app/front-desk",
    icon: "frontDesk",
    roles: ["reception", "housekeeping", "maintenance", "management"],
  },
  {
    label: "Operations",
    path: "/operations",
    icon: "operations",
    roles: ["housekeeping", "maintenance", "management"],
  },
  {
    label: "Reports",
    path: "/app/reports",
    icon: "reports",
    roles: ["management"],
  },
  {
    label: "Settings",
    path: "/app/settings",
    icon: "settings",
    roles: ["management"],
  },
];

export const guestNavigation = [
  {
    label: "Book",
    path: "/app/book",
    icon: "book",
    roles: ["guest"],
  },
  {
    label: "Amenities",
    path: "/app/amenities",
    icon: "amenities",
    roles: ["guest"],
  },
  {
    label: "Stay History",
    path: "/app/my-stays",
    icon: "stays",
    roles: ["guest"],
  },
  {
    label: "Check-In",
    path: "/app/check-in",
    icon: "checkIn",
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
