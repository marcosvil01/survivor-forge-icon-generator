import { useState, useCallback } from "react";
import { Copy, Check, Code2, Terminal, FileJson, Braces } from "lucide-react";

interface WTheme {
  id: string; label: string;
  bgFrom: string; bgTo: string; bgAngle: number;
  accent: string; text: string; sub: string;
}

const THEMES: WTheme[] = [
  { id: "aurora",   label: "🌌 Aurora",    bgFrom: "#0d0d2b", bgTo: "#1a3a2e", bgAngle: 120, accent: "#7cf5c0", text: "#e0fff4", sub: "#5abf92" },
  { id: "sunset",   label: "🌅 Sunset",    bgFrom: "#200a00", bgTo: "#3d1a2e", bgAngle: 135, accent: "#f97316", text: "#fff0e8", sub: "#cf824a" },
  { id: "blurple",  label: "💜 Blurple",   bgFrom: "#0e0f22", bgTo: "#1e2065", bgAngle: 135, accent: "#5865f2", text: "#ffffff", sub: "#8b93f8" },
  { id: "forest",   label: "🌲 Forest",    bgFrom: "#071209", bgTo: "#122416", bgAngle: 130, accent: "#4ade80", text: "#dcfce7", sub: "#5a9e6e" },
  { id: "rose",     label: "🌹 Rose",      bgFrom: "#1a0611", bgTo: "#3d0930", bgAngle: 135, accent: "#fb7185", text: "#ffe4e6", sub: "#c05070" },
  { id: "cyber",    label: "🤖 Cyber",     bgFrom: "#050514", bgTo: "#0a0a28", bgAngle: 135, accent: "#22d3ee", text: "#e0f7ff", sub: "#2a8fa8" },
  { id: "void",     label: "🕳 Void",      bgFrom: "#050505", bgTo: "#111111", bgAngle: 135, accent: "#a855f7", text: "#f3e8ff", sub: "#7e40b8" },
  { id: "sakura",   label: "🌸 Sakura",    bgFrom: "#1a0014", bgTo: "#2e0a26", bgAngle: 135, accent: "#f9a8d4", text: "#fce7f3", sub: "#c4708c" },
];

type Layout = "banner" | "left" | "minimal";
type TabId  = "canvas" | "typescript" | "command" | "config";

// ─── Code generators ──────────────────────────────────────────────────────

function genCanvas(t: WTheme, layout: Layout, serverName: string): string {
  const isLeft    = layout === "left";
  const isMinimal = layout === "minimal";
  const W = isMinimal ? 520 : 600, H = isMinimal ? 100 : 180;

  return `// welcome-card.js  —  generado con ZM Tools
// npm install @napi-rs/canvas

const { createCanvas, loadImage } = require("@napi-rs/canvas");

const W = ${W}, H = ${H};
const SERVER = "${serverName || "Mi Servidor"}";
const THEME  = {
  bgFrom: "${t.bgFrom}", bgTo: "${t.bgTo}", angle: ${t.bgAngle},
  accent: "${t.accent}", text: "${t.text}", sub: "${t.sub}",
};

/**
 * @param {{ username: string, avatarUrl?: string, memberCount: number }} opts
 * @returns {Promise<Buffer>}
 */
async function generateWelcomeCard({ username, avatarUrl, memberCount }) {
  const canvas = createCanvas(W, H);
  const ctx    = canvas.getContext("2d");

  // ── Fondo ──────────────────────────────────────────────
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, THEME.bgFrom); bg.addColorStop(1, THEME.bgTo);
  ctx.fillStyle = bg;
  roundRect(ctx, 0, 0, W, H, 16); ctx.fill();

${isMinimal ? `  // Borde accent
  ctx.strokeStyle = THEME.accent + "50"; ctx.lineWidth = 1.5;
  roundRect(ctx, 1, 1, W - 2, H - 2, 15); ctx.stroke();

  // Avatar pequeño izquierda
  const AR = 36;
  if (avatarUrl) {
    try {
      const img = await loadImage(avatarUrl);
      ctx.save(); ctx.beginPath();
      ctx.arc(20 + AR, H / 2, AR, 0, Math.PI * 2); ctx.clip();
      ctx.drawImage(img, 20, H / 2 - AR, AR * 2, AR * 2);
      ctx.restore();
    } catch {}
  }
  ctx.strokeStyle = THEME.accent; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.arc(20 + AR, H / 2, AR + 1, 0, Math.PI * 2); ctx.stroke();

  const TX = 20 + AR * 2 + 18;
  ctx.textAlign = "left";
  ctx.font = "700 13px Inter"; ctx.fillStyle = THEME.sub;
  ctx.fillText("¡BIENVENIDO/A!", TX, H / 2 - 14);
  ctx.font = "bold 22px Outfit"; ctx.fillStyle = THEME.text;
  ctx.fillText(username, TX, H / 2 + 8);
  ctx.font = "500 12px Inter"; ctx.fillStyle = THEME.sub;
  ctx.fillText(\`Miembro #\${memberCount.toLocaleString()} de \${SERVER}\`, TX, H / 2 + 26);
` : isLeft ? `  // Overlay radial
  const glow = ctx.createRadialGradient(120, H / 2, 0, 120, H / 2, 200);
  glow.addColorStop(0, THEME.accent + "15"); glow.addColorStop(1, "transparent");
  ctx.fillStyle = glow; roundRect(ctx, 0, 0, W, H, 16); ctx.fill();

  // Divisor vertical
  ctx.strokeStyle = THEME.accent + "30"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(210, 24); ctx.lineTo(210, H - 24); ctx.stroke();

  // Avatar centrado a la izquierda
  const AR = 56;
  const AX = 105 - AR, AY = (H - AR * 2) / 2;
  if (avatarUrl) {
    try {
      const img = await loadImage(avatarUrl);
      ctx.save(); ctx.beginPath();
      ctx.arc(AX + AR, AY + AR, AR, 0, Math.PI * 2); ctx.clip();
      ctx.drawImage(img, AX, AY, AR * 2, AR * 2);
      ctx.restore();
    } catch {}
  }
  ctx.strokeStyle = THEME.accent; ctx.lineWidth = 3;
  ctx.shadowColor = THEME.accent + "70"; ctx.shadowBlur = 12;
  ctx.beginPath(); ctx.arc(AX + AR, AY + AR, AR + 2, 0, Math.PI * 2); ctx.stroke();
  ctx.shadowBlur = 0;

  // Texto a la derecha del divisor
  ctx.textAlign = "left";
  const TX = 228;
  ctx.font = "700 12px Inter"; ctx.fillStyle = THEME.accent;
  ctx.fillText("¡BIENVENIDO/A A", TX, H / 2 - 44);
  ctx.font = "bold 22px Outfit"; ctx.fillStyle = THEME.text;
  ctx.fillText(SERVER, TX, H / 2 - 22);
  ctx.font = "bold 28px Outfit"; ctx.fillStyle = THEME.text;
  // Recortar nombre si es muy largo
  const name = username.length > 18 ? username.slice(0, 16) + "…" : username;
  ctx.fillText(name, TX, H / 2 + 10);
  ctx.font = "500 13px Inter"; ctx.fillStyle = THEME.sub;
  ctx.fillText("Eres el miembro #" + memberCount.toLocaleString(), TX, H / 2 + 34);
  ctx.fillText("¡Disfruta tu estancia!", TX, H / 2 + 52);
` : `  // layout: banner — avatar centrado arriba
  // Overlay radial central
  const glow = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, 260);
  glow.addColorStop(0, THEME.accent + "18"); glow.addColorStop(1, "transparent");
  ctx.fillStyle = glow; roundRect(ctx, 0, 0, W, H, 16); ctx.fill();

  ctx.strokeStyle = THEME.accent + "35"; ctx.lineWidth = 1;
  roundRect(ctx, 1, 1, W - 2, H - 2, 15); ctx.stroke();

  // Avatar circular centrado
  const AR = 52, AX = W / 2 - AR, AY = 14;
  if (avatarUrl) {
    try {
      const img = await loadImage(avatarUrl);
      ctx.save(); ctx.beginPath();
      ctx.arc(W / 2, AY + AR, AR, 0, Math.PI * 2); ctx.clip();
      ctx.drawImage(img, AX, AY, AR * 2, AR * 2);
      ctx.restore();
    } catch {}
  }
  ctx.strokeStyle = THEME.accent; ctx.lineWidth = 3;
  ctx.shadowColor = THEME.accent + "80"; ctx.shadowBlur = 14;
  ctx.beginPath(); ctx.arc(W / 2, AY + AR, AR + 2, 0, Math.PI * 2); ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.textAlign = "center";
  ctx.font = "700 14px Inter"; ctx.fillStyle = THEME.accent;
  ctx.fillText("¡BIENVENIDO/A!", W / 2, AY + AR * 2 + 22);
  ctx.font = "bold 26px Outfit"; ctx.fillStyle = THEME.text;
  ctx.fillText(username, W / 2, AY + AR * 2 + 46);
  ctx.font = "500 13px Inter"; ctx.fillStyle = THEME.sub;
  ctx.fillText(\`Miembro #\${memberCount.toLocaleString()} · \${SERVER}\`, W / 2, AY + AR * 2 + 66);
`}
  return canvas.toBuffer("image/png");
}

module.exports = { generateWelcomeCard };

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

function genTS(t: WTheme, serverName: string): string {
  return `// welcome-card.ts  —  versión TypeScript
// npm install @napi-rs/canvas

import { createCanvas, loadImage, SKRSContext2D } from "@napi-rs/canvas";

const W = 600, H = 180;
const SERVER = "${serverName || "Mi Servidor"}";

interface WelcomeOptions {
  username:    string;
  avatarUrl?:  string;
  memberCount: number;
}

interface Theme {
  bgFrom: string; bgTo: string;
  accent: string; text: string; sub: string;
}

const THEME: Theme = {
  bgFrom: "${t.bgFrom}", bgTo: "${t.bgTo}",
  accent: "${t.accent}", text: "${t.text}", sub: "${t.sub}",
};

function roundRect(ctx: SKRSContext2D, x: number, y: number,
    w: number, h: number, r: number): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export async function generateWelcomeCard(
  { username, avatarUrl, memberCount }: WelcomeOptions
): Promise<Buffer> {
  const canvas = createCanvas(W, H);
  const ctx    = canvas.getContext("2d");

  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, THEME.bgFrom); bg.addColorStop(1, THEME.bgTo);
  ctx.fillStyle = bg; roundRect(ctx, 0, 0, W, H, 16); ctx.fill();

  ctx.strokeStyle = THEME.accent + "35"; ctx.lineWidth = 1;
  roundRect(ctx, 1, 1, W - 2, H - 2, 15); ctx.stroke();

  const AR = 52;
  if (avatarUrl) {
    try {
      const img = await loadImage(avatarUrl);
      ctx.save(); ctx.beginPath();
      ctx.arc(W / 2, 14 + AR, AR, 0, Math.PI * 2); ctx.clip();
      ctx.drawImage(img, W / 2 - AR, 14, AR * 2, AR * 2);
      ctx.restore();
    } catch {}
  }

  ctx.strokeStyle = THEME.accent; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(W / 2, 14 + AR, AR + 2, 0, Math.PI * 2); ctx.stroke();

  ctx.textAlign = "center";
  ctx.font = "700 14px Inter"; ctx.fillStyle = THEME.accent;
  ctx.fillText("¡BIENVENIDO/A!", W / 2, 14 + AR * 2 + 22);
  ctx.font = "bold 26px Outfit"; ctx.fillStyle = THEME.text;
  ctx.fillText(username, W / 2, 14 + AR * 2 + 46);
  ctx.font = "500 13px Inter"; ctx.fillStyle = THEME.sub;
  ctx.fillText(\`Miembro #\${memberCount.toLocaleString()} · \${SERVER}\`, W / 2, 14 + AR * 2 + 66);

  return canvas.toBuffer("image/png");
}
`;
}

function genCommand(serverName: string): string {
  return `// events/guildMemberAdd.js  —  Discord.js v14 evento de bienvenida
// npm install discord.js @napi-rs/canvas

const { AttachmentBuilder } = require("discord.js");
const { generateWelcomeCard } = require("../utils/welcome-card");

// ID del canal de bienvenida — ponlo en config.json o .env
const WELCOME_CHANNEL_ID = "TU_CANAL_ID_AQUI";

module.exports = {
  name: "guildMemberAdd",
  async execute(member) {
    const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
    if (!channel) return;

    const avatarUrl = member.user.displayAvatarURL({ extension: "png", size: 256 });

    try {
      const buffer = await generateWelcomeCard({
        username:    member.user.username,
        avatarUrl,
        memberCount: member.guild.memberCount,
      });

      const attachment = new AttachmentBuilder(buffer, { name: "welcome.png" });

      await channel.send({
        content: \`👋 ¡Bienvenido/a al servidor, <@\${member.id}>!\`,
        files:   [attachment],
      });
    } catch (err) {
      console.error("[guildMemberAdd]", err);
    }
  },
};
`;
}

function genConfig(t: WTheme, layout: Layout, serverName: string): string {
  return JSON.stringify({
    generated: "ZM Tools — Welcome Card Generator",
    server:    serverName || "Mi Servidor",
    layout,
    theme: t.id,
    colors: {
      backgroundFrom: t.bgFrom, backgroundTo: t.bgTo,
      bgAngle:        t.bgAngle,
      accent:         t.accent,
      text:           t.text,
      subtext:        t.sub,
    },
    packages: ["@napi-rs/canvas", "discord.js"],
    event: "guildMemberAdd",
  }, null, 2);
}

// ─── Component ────────────────────────────────────────────────────────────

export default function WelcomeCard() {
  const [themeId,    setThemeId]    = useState("aurora");
  const [layout,     setLayout]     = useState<Layout>("banner");
  const [serverName, setServerName] = useState("Zona Muerta RP");
  const [tab,        setTab]        = useState<TabId>("canvas");
  const [copied,     setCopied]     = useState(false);
  const [customAccent, setCustomAccent] = useState("");

  const [prevUser,   setPrevUser]   = useState("NuevoMiembro");
  const [prevCount,  setPrevCount]  = useState(1337);

  const base  = THEMES.find(t => t.id === themeId) ?? THEMES[0];
  const theme = { ...base, accent: customAccent || base.accent };

  const code =
    tab === "canvas"     ? genCanvas(theme, layout, serverName) :
    tab === "typescript" ? genTS(theme, serverName) :
    tab === "command"    ? genCommand(serverName) :
                           genConfig(theme, layout, serverName);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true); setTimeout(() => setCopied(false), 2200);
  }, [code]);

  const TABS: { id: TabId; icon: React.ReactNode; label: string }[] = [
    { id: "canvas",     icon: <Code2 size={13} />,    label: "welcome-card.js" },
    { id: "typescript", icon: <Braces size={13} />,   label: "welcome-card.ts" },
    { id: "command",    icon: <Terminal size={13} />,  label: "guildMemberAdd.js" },
    { id: "config",     icon: <FileJson size={13} />,  label: "config.json" },
  ];

  const LAYOUTS: { id: Layout; label: string }[] = [
    { id: "banner",  label: "🎨 Banner centrado" },
    { id: "left",    label: "◀ Avatar + texto" },
    { id: "minimal", label: "▬ Compacto" },
  ];

  // Preview sizing
  const isMinimal = layout === "minimal";
  const cardW = isMinimal ? "520px" : "600px";
  const cardH = isMinimal ? "100px" : "180px";
  const AvatarSize = isMinimal ? 36 : layout === "left" ? 56 : 52;
  const topOffset  = isMinimal ? 0 : 14;

  return (
    <div className="tool-layout">
      <aside className="tool-sidebar">
        <div className="tool-header">
          <h2>Welcome Card</h2>
          <p>Genera tarjetas de bienvenida con canvas para tu bot</p>
        </div>

        <div className="tool-form">
          <label className="tool-label">Nombre del servidor
            <input className="tool-input" value={serverName} onChange={e => setServerName(e.target.value)} />
          </label>

          <span className="v6-label">Layout</span>
          <div className="v6-chips-wrap">
            {LAYOUTS.map(l => (
              <button key={l.id} className={`v6-chip ${layout === l.id ? "active" : ""}`}
                onClick={() => setLayout(l.id)}>{l.label}</button>
            ))}
          </div>

          <span className="v6-label">Tema</span>
          <div className="rc-theme-grid">
            {THEMES.map(t => (
              <button key={t.id}
                className={`rc-theme-btn ${themeId === t.id ? "active" : ""}`}
                style={{ background: `linear-gradient(${t.bgAngle}deg, ${t.bgFrom}, ${t.bgTo})` }}
                onClick={() => { setThemeId(t.id); setCustomAccent(""); }}>
                <span className="rc-theme-bar" style={{ background: t.accent, boxShadow: `0 0 6px ${t.accent}` }} />
                <span className="rc-theme-label">{t.label}</span>
              </button>
            ))}
          </div>

          <label className="tool-label">Color accent personalizado
            <input type="color" value={customAccent || theme.accent}
              onChange={e => setCustomAccent(e.target.value)}
              style={{ width: "100%", height: 34, padding: 2, borderRadius: 6, border: "1px solid var(--ui-border)", background: "transparent", cursor: "pointer" }} />
          </label>

          <span className="v6-label">Vista previa</span>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <label className="tool-label">Usuario
              <input className="tool-input" value={prevUser} onChange={e => setPrevUser(e.target.value)} />
            </label>
            <label className="tool-label">Nº miembro
              <input className="tool-input" type="number" min={1} value={prevCount} onChange={e => setPrevCount(+e.target.value)} />
            </label>
          </div>
        </div>
      </aside>

      <main className="tool-stage" style={{ flexDirection: "column", overflow: "hidden" }}>
        {/* Preview */}
        <div className="rc-preview-area">
          <div style={{
            width: cardW, height: cardH, borderRadius: 16,
            background: `linear-gradient(${theme.bgAngle}deg, ${theme.bgFrom}, ${theme.bgTo})`,
            position: "relative", overflow: "hidden", flexShrink: 0,
            boxShadow: `0 4px 24px rgba(0,0,0,0.5), inset 0 0 0 1px ${theme.accent}30`,
          }}>
            {/* Glow overlay */}
            <div style={{
              position: "absolute", inset: 0, borderRadius: 16,
              background: layout === "left"
                ? `radial-gradient(circle at 20% 50%, ${theme.accent}15, transparent 55%)`
                : `radial-gradient(circle at 50% 50%, ${theme.accent}15, transparent 60%)`,
              pointerEvents: "none",
            }} />

            {layout === "banner" && (
              <>
                <div style={{
                  position: "absolute", top: topOffset, left: "50%", transform: "translateX(-50%)",
                  width: AvatarSize * 2, height: AvatarSize * 2, borderRadius: "50%",
                  background: `linear-gradient(135deg, ${theme.accent}50, ${theme.bgTo})`,
                  border: `3px solid ${theme.accent}`,
                  boxShadow: `0 0 16px ${theme.accent}60`,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32,
                }}>👤</div>
                <div style={{ position: "absolute", top: topOffset + AvatarSize * 2 + 16, width: "100%", textAlign: "center" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: theme.accent, letterSpacing: "0.08em", marginBottom: 4 }}>¡BIENVENIDO/A!</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: theme.text, marginBottom: 3 }}>{prevUser || "Usuario"}</div>
                  <div style={{ fontSize: 12, color: theme.sub }}>Miembro #{prevCount.toLocaleString()} · {serverName}</div>
                </div>
              </>
            )}

            {layout === "left" && (
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", padding: "0 24px", gap: 20 }}>
                <div style={{
                  width: AvatarSize * 2, height: AvatarSize * 2, borderRadius: "50%",
                  background: `linear-gradient(135deg, ${theme.accent}50, ${theme.bgTo})`,
                  border: `3px solid ${theme.accent}`, boxShadow: `0 0 16px ${theme.accent}60`,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, flexShrink: 0,
                }}>👤</div>
                <div style={{ width: 1, height: 80, background: `${theme.accent}30`, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: theme.accent, letterSpacing: "0.08em", marginBottom: 4 }}>¡BIENVENIDO/A A</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: theme.text, marginBottom: 2 }}>{serverName}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: theme.text, marginBottom: 4 }}>{prevUser || "Usuario"}</div>
                  <div style={{ fontSize: 12, color: theme.sub }}>Eres el miembro #{prevCount.toLocaleString()}</div>
                </div>
              </div>
            )}

            {layout === "minimal" && (
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", padding: "0 20px", gap: 16 }}>
                <div style={{
                  width: AvatarSize * 2, height: AvatarSize * 2, borderRadius: "50%",
                  background: `linear-gradient(135deg, ${theme.accent}50, ${theme.bgTo})`,
                  border: `2.5px solid ${theme.accent}`,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0,
                }}>👤</div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: theme.sub, letterSpacing: "0.06em", marginBottom: 2 }}>¡BIENVENIDO/A!</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: theme.text, marginBottom: 1 }}>{prevUser || "Usuario"}</div>
                  <div style={{ fontSize: 11, color: theme.sub }}>Miembro #{prevCount.toLocaleString()} de {serverName}</div>
                </div>
              </div>
            )}
          </div>
          <p className="rc-preview-note">
            Preview HTML · el bot genera esta imagen en Node.js · {layout === "minimal" ? "520×100" : "600×180"} px
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
