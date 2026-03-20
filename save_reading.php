<?php
// this is the api endpoint for arduino to send data to backend so it can be saved to database and processed by AI for prediction
//headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require 'db_connect.php';
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'OPTIONS') {
    http_response_code(200);
    exit();
}


if ($method === 'POST') {
    $current_lvl = isset($_POST['current_lvl']) ? (int) $_POST['current_lvl'] : 0;
    $distance = isset($_POST['distance']) ? (float) $_POST['distance'] : 0.0;

    // Checks for change in distance to prevent redundant entries (if change is less than 0.1 cm, skip)
    $stmt = $pdo->query("SELECT distance_cm FROM flood_reading ORDER BY id DESC LIMIT 1");
    $lastEntry = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($lastEntry && abs(floatval($lastEntry['distance_cm']) - $distance) < 0.1) {
        echo json_encode(["status" => "skipped", "message" => "No significant change."]);
        exit();
    }

    // Saves reading to database
    $stmt = $pdo->prepare("INSERT INTO flood_reading (current_level, distance_cm) VALUES (?, ?)");
    $stmt->execute([$current_lvl, $distance]);
    $lastId = $pdo->lastInsertId();

    // Fetch previous reading and current threshold for AI prediction
    $stmt = $pdo->prepare("SELECT distance_cm, date_detected FROM flood_reading WHERE id < ? ORDER BY id DESC LIMIT 1");
    $stmt->execute([$lastId]);
    $prevReading = $stmt->fetch(PDO::FETCH_ASSOC);

    $stmt = $pdo->query("SELECT house_threshold FROM settings WHERE id = 1");
    $house_threshold = (float) $stmt->fetchColumn();

    // Default variables for the AI prompt
    //These are fallback values in the case there is no previous reading (first ever entry) or if the AI prediction fails for any reason. The AI will use these values to calculate the minutes remaining and mood label based on the current distance and threshold.
    $prev_dist = $distance;
    $time_interval_mins = 1;
    $minutes_remaining = -1;
    $mood_label = "safe";
    $alert_status = "Scanning...";

    if ($prevReading) {
        $prev_dist = (float) $prevReading['distance_cm'];
        $time_diff = time() - strtotime($prevReading['date_detected']);
        $time_interval_mins = max(1, $time_diff / 60);

        // AI Prediction Logic.
        $apiKey = "XXX"; // Replace with Gemini API Key
        $url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" . $apiKey;

        $system_instruction = "You are the Babaha Ba flood expert. Note: Sensors measure distance to water. "
            . "A DECREASING value means water is RISING.\n\n"
            . "Calculation Logic:\n"
            . "1. Rise_Velocity = (Previous_Distance - Current_Distance) / Interval_Minutes.\n"
            . "2. Gap_to_Threshold = Current_Distance - House_Threshold.\n"
            . "3. Minutes_Remaining = Gap_to_Threshold / Rise_Velocity.\n"
            . "4. If Rise_Velocity <= 0, Minutes_Remaining = -1 (Safe/Receding).\n\n"
            . "MOOD_LABEL:\n"
            . "- <= 60 mins: danger\n"
            . "- > 60 & < 180: watchful\n"
            . "- >= 180 or -1: safe\n\n"
            . "Output strictly JSON.";

        // Simulation Rule: The AI treats the interval (seconds in demo) as minutes to calculate a rapid ETA countdown.
        $user_prompt = "Input: {current_dist: {$distance}, prev_dist: {$prev_dist}, interval: {$time_interval_mins}, threshold: {$house_threshold}}. "
            . "Provide MINUTES_REMAINING, MOOD_LABEL, and a witty Tagalog ALERT_STATUS.";

        $payload = [
            "system_instruction" => [
                "parts" => [["text" => $system_instruction]]
            ],
            "contents" => [
                [
                    "role" => "user",
                    "parts" => [["text" => $user_prompt]]
                ]
            ],
            "generationConfig" => [
                "temperature" => 0,
                "responseMimeType" => "application/json"
            ]
        ];

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

        $response = curl_exec($ch);
        curl_close($ch);

        $result = json_decode($response, true);
        if (isset($result['candidates'][0]['content']['parts'][0]['text'])) {
            $prediction = json_decode($result['candidates'][0]['content']['parts'][0]['text'], true);
            if ($prediction) {
                $minutes_remaining = $prediction['MINUTES_REMAINING'] ?? -1;
                $mood_label = strtolower($prediction['MOOD_LABEL'] ?? "safe");
                $alert_status = $prediction['ALERT_STATUS'] ?? "AI Calculated";
            }
        }
    }

    // Update the latest reading with AI prediction results
    $updateStmt = $pdo->prepare("
        UPDATE flood_reading 
        SET time_interval = ?, minutes_remaining = ?, mood_label = ?, alert_status = ? 
        WHERE id = ?
    ");
    $updateStmt->execute([round($time_interval_mins, 2), $minutes_remaining, $mood_label, $alert_status, $lastId]);

    echo json_encode(["status" => "success", "prediction" => $alert_status]);
}
?>