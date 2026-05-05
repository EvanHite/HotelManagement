<?php

function read_config()
{
    $localConfig = __DIR__ . "/config.local.php";
    $exampleConfig = __DIR__ . "/config.example.php";

    if (file_exists($localConfig)) {
        return require $localConfig;
    }

    return require $exampleConfig;
}

function db()
{
    static $pdo = null;

    if ($pdo) {
        return $pdo;
    }

    $config = read_config();
    $dsn = sprintf(
        "mysql:host=%s;dbname=%s;charset=utf8mb4",
        $config["host"],
        $config["database"]
    );

    $pdo = new PDO($dsn, $config["username"], $config["password"], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    return $pdo;
}

function json_response($payload, $status = 200)
{
    http_response_code($status);
    header("Content-Type: application/json");
    echo json_encode($payload);
    exit;
}

function base64_url_encode($value)
{
    return rtrim(strtr(base64_encode($value), "+/", "-_"), "=");
}

function base64_url_decode($value)
{
    $value = strtr($value, "-_", "+/");
    $padding = strlen($value) % 4;

    if ($padding) {
        $value .= str_repeat("=", 4 - $padding);
    }

    return base64_decode($value);
}

function token_secret()
{
    $config = read_config();
    return hash("sha256", $config["database"] . "|" . $config["username"] . "|" . $config["password"]);
}

function create_token($user)
{
    $header = base64_url_encode(json_encode(["alg" => "HS256", "typ" => "JWT"]));
    $payload = base64_url_encode(json_encode([
        "id" => $user["id"],
        "role" => $user["role"],
        "name" => $user["name"],
        "guestId" => $user["guestId"] ?? null,
        "exp" => time() + 60 * 60 * 8,
    ]));
    $signature = base64_url_encode(hash_hmac("sha256", $header . "." . $payload, token_secret(), true));

    return $header . "." . $payload . "." . $signature;
}

function bearer_token()
{
    $header = $_SERVER["HTTP_AUTHORIZATION"] ?? "";

    if (!$header && function_exists("getallheaders")) {
        $headers = getallheaders();
        $header = $headers["Authorization"] ?? $headers["authorization"] ?? "";
    }

    if (preg_match("/Bearer\s+(.+)/", $header, $matches)) {
        return trim($matches[1]);
    }

    return "";
}

function current_user()
{
    $token = bearer_token();

    if (!$token) {
        return null;
    }

    $parts = explode(".", $token);
    if (count($parts) !== 3) {
        return null;
    }

    [$header, $payload, $signature] = $parts;
    $expected = base64_url_encode(hash_hmac("sha256", $header . "." . $payload, token_secret(), true));

    if (!hash_equals($expected, $signature)) {
        return null;
    }

    $data = json_decode(base64_url_decode($payload), true);

    if (!is_array($data) || ($data["exp"] ?? 0) < time()) {
        return null;
    }

    return $data;
}

function require_auth($roles = [])
{
    $user = current_user();

    if (!$user) {
        json_response(["error" => "Sign in required"], 401);
    }

    if ($roles && !in_array($user["role"], $roles, true)) {
        json_response(["error" => "You do not have permission for this action"], 403);
    }

    return $user;
}

function request_json()
{
    $body = file_get_contents("php://input");
    $data = json_decode($body, true);
    return is_array($data) ? $data : [];
}

function run_query($sql, $params = [])
{
    $statement = db()->prepare($sql);
    $statement->execute($params);
    return $statement;
}

function fetch_all($sql, $params = [])
{
    return run_query($sql, $params)->fetchAll();
}

function fetch_one($sql, $params = [])
{
    $row = run_query($sql, $params)->fetch();
    return $row ?: null;
}

function is_valid_email($email)
{
    return (bool) filter_var($email, FILTER_VALIDATE_EMAIL);
}

function is_valid_password($password)
{
    if (strlen($password) < 6) {
        return false;
    }

    if (ctype_alpha($password) || ctype_digit($password)) {
        return false;
    }

    return true;
}

function is_valid_date_range($checkIn, $checkOut)
{
    if (!$checkIn || !$checkOut) {
        return false;
    }

    $start = strtotime($checkIn);
    $end = strtotime($checkOut);

    return $start !== false && $end !== false && $end > $start;
}

function non_negative_number($value)
{
    return is_numeric($value) && (float) $value >= 0;
}

function verify_stored_password($password, $storedPassword)
{
    if (!$storedPassword) {
        return false;
    }

    if (substr($storedPassword, 0, 4) === "$2y$" || substr($storedPassword, 0, 4) === "$2a$" || substr($storedPassword, 0, 7) === "$argon2") {
        return password_verify($password, $storedPassword);
    }

    return hash_equals($storedPassword, $password);
}

function password_should_be_upgraded($storedPassword)
{
    return substr($storedPassword, 0, 4) !== "$2y$" && substr($storedPassword, 0, 4) !== "$2a$" && substr($storedPassword, 0, 7) !== "$argon2";
}

function client_ip()
{
    return $_SERVER["REMOTE_ADDR"] ?? "unknown";
}

function ensure_login_attempts_table()
{
    run_query(
        "CREATE TABLE IF NOT EXISTS login_attempts (
            login_key VARCHAR(180) NOT NULL,
            ip_address VARCHAR(80) NOT NULL,
            attempts INT NOT NULL DEFAULT 0,
            locked_until DATETIME NULL,
            last_attempt DATETIME NOT NULL,
            PRIMARY KEY (login_key, ip_address)
        )"
    );
}

function check_login_rate_limit($loginKey)
{
    ensure_login_attempts_table();

    $row = fetch_one(
        "SELECT attempts, locked_until FROM login_attempts WHERE login_key = ? AND ip_address = ?",
        [$loginKey, client_ip()]
    );

    if ($row && $row["locked_until"] && strtotime($row["locked_until"]) > time()) {
        json_response(["error" => "Too many failed attempts. Try again later."], 429);
    }
}

function record_failed_login($loginKey)
{
    ensure_login_attempts_table();

    $row = fetch_one(
        "SELECT attempts FROM login_attempts WHERE login_key = ? AND ip_address = ?",
        [$loginKey, client_ip()]
    );
    $attempts = $row ? ((int) $row["attempts"] + 1) : 1;
    $lockedUntil = $attempts >= 5 ? date("Y-m-d H:i:s", time() + 15 * 60) : null;

    run_query(
        "REPLACE INTO login_attempts (login_key, ip_address, attempts, locked_until, last_attempt)
         VALUES (?, ?, ?, ?, NOW())",
        [$loginKey, client_ip(), $attempts, $lockedUntil]
    );
}

function clear_login_attempts($loginKey)
{
    ensure_login_attempts_table();
    run_query("DELETE FROM login_attempts WHERE login_key = ? AND ip_address = ?", [$loginKey, client_ip()]);
}

function decode_json_column($row, $key)
{
    if (!isset($row[$key]) || $row[$key] === null || $row[$key] === "") {
        $row[$key] = [];
        return $row;
    }

    $decoded = json_decode($row[$key], true);
    $row[$key] = is_array($decoded) ? $decoded : [];
    return $row;
}

function handle_api_error($error)
{
    json_response([
        "error" => "Server error",
        "detail" => $error->getMessage(),
    ], 500);
}
