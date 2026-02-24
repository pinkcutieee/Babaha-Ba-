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

        if ($decoded_data === null) {
            http_response_code(400);
            echo json_encode(["error" => "Invalid JSON"]);
            exit();
        }

        //sanitize threshold level
        // if less than 1, set it to 1. if greater than 10, force it to 10
        // $threshold_level = max(1, min(10, (int) ($decoded_data['threshold_lvl'] ?? 0))); removed this because we're not following the level 1 - 10 anymore 
        
        /*following the logic:
        13 max = Lvl 10
        14 = Lvl 9
        15 = Lvl 8
        16 = Lvl 7
        17 = Lvl 6
        18 = Lvl 5
        19 = Lvl 4
        20 = Lvl 3
        21 = Lvl 2
        22 = Lvl 1
        23 <+ = Lvl 0 (Normal)
        */
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

    default:
        http_response_code(405);
        echo json_encode(["error" => "Method not allowed"]);
        exit();
}

?>