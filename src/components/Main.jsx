import { useEffect, useRef } from "react";
import { MAX_CM, THEMES }   from "../components/Themes";
import Header               from "./Header";
import Footer               from "./Footer";
import happyAsset from "../assets/2.svg";
import anxiousAsset from "../assets/3.svg";
import panickedAsset from "../assets/4.svg";
// import { HappyIllust, AnxiousIllust, PanickedIllust } from "./SVG";
import { WavesArrowUp, TriangleAlert, Smile } from "lucide-react";

const ILLUSTS = { safe: happyAsset, watchful: anxiousAsset, danger: panickedAsset };
//changed it to the svg images in the assets

// CSS for flashing effect when danger and ETA is 0
const flashStyle = `
  @keyframes blink-red {
    0% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.3; transform: scale(1.1); }
    100% { opacity: 1; transform: scale(1); }
  }
  .flashing-0 {
    animation: blink-red 0.8s infinite !important;
    color: #ff4d4d !important;
  }
`;

/* ── MetricCard ── */
function MetricCard({ icon, label, tagalog, value, unit, theme, delay }) {
  return (
    <div className="fadeUp" style={{
        animationDelay: `${delay}ms`,
        background: theme.card.bg,
        border: `1.5px solid ${theme.card.border}`,
        borderRadius: "18px",
        padding: "14px 10px 12px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "5px",
        flex: 1,
        minWidth: 0,
        boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
      }}>
      <span style={{ fontSize: "22px", lineHeight: 1 }}>{icon}</span>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontFamily: "'DM Sans'", fontSize: "10px", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.07em", lineHeight: 1.2 }}>{label}</p>
        {tagalog && <p style={{ fontFamily: "'DM Sans'", fontSize: "10px", color: "#9ca3af", lineHeight: 1.3 }}>{tagalog}</p>}
      </div>
      <p style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: "20px", fontWeight: 800, color: theme.card.val, lineHeight: 1 }}>{value ?? "—"}</p>
      {unit && <p style={{ fontFamily: "'DM Sans'", fontSize: "10px", color: "#9ca3af", marginTop: "-3px" }}>{unit}</p>}
    </div>
  );
}

const Main = ({ threshold, onBack, reading }) => {
  // Use a ref to store the previous reading ID and mood to prevent unnecessary updates
  const prevIdRef = useRef(null);

  if (!reading) {
    // Loading state while fetching initial data
    return (
      <div style={{ height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#f1f5f9", fontFamily: "'Plus Jakarta Sans'" }}>
        <p style={{ color: "#94a3b8", marginTop: "20px", fontWeight: 600 }}>Loading ...</p>
      </div>
    );
  }

  const levelCm = reading?.current_level ?? null;
  const mood = reading?.mood_label || "safe";
  const theme = THEMES[mood] || THEMES.safe;
  const Illust = ILLUSTS[mood] || ILLUSTS.safe;

  /* ── ETA Display Logic ── */
  const etaMins = reading?.minutes_remaining;
  let etaText = "0"; 
  let isFlashing = false;

  if (mood === 'danger') {
      if (etaMins === 0) {
          etaText = "0"; 
          isFlashing = true;
      } else if (etaMins > 0) {
          etaText = etaMins;
      } else {
          etaText = "0";
      }
  } else {
      etaText = etaMins > 0 ? etaMins : "0";
  }

  const MIN_FLOOD_DIST = 10; 
  const pct = levelCm !== null ? Math.max(0, Math.min(100, ((MAX_CM - levelCm) / (MAX_CM - MIN_FLOOD_DIST)) * 100)) : 0;

  return (
    // Main dashboard display with live sensor data and ETA
    <div className="fadeIn" style={{ minHeight: "100vh", background: "#f1f5f9", display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
      <style>{flashStyle}</style>

      <div style={{ width: "100%", minHeight: "100vh", background: "#ffffff", display: "flex", flexDirection: "column", boxShadow: "0 0 60px rgba(0,0,0,0.08)" }}>
        
        <Header theme={theme} onBack={onBack} />

        <div style={{ background: theme.illustBg, padding: "16px 20px 12px", display: "flex", flexDirection: "column", alignItems: "center", borderBottom: `1px solid ${theme.card.border}`, gap: "16px" }}>
          
          <div className="float">
            <img src={Illust} alt={mood} style={{ width: "clamp(240px, 55vw, 340px)", height: "auto" }} />
          </div>

          <div className="fadeUp" style={{ width: "100%", animationDelay: "100ms" }}>
             <div style={{ background: theme.header, padding: "18px", borderRadius: "16px", color: "white", textAlign: "center", boxShadow: `0 8px 20px ${theme.accent}30` }}>
                <p style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: "10px", fontWeight: 800, opacity: 0.9, textTransform: "uppercase", letterSpacing: "0.1em" }}>Remaining minutes before flood reaches your home</p>
                
                <h2 className={isFlashing ? "flashing-0" : ""} style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: "44px", fontWeight: 900, margin: "2px 0", lineHeight: 1 }}>
                    {etaText}
                </h2>

                <p style={{ fontFamily: "'DM Sans'", fontSize: "12px", fontWeight: 500, opacity: 0.9 }}>
                   {mood === 'safe' ? "Walang banta ng baha" : "Minuto bago umabot sa bahay"}
                </p>
             </div>
          </div>

          <div style={{ width: "100%", background: theme.caption.bg, border: `1px solid ${theme.caption.border}`, borderRadius: "12px", padding: "12px 16px", textAlign: "center" }}>
            <p style={{ fontFamily: "'DM Sans'", fontSize: "20px", fontStyle: "italic", color: theme.caption.text, lineHeight: 1.5, fontWeight: 500, margin: 0 }}>
              {reading?.alert_status || "Checking..."}
            </p>
          </div>
        </div>

        <div style={{ padding: "24px 18px 0" }}>
          <p style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: "10.5px", fontWeight: 700, color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 12px 0" }}>Mga Sukatan</p>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <MetricCard icon={<WavesArrowUp size={22} />} label="Water Level" tagalog="Antas ng Tubig" value={levelCm} theme={theme} delay={0} unit="cm" />
            <MetricCard icon={<Smile size={22} />} label="Mood" tagalog="Lagay" value={reading?.mood_label} theme={theme} delay={70} />
            <MetricCard icon={<TriangleAlert size={22} />} label="Threshold" tagalog="Limitasyon" value={threshold} unit="cm" theme={theme} delay={140} />
          </div>
        </div>

        <Footer theme={theme} />
      </div>
    </div>
  );
};

export default Main;