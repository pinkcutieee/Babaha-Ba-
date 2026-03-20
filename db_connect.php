<?php
$dbname = "flood_warning_sys";
$user = "root";
$pass = "";
$port = "3306";
$host = "localhost";



try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;port=$port;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Connection failed: " . $e->getMessage()]);
    exit;
}



?>