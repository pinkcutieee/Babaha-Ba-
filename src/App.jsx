import { useState, useEffect } from "react";
import "./index.css";
import FloodLevel from "./components/FloodLevel";
import Main       from "./components/Main";

export default function App() {
  const [threshold, setThreshold] = useState(null) //actual threshold
  const [cm, setCm] = useState(null); // set by user via FloodLevel form
  const [reading,   setReading]   = useState(null); // live data from get_reading.php
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    fetch("http://localhost/Babaha-Ba-/get_threshold.php")
      .then(res => res.json())
      .then(data => {
        if (data && data.house_threshold) {
          setThreshold(data.house_threshold);
        }
        setLoading(false); // Finished checking
      })
      .catch(err => {
        console.error("Error loading settings:", err);
        setLoading(false);
      });
  }, []);

  const getReading = () => {
    fetch("http://localhost/Babaha-Ba-/get_reading.php")
      .then(res => res.json())
      .then(data => { 
        setReading(prev => {
          if (prev && data.id === prev.id && data.mood_label === prev.mood_label) {
            return prev;
          }
          return data;
        });
      })
      .catch(err => console.error("Fetch error:", err));
  };

  const saveCm = (cmInput) => {
    fetch("http://localhost/Babaha-Ba-/save_threshold.php", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ threshold_lvl: cmInput }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.saved_threshold !== undefined) {
          setThreshold(data.saved_threshold);
        }
        getReading();
      })
      .catch(err => console.error("Save error:", err));
  };

  // Poll for fresh sensor readings every 10 seconds while on dashboard
  useEffect(() => {
    if (threshold === null) return;
    getReading();
    const interval = setInterval(getReading, 10_000);
    return () => clearInterval(interval);
  }, [threshold]);

  return (
    <>
      {threshold === null ? (
        /* ── Input screen: user sets their flood threshold ── */
        <FloodLevel
          onSubmit={(cmInput) => {
            setCm(cmInput);
            saveCm(cmInput);
          }}
        />
      ) : (
        /* ── Dashboard: displays live sensor data ── */
        <Main
          threshold={threshold}
          reading={reading}
          onBack={() => setThreshold(null)}
          onUpdate={(cmInput) => {
            setCm(cmInput);
            saveCm(cmInput);
          }}
        />
      )}
    </>
  );
}