<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
require "db_connect.php"; 

date_default_timezone_set('Asia/Manila');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->query("
        SELECT r.*, s.house_threshold
        FROM flood_reading r
        CROSS JOIN settings s WHERE s.id = 1
        ORDER BY r.id DESC LIMIT 1
    ");
    $latest = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($latest) {
        $dist = floatval($latest['distance_cm']); 
        $thresh = floatval($latest['house_threshold']);
        
    
        $last_update_time = strtotime($latest['date_detected']);
        $mins_since_last_update = floor((time() - $last_update_time) / 60);
        
        $ai_mins = (int)$latest['minutes_remaining'];
        if ($ai_mins > 0) {

            $ai_mins = max(0, $ai_mins - $mins_since_last_update);
        }

        
        $timeStmt = $pdo->prepare("
            SELECT date_detected FROM flood_reading 
            WHERE distance_cm <= ? 
            ORDER BY id DESC LIMIT 1
        ");
        $timeStmt->execute([$thresh]);
        $lastDanger = $timeStmt->fetch(PDO::FETCH_ASSOC);

        if ($lastDanger) {

            $start_time = strtotime($lastDanger['date_detected']);
            $mins_since_danger = floor((time() - $start_time) / 60);
        } else {
            $mins_since_danger = 999;
        }

        $latest['current_level'] = $dist;
        
        if ($dist <= $thresh && $dist > 0) {
            $latest['mood_label'] = 'danger';
            $latest['minutes_remaining'] = 0;
            if ($mins_since_danger >= 3) {
                $latest['alert_status'] = "Stable ang tubig pero lampas sa threshold. Ingat!";
            } else {
                $latest['alert_status'] = "⚠️ ABOT NA ANG TUBIG! Mag-ingat!";
            }
        } 

        else if ($ai_mins > 0) {
            $latest['mood_label'] = 'watchful';
            $latest['minutes_remaining'] = $ai_mins;
            $latest['alert_status'] = $latest['alert_status'] ?? "Pataas ang tubig! " . $ai_mins . " mins na lang bago bumaha.";
        }
        else {
            if ($mins_since_danger >= 3) {
                // 
                $latest['mood_label'] = 'safe';
                $latest['minutes_remaining'] = 999;
                $safe_remarks = [
                    "Ghosting na ang baha. Mas malabo pa sa usapan niyo.",
                    "False alarm! Umasa ka lang, parang sa kaniya.",
                    "Water level is stable. 'Wag nang ma-stress, baka tumanda ka niyan.",
                    "Walang galaw ang tubig. Tulog na yata ang baha, 'wag mo na gisingin.",
                    "Safe na tayo! Itabi mo na 'yung salbabida.",
                    "Drier than my humor. Wala nang banta, pramis.",
                    "Buti pa ang tubig, alam kung kailan titigil. Safe na dito!",
                    "Iniwan ka na ng baha, move on na."
                ];
                $latest['alert_status'] = $safe_remarks[array_rand($safe_remarks)];
            } else {
                $latest['mood_label'] = 'watchful';
                $latest['minutes_remaining'] = 0;
                $latest['alert_status'] = "Bantay-bantay lang muna. 'Wag muna mag-panic...";
            }
        }
    }
    echo json_encode($latest);
}