<?php
// this is the API endpoint for frontend to fetch threshold level from backend 

// Set headers to allow the React frontend to access this API
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require 'db_connect.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        // Fetch the current threshold from the settings table
        $stmt = $pdo->query("SELECT house_threshold FROM settings WHERE id = 1");
        $settings = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$settings) {
            // If no settings row exists, return a default threshold
            echo json_encode(["house_threshold" => null]);
        } else {
            // Return the current threshold level as JSON
            echo json_encode([
                "house_threshold" => (int) $settings['house_threshold']
            ]);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Database error: " . $e->getMessage()]);
    }
    exit();
}
?>