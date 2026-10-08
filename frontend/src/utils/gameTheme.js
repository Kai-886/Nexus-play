/**
 * gameTheme — PRD §5.1: per-game tinting is allowed only as card media
 * gradients, "defined once in a gameTheme() util". This file is that
 * util. Every tournament-card media surface (landing GameArt plates,
 * participant tournament cards, games showcase) reads from here so all
 * surfaces tint identically.
 *
 * Colors are tints of the §5.1 token palette expressed as raw values
 * only because Tailwind gradient utilities need literals here; they stay
 * within the accent families already in the system (indigo/violet/cyan/
 * rose/amber). No new hues outside §5.1's families.
 */

const THEMES = {
  valorant: {
    name: "VALORANT",
    genre: "Tactical FPS",
    accent: "#FF4655",
    accentSoft: "rgba(255,70,85,0.32)",
    gradient: "linear-gradient(135deg, rgba(255,70,85,0.34) 0%, rgba(9,17,34,0.2) 55%, rgba(5,10,24,0.65) 100%)",
  },
  bgmi: {
    name: "BGMI",
    genre: "Battle Royale",
    accent: "#F59E0B",
    accentSoft: "rgba(245,158,11,0.30)",
    gradient: "linear-gradient(135deg, rgba(245,158,11,0.30) 0%, rgba(9,17,34,0.2) 55%, rgba(5,10,24,0.65) 100%)",
  },
  "counter-strike": {
    name: "Counter-Strike 2",
    genre: "Tactical FPS",
    accent: "#38BDF8",
    accentSoft: "rgba(56,189,248,0.30)",
    gradient: "linear-gradient(135deg, rgba(56,189,248,0.30) 0%, rgba(9,17,34,0.2) 55%, rgba(5,10,24,0.65) 100%)",
  },
  "free fire": {
    name: "Free Fire",
    genre: "Battle Royale",
    accent: "#FB923C",
    accentSoft: "rgba(251,146,60,0.30)",
    gradient: "linear-gradient(135deg, rgba(251,146,60,0.30) 0%, rgba(9,17,34,0.2) 55%, rgba(5,10,24,0.65) 100%)",
  },
  "rocket league": {
    name: "Rocket League",
    genre: "Sports / Racing",
    accent: "#22D3EE",
    accentSoft: "rgba(34,211,238,0.30)",
    gradient: "linear-gradient(135deg, rgba(34,211,238,0.30) 0%, rgba(9,17,34,0.2) 55%, rgba(5,10,24,0.60) 100%)",
  },
  "apex legends": {
    name: "Apex Legends",
    genre: "Battle Royale",
    accent: "#A78BFA",
    accentSoft: "rgba(167,139,250,0.30)",
    gradient: "linear-gradient(135deg, rgba(167,139,250,0.30) 0%, rgba(9,17,34,0.2) 55%, rgba(5,10,24,0.65) 100%)",
  },
  "call of duty": {
    name: "Call of Duty Mobile",
    genre: "FPS",
    accent: "#34D399",
    accentSoft: "rgba(52,211,153,0.28)",
    gradient: "linear-gradient(135deg, rgba(52,211,153,0.28) 0%, rgba(9,17,34,0.2) 55%, rgba(5,10,24,0.65) 100%)",
  },
  dota: {
    name: "Dota 2",
    genre: "MOBA",
    accent: "#F87171",
    accentSoft: "rgba(248,113,113,0.28)",
    gradient: "linear-gradient(135deg, rgba(248,113,113,0.28) 0%, rgba(9,17,34,0.2) 55%, rgba(5,10,24,0.65) 100%)",
  },
  default: {
    name: "",
    genre: "Tournament",
    accent: "#6366F1",
    accentSoft: "rgba(99,102,241,0.30)",
    gradient: "linear-gradient(135deg, rgba(99,102,241,0.30) 0%, rgba(9,17,34,0.2) 55%, rgba(5,10,24,0.65) 100%)",
  },
};

/** Match a game title (any casing, partial like "BGMI Champions Cup") */
export function gameTheme(game = "") {
  const g = String(game).toLowerCase();
  if (g.includes("valorant")) return THEMES.valorant;
  if (g.includes("bgmi") || g.includes("pubg")) return THEMES.bgmi;
  if (g.includes("counter") || g.includes("cs2") || g.includes("counter-strike")) return THEMES["counter-strike"];
  if (g.includes("free fire")) return THEMES["free fire"];
  if (g.includes("rocket league")) return THEMES["rocket league"];
  if (g.includes("apex")) return THEMES["apex legends"];
  if (g.includes("call of duty") || g.includes("codm")) return THEMES["call of duty"];
  if (g.includes("dota")) return THEMES.dota;
  return THEMES.default;
}

/** Ordered list used by the games showcase (display names) */
export const GAME_LIST = [
  "VALORANT",
  "BGMI",
  "Counter-Strike 2",
  "Free Fire",
  "Rocket League",
  "Apex Legends",
  "Call of Duty Mobile",
  "Dota 2",
];

export default gameTheme;
