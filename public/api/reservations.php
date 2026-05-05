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
        case "details":
            update_reservation_details($data);
            break;
        case "notes":
            update_reservation_notes($data);
            break;
        case "payment":
            update_reservation_payment($data);
            break;
        default:
            json_response(["error" => "Unknown reservation action"], 422);
    }
} catch (Throwable $error) {
    handle_api_error($error);
}

function create_reservation($data)
{
    $user = require_auth(["guest", "reception", "management"]);
    $guest = fetch_one("SELECT id, name FROM guest_profiles WHERE id = ?", [$data["guestId"] ?? ""]);
    $room = fetch_one("SELECT id, number, type, rate, capacity FROM rooms WHERE id = ?", [$data["roomId"] ?? ""]);

    if (!$guest || !$room) {
        json_response(["error" => "Guest or room not found"], 422);
    }

    if ($user["role"] === "guest" && ($user["guestId"] ?? "") !== $guest["id"]) {
        json_response(["error" => "You can only book for your own account"], 403);
    }

    $checkIn = $data["checkIn"] ?? "";
    $checkOut = $data["checkOut"] ?? "";
    $adults = (int) ($data["adults"] ?? 1);

    if (!is_valid_date_range($checkIn, $checkOut)) {
        json_response(["error" => "Check-out must be after check-in"], 422);
    }

    if ($adults < 1 || $adults > (int) $room["capacity"]) {
        json_response(["error" => "Guest count exceeds room capacity"], 422);
    }

    if (!room_is_available($room["id"], $checkIn, $checkOut)) {
        json_response(["error" => "That room is unavailable for those dates"], 422);
    }

    $nights = max(1, (strtotime($checkOut) - strtotime($checkIn)) / 86400);
    $id = $data["id"] ?? ("res-" . time());
    $total = (int) $room["rate"] * (int) $nights;
    $paymentStatus = $data["paymentStatus"] ?? "pending";
    $amountPaid = (int) ($data["amountPaid"] ?? 0);
    $authorizedAmount = (int) ($data["authorizedAmount"] ?? 0);
    $balanceDue = (int) ($data["balanceDue"] ?? max(0, $total - $amountPaid));
    $paymentMethod = $data["paymentMethod"] ?? null;

    if (!valid_payment_state($paymentStatus, $paymentMethod, $amountPaid, $balanceDue, $authorizedAmount)) {
        json_response(["error" => "Invalid payment details"], 422);
    }

    run_query(
        "INSERT INTO reservations
            (id, guest_id, guest_name, room_id, room_number, room_type, check_in, check_out, status,
             payment_status, payment_method, amount_paid, balance_due, authorized_amount, payment_history,
             adults, total, source, created_at, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
            $id,
            $guest["id"],
            $guest["name"],
            $room["id"],
            $room["number"],
            $room["type"],
            $checkIn,
            $checkOut,
            $data["status"] ?? "confirmed",
            $paymentStatus,
            encode_nullable_json($paymentMethod),
            $amountPaid,
            $balanceDue,
            $authorizedAmount,
            json_encode($data["paymentHistory"] ?? []),
            $adults,
            $total,
            $data["source"] ?? "Guest Portal",
            format_created_at($data["createdAt"] ?? null),
            $data["notes"] ?? "",
        ]
    );

    json_response(["reservation" => fetch_reservation($id)], 201);
}

function update_reservation_status($data)
{
    $user = require_auth(["guest", "reception", "management"]);
    $reservationId = $data["reservationId"] ?? "";
    $status = $data["status"] ?? "";
    $allowed = ["pending", "confirmed", "checked-in", "checked-out", "cancelled", "no-show"];

    if (!$reservationId || !in_array($status, $allowed, true)) {
        json_response(["error" => "Invalid reservation status"], 422);
    }

    $reservation = fetch_one("SELECT * FROM reservations WHERE id = ?", [$reservationId]);

    if (!$reservation) {
        json_response(["error" => "Reservation not found"], 404);
    }

    if ($user["role"] === "guest") {
        if (($user["guestId"] ?? "") !== $reservation["guest_id"]) {
            json_response(["error" => "You can only update your own reservation"], 403);
        }

        if (!in_array($status, ["checked-in", "checked-out", "cancelled"], true)) {
            json_response(["error" => "Guests cannot set that reservation status"], 403);
        }
    }

    $paymentStatus = $data["paymentStatus"] ?? $reservation["payment_status"];
    $amountPaid = (int) ($data["amountPaid"] ?? $reservation["amount_paid"]);
    $authorizedAmount = (int) ($data["authorizedAmount"] ?? $reservation["authorized_amount"]);
    $balanceDue = (int) ($data["balanceDue"] ?? $reservation["balance_due"]);
    $paymentHistory = $data["paymentHistory"] ?? json_decode($reservation["payment_history"] ?: "[]", true);

    run_query(
        "UPDATE reservations
         SET status = ?, payment_status = ?, amount_paid = ?, authorized_amount = ?, balance_due = ?, payment_history = ?
         WHERE id = ?",
        [$status, $paymentStatus, $amountPaid, $authorizedAmount, $balanceDue, json_encode($paymentHistory), $reservationId]
    );

    $warning = null;

    if ($status === "checked-out") {
        try {
            add_departure_task_if_needed($reservation);
        } catch (Throwable $error) {
            $warning = "Reservation was checked out, but the housekeeping task could not be created.";
        }
    }

    json_response([
        "ok" => true,
        "warning" => $warning,
    ]);
}

function update_reservation_details($data)
{
    require_auth(["reception", "management"]);
    $reservationId = $data["reservationId"] ?? "";
    $room = fetch_one("SELECT id, number, type, rate, capacity FROM rooms WHERE id = ?", [$data["roomId"] ?? ""]);

    if (!$reservationId || !$room) {
        json_response(["error" => "Reservation or room not found"], 422);
    }

    $checkIn = $data["checkIn"] ?? "";
    $checkOut = $data["checkOut"] ?? "";
    $adults = (int) ($data["adults"] ?? 1);

    if (!is_valid_date_range($checkIn, $checkOut)) {
        json_response(["error" => "Check-out must be after check-in"], 422);
    }

    if ($adults < 1 || $adults > (int) $room["capacity"]) {
        json_response(["error" => "Guest count exceeds room capacity"], 422);
    }

    if (!room_is_available($room["id"], $checkIn, $checkOut, $reservationId)) {
        json_response(["error" => "That room is unavailable for those dates"], 422);
    }

    $nights = max(1, (strtotime($checkOut) - strtotime($checkIn)) / 86400);
    $total = (int) $room["rate"] * (int) $nights;
    $amountPaid = (int) ($data["amountPaid"] ?? 0);

    run_query(
        "UPDATE reservations
         SET room_id = ?, room_number = ?, room_type = ?, check_in = ?, check_out = ?, adults = ?, total = ?, balance_due = ?, notes = ?
         WHERE id = ?",
        [
            $room["id"],
            $room["number"],
            $room["type"],
            $checkIn,
            $checkOut,
            $adults,
            $total,
            max(0, $total - $amountPaid),
            $data["notes"] ?? "",
            $reservationId,
        ]
    );

    json_response(["ok" => true]);
}

function update_reservation_notes($data)
{
    require_auth(["reception", "management"]);
    run_query("UPDATE reservations SET notes = ? WHERE id = ?", [$data["notes"] ?? "", $data["reservationId"] ?? ""]);
    json_response(["ok" => true]);
}

function update_reservation_payment($data)
{
    require_auth(["reception", "management"]);
    $paymentStatus = $data["paymentStatus"] ?? "pending";
    $paymentMethod = $data["paymentMethod"] ?? null;
    $amountPaid = (int) ($data["amountPaid"] ?? 0);
    $balanceDue = (int) ($data["balanceDue"] ?? 0);
    $authorizedAmount = (int) ($data["authorizedAmount"] ?? 0);

    if (!valid_payment_state($paymentStatus, $paymentMethod, $amountPaid, $balanceDue, $authorizedAmount)) {
        json_response(["error" => "Invalid payment details"], 422);
    }

    run_query(
        "UPDATE reservations
         SET payment_status = ?, payment_method = ?, amount_paid = ?, balance_due = ?, authorized_amount = ?, payment_history = ?
         WHERE id = ?",
        [
            $paymentStatus,
            encode_nullable_json($paymentMethod),
            $amountPaid,
            $balanceDue,
            $authorizedAmount,
            json_encode($data["paymentHistory"] ?? []),
            $data["reservationId"] ?? "",
        ]
    );

    json_response(["ok" => true]);
}

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
            "hk-" . time() . "-" . random_int(1000, 9999),
            $reservation["room_id"],
            $reservation["room_number"],
            json_encode(["Fresh linens", "Bath towels"]),
        ]
    );
}

function fetch_reservation($id)
{
    $reservation = fetch_one(
        "SELECT id, guest_id AS guestId, guest_name AS guestName, room_id AS roomId, room_number AS roomNumber,
            room_type AS roomType, check_in AS checkIn, check_out AS checkOut, status,
            payment_status AS paymentStatus, payment_method AS paymentMethod, amount_paid AS amountPaid,
            balance_due AS balanceDue, authorized_amount AS authorizedAmount, payment_history AS paymentHistory,
            adults, total, source, created_at AS createdAt, notes
         FROM reservations WHERE id = ?",
        [$id]
    );

    if (!$reservation) {
        return null;
    }

    $reservation = decode_json_column($reservation, "paymentHistory");
    $reservation["paymentMethod"] = $reservation["paymentMethod"] ? json_decode($reservation["paymentMethod"], true) : null;
    return $reservation;
}

function encode_nullable_json($value)
{
    return $value ? json_encode($value) : null;
}

function room_is_available($roomId, $checkIn, $checkOut, $ignoredReservationId = "")
{
    $conflict = fetch_one(
        "SELECT id FROM reservations
         WHERE room_id = ?
           AND id <> ?
           AND status NOT IN ('cancelled', 'checked-out', 'no-show')
           AND check_in < ?
           AND check_out > ?
         LIMIT 1",
        [$roomId, $ignoredReservationId, $checkOut, $checkIn]
    );

    return !$conflict;
}

function valid_payment_state($paymentStatus, $paymentMethod, $amountPaid, $balanceDue, $authorizedAmount)
{
    $allowed = ["pending", "card-on-file", "authorized", "captured", "prepaid", "partial", "refunded", "failed"];

    if (!in_array($paymentStatus, $allowed, true)) {
        return false;
    }

    if (!non_negative_number($amountPaid) || !non_negative_number($balanceDue) || !non_negative_number($authorizedAmount)) {
        return false;
    }

    if (!$paymentMethod) {
        return true;
    }

    $last4 = $paymentMethod["last4"] ?? "";
    $expiry = $paymentMethod["expiry"] ?? "";
    $cardholder = trim($paymentMethod["cardholderName"] ?? "");

    return preg_match("/^\d{4}$/", $last4) && preg_match("/^\d{2}\/\d{2}$/", $expiry) && $cardholder !== "";
}

function format_created_at($value)
{
    if (!$value) {
        return date("Y-m-d H:i:s");
    }

    return date("Y-m-d H:i:s", strtotime($value));
}
