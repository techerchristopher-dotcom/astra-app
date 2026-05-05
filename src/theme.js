export const C = {
  bg:          "#07040F",
  bgPage:      "#02010A",
  bgCard:      "rgba(255,255,255,0.04)",
  bgCardHover: "rgba(255,255,255,0.07)",
  border:      "rgba(124,58,237,0.22)",
  borderGold:  "rgba(245,193,66,0.5)",
  violet:      "#7C3AED",
  violetDeep:  "#3B1878",
  violetLight: "#A78BFA",
  gold:        "#F5C142",
  goldDeep:    "#C49A0A",
  goldLight:   "#FDE68A",
  rose:        "#E8A4C8",
  text:        "#EDE9F6",
  textMuted:   "#7B6FA0",
  textFaint:   "#3E3560",
  success:     "#4ADE80",
  danger:      "#F87171",
};

export const FONT = {
  serif: "PlayfairDisplay_500Medium",
  serifBold: "PlayfairDisplay_700Bold",
  serifItalic: "PlayfairDisplay_500Medium_Italic",
  body: "DMSans_400Regular",
  bodyMedium: "DMSans_500Medium",
  bodySemi: "DMSans_600SemiBold",
  bodyBold: "DMSans_700Bold",
};

export const TODAY_FR = new Date()
  .toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })
  .toUpperCase();

/** YYYY-MM-DD fuseau local (mis à jour à chaque appel). */
export function getTodayLocalKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export const TODAY_ISO = new Date().toISOString().split("T")[0];
