<?php
//this file is for backend to send all flood_readings to frontend ordered by latest
 
//headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
 
require "db_connect.php"; // for database connection
 
$method = $_SERVER['REQUEST_METHOD'];
 
switch ($method) {
    // preflight
    case 'OPTIONS':
        http_response_code(200);
        exit();
 
    // send all readings if frontend request it
    case 'GET':
        $stmt = $pdo->query("SELECT * FROM flood_reading ORDER BY id DESC LIMIT 50");
        $all_readings = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($all_readings);
        exit();
 
    default:
        http_response_code(405);
        echo json_encode(["error" => "Method not allowed"]);
        exit();
}
?>