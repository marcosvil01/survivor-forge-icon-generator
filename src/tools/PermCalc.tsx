import { useState, useCallback } from 'react';
import { Copy, Check } from 'lucide-react';

const PERMS = [
  // General
  { key: 'CREATE_INSTANT_INVITE', bit: 0,  label: 'Crear invitaciones',         cat: 'General'    },
  { key: 'KICK_MEMBERS',          bit: 1,  label: 'Expulsar miembros',           cat: 'Moderación' },
  { key: 'BAN_MEMBERS',           bit: 2,  label: 'Banear miembros',             cat: 'Moderación' },
  { key: 'ADMINISTRATOR',         bit: 3,  label: '👑 Administrador',            cat: 'General'    },
  { key: 'MANAGE_CHANNELS',       bit: 4,  label: 'Gestionar canales',           cat: 'General'    },
  { key: 'MANAGE_GUILD',          bit: 5,  label: 'Gestionar servidor',          cat: 'General'    },
  { key: 'ADD_REACTIONS',         bit: 6,  label: 'Añadir reacciones',           cat: 'Texto'      },
  { key: 'VIEW_AUDIT_LOG',        bit: 7,  label: 'Ver registro de auditoría',   cat: 'General'    },
  { key: 'PRIORITY_SPEAKER',      bit: 8,  label: 'Voz prioritaria',             cat: 'Voz'        },
  { key: 'STREAM',                bit: 9,  label: 'Go Live',                     cat: 'Voz'        },
  { key: 'VIEW_CHANNEL',          bit: 10, label: 'Ver canales',                 cat: 'General'    },
  { key: 'SEND_MESSAGES',         bit: 11, label: 'Enviar mensajes',             cat: 'Texto'      },
  { key: 'SEND_TTS',              bit: 12, label: 'Enviar mensajes TTS',         cat: 'Texto'      },
  { key: 'MANAGE_MESSAGES',       bit: 13, label: 'Gestionar mensajes',          cat: 'Moderación' },
  { key: 'EMBED_LINKS',           bit: 14, label: 'Incrustar enlaces',           cat: 'Texto'      },
  { key: 'ATTACH_FILES',          bit: 15, label: 'Adjuntar archivos',           cat: 'Texto'      },
  { key: 'READ_HISTORY',          bit: 16, label: 'Leer historial',              cat: 'Texto'      },
  { key: 'MENTION_EVERYONE',      bit: 17, label: 'Mencionar @everyone',         cat: 'Moderación' },
  { key: 'EXTERNAL_EMOJIS',       bit: 18, label: 'Usar emojis externos',        cat: 'Texto'      },
  { key: 'VIEW_INSIGHTS',         bit: 19, label: 'Ver estadísticas',            cat: 'General'    },
  { key: 'CONNECT',               bit: 20, label: 'Conectar a voz',              cat: 'Voz'        },
  { key: 'SPEAK',                 bit: 21, label: 'Hablar',                      cat: 'Voz'        },
  { key: 'MUTE_MEMBERS',          bit: 22, label: 'Silenciar miembros',          cat: 'Moderación' },
  { key: 'DEAFEN_MEMBERS',        bit: 23, label: 'Ensorecer miembros',          cat: 'Moderación' },
  { key: 'MOVE_MEMBERS',          bit: 24, label: 'Mover miembros',              cat: 'Moderación' },
  { key: 'USE_VAD',               bit: 25, label: 'Detección de actividad vocal',cat: 'Voz'        },
  { key: 'CHANGE_NICKNAME',       bit: 26, label: 'Cambiar apodo',               cat: 'General'    },
  { key: 'MANAGE_NICKNAMES',      bit: 27, label: 'Gestionar apodos',            cat: 'Moderación' },
  { key: 'MANAGE_ROLES',          bit: 28, label: 'Gestionar roles',             cat: 'General'    },
  { key: 'MANAGE_WEBHOOKS',       bit: 29, label: 'Gestionar webhooks',          cat: 'General'    },
  { key: 'MANAGE_EXPRESSIONS',    bit: 30, label: 'Gestionar emojis/stickers',   cat: 'General'    },
  { key: 'USE_APP_COMMANDS',      bit: 31, label: 'Usar comandos de bot',        cat: 'Texto'      },
  { key: 'REQUEST_TO_SPEAK',      bit: 32, label: 'Pedir hablar (Stage)',        cat: 'Voz'        },
  { key: 'MANAGE_EVENTS',         bit: 33, label: 'Gestionar eventos',           cat: 'General'    },
  { key: 'MANAGE_THREADS',        bit: 34, label: 'Gestionar hilos',             cat: 'Texto'      },
  { key: 'CREATE_PUB_THREADS',    bit: 35, label: 'Crear hilos públicos',        cat: 'Texto'      },
  { key: 'CREATE_PRIV_THREADS',   bit: 36, label: 'Crear hilos privados',        cat: 'Texto'      },
  { key: 'EXTERNAL_STICKERS',     bit: 37, label: 'Usar stickers externos',      cat: 'Texto'      },
  { key: 'SEND_IN_THREADS',       bit: 38, label: 'Enviar en hilos',             cat: 'Texto'      },
  { key: 'USE_ACTIVITIES',        bit: 39, label: 'Actividades de voz',          cat: 'Voz'        },
  { key: 'MODERATE_MEMBERS',      bit: 40, label: 'Timeout a miembros',          cat: 'Moderación' },
] as const;

type PermKey = typeof PERMS[number]['key'];

const CAT_COLORS: Record<string, string> = {
  'General': '#5865f2', 'Moderación': '#ed4245', 'Texto': '#57f287', 'Voz': '#00b0f4',
};

const PRESETS: { name: string; keys: PermKey[] }[] = [
  { name: 'Administrador', keys: ['ADMINISTRATOR'] },
  { name: 'Moderador', keys: ['KICK_MEMBERS','BAN_MEMBERS','MANAGE_MESSAGES','MUTE_MEMBERS','DEAFEN_MEMBERS','MOVE_MEMBERS','MANAGE_NICKNAMES','MODERATE_MEMBERS','VIEW_AUDIT_LOG','VIEW_CHANNEL','SEND_MESSAGES','READ_HISTORY','CONNECT','SPEAK'] },
  { name: 'Miembro', keys: ['VIEW_CHANNEL','SEND_MESSAGES','READ_HISTORY','ADD_REACTIONS','EMBED_LINKS','ATTACH_FILES','EXTERNAL_EMOJIS','CONNECT','SPEAK','USE_VAD','CHANGE_NICKNAME','USE_APP_COMMANDS','CREATE_PUB_THREADS','SEND_IN_THREADS'] },
  { name: 'Solo leer', keys: ['VIEW_CHANNEL','READ_HISTORY','ADD_REACTIONS'] },
  { name: 'Limpiar todo', keys: [] },
];

const CATS = ['General','Moderación','Texto','Voz'] as const;

export default function PermCalc() {
  const [enabled, setEnabled] = useState<Set<PermKey>>(new Set(PRESETS[2].keys));
  const [copied, setCopied]   = useState(false);

  const toggle = (key: PermKey) =>
    setEnabled(s => { const n = new Set(s); n.has(key) ? n.delete(key) : n.add(key); return n; });

  // BigInt-safe computation
  const value   = PERMS.reduce((acc, p) => enabled.has(p.key) ? acc | (BigInt(1) << BigInt(p.bit)) : acc, BigInt(0));
  const decimal = value.toString();
  const hex     = '0x' + value.toString(16).toUpperCase();

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(decimal);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }, [decimal]);

  return (
    <div className="tool-layout">
      <aside className="tool-sidebar">
        <div className="tool-header"><h2>Calculadora de Permisos</h2><p>Genera el valor entero de permisos para bots Discord</p></div>

        <div className="tool-form">
          <span className="v6-label">Presets rápidos</span>
          <div className="v6-chips-wrap">
            {PRESETS.map(p => (
              <button key={p.name} className="v6-chip" onClick={() => setEnabled(new Set(p.keys))}>{p.name}</button>
            ))}
          </div>
        </div>

        <div className="perm-result-box">
          <span className="v6-label" style={{ marginBottom: '6px' }}>Valor decimal</span>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
            <code className="perm-code">{decimal}</code>
            <button className="v6-chip" onClick={handleCopy} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {copied ? <><Check size={12} /> Copiado</> : <><Copy size={12} /> Copiar</>}
            </button>
          </div>
          <div style={{ marginTop: '6px', fontFamily: 'monospace', fontSize: '11px', color: 'var(--ui-text-dim)' }}>{hex}</div>
          <div className="perm-count">{enabled.size} de {PERMS.length} permisos activos</div>
        </div>

        <p className="v6-hint" style={{ marginTop: '8px' }}>
          Usa este entero en el campo <code style={{ color: '#fff' }}>permissions</code> al crear roles o invitaciones con la API de Discord.
        </p>
      </aside>

      <main className="tool-stage" style={{ padding: '20px 24px', overflowY: 'auto' }}>
        <div className="perm-grid-wrap">
          {CATS.map(cat => (
            <div key={cat} className="perm-cat-section">
              <div className="perm-cat-title" style={{ color: CAT_COLORS[cat] }}>{cat}</div>
              <div className="perm-cat-grid">
                {PERMS.filter(p => p.cat === cat).map(p => (
                  <label key={p.key} className={`perm-item ${enabled.has(p.key) ? 'on' : ''}`} onClick={() => toggle(p.key)}>
                    <div className={`perm-checkbox ${enabled.has(p.key) ? 'on' : ''}`}>
                      {enabled.has(p.key) && <Check size={11} />}
                    </div>
                    <span>{p.label}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
