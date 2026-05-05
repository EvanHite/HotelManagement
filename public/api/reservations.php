<?php
require __DIR__ . "/db.php";

try {
    if ($_SERVER["REQUEST_METHOD"] !== "POST") {
        json_response(["error" => "Method not allowed"], 405);
    }

    $data = request_json();
    $action = $data["action"] ?? "";

    switch ($action) {
        case "create":
            create_reservation($data);
            break;
        case "status":
            update_reservation_status($data);
            break;
        case "notes":
            update_reservation_notes($data);
            break;
        default:
            json_response(["error" => "Unknown reservation action"], 422);
    }
} catch (Throwable $error) {
    handle_api_error($error);
}

// Create a new guest or front-desk reservation.
function create_reservation($data)
{
    $guest = fetch_one("SELECT id, name FROM guest_profiles WHERE id = ?", [$data["guestId"] ?? ""]);
    $room = fetch_one("SELECT id, number, type, rate FROM rooms WHERE id = ?", [$data["roomId"] ?? ""]);

    if (!$guest || !$room) {
        json_response(["error" => "Guest or room not found"], 422);
    }

    $checkIn = $data["checkIn"] ?? "";
    $checkOut = $data["checkOut"] ?? "";
    $nights = max(1, (strtotime($checkOut) - strtotime($checkIn)) / 86400);
    $id = "res-" . time();
    $total = (int) $room["rate"] * (int) $nights;
    $source = $data["source"] ?? "Guest Portal";

    run_query(
        "INSERT INTO reservations
            (id, guest_id, guest_name, room_id, room_number, room_type, check_in, check_out, status,
             payment_status, adults, total, source, created_at, notes)
         VALUES
            (?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', 'authorized', ?, ?, ?, NOW(), ?)",
        [
            $id,
            $guest["id"],
            $guest["name"],
            $room["id"],
            $room["number"],
            $room["type"],
            $checkIn,
            $checkOut,
            (int) ($data["adults"] ?? 1),
            $total,
            $source,
            $data["notes"] ?? "",
        ]
    );

    $reservation = fetch_reservation($id);
    json_response(["reservation" => $reservation], 201);
}

// Change reservation state, such as check-in, check-out, or cancelled.
function update_reservation_status($data)
{
    $reservationId = $data["reservationId"] ?? "";
    $status = $data["status"] ?? "";
    $allowed = ["pending", "confirmed", "checked-in", "checked-out", "cancelled"];

    if (!$reservationId || !in_array($status, $allowed, true)) {
        json_response(["error" => "Invalid reservation status"], 422);
    }

    $reservation = fetch_one("SELECT * FROM reservations WHERE id = ?", [$reservationId]);

    if (!$reservation) {
        json_response(["error" => "Reservation not found"], 404);
    }

    $paymentStatus = $reservation["payment_status"];
    if ($status === "checked-in") {
        $paymentStatus = "captured";
    } elseif ($status === "cancelled") {
        $paymentStatus = "refunded";
    }

    run_query(
        "UPDATE reservations SET status = ?, payment_status = ? WHERE id = ?",
        [$status, $paymentStatus, $reservationId]
    );

    if ($status === "checked-out") {
        add_departure_task_if_needed($reservation);
    }

    json_response(["ok" => true]);
}

// Save front-desk notes from the reservation drawer.
function update_reservation_notes($data)
{
    $reservationId = $data["reservationId"] ?? "";

    if (!$reservationId) {
        json_response(["error" => "Reservation is required"], 422);
    }

    run_query("UPDATE reservations SET notes = ? WHERE id = ?", [$data["notes"] ?? "", $reservationId]);
    json_response(["ok" => true]);
}

// Checking out creates a housekeeping turnover task when one does not already exist.
function add_departure_task_if_needed($reservation)
{
    $existingTask = fetch_one(
        "SELECT id FROM housekeeping_tasks WHERE room_id = ? AND task_type = 'Departure reset' AND status <> 'completed'",
        [$reservation["room_id"]]
    );

    if ($existingTask) {
        return;
    }

    run_query(
        "INSERT INTO housekeeping_tasks
            (id, room_id, room_number, task_type, urgency, status, assigned_to, due_by, readiness, supplies_needed)
         VALUES (?, ?, ?, 'Departure reset', 'high', 'queued', 'Marisol Diaz', '12:00', 'Blocked', ?)",
        [
            "hk-" . time(),
            $reservation["room_id"],
            $reservation["room_number"],
            json_encode(["Fresh linens", "Bath towels"]),
        ]
    );
}

// Return a reservation using the same field names React expects.
function fetch_reservation($id)
{
    return fetch_one(
        "SELECT id, guest_id AS guestId, guest_name AS guestName, room_id AS roomId, room_number AS roomNumber,
            room_type AS roomType, check_in AS checkIn, check_out AS checkOut, status,
            payment_status AS paymentStatus, adults, total, source, created_at AS createdAt, notes
         FROM reservations WHERE id = ?",
        [$id]
    );
}
