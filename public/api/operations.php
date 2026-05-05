<?php
require __DIR__ . "/db.php";

try {
    if ($_SERVER["REQUEST_METHOD"] !== "POST") {
        json_response(["error" => "Method not allowed"], 405);
    }

    $data = request_json();
    $action = $data["action"] ?? "";

    switch ($action) {
        case "createHousekeeping":
            create_housekeeping_task($data);
            break;
        case "housekeepingStatus":
            update_housekeeping_status($data);
            break;
        case "createMaintenance":
            create_maintenance_request($data);
            break;
        case "maintenanceStatus":
            update_maintenance_status($data);
            break;
        case "restockInventory":
            restock_inventory($data);
            break;
        case "updateInventory":
            update_inventory($data);
            break;
        case "deleteMaintenance":
            delete_maintenance_request($data);
            break;
        case "deleteInventory":
            delete_inventory_item($data);
            break;
        case "updateSettings":
            update_settings($data);
            break;
        default:
            json_response(["error" => "Unknown operations action"], 422);
    }
} catch (Throwable $error) {
    handle_api_error($error);
}

function create_housekeeping_task($data)
{
    require_auth(["housekeeping", "management"]);
    $room = fetch_one("SELECT id, number FROM rooms WHERE id = ?", [$data["roomId"] ?? ""]);

    if (!$room || !trim($data["taskType"] ?? "") || !trim($data["assignedTo"] ?? "") || !trim($data["dueBy"] ?? "")) {
        json_response(["error" => "Room, task, assignee, and due time are required"], 422);
    }

    $urgency = $data["urgency"] ?? "standard";
    if (!in_array($urgency, ["low", "standard", "high"], true)) {
        json_response(["error" => "Invalid housekeeping urgency"], 422);
    }

    run_query(
        "INSERT INTO housekeeping_tasks
            (id, room_id, room_number, task_type, urgency, status, assigned_to, due_by, readiness, supplies_needed)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
            $data["id"] ?? ("hk-" . time()),
            $room["id"],
            $room["number"],
            trim($data["taskType"] ?? ""),
            $urgency,
            $data["status"] ?? "queued",
            trim($data["assignedTo"] ?? ""),
            trim($data["dueBy"] ?? ""),
            $data["readiness"] ?? "Blocked",
            json_encode($data["suppliesNeeded"] ?? []),
        ]
    );

    json_response(["ok" => true], 201);
}

function update_housekeeping_status($data)
{
    require_auth(["housekeeping", "management"]);
    $status = $data["status"] ?? "";
    $allowed = ["queued", "in-progress", "completed"];

    if (!in_array($status, $allowed, true)) {
        json_response(["error" => "Invalid housekeeping status"], 422);
    }

    $readiness = $status === "completed" ? "Ready" : ($status === "in-progress" ? "Partial" : "Blocked");

    run_query(
        "UPDATE housekeeping_tasks SET status = ?, readiness = ? WHERE id = ?",
        [$status, $readiness, $data["taskId"] ?? ""]
    );

    json_response(["ok" => true]);
}

function create_maintenance_request($data)
{
    require_auth(["maintenance", "management"]);
    $room = fetch_one("SELECT id, number FROM rooms WHERE id = ?", [$data["roomId"] ?? ""]);
    $issue = trim($data["issue"] ?? "");
    $issueType = trim($data["issueType"] ?? "");
    $priority = $data["priority"] ?? "medium";

    if (!$room || !$issueType || !$issue) {
        json_response(["error" => "Room, issue type, and issue are required"], 422);
    }

    if (!in_array($priority, ["low", "medium", "high"], true)) {
        json_response(["error" => "Invalid maintenance priority"], 422);
    }

    run_query(
        "INSERT INTO maintenance_requests
            (id, room_id, room_number, location, issue_type, issue, priority, status, assigned_to, reported_at, submitted_date)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
            $data["id"] ?? ("mx-" . time()),
            $room["id"],
            $room["number"],
            $data["location"] ?? "Guest room",
            $issueType,
            $issue,
            $priority,
            $data["status"] ?? "open",
            $data["assignedTo"] ?? "Unassigned",
            $data["reportedAt"] ?? "Just now",
            $data["submittedDate"] ?? date("Y-m-d"),
        ]
    );

    json_response(["ok" => true], 201);
}

function update_maintenance_status($data)
{
    require_auth(["maintenance", "management"]);
    $status = $data["status"] ?? "";
    $allowed = ["open", "in-progress", "resolved"];

    if (!in_array($status, $allowed, true)) {
        json_response(["error" => "Invalid maintenance status"], 422);
    }

    run_query("UPDATE maintenance_requests SET status = ? WHERE id = ?", [$status, $data["requestId"] ?? ""]);
    json_response(["ok" => true]);
}

function restock_inventory($data)
{
    require_auth(["housekeeping", "maintenance", "management"]);
    run_query("UPDATE inventory_items SET stock = reorder_level + 25 WHERE id = ?", [$data["itemId"] ?? ""]);
    json_response(["ok" => true]);
}

function update_inventory($data)
{
    require_auth(["housekeeping", "maintenance", "management"]);
    if (!non_negative_number($data["stock"] ?? null) || !non_negative_number($data["reorderLevel"] ?? null)) {
        json_response(["error" => "Stock and reorder level must be non-negative numbers"], 422);
    }

    run_query(
        "UPDATE inventory_items SET stock = ?, reorder_level = ? WHERE id = ?",
        [(int) ($data["stock"] ?? 0), (int) ($data["reorderLevel"] ?? 0), $data["itemId"] ?? ""]
    );

    json_response(["ok" => true]);
}

function delete_maintenance_request($data)
{
    require_auth(["maintenance", "management"]);
    $requestId = $data["requestId"] ?? "";

    if (!$requestId) {
        json_response(["error" => "Maintenance request ID is required"], 422);
    }

    run_query("DELETE FROM maintenance_requests WHERE id = ?", [$requestId]);
    json_response(["ok" => true]);
}

function delete_inventory_item($data)
{
    require_auth(["management"]);
    $itemId = $data["itemId"] ?? "";

    if (!$itemId) {
        json_response(["error" => "Inventory item ID is required"], 422);
    }

    run_query("DELETE FROM inventory_items WHERE id = ?", [$itemId]);
    json_response(["ok" => true]);
}

function update_settings($data)
{
    require_auth(["management"]);
    $settings = $data["settings"] ?? [];

    if (!is_array($settings)) {
        json_response(["error" => "Settings are required"], 422);
    }

    $allowedKeys = [
        "hotelName",
        "contactEmail",
        "checkInTime",
        "checkOutTime",
        "quietHours",
        "arrivalAlerts",
        "inventoryAlerts",
        "maintenanceAlerts",
    ];

    foreach ($settings as $key => $value) {
        if (!in_array($key, $allowedKeys, true)) {
            continue;
        }

        if ($key === "contactEmail" && !is_valid_email($value)) {
            json_response(["error" => "Enter a valid operations email"], 422);
        }

        if (in_array($key, ["hotelName", "checkInTime", "checkOutTime", "quietHours"], true) && trim((string) $value) === "") {
            json_response(["error" => "Settings fields cannot be empty"], 422);
        }

        $storedValue = is_bool($value) ? ($value ? "1" : "0") : trim((string) $value);

        run_query(
            "REPLACE INTO app_settings (setting_key, setting_value) VALUES (?, ?)",
            [$key, $storedValue]
        );
    }

    json_response(["ok" => true]);
}
