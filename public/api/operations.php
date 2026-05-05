<?php
require __DIR__ . "/db.php";

try {
    if ($_SERVER["REQUEST_METHOD"] !== "POST") {
        json_response(["error" => "Method not allowed"], 405);
    }

    $data = request_json();
    $action = $data["action"] ?? "";

    switch ($action) {
        case "housekeepingStatus":
            update_housekeeping_status($data);
            break;
        case "maintenanceStatus":
            update_maintenance_status($data);
            break;
        case "restockInventory":
            restock_inventory($data);
            break;
        default:
            json_response(["error" => "Unknown operations action"], 422);
    }
} catch (Throwable $error) {
    handle_api_error($error);
}

// Update a room cleaning task from the housekeeping page.
function update_housekeeping_status($data)
{
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

// Update a maintenance request from the maintenance page.
function update_maintenance_status($data)
{
    $status = $data["status"] ?? "";
    $allowed = ["open", "in-progress", "resolved"];

    if (!in_array($status, $allowed, true)) {
        json_response(["error" => "Invalid maintenance status"], 422);
    }

    run_query("UPDATE maintenance_requests SET status = ? WHERE id = ?", [$status, $data["requestId"] ?? ""]);
    json_response(["ok" => true]);
}

// Bring an inventory item above its reorder threshold.
function restock_inventory($data)
{
    run_query(
        "UPDATE inventory_items SET stock = reorder_level + 25 WHERE id = ?",
        [$data["itemId"] ?? ""]
    );

    json_response(["ok" => true]);
}
