export const MAX_LV = 10;

/** Water level boundaries (cm) */
export const THRESHOLDS = {
  safe:    100,   // 0–100 cm    → Safe
  warning: 200,   // 101–200 cm  → Warning
                  // 201–300 cm  → Critical
};

export const THEMES = {
  safe: {
    header:        "linear-gradient(135deg, #76b9a4 0%, #0c6794 100%)",
    illustBg:      "#f0fdf9",
    accent:        "#059669",
    accentSoft:    "#d1fae5",
    badge:         { bg: "#d1fae5", border: "#6ee7b7", dot: "#10b981", text: "#065f46" },
    card:          { bg: "#f0fdf9", border: "#a7f3d0", val: "#065f46" },
    status:        { bg: "#d1fae5", border: "#6ee7b7", text: "#065f46", icon: "✅" },
    bar:           "#10b981",
    rangeBg:       "#a7f3d0",
    caption:       { bg: "rgba(209,250,229,0.55)", border: "#a7f3d0", text: "#047857" },
    moodLabel:     "LIGTAS",
    moodSub:       "Safe",
    landingBg:     "linear-gradient(160deg, #ecfdf5 0%, #d1fae5 50%, #bfdbfe 100%)",
    landingAccent: "#059669",
  },
  watchful: {
    header:        "linear-gradient(135deg, #d97706 0%, #ea580c 100%)",
    illustBg:      "#fffceb",
    accent:        "#d97706",
    accentSoft:    "#fef3c7",
    badge:         { bg: "#fef3c7", border: "#fcd34d", dot: "#f59e0b", text: "#92400e" },
    card:          { bg: "#fffbeb", border: "#fde68a", val: "#92400e" },
    status:        { bg: "#fef3c7", border: "#fcd34d", text: "#92400e", icon: "⚡" },
    bar:           "#f59e0b",
    rangeBg:       "#fde68a",
    caption:       { bg: "rgba(254,243,199,0.55)", border: "#fde68a", text: "#92400e" },
    moodLabel:     "BABALA",
    moodSub:       "Warning",
    landingBg:     "linear-gradient(160deg, #fffbeb 0%, #fef3c7 50%, #fed7aa 100%)",
    landingAccent: "#d97706",
  },
  danger: {
    header:        "linear-gradient(135deg, #dc2626 0%, #9f1239 100%)",
    illustBg:      "#fff1f2",
    accent:        "#dc2626",
    accentSoft:    "#fee2e2",
    badge:         { bg: "#fee2e2", border: "#fca5a5", dot: "#ef4444", text: "#7f1d1d" },
    card:          { bg: "#fff1f2", border: "#fca5a5", val: "#7f1d1d" },
    status:        { bg: "#fee2e2", border: "#fca5a5", text: "#7f1d1d", icon: "🚨" },
    bar:           "#ef4444",
    rangeBg:       "#fca5a5",
    caption:       { bg: "rgba(254,226,226,0.55)", border: "#fca5a5", text: "#7f1d1d" },
    moodLabel:     "PANGANIB",
    moodSub:       "Critical",
    landingBg:     "linear-gradient(160deg, #fff1f2 0%, #fee2e2 50%, #fecaca 100%)",
    landingAccent: "#dc2626",
  },
};