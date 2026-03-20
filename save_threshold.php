<?php
//this fie is the api endpoint for frontend sending to backend

//headers 
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Accept");

// Handle preflight immediately before any other code
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require 'db_connect.php'; // for database connection 
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    //fetches threshold_level from frontend 
    case 'POST':
        $rawdata = file_get_contents("php://input"); //get the raw json frontend sent
        $decoded_data = json_decode($rawdata, true); // convert to php array 

        //if json is invalid, return error response
        if ($decoded_data === null) {
            http_response_code(400);
            echo json_encode(["error" => "Invalid JSON"]);
            exit();
        }

        $threshold_level = $decoded_data['threshold_lvl'] ?? 0;
        // Update the only settings row
        $stmt = $pdo->prepare("UPDATE settings SET house_threshold = ? WHERE id = 1");
        $stmt->execute([$threshold_level]);

        echo json_encode([
            "status" => "updated",
            "message" => "Threshold successfully saved",
            "saved_threshold" => $threshold_level
        ]);
        exit();

    // other request methods that are not allowed
    default:
        http_response_code(405);
        echo json_encode(["error" => "Method not allowed"]);
        exit();
}

?>