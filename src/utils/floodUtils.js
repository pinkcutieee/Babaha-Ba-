import { THRESHOLDS } from "../components/Themes";

/**
 * Derives the mood/severity from a  water level reading.
 * @param {number} levelCm
 * @returns {"safe" | "warning" | "critical"}
 */
export function getMood(levelCm) {
  if (levelCm <= THRESHOLDS.safe)    return "safe";
  if (levelCm <= THRESHOLDS.warning) return "warning";
  return "critical";
}

/**
 * Returns a Tagalog status caption based on the current water level and mood.
 * @param {number} levelCm
 * @param {"safe" | "warning" | "critical"} mood
 * @returns {string}
 */
export function getCaption(levelCm, mood) {
  if (mood === "safe")     return "Chill lang! Safe pa ang antas ng tubig.";
  if (mood === "warning")  return "Mag-ingat ka! Tumataas na ang antas ng tubig sa inyong lugar.";
  if (mood === "critical") return "NAKUUU! Lumikas na agad, kritikal na ang antas ng tubig.";
  return "";
}