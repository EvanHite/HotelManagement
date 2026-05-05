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
