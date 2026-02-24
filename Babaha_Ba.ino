#include <LiquidCrystal_I2C.h>
#include <WiFiS3.h> 
#include <Arduino_JSON.h>

// WiFi Settings
const char* ssid = ""; // Replace with WiFi SSID
const char* password = ""; // Replace with WiFi Password
const char* server = "192.168.XX.XX"; // Replace with server's IP address
WiFiClient client;

// Pins
const int TRIG_PIN = 9;
const int ECHO_PIN = 10;

// Calibration
const int DIST_LOW = 23;  
const int DIST_HIGH = 13; 

LiquidCrystal_I2C lcd(0x27, 16, 2);

// Tracks the last data sent to avoid database spamming
int lastSentLevel = -1;
float lastSentDistance = -1.0;

void setup() {
  Serial.begin(9600);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);

  Wire.begin();
  lcd.init();
  lcd.backlight();
  
  lcd.setCursor(0, 0);
  lcd.print("Babaha Ba? ");
  
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  lcd.clear();
  lcd.print("WiFi: Connected");
  delay(2000);
}

// Get the average of the last 3 readings
float getAverageDistance() {
  float sum = 0;
  int count = 0;

  for (int i = 0; i < 3; i++) {
    digitalWrite(TRIG_PIN, LOW);
    delayMicroseconds(2);
    digitalWrite(TRIG_PIN, HIGH);
    delayMicroseconds(10);
    digitalWrite(TRIG_PIN, LOW);
    
    long duration = pulseIn(ECHO_PIN, HIGH, 30000);
    float d = duration * 0.034 / 2;

    // Error check for sensor
    if (d > 2 && d < 400) {
      sum += d;
      count++;
    }
    delay(100);
  }

  return (count > 0) ? (sum / count) : -1;
}

void loop() {
  float distance = getAverageDistance();
  
  // If sensor error, skip loop
  if (distance == -1) return;

  int waterLevel = map(constrain((int)distance, DIST_HIGH, DIST_LOW), DIST_LOW, DIST_HIGH, 0, 10);

  // LCD update
  lcd.setCursor(0, 0);
  lcd.print("Dist: "); lcd.print(distance, 1); lcd.print(" cm    ");
  lcd.setCursor(0, 1);
  lcd.print("Level: "); lcd.print(waterLevel); lcd.print("/10    ");

  // If distance reading is different than previous reading, we will do an api call.
  // Check level or distance (with 0.5cm tolerance)
  if (waterLevel != lastSentLevel || abs(distance - lastSentDistance) > 0.5) {
    
    if (client.connect(server, 80)) {
      // Latest reading sent to the database
      String query = "current_lvl=" + String(waterLevel) + "&distance=" + String(distance, 2);
      
      client.println("POST /LocalizedFloodWarning/save_reading.php HTTP/1.1");
      client.print("Host: "); client.println(server);
      client.println("Content-Type: application/x-www-form-urlencoded");
      client.print("Content-Length: "); client.println(query.length());
      client.println("Connection: close");
      client.println();
      client.print(query);
      
      Serial.println("Change detected! Data Sent: " + query);
      
      lastSentLevel = waterLevel;
      lastSentDistance = distance;
      
      client.stop();
    }
  } else {
    // If distance reading is still the same as the previous reading, we will not do an api call.
    Serial.println("Stable: " + String(distance) + "cm. Skipping API call.");
  }

  delay(5000); 
}