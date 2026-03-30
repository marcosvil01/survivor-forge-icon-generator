import { useState, useCallback } from "react";
import { Copy, Check, Code2, Terminal, FileJson, Database, Braces } from "lucide-react";

interface Theme {
  id: string; label: string;
  bgFrom: string; bgTo: string; bgAngle?: string;
  bar: string; text: string; sub: string; rankColor: string;
}

const PRESET_THEMES: Theme[] = [
  { id: "dark",     label: "🌑 Dark",      bgFrom: "#1a1c2e", bgTo: "#2d2f45", bar: "#5865f2", text: "#ffffff", sub: "#a0a8c0", rankColor: "#5865f2" },
  { id: "zombie",   label: "🧟 Zombie",    bgFrom: "#0d1a0d", bgTo: "#1a3320", bar: "#57f287", text: "#c8ffd4", sub: "#7abf8a", rankColor: "#57f287" },
  { id: "police",   label: "🚔 Police",    bgFrom: "#0b0c1a", bgTo: "#12163a", bar: "#00b0f4", text: "#d0efff", sub: "#6ab8d6", rankColor: "#00b0f4" },
  { id: "prestige", label: "⭐ Prestige",  bgFrom: "#1a1200", bgTo: "#3a2d00", bar: "#f1c40f", text: "#fff7cc", sub: "#c8a832", rankColor: "#f1c40f" },
  { id: "gold",     label: "🏆 Gold",      bgFrom: "#2a1500", bgTo: "#4a2800", bar: "#cd7f32", text: "#ffe8cc", sub: "#b07030", rankColor: "#ffd700" },
  { id: "crimson",  label: "🩸 Crimson",   bgFrom: "#1a0000", bgTo: "#3d0a0a", bar: "#ed4245", text: "#ffd0d0", sub: "#c06060", rankColor: "#ed4245" },
  { id: "neon",     label: "⚡ Neon",       bgFrom: "#0a0014", bgTo: "#1a0030", bar: "#c084fc", text: "#f0d4ff", sub: "#9b5ec4", rankColor: "#c084fc" },
  { id: "ocean",    label: "🌊 Ocean",      bgFrom: "#001a2e", bgTo: "#003a5c", bar: "#06b6d4", text: "#cffafe", sub: "#4da8c0", rankColor: "#06b6d4" },
  { id: "sakura",   label: "🌸 Sakura",     bgFrom: "#1a0014", bgTo: "#2e0a26", bar: "#f9a8d4", text: "#fce7f3", sub: "#c4708c", rankColor: "#f9a8d4" },
  { id: "midnight", label: "🌙 Midnight",   bgFrom: "#0a0a0a", bgTo: "#1a1a2e", bar: "#818cf8", text: "#e0e7ff", sub: "#6d76c0", rankColor: "#818cf8" },
];

type TabId = "canvas" | "command" | "db" | "typescript" | "config";

// ─── Code generators ───────────────────────────────────────────────────────

function genCanvas(t: Theme, showBadges: boolean): string {
  return `// rank-card.js  —  generado con ZM Tools
// npm install @napi-rs/canvas

const { createCanvas, loadImage } = require("@napi-rs/canvas");

const W = 520, H = 160;
const THEME = {
  bgFrom:    "${t.bgFrom}",
  bgTo:      "${t.bgTo}",
  accent:    "${t.bar}",
  text:      "${t.text}",
  sub:       "${t.sub}",
  rankColor: "${t.rankColor}",
};

/**
 * Genera la rank card como PNG
 * @param {{ username: string, discriminator: string, rank: number,
 *           level: number, xp: number, xpNeeded: number,
 *           avatarUrl?: string${showBadges ? ", badges?: string[]" : ""} }} opts
 * @returns {Promise<Buffer>}
 */
async function generateRankCard({ username, discriminator, rank,
    level, xp, xpNeeded, avatarUrl${showBadges ? ", badges = []" : ""} }) {
  const canvas = createCanvas(W, H);
  const ctx    = canvas.getContext("2d");

  // ── Fondo gradiente ───────────────────────────────────────
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, THEME.bgFrom);
  bg.addColorStop(1, THEME.bgTo);
  ctx.fillStyle = bg;
  roundRect(ctx, 0, 0, W, H, 16); ctx.fill();

  // Overlay radial decorativo
  const glow = ctx.createRadialGradient(W * 0.88, H * 0.5, 0, W * 0.88, H * 0.5, 190);
  glow.addColorStop(0, THEME.accent + "20");
  glow.addColorStop(1, "transparent");
  ctx.fillStyle = glow;
  roundRect(ctx, 0, 0, W, H, 16); ctx.fill();

  // Línea brillante en el borde del accent
  ctx.strokeStyle = THEME.accent + "40";
  ctx.lineWidth   = 1;
  roundRect(ctx, 0.5, 0.5, W - 1, H - 1, 16);
  ctx.stroke();

  // ── Rank badge (esquina top-right) ────────────────────────
  ctx.font      = "bold 13px Inter, sans-serif";
  ctx.fillStyle = THEME.sub;
  ctx.textAlign = "right";
  ctx.fillText("RANK", W - 18, 22);
  ctx.font      = "bold 28px Outfit, sans-serif";
  ctx.fillStyle = THEME.rankColor;
  ctx.fillText(\`#\${rank}\`, W - 18, 50);

  // ── Avatar ────────────────────────────────────────────────
  const AX = 20, AY = (H - 76) / 2, AR = 38;
  ctx.save();
  ctx.beginPath();
  ctx.arc(AX + AR, AY + AR, AR, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  if (avatarUrl) {
    try {
      const img = await loadImage(avatarUrl);
      ctx.drawImage(img, AX, AY, AR * 2, AR * 2);
    } catch { ctx.fillStyle = "#23272a"; ctx.fill(); }
  } else {
    ctx.fillStyle = "#23272a"; ctx.fill();
  }
  ctx.restore();

  // Borde del avatar con glow
  ctx.strokeStyle = THEME.accent;
  ctx.lineWidth   = 3;
  ctx.shadowColor = THEME.accent + "80";
  ctx.shadowBlur  = 8;
  ctx.beginPath(); ctx.arc(AX + AR, AY + AR, AR + 1.5, 0, Math.PI * 2); ctx.stroke();
  ctx.shadowBlur = 0;

  // ── Texto ─────────────────────────────────────────────────
  const TX = AX + AR * 2 + 18;

  ctx.textAlign = "left";
  ctx.font      = "bold 20px Outfit, sans-serif";
  ctx.fillStyle = THEME.text;
  ctx.fillText(username, TX, AY + 24);

  ctx.font      = "500 12px Inter, sans-serif";
  ctx.fillStyle = THEME.sub;
  ctx.fillText(\`#\${discriminator}\`, TX, AY + 42);

  // Level badge
  const lvlLabel = "LEVEL";
  ctx.font      = "700 11px Inter, sans-serif";
  ctx.fillStyle = THEME.sub;
  ctx.fillText(lvlLabel, TX, AY + 63);
  ctx.font      = "bold 20px Outfit, sans-serif";
  ctx.fillStyle = THEME.accent;
  ctx.fillText(\`\${level}\`, TX + 46, AY + 63);
${showBadges ? `
  // ── Badges (emojis) ───────────────────────────────────────
  if (badges.length > 0) {
    ctx.font = "16px sans-serif";
    badges.slice(0, 6).forEach((badge, i) => {
      ctx.fillText(badge, TX + i * 22, AY + 83);
    });
  }` : ""}
  // ── XP Bar ────────────────────────────────────────────────
  const BX = TX, BY = H - 30, BW = W - TX - 24, BH = 10;
  const pct = Math.min(1, xp / Math.max(1, xpNeeded));

  ctx.font      = "600 11px Inter, sans-serif";
  ctx.fillStyle = THEME.sub;
  ctx.textAlign = "left";
  ctx.fillText(\`\${xp.toLocaleString()} XP\`, BX, BY - 8);
  ctx.textAlign = "right";
  ctx.fillText(\`/ \${xpNeeded.toLocaleString()} XP · \${Math.round(pct * 100)}%\`, BX + BW, BY - 8);

  // Track
  ctx.fillStyle = "rgba(255,255,255,0.10)";
  roundRect(ctx, BX, BY, BW, BH, BH / 2); ctx.fill();

  // Fill gradiente
  const barGrad = ctx.createLinearGradient(BX, 0, BX + BW * pct, 0);
  barGrad.addColorStop(0, THEME.accent);
  barGrad.addColorStop(1, THEME.accent + "cc");
  ctx.fillStyle = barGrad;
  if (pct > 0) { roundRect(ctx, BX, BY, BW * pct, BH, BH / 2); ctx.fill(); }

  // Glow en el tip de la barra
  if (pct > 0.02) {
    ctx.shadowColor = THEME.accent;
    ctx.shadowBlur  = 10;
    ctx.fillStyle   = "#fff";
    const tipX = BX + BW * pct - 2;
    ctx.beginPath(); ctx.arc(tipX, BY + BH / 2, 3, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
  }

  return canvas.toBuffer("image/png");
}

module.exports = { generateRankCard };

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
`;
}

function genTS(t: Theme): string {
  return `// rank-card.ts  —  versión TypeScript
// npm install @napi-rs/canvas  (tipos incluidos en el paquete)

import { createCanvas, loadImage, Canvas, SKRSContext2D } from "@napi-rs/canvas";

const W = 520, H = 160;

interface RankCardOptions {
  username:       string;
  discriminator:  string;
  rank:           number;
  level:          number;
  xp:             number;
  xpNeeded:       number;
  avatarUrl?:     string;
  badges?:        string[];
}

interface Theme {
  bgFrom: string; bgTo: string;
  accent: string; text: string; sub: string; rankColor: string;
}

const THEME: Theme = {
  bgFrom:    "${t.bgFrom}",
  bgTo:      "${t.bgTo}",
  accent:    "${t.bar}",
  text:      "${t.text}",
  sub:       "${t.sub}",
  rankColor: "${t.rankColor}",
};

function roundRect(ctx: SKRSContext2D, x: number, y: number,
    w: number, h: number, r: number): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export async function generateRankCard(opts: RankCardOptions): Promise<Buffer> {
  const { username, discriminator, rank, level, xp, xpNeeded,
          avatarUrl, badges = [] } = opts;

  const canvas: Canvas = createCanvas(W, H);
  const ctx            = canvas.getContext("2d");

  // Fondo
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, THEME.bgFrom); bg.addColorStop(1, THEME.bgTo);
  ctx.fillStyle = bg;
  roundRect(ctx, 0, 0, W, H, 16); ctx.fill();

  // Overlay
  const glow = ctx.createRadialGradient(W * .88, H * .5, 0, W * .88, H * .5, 190);
  glow.addColorStop(0, THEME.accent + "20"); glow.addColorStop(1, "transparent");
  ctx.fillStyle = glow;
  roundRect(ctx, 0, 0, W, H, 16); ctx.fill();

  // Rank
  ctx.font = "bold 13px Inter"; ctx.fillStyle = THEME.sub;
  ctx.textAlign = "right"; ctx.fillText("RANK", W - 18, 22);
  ctx.font = "bold 28px Outfit"; ctx.fillStyle = THEME.rankColor;
  ctx.fillText(\`#\${rank}\`, W - 18, 50);

  // Avatar
  const AX = 20, AY = (H - 76) / 2, AR = 38;
  ctx.save(); ctx.beginPath();
  ctx.arc(AX + AR, AY + AR, AR, 0, Math.PI * 2); ctx.clip();
  if (avatarUrl) {
    try { ctx.drawImage(await loadImage(avatarUrl), AX, AY, AR * 2, AR * 2); }
    catch { ctx.fillStyle = "#23272a"; ctx.fill(); }
  }
  ctx.restore();
  ctx.strokeStyle = THEME.accent; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(AX + AR, AY + AR, AR + 1.5, 0, Math.PI * 2); ctx.stroke();

  const TX = AX + AR * 2 + 18;
  ctx.textAlign = "left";

  ctx.font = "bold 20px Outfit"; ctx.fillStyle = THEME.text;
  ctx.fillText(username, TX, AY + 24);
  ctx.font = "500 12px Inter";   ctx.fillStyle = THEME.sub;
  ctx.fillText(\`#\${discriminator}\`, TX, AY + 42);
  ctx.font = "700 11px Inter";   ctx.fillText("LEVEL", TX, AY + 63);
  ctx.font = "bold 20px Outfit"; ctx.fillStyle = THEME.accent;
  ctx.fillText(\`\${level}\`, TX + 46, AY + 63);

  // XP bar
  const BX = TX, BY = H - 30, BW = W - TX - 24, BH = 10;
  const pct = Math.min(1, xp / Math.max(1, xpNeeded));

  ctx.font = "600 11px Inter"; ctx.fillStyle = THEME.sub;
  ctx.textAlign = "left";  ctx.fillText(\`\${xp.toLocaleString()} XP\`, BX, BY - 8);
  ctx.textAlign = "right"; ctx.fillText(\`/ \${xpNeeded.toLocaleString()} XP\`, BX + BW, BY - 8);

  ctx.fillStyle = "rgba(255,255,255,0.10)";
  roundRect(ctx, BX, BY, BW, BH, BH / 2); ctx.fill();

  if (pct > 0) {
    const barG = ctx.createLinearGradient(BX, 0, BX + BW, 0);
    barG.addColorStop(0, THEME.accent); barG.addColorStop(1, THEME.accent + "cc");
    ctx.fillStyle = barG;
    roundRect(ctx, BX, BY, BW * pct, BH, BH / 2); ctx.fill();
  }

  return canvas.toBuffer("image/png");
}
`;
}

function genCommand(): string {
  return `// commands/rank.js  —  Discord.js v14 slash command
// npm install discord.js @napi-rs/canvas better-sqlite3

const { SlashCommandBuilder, AttachmentBuilder } = require("discord.js");
const { generateRankCard } = require("../utils/rank-card");
const { getUser, getRank }  = require("../utils/db");  // ver db.js

// XP necesario para cada nivel (fórmula estándar)
const xpForLevel = (lvl) => 5 * lvl * lvl + 50 * lvl + 100;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("rank")
    .setDescription("🏆 Ver tu tarjeta de rango")
    .addUserOption(opt =>
      opt.setName("usuario")
         .setDescription("Ver el rango de otro usuario")
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const target  = interaction.options.getUser("usuario") ?? interaction.user;
    const db      = getUser(target.id);

    if (!db) {
      return interaction.editReply("Este usuario no tiene XP todavía.");
    }

    const rank = getRank(target.id);

    const buffer = await generateRankCard({
      username:      target.username,
      discriminator: target.discriminator ?? "0",
      rank,
      level:         db.level,
      xp:            db.xp,
      xpNeeded:      xpForLevel(db.level),
      avatarUrl:     target.displayAvatarURL({ extension: "png", size: 256 }),
    });

    await interaction.editReply({
      files: [new AttachmentBuilder(buffer, { name: "rank.png" })]
    });
  },
};
`;
}

function genDB(): string {
  return `// utils/db.js  —  sistema de XP con better-sqlite3
// npm install better-sqlite3

const Database = require("better-sqlite3");
const db = new Database("./data/bot.db");

// ── Setup inicial ─────────────────────────────────────────
db.exec(\`
  CREATE TABLE IF NOT EXISTS users (
    id       TEXT PRIMARY KEY,
    xp       INTEGER DEFAULT 0,
    level    INTEGER DEFAULT 0,
    total_xp INTEGER DEFAULT 0
  )
\`);

// XP por mensaje (min/max aleatorio + cooldown de 60s)
const cooldowns = new Map();
const XP_MIN = 15, XP_MAX = 25, COOLDOWN_MS = 60_000;

const xpForLevel = (lvl) => 5 * lvl * lvl + 50 * lvl + 100;

// ── Helpers exportados ────────────────────────────────────

/** Devuelve los datos del usuario o null */
function getUser(userId) {
  return db.prepare("SELECT * FROM users WHERE id = ?").get(userId) ?? null;
}

/** Devuelve la posición en el ranking */
function getRank(userId) {
  const row = db.prepare(
    "SELECT COUNT(*) as cnt FROM users WHERE total_xp > (SELECT total_xp FROM users WHERE id = ?)"
  ).get(userId);
  return (row?.cnt ?? 0) + 1;
}

/**
 * Añade XP al usuario con cooldown.
 * @returns {{ leveledUp: boolean, newLevel?: number }}
 */
function addXp(userId) {
  const now = Date.now();
  if (cooldowns.get(userId) > now) return { leveledUp: false };
  cooldowns.set(userId, now + COOLDOWN_MS);

  const earned = Math.floor(Math.random() * (XP_MAX - XP_MIN + 1)) + XP_MIN;

  db.prepare(\`
    INSERT INTO users (id, xp, level, total_xp) VALUES (?, ?, 0, ?)
    ON CONFLICT(id) DO UPDATE SET xp = xp + ?, total_xp = total_xp + ?
  \`).run(userId, earned, earned, earned, earned);

  // Comprobar subida de nivel
  const user = getUser(userId);
  const needed = xpForLevel(user.level);
  if (user.xp >= needed) {
    db.prepare("UPDATE users SET level = level + 1, xp = xp - ? WHERE id = ?")
      .run(needed, userId);
    return { leveledUp: true, newLevel: user.level + 1 };
  }
  return { leveledUp: false };
}

module.exports = { getUser, getRank, addXp, xpForLevel };
`;
}

function genConfig(t: Theme): string {
  return JSON.stringify({
    generated: "ZM Tools — Rank Card Generator",
    theme: t.id,
    card: { width: 520, height: 160, borderRadius: 16 },
    colors: {
      backgroundFrom: t.bgFrom, backgroundTo: t.bgTo,
      accent: t.bar, text: t.text, subtext: t.sub, rankNumber: t.rankColor,
    },
    xpSystem: {
      formula: "5 * level² + 50 * level + 100",
      xpPerMessage: { min: 15, max: 25 },
      cooldownSeconds: 60,
    },
    packages: ["@napi-rs/canvas", "discord.js", "better-sqlite3"],
  }, null, 2);
}

// ─── Component ────────────────────────────────────────────────────────────

export default function RankCard() {
  const [themeId,     setThemeId]     = useState("dark");
  const [tab,         setTab]         = useState<TabId>("canvas");
  const [copied,      setCopied]      = useState(false);
  const [showBadges,  setShowBadges]  = useState(false);
  const [customAccent,setCustomAccent]= useState("");
  const [customBgFrom,setCustomBgFrom]= useState("");
  const [customBgTo,  setCustomBgTo]  = useState("");

  // Preview knobs
  const [prevUser,  setPrevUser]  = useState("ZephyrBlade");
  const [prevTag,   setPrevTag]   = useState("0042");
  const [prevRank,  setPrevRank]  = useState(3);
  const [prevLevel, setPrevLevel] = useState(15);
  const [prevXp,    setPrevXp]    = useState(720);
  const [prevXpMax, setPrevXpMax] = useState(1275);

  const base  = PRESET_THEMES.find(t => t.id === themeId) ?? PRESET_THEMES[0];
  const theme: Theme = {
    ...base,
    bar:    customAccent || base.bar,
    bgFrom: customBgFrom || base.bgFrom,
    bgTo:   customBgTo   || base.bgTo,
  };

  const pct = Math.min(100, Math.round((prevXp / Math.max(1, prevXpMax)) * 100));

  const code =
    tab === "canvas"  ? genCanvas(theme, showBadges) :
    tab === "typescript" ? genTS(theme) :
    tab === "command" ? genCommand() :
    tab === "db"      ? genDB() :
                        genConfig(theme);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true); setTimeout(() => setCopied(false), 2200);
  }, [code]);

  const TABS: { id: TabId; icon: React.ReactNode; label: string }[] = [
    { id: "canvas",     icon: <Code2 size={13} />,    label: "rank-card.js"  },
    { id: "typescript", icon: <Braces size={13} />,   label: "rank-card.ts"  },
    { id: "command",    icon: <Terminal size={13} />,  label: "comando.js"    },
    { id: "db",         icon: <Database size={13} />,  label: "db.js"         },
    { id: "config",     icon: <FileJson size={13} />,  label: "config.json"   },
  ];

  return (
    <div className="tool-layout">
      <aside className="tool-sidebar">
        <div className="tool-header">
          <h2>Rank Card</h2>
          <p>Genera el código listo para tu bot con canvas + SQLite</p>
        </div>

        <div className="tool-form">
          <span className="v6-label">Tema</span>
          <div className="rc-theme-grid">
            {PRESET_THEMES.map(t => (
              <button key={t.id}
                className={`rc-theme-btn ${themeId === t.id ? "active" : ""}`}
                style={{ background: `linear-gradient(135deg, ${t.bgFrom}, ${t.bgTo})` }}
                onClick={() => { setThemeId(t.id); setCustomAccent(""); setCustomBgFrom(""); setCustomBgTo(""); }}>
                <span className="rc-theme-bar" style={{ background: t.bar, boxShadow: `0 0 6px ${t.bar}` }} />
                <span className="rc-theme-label">{t.label}</span>
              </button>
            ))}
          </div>

          {/* Custom overrides */}
          <span className="v6-label" style={{ marginTop: 4 }}>Personalizar colores</span>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
            {[
              { label: "Accent",   val: customAccent || theme.bar,    set: setCustomAccent },
              { label: "BG inicio",val: customBgFrom || theme.bgFrom, set: setCustomBgFrom },
              { label: "BG fin",   val: customBgTo   || theme.bgTo,   set: setCustomBgTo   },
            ].map(({ label, val, set }) => (
              <label key={label} className="tool-label" style={{ alignItems: "center", gap: 4 }}>
                {label}
                <input type="color" value={val} onChange={e => set(e.target.value)}
                  style={{ width: "100%", height: 32, padding: 2, borderRadius: 6, border: "1px solid var(--ui-border)", background: "transparent", cursor: "pointer" }} />
              </label>
            ))}
          </div>

          <label className="tool-label" style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2 }}>
            <input type="checkbox" checked={showBadges} onChange={e => setShowBadges(e.target.checked)}
              style={{ accentColor: "var(--ui-accent)", width: 14, height: 14 }} />
            Incluir sistema de badges en el código
          </label>

          <span className="v6-label" style={{ marginTop: 4 }}>Vista previa</span>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {([
              ["Usuario", prevUser,  setPrevUser,  "text",   undefined, undefined],
              ["Tag",     prevTag,   setPrevTag,   "text",   undefined, undefined],
              ["Rank",    prevRank,  setPrevRank,  "number", 1,         undefined],
              ["Level",   prevLevel, setPrevLevel, "number", 0,         undefined],
              ["XP",      prevXp,    setPrevXp,    "number", 0,         undefined],
              ["XP Max",  prevXpMax, setPrevXpMax, "number", 1,         undefined],
            ] as const).map(([lbl, val, setter, type]) => (
              <label key={lbl} className="tool-label">{lbl}
                <input className="tool-input" type={type} min={type === "number" ? 0 : undefined}
                  value={val as string | number}
                  onChange={e => (setter as (v: string | number) => void)(type === "number" ? +e.target.value : e.target.value)} />
              </label>
            ))}
          </div>

          <p className="v6-hint">
            Los datos reales los provee tu DB por usuario. Esta preview es solo visual.
          </p>
        </div>
      </aside>

      <main className="tool-stage" style={{ flexDirection: "column", overflow: "hidden" }}>
        {/* Preview */}
        <div className="rc-preview-area">
          <div className="rank-card" style={{ background: `linear-gradient(135deg, ${theme.bgFrom}, ${theme.bgTo})` }}>
            <div className="rank-card-deco"
              style={{ background: `radial-gradient(circle at 88% 50%, ${theme.bar}22 0%, transparent 60%)` }} />
            <div style={{
              position: "absolute", inset: 0, borderRadius: 16,
              boxShadow: `inset 0 0 0 1px ${theme.bar}30`, pointerEvents: "none",
            }} />

            <div className="rank-card-rank-label" style={{ color: theme.sub }}>RANK</div>
            <div className="rank-card-rank"        style={{ color: theme.rankColor }}>#{prevRank}</div>

            <div className="rank-card-avatar-wrap" style={{ border: `3px solid ${theme.bar}`, boxShadow: `0 0 14px ${theme.bar}50` }}>
              <div className="rank-card-avatar" style={{
                background: `linear-gradient(135deg, ${theme.bar}60, ${theme.bgTo})`,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28,
              }}>👤</div>
            </div>

            <div className="rank-card-info">
              <div className="rank-card-username" style={{ color: theme.text }}>{prevUser || "Usuario"}</div>
              <div className="rank-card-tag"      style={{ color: theme.sub }}>#{prevTag}</div>
              <div className="rank-card-level">
                <span style={{ color: theme.sub,  fontSize: 11, fontWeight: 700, letterSpacing: "0.06em" }}>LEVEL </span>
                <span className="rank-card-level-num" style={{ color: theme.bar }}>{prevLevel}</span>
              </div>
              {showBadges && (
                <div style={{ fontSize: 14, marginTop: 3, letterSpacing: 2 }}>🏆⚡🎖</div>
              )}
            </div>

            <div className="rank-card-xp-wrap">
              <div className="rank-card-xp-row">
                <span style={{ fontSize: 11, color: theme.sub }}>{prevXp.toLocaleString()} XP</span>
                <span style={{ fontSize: 11, color: theme.sub }}>/ {prevXpMax.toLocaleString()} XP · {pct}%</span>
              </div>
              <div className="rank-card-bar-bg">
                <div className="rank-card-bar-fill" style={{
                  width: `${pct}%`, background: `linear-gradient(90deg, ${theme.bar}, ${theme.bar}cc)`,
                  boxShadow: pct > 2 ? `2px 0 12px ${theme.bar}80` : "none",
                }} />
              </div>
            </div>
          </div>
          <p className="rc-preview-note">
            Preview HTML — el bot genera esta imagen en Node.js · 520 × 160 px
          </p>
        </div>

        {/* Code panel */}
        <div className="rc-code-panel">
          <div className="rc-code-tabs">
            {TABS.map(t => (
              <button key={t.id} className={`rc-code-tab ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
                {t.icon} {t.label}
              </button>
            ))}
            <button className={`rc-copy-btn ${copied ? "done" : ""}`} onClick={handleCopy}>
              {copied ? <><Check size={13} /> Copiado</> : <><Copy size={13} /> Copiar</>}
            </button>
          </div>
          <pre className="rc-code-block"><code>{code}</code></pre>
        </div>
      </main>
    </div>
  );
}
