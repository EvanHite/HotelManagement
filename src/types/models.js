/**
 * @typedef {"guest" | "reception" | "housekeeping" | "maintenance" | "management"} Role
 */

/**
 * @typedef {Object} Reservation
 * @property {string} id
 * @property {string} guestId
 * @property {string} guestName
 * @property {string} roomId
 * @property {string} roomNumber
 * @property {string} roomType
 * @property {string} checkIn
 * @property {string} checkOut
 * @property {"pending" | "confirmed" | "checked-in" | "checked-out" | "cancelled"} status
 * @property {"pending" | "authorized" | "captured" | "refunded"} paymentStatus
 * @property {number} adults
 * @property {number} total
 * @property {string} source
 * @property {string} createdAt
 * @property {string} notes
 */

/**
 * @typedef {Object} Room
 * @property {string} id
 * @property {string} number
 * @property {string} type
 * @property {number} floor
 * @property {number} beds
 * @property {number} rate
 * @property {number} capacity
 * @property {string} notes
 */

/**
 * @typedef {Object} GuestProfile
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string} phone
 * @property {string} loyaltyTier
 * @property {string} company
 * @property {string} notes
 */

/**
 * @typedef {Object} HousekeepingTask
 * @property {string} id
 * @property {string} roomId
 * @property {string} roomNumber
 * @property {string} taskType
 * @property {"standard" | "high"} urgency
 * @property {"queued" | "in-progress" | "completed"} status
 * @property {string} assignedTo
 * @property {string} dueBy
 */

/**
 * @typedef {Object} MaintenanceRequest
 * @property {string} id
 * @property {string} roomId
 * @property {string} roomNumber
 * @property {string} issue
 * @property {"medium" | "high" | "critical"} priority
 * @property {"open" | "in-progress" | "resolved"} status
 * @property {string} assignedTo
 * @property {string} reportedAt
 */

/**
 * @typedef {Object} InventoryItem
 * @property {string} id
 * @property {string} category
 * @property {string} name
 * @property {number} stock
 * @property {number} reorderLevel
 * @property {string} unit
 * @property {string} vendor
 */

export {};
