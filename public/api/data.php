<?php
require __DIR__ . "/db.php";

try {
    $hotels = fetch_all("SELECT id, name, location FROM hotels ORDER BY name");
    $guestProfiles = fetch_all(
        "SELECT id, name, email, phone, loyalty_tier AS loyaltyTier, company, notes FROM guest_profiles ORDER BY name"
    );
    $baseRooms = fetch_all(
        "SELECT id, number, type, floor, beds, rate, capacity, notes FROM rooms ORDER BY number"
    );
    $initialReservations = fetch_all(
        "SELECT id, guest_id AS guestId, guest_name AS guestName, room_id AS roomId, room_number AS roomNumber,
            room_type AS roomType, check_in AS checkIn, check_out AS checkOut, status, payment_status AS paymentStatus,
            adults, total, source, created_at AS createdAt, notes
         FROM reservations
         ORDER BY created_at DESC, id DESC"
    );
    $housekeepingRows = fetch_all(
        "SELECT id, room_id AS roomId, room_number AS roomNumber, task_type AS taskType, urgency, status,
            assigned_to AS assignedTo, due_by AS dueBy, readiness, supplies_needed AS suppliesNeeded
         FROM housekeeping_tasks
         ORDER BY due_by, id"
    );
    $initialHousekeepingTasks = array_map("decode_supplies_needed", $housekeepingRows);
    $initialMaintenanceRequests = fetch_all(
        "SELECT id, room_id AS roomId, room_number AS roomNumber, location, issue_type AS issueType, issue,
            priority, status, assigned_to AS assignedTo, reported_at AS reportedAt, submitted_date AS submittedDate
         FROM maintenance_requests
         ORDER BY submitted_date DESC, reported_at DESC, id"
    );
    $initialInventoryItems = fetch_all(
        "SELECT id, category, name, stock, reorder_level AS reorderLevel, unit, vendor
         FROM inventory_items
         ORDER BY category, name"
    );

    json_response([
        "businessDate" => "2026-04-15",
        "hotels" => $hotels,
        "guestProfiles" => $guestProfiles,
        "baseRooms" => $baseRooms,
        "initialReservations" => $initialReservations,
        "initialHousekeepingTasks" => $initialHousekeepingTasks,
        "initialMaintenanceRequests" => $initialMaintenanceRequests,
        "initialInventoryItems" => $initialInventoryItems,
    ]);
} catch (Throwable $error) {
    handle_api_error($error);
}

function decode_supplies_needed($row)
{
    return decode_json_column($row, "suppliesNeeded");
}
