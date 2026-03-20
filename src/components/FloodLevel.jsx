import { useState }          from "react";
import { MAX_LV, THEMES }    from "../components/Themes";
import { getMood }           from "../utils/floodUtils";
import { Waves } from "lucide-react";

const RANGE_GUIDE = [
  { label: "Ligtas",   range: "1–4 lvl",   color: "#10b981", bg: "#d1fae5" },
  { label: "Babala",   range: "6–8 lvl", color: "#f59e0b", bg: "#fef3c7" },
  { label: "Panganib", range: "9–10 lvl", color: "#ef4444", bg: "#fee2e2" },
];

const FloodLevel = ({ onSubmit }) => {
  const [raw,     setRaw]     = useState("");
  const [error,   setError]   = useState("");
  const [focused, setFocused] = useState(false);

  const numVal      = parseFloat(raw);
  const valid = raw !== "" && !isNaN(numVal) && numVal >= 0 && numVal <= MAX_LV;
  const previewMood = valid ? getMood(numVal) : null;
  const previewT    = previewMood ? THEMES[previewMood] : null;

  const cmStatusText = (() => {
    if (!valid) return "Maglagay ng lvl mula sa 0-10 para makita ang katumbas na cm.";
    if (numVal >= 10) return "Katumbas: 13 cm o mas mababa.";
    if (numVal <= 0) return "Katumbas: 23 cm o mas mababa.";
    return `Katumbas: ${Number((23 - numVal).toFixed(1))} cm.`;
  })();

  const accentColor = previewT?.landingAccent ?? "#0284c7";
  const bgGrad      = previewT?.landingBg
    ?? "linear-gradient(160deg, #e0f2fe 0%, #e0e7ff 50%, #ede9fe 100%)";


  function handleChange(val) {
    setRaw(val);
    if (error) setError("");
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!valid) {
      setError(`Mangyaring maglagay ng wastong halaga (0–${MAX_LV} cm).`);
      return;
    }
    setError("");
    onSubmit(numVal);
  }
  return (
    <div
      className="fadeIn"
      style={{
        minHeight:      "100vh",
        background:     bgGrad,
        display:        "flex",
        flexDirection:  "column",
        alignItems:     "center",
        justifyContent: "center",
        padding:        "24px 20px 40px",
        transition:     "background 0.5s ease",
      }}
    >
      {/* ── Logo and Title ── */}
      <div
        className="slideUp"
        style={{ textAlign: "center", marginBottom: "32px", animationDelay: "0ms" }}
      >
        <div
          style={{
            width:       "68px",
            height:      "68px",
            borderRadius:"22px",
            background:  "linear-gradient(135deg, #0284c7, #059669)",
            display:     "flex",
            alignItems:  "center",
            justifyContent: "center",
            fontSize:    "32px",
            margin:      "0 auto 14px",
            boxShadow:   "0 8px 24px rgba(2,132,199,0.3)",
          }}
        >
        <Waves color="#063eb2" />
        </div>
        <h1
          style={{
            fontFamily:    "'Plus Jakarta Sans'",
            fontWeight:    900,
            fontSize:      "26px",
            color:         "#0f172a",
            letterSpacing: "-0.5px",
            lineHeight:    1.2,
            marginBottom:  "8px",
          }}
        >
          Flood Warning System  PH
        </h1>
        <p
          style={{
            fontFamily: "'DM Sans'",
            fontSize:   "14px",
            color:      "#64748b",
            lineHeight: 1.6,
            maxWidth:   "280px",
            margin:     "0 auto",
          }}
        >
          Ilagay ang antas ng tubig kung kailan kayo binabaha.
        </p>
      </div>

      {/* ── Input Card ── */}
      <div
        className="slideUp"
        style={{
          animationDelay: "80ms",
          width:           "100%",
          maxWidth:        "380px",
          background:      "rgba(255,255,255,0.9)",
          backdropFilter:  "blur(16px)",
          border:          "1.5px solid rgba(255,255,255,0.95)",
          borderRadius:    "28px",
          padding:         "28px 24px 24px",
          boxShadow:       "0 16px 48px rgba(0,0,0,0.10)",
        }}
      >
        <form onSubmit={handleSubmit}>
          {/* Field label */}
          <p
            style={{
              fontFamily:    "'Plus Jakarta Sans'",
              fontSize:      "12px",
              fontWeight:    700,
              color:         "#94a3b8",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom:  "12px",
              textAlign:     "center",
            }}
          >
            Antas ng Tubig
          </p>

          {/* Number input + cm badge */}
          <div
            style={{
              position:       "relative",
              border:         `2px solid ${focused ? accentColor : error ? "#ef4444" : "#e2e8f0"}`,
              borderRadius:   "18px",
              overflow:       "hidden",
              transition:     "border-color 0.2s",
              background:     "#f8fafc",
              marginBottom:   "12px",
              boxShadow:      focused ? `0 0 0 4px ${accentColor}22` : "none",
            }}
          >
            <input
              className="input-field"
              type="number"
              min="0"
              max={MAX_LV}
              step="0.1"
              placeholder="0"
              value={raw}
              onChange={e => handleChange(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              style={{
                border:      "none",
                color:       valid ? accentColor : "#0f172a",
                paddingRight:"70px",
                background:  "transparent",
              }}
            />
            <div
              style={{
                position:   "absolute",
                right:      "16px",
                top:        "50%",
                transform:  "translateY(-50%)",
                background: valid ? accentColor : "#e2e8f0",
                color:      valid ? "white" : "#94a3b8",
                borderRadius:"10px",
                padding:    "5px 12px",
                fontFamily: "'Plus Jakarta Sans'",
                fontSize:   "14px",
                fontWeight: 800,
                transition: "background 0.3s, color 0.3s",
              }}
            >
              lvl
            </div>
          </div>

          <p
            style={{
              margin: "2px 4px 12px",
              fontFamily: "'DM Sans'",
              fontSize: "12px",
              fontWeight: 600,
              color: valid ? "#475569" : "#94a3b8",
              lineHeight: 1.4,
            }}
          >
            {cmStatusText}
          </p>

          {/* Validation error */}
          {error && (
            <div
              className="fadeUp"
              style={{
                background:   "#fee2e2",
                border:       "1px solid #fca5a5",
                borderRadius: "12px",
                padding:      "10px 14px",
                marginBottom: "12px",
                display:      "flex",
                gap:          "8px",
                alignItems:   "center",
              }}
            >

              <p style={{ fontFamily: "'DM Sans'", fontSize: "12px", color: "#7f1d1d", fontWeight: 600 }}>
                {error}
              </p>
            </div>
          )}

          {/* Submit button */}
          <button
            className="btn-primary"
            type="submit"
            disabled={!valid}
            style={{
              background: valid
                ? `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`
                : "#e2e8f0",
              boxShadow: valid ? `0 6px 20px ${accentColor}50` : "none",
            }}
          >
            {valid ? "Tingnan ang Status →" : "Maglagay ng Halaga"}
          </button>
        </form>
        </div>
        </div>
      );
};
export default FloodLevel;