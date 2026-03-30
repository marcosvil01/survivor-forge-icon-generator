import { useState, useCallback, useRef } from "react";
import {
  Copy, Check, Plus, Trash2, GripVertical, ChevronDown, ChevronRight,
  Hash, Volume2, Megaphone, Lock, Eye, EyeOff, Settings, Download,
  Upload, Layers, FolderOpen, MessageSquare, Shield, Users, Zap
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════════ */

type ChannelType = "text" | "voice" | "announcement" | "stage" | "forum" | "rules";

interface Channel {
  id: string;
  name: string;
  type: ChannelType;
  emoji: string;
  topic: string;
  slowmode: number;
  nsfw: boolean;
  locked: boolean;
  hidden: boolean;
}

interface Category {
  id: string;
  name: string;
  emoji: string;
  collapsed: boolean;
  channels: Channel[];
}

interface Role {
  id: string;
  name: string;
  color: string;
  hoist: boolean;
  mentionable: boolean;
  permissions: string[];
}

interface ServerTemplate {
  name: string;
  icon: string;
  description: string;
  categories: Category[];
  roles: Role[];
  welcomeChannel: string;
  rulesChannel: string;
  systemChannel: string;
  boostBar: boolean;
  communityEnabled: boolean;
  verificationLevel: "none" | "low" | "medium" | "high" | "highest";
}

/* ═══════════════════════════════════════════════════════════════════════════════
   PRESETS — Zona Muerta RP style
   ═══════════════════════════════════════════════════════════════════════════════ */

const uid = () => Math.random().toString(36).slice(2, 10);

const ch = (name: string, type: ChannelType = "text", emoji = "", topic = "", extra: Partial<Channel> = {}): Channel => ({
  id: uid(), name, type, emoji, topic, slowmode: 0, nsfw: false, locked: false, hidden: false, ...extra,
});

const cat = (name: string, emoji: string, channels: Channel[]): Category => ({
  id: uid(), name, emoji, collapsed: false, channels,
});

const PRESETS: { id: string; label: string; desc: string; icon: string; template: Partial<ServerTemplate> }[] = [
  {
    id: "zm-rp", label: "🧟 Zona Muerta RP", desc: "Servidor Zombie RP FiveM completo", icon: "🧟",
    template: {
      name: "Zona Muerta RP",
      description: "Servidor de roleplay zombie en FiveM — Sobrevive, explora, domina.",
      verificationLevel: "high",
      communityEnabled: true,
      boostBar: true,
      categories: [
        cat("INFORMACIÓN", "📋", [
          ch("bienvenidas", "text", "🎉", "Canal de bienvenida automática"),
          ch("reglas", "rules", "📜", "Reglas del servidor — léelas obligatoriamente"),
          ch("verificación", "text", "✅", "Verifica tu cuenta aquí", { locked: true }),
          ch("anuncios", "announcement", "📢", "Anuncios oficiales del staff"),
          ch("change-logs", "text", "⛔", "Registro de cambios y actualizaciones"),
          ch("sneak-peaks", "text", "👀", "Avances de lo que viene"),
        ]),
        cat("COMUNIDAD", "💬", [
          ch("chat-general", "text", "💬", "Habla de lo que quieras"),
          ch("multimedia", "text", "📸", "Comparte fotos, clips, memes"),
          ch("sugerencias", "text", "💡", "Propón mejoras para el servidor"),
          ch("reportes", "text", "🚨", "Reporta bugs o jugadores", { slowmode: 30 }),
          ch("dudas", "text", "❓", "Pregunta lo que necesites"),
          ch("off-topic", "text", "🎲", "Todo lo que no encaje en otro canal"),
        ]),
        cat("ROLEPLAY", "🎭", [
          ch("historias-rp", "text", "📖", "Comparte tus historias de roleplay"),
          ch("personajes", "text", "🧑", "Presenta tu personaje"),
          ch("diario-superviviente", "text", "📓", "Lleva un diario in-character"),
          ch("radio-frecuencias", "text", "📻", "Comunicados IC por radio"),
          ch("economia-rp", "text", "💰", "Sistema económico del RP"),
          ch("organizaciones", "text", "🏴", "Facciones y grupos organizados"),
        ]),
        cat("FIVEM", "🎮", [
          ch("como-conectar", "text", "🔗", "Guía paso a paso para conectar"),
          ch("mods-permitidos", "text", "🛠️", "Lista de mods permitidos"),
          ch("soporte-tecnico", "text", "🔧", "Ayuda técnica con FiveM"),
          ch("keys-whitelist", "text", "🔑", "Sistema de whitelist", { locked: true }),
          ch("configs", "text", "⚙️", "Configuraciones recomendadas"),
        ]),
        cat("ZONA DE COMBATE", "⚔️", [
          ch("eventos-pvp", "text", "🏟️", "Eventos de combate programados"),
          ch("zonas-peligrosas", "text", "☠️", "Mapa de zonas de alto riesgo"),
          ch("armamento", "text", "🔫", "Info sobre armas y crafteo"),
          ch("ranking-pvp", "text", "🏆", "Ranking de mejores combatientes"),
        ]),
        cat("SUPERVIVENCIA", "🧟", [
          ch("guia-supervivencia", "text", "🗺️", "Guías y tips para sobrevivir"),
          ch("recursos-crafteo", "text", "🔨", "Materiales, recetas, crafteo"),
          ch("bases-refugios", "text", "🏚️", "Info sobre construcción de bases"),
          ch("rutas-loot", "text", "💎", "Rutas de saqueo conocidas"),
          ch("zombies-info", "text", "🧟‍♂️", "Tipos de zombies y comportamiento"),
        ]),
        cat("STAFF", "🛡️", [
          ch("staff-chat", "text", "💼", "Chat interno del equipo", { hidden: true }),
          ch("sanciones", "text", "🔨", "Registro de sanciones", { hidden: true }),
          ch("postulaciones", "text", "📝", "Postulate como staff"),
          ch("reuniones", "text", "📅", "Calendario de reuniones staff", { hidden: true }),
          ch("logs", "text", "📊", "Logs del servidor", { hidden: true }),
        ]),
        cat("VOZ", "🔊", [
          ch("Sala General", "voice", "🔊"),
          ch("Roleplay 1", "voice", "🎭"),
          ch("Roleplay 2", "voice", "🎭"),
          ch("Soporte", "voice", "🎧"),
          ch("Eventos", "voice", "🏟️"),
          ch("Staff Room", "voice", "🛡️", "", { hidden: true }),
          ch("AFK", "voice", "💤"),
        ]),
        cat("LOGS", "📊", [
          ch("audit-log", "text", "📋", "Registro de auditoría", { hidden: true }),
          ch("join-leave", "text", "🚪", "Entradas y salidas", { hidden: true }),
          ch("msg-log", "text", "💬", "Mensajes editados/eliminados", { hidden: true }),
          ch("mod-log", "text", "🔨", "Acciones de moderación", { hidden: true }),
          ch("voice-log", "text", "🔊", "Cambios de canales de voz", { hidden: true }),
        ]),
      ],
      roles: [
        { id: uid(), name: "👑 Propietario", color: "#e74c3c", hoist: true, mentionable: false, permissions: ["ADMINISTRATOR"] },
        { id: uid(), name: "🛡️ Admin", color: "#e91e63", hoist: true, mentionable: false, permissions: ["ADMINISTRATOR"] },
        { id: uid(), name: "⚔️ Moderador", color: "#9b59b6", hoist: true, mentionable: true, permissions: ["MANAGE_MESSAGES", "KICK_MEMBERS", "BAN_MEMBERS", "MUTE_MEMBERS"] },
        { id: uid(), name: "🎧 Soporte", color: "#3498db", hoist: true, mentionable: true, permissions: ["MANAGE_MESSAGES", "MUTE_MEMBERS"] },
        { id: uid(), name: "🤖 Bots", color: "#2ecc71", hoist: true, mentionable: false, permissions: ["MANAGE_MESSAGES", "MANAGE_ROLES"] },
        { id: uid(), name: "🧟 Superviviente", color: "#f39c12", hoist: true, mentionable: true, permissions: [] },
        { id: uid(), name: "☠️ Infectado", color: "#e67e22", hoist: false, mentionable: true, permissions: [] },
        { id: uid(), name: "🏴 Líder de Facción", color: "#1abc9c", hoist: true, mentionable: true, permissions: [] },
        { id: uid(), name: "⭐ Booster", color: "#f47fff", hoist: true, mentionable: false, permissions: [] },
        { id: uid(), name: "✅ Verificado", color: "#2ecc71", hoist: false, mentionable: false, permissions: [] },
        { id: uid(), name: "🔇 Silenciado", color: "#7f8c8d", hoist: false, mentionable: false, permissions: [] },
        { id: uid(), name: "👤 Nuevo", color: "#95a5a6", hoist: false, mentionable: false, permissions: [] },
      ],
    },
  },
  {
    id: "rp-basic", label: "🎮 RP Genérico", desc: "Base para cualquier servidor RP", icon: "🎮",
    template: {
      name: "Mi Servidor RP",
      description: "Servidor de roleplay — tu historia, tus reglas.",
      verificationLevel: "medium",
      communityEnabled: true,
      boostBar: true,
      categories: [
        cat("INFO", "📋", [
          ch("reglas", "rules", "📜", "Lee las reglas"),
          ch("anuncios", "announcement", "📢", "Anuncios oficiales"),
          ch("bienvenida", "text", "👋", "Bienvenida automática"),
        ]),
        cat("GENERAL", "💬", [
          ch("chat", "text", "💬"),
          ch("memes", "text", "😂"),
          ch("multimedia", "text", "📸"),
        ]),
        cat("RP", "🎭", [
          ch("personajes", "text", "🧑"),
          ch("historias", "text", "📖"),
          ch("eventos", "text", "🎉"),
        ]),
        cat("STAFF", "🛡️", [
          ch("staff-chat", "text", "💼", "", { hidden: true }),
          ch("logs", "text", "📊", "", { hidden: true }),
          ch("postulaciones", "text", "📝"),
        ]),
        cat("VOZ", "🔊", [
          ch("General", "voice", "🔊"),
          ch("RP 1", "voice", "🎭"),
          ch("RP 2", "voice", "🎭"),
          ch("AFK", "voice", "💤"),
        ]),
      ],
      roles: [
        { id: uid(), name: "👑 Owner", color: "#e74c3c", hoist: true, mentionable: false, permissions: ["ADMINISTRATOR"] },
        { id: uid(), name: "🛡️ Admin", color: "#e91e63", hoist: true, mentionable: false, permissions: ["ADMINISTRATOR"] },
        { id: uid(), name: "⚔️ Mod", color: "#9b59b6", hoist: true, mentionable: true, permissions: ["MANAGE_MESSAGES", "KICK_MEMBERS"] },
        { id: uid(), name: "👤 Miembro", color: "#3498db", hoist: false, mentionable: false, permissions: [] },
      ],
    },
  },
  {
    id: "gaming", label: "🕹️ Gaming Community", desc: "Comunidad gaming con torneos", icon: "🕹️",
    template: {
      name: "Gaming Hub",
      description: "Comunidad de gaming — torneos, clips y más.",
      verificationLevel: "low",
      communityEnabled: true,
      boostBar: true,
      categories: [
        cat("INICIO", "🏠", [
          ch("bienvenida", "text", "👋"),
          ch("reglas", "rules", "📜"),
          ch("anuncios", "announcement", "📢"),
          ch("roles", "text", "🎨"),
        ]),
        cat("SOCIAL", "💬", [
          ch("general", "text", "💬"),
          ch("memes", "text", "😂"),
          ch("clips", "text", "🎬"),
          ch("arte", "text", "🎨"),
        ]),
        cat("JUEGOS", "🎮", [
          ch("valorant", "text", "🔫"),
          ch("minecraft", "text", "⛏️"),
          ch("gta-fivem", "text", "🚗"),
          ch("fortnite", "text", "🏗️"),
          ch("otros-juegos", "text", "🎲"),
        ]),
        cat("TORNEOS", "🏆", [
          ch("inscripciones", "text", "📝"),
          ch("brackets", "text", "📊"),
          ch("resultados", "text", "🥇"),
        ]),
        cat("VOZ", "🔊", [
          ch("Lobby", "voice", "🔊"),
          ch("Ranked", "voice", "⚔️"),
          ch("Chill", "voice", "☕"),
          ch("Stream", "voice", "📺"),
        ]),
      ],
      roles: [
        { id: uid(), name: "👑 Fundador", color: "#f1c40f", hoist: true, mentionable: false, permissions: ["ADMINISTRATOR"] },
        { id: uid(), name: "🛡️ Admin", color: "#e74c3c", hoist: true, mentionable: false, permissions: ["ADMINISTRATOR"] },
        { id: uid(), name: "⚔️ Mod", color: "#9b59b6", hoist: true, mentionable: true, permissions: ["MANAGE_MESSAGES", "KICK_MEMBERS"] },
        { id: uid(), name: "🏆 Torneo Champ", color: "#f39c12", hoist: true, mentionable: true, permissions: [] },
        { id: uid(), name: "🎮 Gamer", color: "#2ecc71", hoist: false, mentionable: false, permissions: [] },
      ],
    },
  },
];

const DEFAULT_TEMPLATE: ServerTemplate = {
  name: "Zona Muerta RP",
  icon: "🧟",
  description: "Servidor de roleplay zombie en FiveM",
  categories: PRESETS[0].template.categories!,
  roles: PRESETS[0].template.roles!,
  welcomeChannel: "bienvenidas",
  rulesChannel: "reglas",
  systemChannel: "bienvenidas",
  boostBar: true,
  communityEnabled: true,
  verificationLevel: "high",
};

const CHANNEL_ICONS: Record<ChannelType, typeof Hash> = {
  text: Hash, voice: Volume2, announcement: Megaphone,
  stage: Users, forum: MessageSquare, rules: Shield,
};

const CHANNEL_LABELS: Record<ChannelType, string> = {
  text: "Texto", voice: "Voz", announcement: "Anuncio",
  stage: "Stage", forum: "Foro", rules: "Reglas",
};

const VERIFICATION_LABELS: Record<string, string> = {
  none: "Ninguna", low: "Baja — Email verificado",
  medium: "Media — 5 min en servidor", high: "Alta — 10 min en servidor",
  highest: "Máxima — Teléfono verificado",
};

const COMMON_PERMS = [
  "ADMINISTRATOR", "MANAGE_GUILD", "MANAGE_ROLES", "MANAGE_CHANNELS",
  "KICK_MEMBERS", "BAN_MEMBERS", "MANAGE_MESSAGES", "MUTE_MEMBERS",
  "MOVE_MEMBERS", "MANAGE_NICKNAMES", "MENTION_EVERYONE", "VIEW_AUDIT_LOG",
  "SEND_MESSAGES", "EMBED_LINKS", "ATTACH_FILES", "USE_EXTERNAL_EMOJIS",
  "CONNECT", "SPEAK", "STREAM", "USE_VAD",
];

const POPULAR_EMOJIS = [
  "📋","💬","🎭","🎮","⚔️","🧟","🛡️","🔊","📊","🏠",
  "🎉","📜","✅","📢","⛔","👀","📸","💡","🚨","❓",
  "🎲","📖","🧑","📓","📻","💰","🏴","🔗","🛠️","🔧",
  "🔑","⚙️","🏟️","☠️","🔫","🏆","🗺️","🔨","🏚️","💎",
  "💼","📝","📅","🎧","💤","🚪","👑","⭐","🔇","👤",
  "🤖","🧟‍♂️","🎬","🎨","🚗","⛏️","🏗️","☕","📺","🥇",
  "😂","🔥","💀","👁️","🌙","🌊","🌿","🍂","❄️","⚡",
];

/* ═══════════════════════════════════════════════════════════════════════════════
   TABS
   ═══════════════════════════════════════════════════════════════════════════════ */

type Tab = "channels" | "roles" | "settings" | "export";
const TABS: { id: Tab; label: string; icon: typeof Layers }[] = [
  { id: "channels", label: "Canales", icon: Layers },
  { id: "roles",    label: "Roles",   icon: Shield },
  { id: "settings", label: "Config",  icon: Settings },
  { id: "export",   label: "Exportar",icon: Download },
];

/* ═══════════════════════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════════════════════ */

export default function TemplateCreator() {
  const [template, setTemplate] = useState<ServerTemplate>({ ...DEFAULT_TEMPLATE, categories: DEFAULT_TEMPLATE.categories.map(c => ({ ...c, channels: [...c.channels] })), roles: [...DEFAULT_TEMPLATE.roles] });
  const [tab, setTab] = useState<Tab>("channels");
  const [editCat, setEditCat] = useState<string | null>(null);
  const [editCh, setEditCh] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const [presetOpen, setPresetOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // ─── helpers ──────────────────────────────────────────
  const T = template;
  const set = <K extends keyof ServerTemplate>(k: K, v: ServerTemplate[K]) => setTemplate(t => ({ ...t, [k]: v }));

  const updateCat = (catId: string, fn: (c: Category) => Category) =>
    set("categories", T.categories.map(c => c.id === catId ? fn(c) : c));

  const updateCh = (catId: string, chId: string, fn: (c: Channel) => Channel) =>
    updateCat(catId, cat => ({ ...cat, channels: cat.channels.map(c => c.id === chId ? fn(c) : c) }));

  const updateRole = (roleId: string, fn: (r: Role) => Role) =>
    set("roles", T.roles.map(r => r.id === roleId ? fn(r) : r));

  const addCategory = () => {
    const c = cat("nueva-categoría", "📁", []);
    set("categories", [...T.categories, c]);
    setEditCat(c.id);
  };

  const removeCategory = (id: string) => set("categories", T.categories.filter(c => c.id !== id));

  const addChannel = (catId: string) => {
    const c = ch("nuevo-canal");
    updateCat(catId, cat => ({ ...cat, channels: [...cat.channels, c] }));
    setEditCh(c.id);
  };

  const removeChannel = (catId: string, chId: string) =>
    updateCat(catId, cat => ({ ...cat, channels: cat.channels.filter(c => c.id !== chId) }));

  const moveChannel = (catId: string, chId: string, dir: -1 | 1) =>
    updateCat(catId, cat => {
      const idx = cat.channels.findIndex(c => c.id === chId);
      if (idx < 0) return cat;
      const nIdx = idx + dir;
      if (nIdx < 0 || nIdx >= cat.channels.length) return cat;
      const chs = [...cat.channels];
      [chs[idx], chs[nIdx]] = [chs[nIdx], chs[idx]];
      return { ...cat, channels: chs };
    });

  const moveCategory = (catId: string, dir: -1 | 1) => {
    const idx = T.categories.findIndex(c => c.id === catId);
    if (idx < 0) return;
    const nIdx = idx + dir;
    if (nIdx < 0 || nIdx >= T.categories.length) return;
    const cats = [...T.categories];
    [cats[idx], cats[nIdx]] = [cats[nIdx], cats[idx]];
    set("categories", cats);
  };

  const addRole = () => {
    const r: Role = { id: uid(), name: "Nuevo Rol", color: "#99aab5", hoist: false, mentionable: false, permissions: [] };
    set("roles", [...T.roles, r]);
    setEditRole(r.id);
  };

  const removeRole = (id: string) => set("roles", T.roles.filter(r => r.id !== id));

  const moveRole = (roleId: string, dir: -1 | 1) => {
    const idx = T.roles.findIndex(r => r.id === roleId);
    if (idx < 0) return;
    const nIdx = idx + dir;
    if (nIdx < 0 || nIdx >= T.roles.length) return;
    const rs = [...T.roles];
    [rs[idx], rs[nIdx]] = [rs[nIdx], rs[idx]];
    set("roles", rs);
  };

  const applyPreset = (presetId: string) => {
    const p = PRESETS.find(pr => pr.id === presetId);
    if (!p) return;
    setTemplate({
      ...DEFAULT_TEMPLATE,
      ...p.template,
      categories: (p.template.categories || []).map(c => ({ ...c, channels: c.channels.map(ch => ({ ...ch })) })),
      roles: (p.template.roles || []).map(r => ({ ...r, permissions: [...r.permissions] })),
    });
    setPresetOpen(false);
    setEditCat(null);
    setEditCh(null);
    setEditRole(null);
  };

  const handleCopy = useCallback(async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2200);
  }, []);

  const totalChannels = T.categories.reduce((a, c) => a + c.channels.length, 0);

  // ─── Export generators ────────────────────────────────

  const genDiscordBotJS = () => {
    const lines: string[] = [
      `// ═══════════════════════════════════════════════════════`,
      `// Discord.js v14 — Server Template Setup`,
      `// Generado por ZM Tools — ${T.name}`,
      `// ═══════════════════════════════════════════════════════`,
      ``,
      `const { Client, GatewayIntentBits, ChannelType, PermissionFlagsBits } = require("discord.js");`,
      ``,
      `const client = new Client({`,
      `  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],`,
      `});`,
      ``,
      `const TEMPLATE = ${JSON.stringify({ name: T.name, description: T.description, verificationLevel: T.verificationLevel }, null, 2)};`,
      ``,
      `// ─── Roles ──────────────────────────────────────`,
      `const ROLES = ${JSON.stringify(T.roles.map(r => ({ name: r.name, color: r.color, hoist: r.hoist, mentionable: r.mentionable, permissions: r.permissions })), null, 2)};`,
      ``,
      `// ─── Categories & Channels ─────────────────────`,
      `const CATEGORIES = ${JSON.stringify(T.categories.map(c => ({
        name: `${c.emoji} ${c.name}`.trim(),
        channels: c.channels.map(ch => ({
          name: ch.name,
          type: ch.type === "voice" ? "GuildVoice" : ch.type === "announcement" ? "GuildAnnouncement" : ch.type === "stage" ? "GuildStageVoice" : ch.type === "forum" ? "GuildForum" : "GuildText",
          topic: ch.topic || undefined,
          emoji: ch.emoji || undefined,
          slowmode: ch.slowmode || undefined,
          nsfw: ch.nsfw || undefined,
          hidden: ch.hidden || undefined,
        })),
      })), null, 2)};`,
      ``,
      `async function setupServer(guild) {`,
      `  console.log(\`⚙️ Configurando servidor: \${guild.name}\`);`,
      ``,
      `  // Crear roles (en orden inverso para jerarquía correcta)`,
      `  const createdRoles = {};`,
      `  for (const role of [...ROLES].reverse()) {`,
      `    try {`,
      `      const r = await guild.roles.create({`,
      `        name: role.name,`,
      `        color: role.color,`,
      `        hoist: role.hoist,`,
      `        mentionable: role.mentionable,`,
      `        permissions: role.permissions.map(p => PermissionFlagsBits[p]).filter(Boolean),`,
      `      });`,
      `      createdRoles[role.name] = r;`,
      `      console.log(\`  ✅ Rol creado: \${role.name}\`);`,
      `    } catch (e) {`,
      `      console.error(\`  ❌ Error creando rol \${role.name}:\`, e.message);`,
      `    }`,
      `  }`,
      ``,
      `  // Crear categorías y canales`,
      `  for (const cat of CATEGORIES) {`,
      `    try {`,
      `      const category = await guild.channels.create({`,
      `        name: cat.name,`,
      `        type: ChannelType.GuildCategory,`,
      `      });`,
      `      console.log(\`  📁 Categoría: \${cat.name}\`);`,
      ``,
      `      for (const ch of cat.channels) {`,
      `        const opts = {`,
      `          name: ch.emoji ? \`\${ch.emoji}・\${ch.name}\` : ch.name,`,
      `          type: ChannelType[ch.type],`,
      `          parent: category.id,`,
      `          topic: ch.topic || undefined,`,
      `          rateLimitPerUser: ch.slowmode || undefined,`,
      `          nsfw: ch.nsfw || undefined,`,
      `        };`,
      ``,
      `        if (ch.hidden) {`,
      `          opts.permissionOverwrites = [`,
      `            { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },`,
      `          ];`,
      `        }`,
      ``,
      `        await guild.channels.create(opts);`,
      `        console.log(\`    #\${ch.name}\`);`,
      `      }`,
      `    } catch (e) {`,
      `      console.error(\`  ❌ Error:\`, e.message);`,
      `    }`,
      `  }`,
      ``,
      `  console.log("\\n🎉 Servidor configurado correctamente!");`,
      `}`,
      ``,
      `// ─── Comando /setup ──────────────────────────────`,
      `client.on("interactionCreate", async (interaction) => {`,
      `  if (!interaction.isChatInputCommand()) return;`,
      `  if (interaction.commandName !== "setup") return;`,
      `  if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {`,
      `    return interaction.reply({ content: "❌ Sin permisos.", ephemeral: true });`,
      `  }`,
      `  await interaction.deferReply({ ephemeral: true });`,
      `  await setupServer(interaction.guild);`,
      `  await interaction.editReply("✅ Servidor configurado con la plantilla.");`,
      `});`,
      ``,
      `client.login(process.env.TOKEN);`,
    ];
    return lines.join("\n");
  };

  const genDiscordBotTS = () => {
    const lines: string[] = [
      `// ═══════════════════════════════════════════════════════`,
      `// Discord.js v14 — Server Template Setup (TypeScript)`,
      `// Generado por ZM Tools — ${T.name}`,
      `// ═══════════════════════════════════════════════════════`,
      ``,
      `import { Client, GatewayIntentBits, ChannelType, PermissionFlagsBits, Guild, GuildChannelCreateOptions } from "discord.js";`,
      ``,
      `interface RoleTemplate {`,
      `  name: string;`,
      `  color: string;`,
      `  hoist: boolean;`,
      `  mentionable: boolean;`,
      `  permissions: (keyof typeof PermissionFlagsBits)[];`,
      `}`,
      ``,
      `interface ChannelTemplate {`,
      `  name: string;`,
      `  type: keyof typeof ChannelType;`,
      `  topic?: string;`,
      `  emoji?: string;`,
      `  slowmode?: number;`,
      `  nsfw?: boolean;`,
      `  hidden?: boolean;`,
      `}`,
      ``,
      `interface CategoryTemplate {`,
      `  name: string;`,
      `  channels: ChannelTemplate[];`,
      `}`,
      ``,
      `const ROLES: RoleTemplate[] = ${JSON.stringify(T.roles.map(r => ({ name: r.name, color: r.color, hoist: r.hoist, mentionable: r.mentionable, permissions: r.permissions })), null, 2)};`,
      ``,
      `const CATEGORIES: CategoryTemplate[] = ${JSON.stringify(T.categories.map(c => ({
        name: `${c.emoji} ${c.name}`.trim(),
        channels: c.channels.map(ch => ({
          name: ch.name,
          type: ch.type === "voice" ? "GuildVoice" : ch.type === "announcement" ? "GuildAnnouncement" : ch.type === "stage" ? "GuildStageVoice" : ch.type === "forum" ? "GuildForum" : "GuildText",
          topic: ch.topic || undefined,
          emoji: ch.emoji || undefined,
          slowmode: ch.slowmode || undefined,
          nsfw: ch.nsfw || undefined,
          hidden: ch.hidden || undefined,
        })),
      })), null, 2)};`,
      ``,
      `async function setupServer(guild: Guild): Promise<void> {`,
      `  console.log(\`⚙️ Configurando: \${guild.name}\`);`,
      `  for (const role of [...ROLES].reverse()) {`,
      `    await guild.roles.create({`,
      `      name: role.name, color: role.color as any,`,
      `      hoist: role.hoist, mentionable: role.mentionable,`,
      `      permissions: role.permissions.map(p => PermissionFlagsBits[p]).filter(Boolean),`,
      `    });`,
      `  }`,
      `  for (const cat of CATEGORIES) {`,
      `    const category = await guild.channels.create({ name: cat.name, type: ChannelType.GuildCategory });`,
      `    for (const ch of cat.channels) {`,
      `      const opts: GuildChannelCreateOptions = {`,
      `        name: ch.emoji ? \`\${ch.emoji}・\${ch.name}\` : ch.name,`,
      `        type: ChannelType[ch.type] as any,`,
      `        parent: category.id,`,
      `        topic: ch.topic,`,
      `        rateLimitPerUser: ch.slowmode,`,
      `        nsfw: ch.nsfw,`,
      `      };`,
      `      if (ch.hidden) (opts as any).permissionOverwrites = [{ id: guild.id, deny: [PermissionFlagsBits.ViewChannel] }];`,
      `      await guild.channels.create(opts);`,
      `    }`,
      `  }`,
      `  console.log("🎉 Servidor listo.");`,
      `}`,
      ``,
      `const client = new Client({ intents: [GatewayIntentBits.Guilds] });`,
      `client.login(process.env.TOKEN);`,
    ];
    return lines.join("\n");
  };

  const genJSON = () => JSON.stringify({
    name: T.name,
    description: T.description,
    verification_level: T.verificationLevel,
    community: T.communityEnabled,
    roles: T.roles.map(r => ({ name: r.name, color: r.color, hoist: r.hoist, mentionable: r.mentionable, permissions: r.permissions })),
    categories: T.categories.map(c => ({
      name: c.name, emoji: c.emoji,
      channels: c.channels.map(ch => ({
        name: ch.name, type: ch.type, emoji: ch.emoji,
        topic: ch.topic || undefined,
        slowmode: ch.slowmode || undefined,
        nsfw: ch.nsfw || undefined,
        locked: ch.locked || undefined,
        hidden: ch.hidden || undefined,
      })),
    })),
    welcomeChannel: T.welcomeChannel,
    rulesChannel: T.rulesChannel,
    systemChannel: T.systemChannel,
  }, null, 2);

  const genMarkdown = () => {
    const lines: string[] = [
      `# 🏗️ ${T.name} — Estructura del Servidor`,
      `> ${T.description}`,
      ``,
      `**Verificación:** ${VERIFICATION_LABELS[T.verificationLevel]}`,
      `**Comunidad:** ${T.communityEnabled ? "✅ Activada" : "❌ Desactivada"}`,
      `**Roles:** ${T.roles.length} | **Canales:** ${totalChannels}`,
      ``,
      `---`,
      ``,
      `## 🛡️ Roles`,
      ``,
      `| Rol | Color | Separado | Mencionable | Permisos |`,
      `|-----|-------|----------|-------------|----------|`,
      ...T.roles.map(r => `| ${r.name} | \`${r.color}\` | ${r.hoist ? "✅" : "❌"} | ${r.mentionable ? "✅" : "❌"} | ${r.permissions.length ? r.permissions.join(", ") : "—"} |`),
      ``,
      `---`,
      ``,
      `## 📁 Canales`,
      ``,
    ];
    for (const cat of T.categories) {
      lines.push(`### ${cat.emoji} ${cat.name}`);
      lines.push(``);
      for (const c of cat.channels) {
        const flags = [
          c.locked && "🔒",
          c.hidden && "👁️‍🗨️",
          c.nsfw && "🔞",
          c.slowmode && `⏱️${c.slowmode}s`,
        ].filter(Boolean).join(" ");
        const icon = c.type === "voice" ? "🔊" : c.type === "announcement" ? "📢" : c.type === "rules" ? "📜" : c.type === "forum" ? "💬" : c.type === "stage" ? "🎙️" : "#";
        lines.push(`- ${icon} ${c.emoji} **${c.name}** ${c.topic ? `— *${c.topic}*` : ""} ${flags}`);
      }
      lines.push(``);
    }
    return lines.join("\n");
  };

  const handleExportFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        if (data.categories && data.roles) {
          setTemplate({
            ...DEFAULT_TEMPLATE,
            ...data,
            categories: (data.categories || []).map((c: any) => ({
              id: uid(), name: c.name || "", emoji: c.emoji || "", collapsed: false,
              channels: (c.channels || []).map((ch: any) => ({
                id: uid(), name: ch.name || "", type: ch.type || "text", emoji: ch.emoji || "",
                topic: ch.topic || "", slowmode: ch.slowmode || 0, nsfw: !!ch.nsfw, locked: !!ch.locked, hidden: !!ch.hidden,
              })),
            })),
            roles: (data.roles || []).map((r: any) => ({
              id: uid(), name: r.name || "", color: r.color || "#99aab5",
              hoist: !!r.hoist, mentionable: !!r.mentionable, permissions: r.permissions || [],
            })),
          });
        }
      } catch { /* ignore bad JSON */ }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // ─── RENDER ─────────────────────────────────────────

  return (
    <div className="tool-layout">
      <aside className="tool-sidebar tc-sidebar">
        <div className="tool-header">
          <h2>🏗️ Template Creator</h2>
          <p>Creador mega-completo de estructuras de servidor Discord</p>
        </div>

        {/* Preset selector */}
        <div className="tc-preset-section">
          <span className="v6-label">Plantillas Base</span>
          <button className="tc-preset-toggle" onClick={() => setPresetOpen(!presetOpen)}>
            {presetOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            Seleccionar Plantilla
          </button>
          {presetOpen && (
            <div className="tc-preset-list">
              {PRESETS.map(p => (
                <button key={p.id} className="tc-preset-card" onClick={() => applyPreset(p.id)}>
                  <span className="tc-preset-icon">{p.icon}</span>
                  <div>
                    <strong>{p.label}</strong>
                    <span>{p.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="tc-tabs">
          {TABS.map(t => (
            <button key={t.id} className={`tc-tab ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
              <t.icon size={14} /> {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="tc-tab-content">

          {/* ─── CHANNELS TAB ──── */}
          {tab === "channels" && (
            <div className="tc-channels-editor">
              {T.categories.map((cat, catIdx) => (
                <div key={cat.id} className="tc-cat-block">
                  <div className="tc-cat-header" onClick={() => updateCat(cat.id, c => ({ ...c, collapsed: !c.collapsed }))}>
                    <span className="tc-cat-chevron">{cat.collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}</span>
                    <span className="tc-cat-emoji">{cat.emoji}</span>
                    <span className="tc-cat-name">{cat.name.toUpperCase()}</span>
                    <span className="tc-cat-count">{cat.channels.length}</span>
                    <div className="tc-cat-actions" onClick={e => e.stopPropagation()}>
                      <button title="Editar" onClick={() => setEditCat(editCat === cat.id ? null : cat.id)}>
                        <Settings size={12} />
                      </button>
                      <button title="Mover arriba" onClick={() => moveCategory(cat.id, -1)} disabled={catIdx === 0}>▲</button>
                      <button title="Mover abajo" onClick={() => moveCategory(cat.id, 1)} disabled={catIdx === T.categories.length - 1}>▼</button>
                      <button title="Eliminar" onClick={() => removeCategory(cat.id)} className="tc-danger">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Category edit panel */}
                  {editCat === cat.id && (
                    <div className="tc-edit-panel">
                      <div className="tc-edit-row">
                        <label>Nombre</label>
                        <input value={cat.name} onChange={e => updateCat(cat.id, c => ({ ...c, name: e.target.value }))} />
                      </div>
                      <div className="tc-edit-row">
                        <label>Emoji</label>
                        <div className="tc-emoji-input">
                          <input value={cat.emoji} onChange={e => updateCat(cat.id, c => ({ ...c, emoji: e.target.value }))} style={{ width: 60 }} />
                          <button className="tc-emoji-btn" onClick={() => setShowEmojiPicker(showEmojiPicker === `cat-${cat.id}` ? null : `cat-${cat.id}`)}>
                            📋
                          </button>
                        </div>
                        {showEmojiPicker === `cat-${cat.id}` && (
                          <div className="tc-emoji-grid">
                            {POPULAR_EMOJIS.map(em => (
                              <button key={em} onClick={() => { updateCat(cat.id, c => ({ ...c, emoji: em })); setShowEmojiPicker(null); }}>{em}</button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Channels */}
                  {!cat.collapsed && (
                    <div className="tc-ch-list">
                      {cat.channels.map((c, chIdx) => {
                        const CIcon = CHANNEL_ICONS[c.type];
                        return (
                          <div key={c.id} className={`tc-ch-item ${editCh === c.id ? "editing" : ""}`}>
                            <div className="tc-ch-row">
                              <GripVertical size={12} className="tc-grip" />
                              <span className="tc-ch-emoji">{c.emoji}</span>
                              <CIcon size={14} className="tc-ch-type-icon" />
                              <span className="tc-ch-name">{c.name}</span>
                              <div className="tc-ch-flags">
                                {c.hidden && <EyeOff size={10} title="Oculto" />}
                                {c.locked && <Lock size={10} title="Bloqueado" />}
                                {c.nsfw && <span className="tc-nsfw-badge">18+</span>}
                              </div>
                              <div className="tc-ch-actions" onClick={e => e.stopPropagation()}>
                                <button onClick={() => setEditCh(editCh === c.id ? null : c.id)}><Settings size={11} /></button>
                                <button onClick={() => moveChannel(cat.id, c.id, -1)} disabled={chIdx === 0}>▲</button>
                                <button onClick={() => moveChannel(cat.id, c.id, 1)} disabled={chIdx === cat.channels.length - 1}>▼</button>
                                <button className="tc-danger" onClick={() => removeChannel(cat.id, c.id)}><Trash2 size={11} /></button>
                              </div>
                            </div>

                            {editCh === c.id && (
                              <div className="tc-edit-panel tc-ch-edit">
                                <div className="tc-edit-grid">
                                  <div className="tc-edit-row">
                                    <label>Nombre</label>
                                    <input value={c.name} onChange={e => updateCh(cat.id, c.id, ch => ({ ...ch, name: e.target.value }))} />
                                  </div>
                                  <div className="tc-edit-row">
                                    <label>Tipo</label>
                                    <select value={c.type} onChange={e => updateCh(cat.id, c.id, ch => ({ ...ch, type: e.target.value as ChannelType }))}>
                                      {Object.entries(CHANNEL_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                    </select>
                                  </div>
                                  <div className="tc-edit-row">
                                    <label>Emoji</label>
                                    <div className="tc-emoji-input">
                                      <input value={c.emoji} onChange={e => updateCh(cat.id, c.id, ch => ({ ...ch, emoji: e.target.value }))} style={{ width: 60 }} />
                                      <button className="tc-emoji-btn" onClick={() => setShowEmojiPicker(showEmojiPicker === c.id ? null : c.id)}>📋</button>
                                    </div>
                                    {showEmojiPicker === c.id && (
                                      <div className="tc-emoji-grid">
                                        {POPULAR_EMOJIS.map(em => (
                                          <button key={em} onClick={() => { updateCh(cat.id, c.id, ch => ({ ...ch, emoji: em })); setShowEmojiPicker(null); }}>{em}</button>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  <div className="tc-edit-row">
                                    <label>Topic</label>
                                    <input value={c.topic} onChange={e => updateCh(cat.id, c.id, ch => ({ ...ch, topic: e.target.value }))} placeholder="Descripción del canal..." />
                                  </div>
                                  {c.type === "text" && (
                                    <div className="tc-edit-row">
                                      <label>Slowmode (seg)</label>
                                      <input type="number" min={0} max={21600} value={c.slowmode} onChange={e => updateCh(cat.id, c.id, ch => ({ ...ch, slowmode: Number(e.target.value) }))} />
                                    </div>
                                  )}
                                </div>
                                <div className="tc-toggles">
                                  <label className="tc-toggle">
                                    <input type="checkbox" checked={c.hidden} onChange={e => updateCh(cat.id, c.id, ch => ({ ...ch, hidden: e.target.checked }))} />
                                    <EyeOff size={12} /> Oculto (solo staff)
                                  </label>
                                  <label className="tc-toggle">
                                    <input type="checkbox" checked={c.locked} onChange={e => updateCh(cat.id, c.id, ch => ({ ...ch, locked: e.target.checked }))} />
                                    <Lock size={12} /> Bloqueado (solo lectura)
                                  </label>
                                  {c.type === "text" && (
                                    <label className="tc-toggle">
                                      <input type="checkbox" checked={c.nsfw} onChange={e => updateCh(cat.id, c.id, ch => ({ ...ch, nsfw: e.target.checked }))} />
                                      🔞 NSFW
                                    </label>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                      <button className="tc-add-ch" onClick={() => addChannel(cat.id)}>
                        <Plus size={13} /> Añadir Canal
                      </button>
                    </div>
                  )}
                </div>
              ))}
              <button className="tc-add-cat" onClick={addCategory}>
                <FolderOpen size={14} /> Añadir Categoría
              </button>
            </div>
          )}

          {/* ─── ROLES TAB ──── */}
          {tab === "roles" && (
            <div className="tc-roles-editor">
              <p className="tc-hint">Orden jerárquico: el primero tiene más poder. Arrastra para reordenar.</p>
              {T.roles.map((role, rIdx) => (
                <div key={role.id} className={`tc-role-item ${editRole === role.id ? "editing" : ""}`}>
                  <div className="tc-role-row">
                    <div className="tc-role-color-dot" style={{ background: role.color }} />
                    <span className="tc-role-name">{role.name}</span>
                    <div className="tc-role-badges">
                      {role.hoist && <span className="tc-badge" title="Separado">H</span>}
                      {role.mentionable && <span className="tc-badge" title="Mencionable">@</span>}
                      {role.permissions.includes("ADMINISTRATOR") && <span className="tc-badge tc-badge-admin" title="Admin">⚡</span>}
                    </div>
                    <div className="tc-ch-actions">
                      <button onClick={() => setEditRole(editRole === role.id ? null : role.id)}><Settings size={11} /></button>
                      <button onClick={() => moveRole(role.id, -1)} disabled={rIdx === 0}>▲</button>
                      <button onClick={() => moveRole(role.id, 1)} disabled={rIdx === T.roles.length - 1}>▼</button>
                      <button className="tc-danger" onClick={() => removeRole(role.id)}><Trash2 size={11} /></button>
                    </div>
                  </div>

                  {editRole === role.id && (
                    <div className="tc-edit-panel">
                      <div className="tc-edit-grid">
                        <div className="tc-edit-row">
                          <label>Nombre</label>
                          <input value={role.name} onChange={e => updateRole(role.id, r => ({ ...r, name: e.target.value }))} />
                        </div>
                        <div className="tc-edit-row">
                          <label>Color</label>
                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <input type="color" value={role.color} onChange={e => updateRole(role.id, r => ({ ...r, color: e.target.value }))} style={{ width: 36, height: 28, padding: 0, border: "none", cursor: "pointer" }} />
                            <input value={role.color} onChange={e => updateRole(role.id, r => ({ ...r, color: e.target.value }))} style={{ width: 80, fontFamily: "monospace" }} />
                          </div>
                        </div>
                      </div>
                      <div className="tc-toggles">
                        <label className="tc-toggle">
                          <input type="checkbox" checked={role.hoist} onChange={e => updateRole(role.id, r => ({ ...r, hoist: e.target.checked }))} />
                          Mostrar separado en lista
                        </label>
                        <label className="tc-toggle">
                          <input type="checkbox" checked={role.mentionable} onChange={e => updateRole(role.id, r => ({ ...r, mentionable: e.target.checked }))} />
                          Mencionable por todos
                        </label>
                      </div>
                      <div className="tc-perms-section">
                        <label className="v6-label" style={{ marginTop: 8 }}>Permisos</label>
                        <div className="tc-perms-grid">
                          {COMMON_PERMS.map(perm => (
                            <label key={perm} className={`tc-perm-chip ${role.permissions.includes(perm) ? "active" : ""}`}>
                              <input
                                type="checkbox"
                                checked={role.permissions.includes(perm)}
                                onChange={e => updateRole(role.id, r => ({
                                  ...r,
                                  permissions: e.target.checked
                                    ? [...r.permissions, perm]
                                    : r.permissions.filter(p => p !== perm),
                                }))}
                              />
                              {perm.replace(/_/g, " ")}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <button className="tc-add-cat" onClick={addRole}>
                <Plus size={14} /> Añadir Rol
              </button>
            </div>
          )}

          {/* ─── SETTINGS TAB ──── */}
          {tab === "settings" && (
            <div className="tc-settings">
              <div className="tc-edit-row">
                <label>Nombre del Servidor</label>
                <input value={T.name} onChange={e => set("name", e.target.value)} />
              </div>
              <div className="tc-edit-row">
                <label>Icono (emoji)</label>
                <div className="tc-emoji-input">
                  <input value={T.icon} onChange={e => set("icon", e.target.value)} style={{ width: 60 }} />
                  <button className="tc-emoji-btn" onClick={() => setShowEmojiPicker(showEmojiPicker === "server-icon" ? null : "server-icon")}>📋</button>
                </div>
                {showEmojiPicker === "server-icon" && (
                  <div className="tc-emoji-grid">
                    {POPULAR_EMOJIS.map(em => (
                      <button key={em} onClick={() => { set("icon", em); setShowEmojiPicker(null); }}>{em}</button>
                    ))}
                  </div>
                )}
              </div>
              <div className="tc-edit-row">
                <label>Descripción</label>
                <textarea value={T.description} onChange={e => set("description", e.target.value)} rows={3} />
              </div>
              <div className="tc-edit-row">
                <label>Nivel de Verificación</label>
                <select value={T.verificationLevel} onChange={e => set("verificationLevel", e.target.value as any)}>
                  {Object.entries(VERIFICATION_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div className="tc-edit-row">
                <label>Canal de Bienvenida</label>
                <select value={T.welcomeChannel} onChange={e => set("welcomeChannel", e.target.value)}>
                  <option value="">— Ninguno —</option>
                  {T.categories.flatMap(c => c.channels).filter(c => c.type === "text").map(c => (
                    <option key={c.id} value={c.name}>{c.emoji} {c.name}</option>
                  ))}
                </select>
              </div>
              <div className="tc-edit-row">
                <label>Canal de Reglas</label>
                <select value={T.rulesChannel} onChange={e => set("rulesChannel", e.target.value)}>
                  <option value="">— Ninguno —</option>
                  {T.categories.flatMap(c => c.channels).map(c => (
                    <option key={c.id} value={c.name}>{c.emoji} {c.name}</option>
                  ))}
                </select>
              </div>
              <div className="tc-toggles" style={{ marginTop: 12 }}>
                <label className="tc-toggle">
                  <input type="checkbox" checked={T.communityEnabled} onChange={e => set("communityEnabled", e.target.checked)} />
                  <Users size={12} /> Comunidad activada
                </label>
                <label className="tc-toggle">
                  <input type="checkbox" checked={T.boostBar} onChange={e => set("boostBar", e.target.checked)} />
                  <Zap size={12} /> Barra de boost
                </label>
              </div>

              {/* Import */}
              <div style={{ marginTop: 20 }}>
                <span className="v6-label">Importar / Exportar JSON</span>
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <button className="tc-action-btn" onClick={() => fileRef.current?.click()}>
                    <Upload size={13} /> Importar JSON
                  </button>
                  <button className="tc-action-btn" onClick={() => handleExportFile(genJSON(), `${T.name.toLowerCase().replace(/\s+/g, "-")}-template.json`)}>
                    <Download size={13} /> Descargar JSON
                  </button>
                </div>
                <input ref={fileRef} type="file" accept=".json" onChange={handleImport} style={{ display: "none" }} />
              </div>
            </div>
          )}

          {/* ─── EXPORT TAB ──── */}
          {tab === "export" && (
            <div className="tc-export">
              <p className="tc-hint">Genera código listo para copiar y pegar. Elige el formato que necesites.</p>

              {([
                { key: "js", title: "📦 Discord.js v14", desc: "Código completo con /setup", gen: genDiscordBotJS, filename: "setup-server.js" },
                { key: "ts", title: "📘 TypeScript", desc: "Versión tipada con interfaces", gen: genDiscordBotTS, filename: "setup-server.ts" },
                { key: "json", title: "📄 JSON Template", desc: "Datos puros, importable", gen: genJSON, filename: `${T.name.toLowerCase().replace(/\s+/g, "-")}-template.json` },
                { key: "md", title: "📝 Markdown Doc", desc: "Documentación legible", gen: genMarkdown, filename: `${T.name.toLowerCase().replace(/\s+/g, "-")}-structure.md` },
              ] as const).map(exp => (
                <div key={exp.key} className="tc-export-card">
                  <div className="tc-export-header">
                    <div>
                      <strong>{exp.title}</strong>
                      <span>{exp.desc}</span>
                    </div>
                    <div className="tc-export-btns">
                      <button className={`rc-copy-btn ${copied === exp.key ? "done" : ""}`} onClick={() => handleCopy(exp.gen(), exp.key)}>
                        {copied === exp.key ? <><Check size={12} /> Copiado</> : <><Copy size={12} /> Copiar</>}
                      </button>
                      <button className="tc-action-btn" onClick={() => handleExportFile(exp.gen(), exp.filename)}>
                        <Download size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* ═══════════════════════════════════════════════════════
         PREVIEW — Fake Discord sidebar
         ═══════════════════════════════════════════════════════ */}
      <main className="tool-stage tc-preview-stage">
        <div className="tc-preview-header">
          <div className="tc-server-icon">{T.icon}</div>
          <div className="tc-server-info">
            <h3>{T.name}</h3>
            <span>{totalChannels} canales · {T.roles.length} roles · {T.categories.length} categorías</span>
          </div>
        </div>

        <div className="tc-discord-preview">
          {/* Boost bar */}
          {T.boostBar && (
            <div className="tc-boost-bar">
              <Zap size={13} /> Boosteado · Nivel 2
            </div>
          )}

          {/* Channel list */}
          <div className="tc-server-channels">
            {T.categories.map(cat => (
              <div key={cat.id} className="tc-prev-category">
                <div className="tc-prev-cat-header" onClick={() => updateCat(cat.id, c => ({ ...c, collapsed: !c.collapsed }))}>
                  <ChevronDown size={10} className={cat.collapsed ? "tc-prev-rotate" : ""} />
                  <span>{cat.emoji} {cat.name.toUpperCase()}</span>
                </div>
                {!cat.collapsed && cat.channels.map(c => {
                  const CIcon = CHANNEL_ICONS[c.type];
                  return (
                    <div key={c.id} className={`tc-prev-channel ${c.hidden ? "tc-prev-hidden" : ""} ${c.locked ? "tc-prev-locked" : ""}`}>
                      <CIcon size={16} className="tc-prev-ch-icon" />
                      {c.emoji && <span className="tc-prev-ch-emoji">{c.emoji}</span>}
                      <span className="tc-prev-ch-name">{c.type === "voice" || c.type === "stage" ? c.name : c.name}</span>
                      {c.hidden && <EyeOff size={11} className="tc-prev-ch-flag" />}
                      {c.locked && <Lock size={11} className="tc-prev-ch-flag" />}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Role list */}
          <div className="tc-prev-roles-section">
            <div className="tc-prev-roles-title">
              <Shield size={13} /> ROLES — {T.roles.length}
            </div>
            <div className="tc-prev-roles-list">
              {T.roles.map(r => (
                <div key={r.id} className="tc-prev-role" style={{ borderColor: r.color }}>
                  <span className="tc-prev-role-dot" style={{ background: r.color }} />
                  {r.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
