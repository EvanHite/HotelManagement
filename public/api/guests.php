<?php
require __DIR__ . "/db.php";

try {
    if ($_SERVER["REQUEST_METHOD"] !== "POST") {
        json_response(["error" => "Method not allowed"], 405);
    }

    $data = request_json();
    $action = $data["action"] ?? "";

    switch ($action) {
        case "login":
            login_guest($data);
            break;
        case "create":
            create_guest($data);
            break;
        case "update":
            update_guest($data);
            break;
        default:
            json_response(["error" => "Unknown guest action"], 422);
    }
} catch (Throwable $error) {
    handle_api_error($error);
}

function login_guest($data)
{
    $email = strtolower(trim($data["email"] ?? ""));
    $password = $data["password"] ?? "";
    $loginKey = "guest:" . $email;

    if (!is_valid_email($email)) {
        json_response(["error" => "Enter a valid email address"], 422);
    }

    check_login_rate_limit($loginKey);

    $guest = fetch_one(
        "SELECT id, name, email, phone, loyalty_tier AS loyaltyTier, company, notes, password
         FROM guest_profiles
         WHERE LOWER(email) = ?",
        [$email]
    );

    if (!$guest || !verify_stored_password($password, $guest["password"])) {
        record_failed_login($loginKey);
        json_response(["error" => "Invalid login"], 401);
    }

    clear_login_attempts($loginKey);

    if (password_should_be_upgraded($guest["password"])) {
        run_query("UPDATE guest_profiles SET password = ? WHERE id = ?", [password_hash($password, PASSWORD_DEFAULT), $guest["id"]]);
    }

    unset($guest["password"]);
    $token = create_token([
        "id" => $guest["id"],
        "role" => "guest",
        "name" => $guest["name"],
        "guestId" => $guest["id"],
    ]);

    json_response(["guest" => $guest, "token" => $token]);
}

function create_guest($data)
{
    $name = trim($data["name"] ?? "");
    $email = strtolower(trim($data["email"] ?? ""));
    $password = trim($data["password"] ?? "");

    if (!$name || !$email || !$password) {
        json_response(["error" => "Name, email, and password are required"], 422);
    }

    if (!is_valid_email($email)) {
        json_response(["error" => "Enter a valid email address"], 422);
    }

    if (!is_valid_password($password)) {
        json_response(["error" => "Password must be at least 6 characters and include both letters and numbers or symbols"], 422);
    }

    $existingGuest = fetch_one("SELECT id FROM guest_profiles WHERE LOWER(email) = ?", [$email]);
    if ($existingGuest) {
        json_response(["error" => "An account already exists for that email"], 422);
    }

    $id = $data["id"] ?? ("guest-" . time());
    run_query(
        "INSERT INTO guest_profiles (id, name, email, phone, loyalty_tier, company, notes, password)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [
            $id,
            $name,
            $email,
            trim($data["phone"] ?? ""),
            $data["loyaltyTier"] ?? "Standard",
            $data["company"] ?? "Personal Travel",
            $data["notes"] ?? "",
            password_hash($password, PASSWORD_DEFAULT),
        ]
    );

    $guest = fetch_guest($id);
    $token = create_token([
        "id" => $guest["id"],
        "role" => "guest",
        "name" => $guest["name"],
        "guestId" => $guest["id"],
    ]);

    json_response(["guest" => $guest, "token" => $token], 201);
}

function update_guest($data)
{
    $user = require_auth(["guest", "reception", "management"]);
    $guestId = $data["guestId"] ?? "";
    $name = trim($data["name"] ?? "");
    $email = strtolower(trim($data["email"] ?? ""));

    if (!$guestId || !$name) {
        json_response(["error" => "Guest ID and name are required"], 422);
    }

    if ($user["role"] === "guest" && ($user["guestId"] ?? "") !== $guestId) {
        json_response(["error" => "You can only update your own profile"], 403);
    }

    if (!is_valid_email($email)) {
        json_response(["error" => "Enter a valid email address"], 422);
    }

    run_query(
        "UPDATE guest_profiles
         SET name = ?, email = ?, phone = ?, loyalty_tier = ?, company = ?, notes = ?
         WHERE id = ?",
        [
            $name,
            strtolower(trim($data["email"] ?? "")),
            trim($data["phone"] ?? ""),
            $data["loyaltyTier"] ?? "Standard",
            $data["company"] ?? "Personal Travel",
            $data["notes"] ?? "",
            $guestId,
        ]
    );

    json_response(["ok" => true]);
}

function fetch_guest($id)
{
    return fetch_one(
        "SELECT id, name, email, phone, loyalty_tier AS loyaltyTier, company, notes
         FROM guest_profiles WHERE id = ?",
        [$id]
    );
}
