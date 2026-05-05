<?php
require __DIR__ . "/db.php";

try {
    $hotels = fetch_all("SELECT id, name, location FROM hotels ORDER BY name");
    $settingsRows = fetch_all("SELECT setting_key AS settingKey, setting_value AS settingValue FROM app_settings");
    $settings = settings_from_rows($settingsRows);
    $amenities = fetch_all(
        "SELECT id, name, detail, amenity_group AS amenityGroup
         FROM amenities
         ORDER BY sort_order, name"
    );
    $guestProfiles = fetch_all(
        "SELECT id, name, email, phone, loyalty_tier AS loyaltyTier, company, notes FROM guest_profiles ORDER BY name"
    );
    $baseRooms = fetch_all(
        "SELECT id, number, type, floor, beds, rate, capacity, notes FROM rooms ORDER BY number"
    );
    $initialReservations = fetch_all(
        "SELECT id, guest_id AS guestId, guest_name AS guestName, room_id AS roomId, room_number AS roomNumber,
            room_type AS roomType, check_in AS checkIn, check_out AS checkOut, status, payment_status AS paymentStatus,
            payment_method AS paymentMethod, amount_paid AS amountPaid, balance_due AS balanceDue,
            authorized_amount AS authorizedAmount, payment_history AS paymentHistory,
            adults, total, source, created_at AS createdAt, notes
         FROM reservations
         ORDER BY created_at DESC, id DESC"
    );
    $initialReservations = array_map("decode_reservation_json", $initialReservations);
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
        "businessDate" => $settings["businessDate"] ?? date("Y-m-d"),
        "hotels" => $hotels,
        "settings" => $settings,
        "amenities" => $amenities,
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

function settings_from_rows($rows)
{
    $settings = [];

    foreach ($rows as $row) {
        $key = $row["settingKey"];
        $value = $row["settingValue"];

        if (in_array($key, ["arrivalAlerts", "inventoryAlerts", "maintenanceAlerts"], true)) {
            $settings[$key] = $value === "1";
        } else {
            $settings[$key] = $value;
        }
    }

    return $settings;
}

function decode_reservation_json($row)
{
    $row = decode_json_column($row, "paymentHistory");

    if (!isset($row["paymentMethod"]) || $row["paymentMethod"] === null || $row["paymentMethod"] === "") {
        $row["paymentMethod"] = null;
        return $row;
    }

    $decoded = json_decode($row["paymentMethod"], true);
    $row["paymentMethod"] = is_array($decoded) ? $decoded : null;
    return $row;
}

function decode_supplies_needed($row)
{
    return decode_json_column($row, "suppliesNeeded");
}
