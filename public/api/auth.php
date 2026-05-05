<?php
require __DIR__ . "/db.php";

try {
    if ($_SERVER["REQUEST_METHOD"] !== "POST") {
        json_response(["error" => "Method not allowed"], 405);
    }

    $data = request_json();
    $action = $data["action"] ?? "";

    switch ($action) {
        case "staffLogin":
            staff_login($data);
            break;
        case "managementLogin":
            management_login($data);
            break;
        default:
            json_response(["error" => "Unknown auth action"], 422);
    }
} catch (Throwable $error) {
    handle_api_error($error);
}

function staff_login($data)
{
    $role = $data["role"] ?? "";
    $employeeId = strtoupper(trim($data["employeeId"] ?? ""));
    $password = $data["password"] ?? "";
    $loginKey = "staff:" . $role . ":" . $employeeId;

    check_login_rate_limit($loginKey);

    $user = fetch_one(
        "SELECT id, name, role, employee_id AS employeeId, email, password
         FROM staff_users
         WHERE role = ? AND UPPER(employee_id) = ?",
        [$role, $employeeId]
    );

    if (!$user || !verify_stored_password($password, $user["password"])) {
        record_failed_login($loginKey);
        json_response(["error" => "Invalid staff login"], 401);
    }

    clear_login_attempts($loginKey);

    if (password_should_be_upgraded($user["password"])) {
        run_query("UPDATE staff_users SET password = ? WHERE id = ?", [password_hash($password, PASSWORD_DEFAULT), $user["id"]]);
    }

    unset($user["password"]);
    $token = create_token($user);

    json_response(["user" => $user, "token" => $token]);
}

function management_login($data)
{
    $email = strtolower(trim($data["email"] ?? ""));
    $password = $data["password"] ?? "";
    $loginKey = "management:" . $email;

    if (!is_valid_email($email)) {
        json_response(["error" => "Enter a valid email address"], 422);
    }

    check_login_rate_limit($loginKey);

    $user = fetch_one(
        "SELECT id, name, role, employee_id AS employeeId, email, password
         FROM staff_users
         WHERE role = 'management' AND LOWER(email) = ?",
        [$email]
    );

    if (!$user || !verify_stored_password($password, $user["password"])) {
        record_failed_login($loginKey);
        json_response(["error" => "Invalid management login"], 401);
    }

    clear_login_attempts($loginKey);

    if (password_should_be_upgraded($user["password"])) {
        run_query("UPDATE staff_users SET password = ? WHERE id = ?", [password_hash($password, PASSWORD_DEFAULT), $user["id"]]);
    }

    unset($user["password"]);
    $token = create_token($user);

    json_response(["user" => $user, "token" => $token]);
}
