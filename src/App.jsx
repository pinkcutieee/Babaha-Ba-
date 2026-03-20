import { useState, useEffect } from "react";
import "./index.css";
import FloodLevel from "./components/FloodLevel";
import Main       from "./components/Main";

export default function App() {
  const [threshold, setThreshold] = useState(null) //actual threshold
  const [lvl, setLvl] = useState(null); // set by user via FloodLevel form
  const [cm, setCm] = useState(null); //converted lvl to cm
  const [reading,   setReading]   = useState(null); // live data from get_reading.php
  const [loading,   setLoading]   = useState(true);
  
  const convertToCm = (lvlInput) => {
    //convert lvl to cm
    if (lvlInput === null || lvlInput === undefined) return null;

    const lvlNum = Number(lvlInput);

    if (lvlNum <= 0) return 23;
    if (lvlNum >= 10) return 13;

    return 23 - lvlNum;
  };
  const convertToLvl = (cmRead) => {
    //convert cm to lvl
    if (cmRead === null || cmRead === undefined) return null;

    const cmNum = Number(cmRead);
    if (cmNum >= 23) return 0;
    if (cmNum <= 13) return 10;

    return 23 - cmNum;
  }

  useEffect(() => {
    fetch("http://localhost/Babaha-Ba-/get_threshold.php")
      .then(res => res.json())
      .then(data => {
        if (data && data.house_threshold) {
          const lvlValue = convertToLvl(data.house_threshold) //call convert cm to lvl function
          setThreshold(lvlValue);
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
          const lvlValue = convertToLvl(data.current_level);
          return {
            ...data,
            current_level: lvlValue
          }
        });
      })
      .catch(err => console.error("Fetch error:", err));
  };

  const saveCm = (lvlInput) => {
    const cmValue = convertToCm(lvlInput); //call convert to cm function
    setCm(cmValue);

    fetch("http://localhost/Babaha-Ba-/save_threshold.php", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ threshold_lvl: cmValue }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.saved_threshold !== undefined) {
          const lvlValue = convertToLvl(data.saved_threshold); // 🔥 FIX
          setThreshold(lvlValue);
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
          onSubmit={(lvlInput) => {
            setLvl(lvlInput);
            saveCm(lvlInput);
          }}
        />
      ) : (
        /* ── Dashboard: displays live sensor data ── */
        <Main
          threshold={threshold}
          reading={reading}
          onBack={() => setThreshold(null)}
          onUpdate={(lvlInput) => {
            setLvl(lvlInput);
            saveCm(lvlInput);
          }}
        />
      )}
    </>
  );
}