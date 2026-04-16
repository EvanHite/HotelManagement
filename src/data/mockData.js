export const businessDate = "2026-04-15";

export const hotels = [
  {
    id: "milledgeville-grand",
    name: "Milledgeville Grand",
    location: "Milledgeville, Georgia",
  },
  {
    id: "lakeview-suites",
    name: "Lakeview Suites",
    location: "Lake Sinclair, Georgia",
  },
];

export const demoUsers = [
  {
    role: "guest",
    name: "Ava Bennett",
    title: "Returning guest",
    guestId: "guest-1",
  },
  {
    role: "reception",
    name: "Jordan Lee",
    title: "Front desk",
  },
  {
    role: "housekeeping",
    name: "Marisol Diaz",
    title: "Housekeeping lead",
  },
  {
    role: "maintenance",
    name: "Theo Grant",
    title: "Maintenance supervisor",
  },
  {
    role: "management",
    name: "Elena Foster",
    title: "General manager",
  },
];

export const guestProfiles = [
  {
    id: "guest-1",
    name: "Ava Bennett",
    email: "ava.bennett@example.com",
    phone: "(478) 555-0123",
    loyaltyTier: "Gold",
    company: "Southland Advisory",
    notes: "Prefers a quiet room and a late check-out when available.",
  },
  {
    id: "guest-2",
    name: "Marcus Reed",
    email: "marcus.reed@example.com",
    phone: "(478) 555-0118",
    loyaltyTier: "Silver",
    company: "Reed Logistics",
    notes: "Usually books early breakfast and meeting room access.",
  },
  {
    id: "guest-3",
    name: "Priya Sharma",
    email: "priya.sharma@example.com",
    phone: "(478) 555-0147",
    loyaltyTier: "Platinum",
    company: "Mercer Health",
    notes: "Requests allergy-safe toiletries and digital folios.",
  },
  {
    id: "guest-4",
    name: "Lauren Cole",
    email: "lauren.cole@example.com",
    phone: "(478) 555-0179",
    loyaltyTier: "Standard",
    company: "Personal Travel",
    notes: "Weekend stays, usually books double queen rooms.",
  },
  {
    id: "guest-5",
    name: "Devon Ellis",
    email: "devon.ellis@example.com",
    phone: "(478) 555-0134",
    loyaltyTier: "Gold",
    company: "Peachtree Events",
    notes: "Needs early arrival support during event weeks.",
  },
  {
    id: "guest-6",
    name: "Sofia Martinez",
    email: "sofia.martinez@example.com",
    phone: "(478) 555-0161",
    loyaltyTier: "Silver",
    company: "Personal Travel",
    notes: "Often uses room service and valet laundry.",
  },
];

export const baseRooms = [
  {
    id: "room-101",
    number: "101",
    type: "Deluxe King",
    floor: 1,
    beds: 1,
    rate: 189,
    capacity: 2,
    notes: "Courtyard-facing room with workspace and lounge chair.",
  },
  {
    id: "room-102",
    number: "102",
    type: "Double Queen",
    floor: 1,
    beds: 2,
    rate: 209,
    capacity: 4,
    notes: "Popular for family bookings and event weekends.",
  },
  {
    id: "room-103",
    number: "103",
    type: "Standard King",
    floor: 1,
    beds: 1,
    rate: 169,
    capacity: 2,
    notes: "Compact room near lobby for late arrivals.",
  },
  {
    id: "room-201",
    number: "201",
    type: "Executive Suite",
    floor: 2,
    beds: 1,
    rate: 289,
    capacity: 3,
    notes: "Separate sitting area, extended-stay friendly layout.",
  },
  {
    id: "room-202",
    number: "202",
    type: "Courtyard Queen",
    floor: 2,
    beds: 1,
    rate: 199,
    capacity: 2,
    notes: "Near elevator, often used for quick corporate stays.",
  },
  {
    id: "room-203",
    number: "203",
    type: "Standard Double",
    floor: 2,
    beds: 2,
    rate: 179,
    capacity: 4,
    notes: "Flexible layout for short stays and small groups.",
  },
  {
    id: "room-301",
    number: "301",
    type: "Signature King",
    floor: 3,
    beds: 1,
    rate: 239,
    capacity: 2,
    notes: "Top-floor room with preferred guest demand.",
  },
  {
    id: "room-302",
    number: "302",
    type: "Double Queen",
    floor: 3,
    beds: 2,
    rate: 214,
    capacity: 4,
    notes: "Ideal for conference guests with late departure requests.",
  },
  {
    id: "room-303",
    number: "303",
    type: "Accessible King",
    floor: 3,
    beds: 1,
    rate: 189,
    capacity: 2,
    notes: "Accessible shower, wider turning radius, near lift.",
  },
];

export const initialReservations = [
  {
    id: "res-1001",
    guestId: "guest-1",
    guestName: "Ava Bennett",
    roomId: "room-301",
    roomNumber: "301",
    roomType: "Signature King",
    checkIn: "2026-04-16",
    checkOut: "2026-04-19",
    status: "confirmed",
    paymentStatus: "authorized",
    adults: 2,
    total: 717,
    source: "Guest Portal",
    createdAt: "2026-04-10T09:20:00Z",
    notes: "Requested quiet floor and digital receipt.",
  },
  {
    id: "res-1002",
    guestId: "guest-2",
    guestName: "Marcus Reed",
    roomId: "room-102",
    roomNumber: "102",
    roomType: "Double Queen",
    checkIn: "2026-04-15",
    checkOut: "2026-04-17",
    status: "checked-in",
    paymentStatus: "captured",
    adults: 2,
    total: 418,
    source: "Front Desk",
    createdAt: "2026-04-11T14:50:00Z",
    notes: "Needs breakfast vouchers for two.",
  },
  {
    id: "res-1003",
    guestId: "guest-3",
    guestName: "Priya Sharma",
    roomId: "room-201",
    roomNumber: "201",
    roomType: "Executive Suite",
    checkIn: "2026-04-15",
    checkOut: "2026-04-18",
    status: "checked-in",
    paymentStatus: "captured",
    adults: 1,
    total: 867,
    source: "Corporate",
    createdAt: "2026-04-08T12:15:00Z",
    notes: "Allergy-safe toiletries requested before arrival.",
  },
  {
    id: "res-1004",
    guestId: "guest-4",
    guestName: "Lauren Cole",
    roomId: "room-103",
    roomNumber: "103",
    roomType: "Standard King",
    checkIn: "2026-04-18",
    checkOut: "2026-04-20",
    status: "pending",
    paymentStatus: "pending",
    adults: 2,
    total: 338,
    source: "Guest Portal",
    createdAt: "2026-04-14T17:32:00Z",
    notes: "Awaiting card authorization.",
  },
  {
    id: "res-1005",
    guestId: "guest-5",
    guestName: "Devon Ellis",
    roomId: "room-302",
    roomNumber: "302",
    roomType: "Double Queen",
    checkIn: "2026-04-13",
    checkOut: "2026-04-15",
    status: "checked-out",
    paymentStatus: "captured",
    adults: 3,
    total: 428,
    source: "Front Desk",
    createdAt: "2026-04-06T10:04:00Z",
    notes: "Conference block booking.",
  },
  {
    id: "res-1006",
    guestId: "guest-6",
    guestName: "Sofia Martinez",
    roomId: "room-202",
    roomNumber: "202",
    roomType: "Courtyard Queen",
    checkIn: "2026-04-12",
    checkOut: "2026-04-14",
    status: "checked-out",
    paymentStatus: "captured",
    adults: 1,
    total: 398,
    source: "Online Travel",
    createdAt: "2026-04-03T16:20:00Z",
    notes: "Requested laundry turnaround same day.",
  },
];

export const initialHousekeepingTasks = [
  {
    id: "hk-201",
    roomId: "room-302",
    roomNumber: "302",
    taskType: "Departure reset",
    urgency: "high",
    status: "queued",
    assignedTo: "Marisol Diaz",
    dueBy: "11:30",
    readiness: "Blocked",
    suppliesNeeded: ["Fresh linens", "Bath towels"],
  },
  {
    id: "hk-202",
    roomId: "room-203",
    roomNumber: "203",
    taskType: "Towel restock",
    urgency: "standard",
    status: "in-progress",
    assignedTo: "Nina Alvarez",
    dueBy: "13:00",
    readiness: "Partial",
    suppliesNeeded: ["Bath towels", "Hand towels"],
  },
  {
    id: "hk-203",
    roomId: "room-201",
    roomNumber: "201",
    taskType: "Allergy-safe amenities setup",
    urgency: "high",
    status: "queued",
    assignedTo: "Marisol Diaz",
    dueBy: "10:45",
    readiness: "Blocked",
    suppliesNeeded: ["Hypoallergenic toiletries"],
  },
  {
    id: "hk-204",
    roomId: "room-101",
    roomNumber: "101",
    taskType: "Light touch service",
    urgency: "standard",
    status: "completed",
    assignedTo: "Lana Brooks",
    dueBy: "09:30",
    readiness: "Ready",
    suppliesNeeded: [],
  },
];

export const initialMaintenanceRequests = [
  {
    id: "mx-101",
    roomId: "room-202",
    roomNumber: "202",
    location: "Guest room",
    issueType: "Plumbing",
    issue: "Bathroom sink drainage is slow",
    priority: "high",
    status: "open",
    assignedTo: "Theo Grant",
    reportedAt: "08:20",
    submittedDate: "2026-04-15",
  },
  {
    id: "mx-102",
    roomId: "room-303",
    roomNumber: "303",
    location: "Guest room",
    issueType: "HVAC",
    issue: "Thermostat calibration check",
    priority: "medium",
    status: "in-progress",
    assignedTo: "Darius Mills",
    reportedAt: "09:05",
    submittedDate: "2026-04-15",
  },
  {
    id: "mx-103",
    roomId: "room-103",
    roomNumber: "103",
    location: "Guest room",
    issueType: "Electronics",
    issue: "Television input reset",
    priority: "medium",
    status: "resolved",
    assignedTo: "Theo Grant",
    reportedAt: "Yesterday",
    submittedDate: "2026-04-14",
  },
];

export const initialInventoryItems = [
  {
    id: "inv-101",
    category: "Linens",
    name: "Bath towels",
    stock: 42,
    reorderLevel: 50,
    unit: "pieces",
    vendor: "Peachtree Linens",
  },
  {
    id: "inv-102",
    category: "Toiletries",
    name: "Shampoo bottles",
    stock: 78,
    reorderLevel: 60,
    unit: "units",
    vendor: "Southern Supply Co.",
  },
  {
    id: "inv-103",
    category: "Toiletries",
    name: "Conditioner bottles",
    stock: 51,
    reorderLevel: 55,
    unit: "units",
    vendor: "Southern Supply Co.",
  },
  {
    id: "inv-104",
    category: "Housekeeping",
    name: "Glass cleaner",
    stock: 12,
    reorderLevel: 15,
    unit: "bottles",
    vendor: "Civic Janitorial",
  },
  {
    id: "inv-105",
    category: "Food Service",
    name: "Breakfast coffee pods",
    stock: 120,
    reorderLevel: 80,
    unit: "pods",
    vendor: "Blue Oak Roasters",
  },
  {
    id: "inv-106",
    category: "Front Desk",
    name: "Key cards",
    stock: 18,
    reorderLevel: 25,
    unit: "cards",
    vendor: "Access Secure",
  },
];

export const amenities = [
  {
    name: "Complimentary breakfast",
    detail: "Served daily from 6:30 AM to 10:00 AM in the lobby lounge.",
  },
  {
    name: "Fiber Wi-Fi",
    detail: "Property-wide connectivity with guest and conference access.",
  },
  {
    name: "Fitness studio",
    detail: "Open 24 hours with card access and fresh towel pickup.",
  },
  {
    name: "Room service",
    detail: "Available from 6:00 AM to 10:00 PM with express delivery windows.",
  },
  {
    name: "Meeting room access",
    detail: "Bookable through the front desk for business or private events.",
  },
  {
    name: "Same-day laundry",
    detail: "Submit before 10:00 AM for evening delivery.",
  },
];

export const reportSnapshots = [
  {
    label: "Arrivals today",
    value: 9,
  },
  {
    label: "Departures today",
    value: 7,
  },
  {
    label: "Average daily rate",
    value: "$211",
  },
  {
    label: "Housekeeping completion",
    value: "76%",
  },
];

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
