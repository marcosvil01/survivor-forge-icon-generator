import { useState, useCallback } from 'react';
import { Copy, Check } from 'lucide-react';

interface RGB { r: number; g: number; b: number; }

function hexToRgb(hex: string): RGB {
  const n = parseInt(hex.replace('#', ''), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgbToDecimal({ r, g, b }: RGB): number {
  return (r << 16) | (g << 8) | b;
}

function isLight(hex: string): boolean {
  const { r, g, b } = hexToRgb(hex);
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}

const PRESETS = [
  { name: 'Blurple',  hex: '#5865F2' }, { name: 'Verde',   hex: '#57F287' },
  { name: 'Amarillo', hex: '#FEE75C' }, { name: 'Rojo',    hex: '#ED4245' },
  { name: 'Rosa',     hex: '#EB459E' }, { name: 'Aqua',    hex: '#1ABC9C' },
  { name: 'Oro',      hex: '#F1C40F' }, { name: 'Plata',   hex: '#95A5A6' },
  { name: 'Bronce',   hex: '#CD7F32' }, { name: 'Carmesí', hex: '#B22222' },
  { name: 'Cian',     hex: '#00B0F4' }, { name: 'Lima',    hex: '#2ECC71' },
];

type CopiedKey = 'hex' | 'rgb' | 'dec' | null;

export default function ColorRolePicker() {
  const [color,    setColor]    = useState('#5865F2');
  const [roleName, setRoleName] = useState('Moderador');
  const [copied,   setCopied]   = useState<CopiedKey>(null);

  const rgb = hexToRgb(color);
  const dec = rgbToDecimal(rgb);
  const rgbStr = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;

  const copy = useCallback(async (k: CopiedKey, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(k); setTimeout(() => setCopied(null), 2000);
  }, []);

  const textOnColor = isLight(color) ? '#000' : '#fff';

  return (
    <div className="tool-layout">
      <aside className="tool-sidebar">
        <div className="tool-header"><h2>Color de Rol</h2><p>Obtén el color perfecto y su valor de API para Discord</p></div>

        <div className="tool-form">
          <label className="tool-label">
            Nombre del rol
            <input className="tool-input" value={roleName} onChange={e => setRoleName(e.target.value)} placeholder="Moderador" />
          </label>

          <label className="tool-label">
            Color
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '6px' }}>
              <input type="color" value={color} onChange={e => setColor(e.target.value)}
                style={{ width: 48, height: 48, padding: 2, border: '1px solid var(--ui-border)', borderRadius: 8, background: 'transparent', cursor: 'pointer' }} />
              <input className="tool-input" value={color} onChange={e => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) setColor(e.target.value); }}
                style={{ fontFamily: 'monospace', flex: 1 }} />
            </div>
          </label>

          <span className="v6-label">Colores de Discord</span>
          <div className="v6-chips-wrap" style={{ gap: '6px' }}>
            {PRESETS.map(p => (
              <button key={p.hex} title={p.name} onClick={() => setColor(p.hex)} style={{
                width: 28, height: 28, borderRadius: '50%', background: p.hex, border: color === p.hex ? '2px solid #fff' : '2px solid transparent', cursor: 'pointer', flexShrink: 0,
              }} />
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '12px' }}>
            {[
              { key: 'hex' as CopiedKey, label: 'HEX',      value: color.toUpperCase()    },
              { key: 'rgb' as CopiedKey, label: 'RGB',      value: rgbStr                 },
              { key: 'dec' as CopiedKey, label: 'Decimal',  value: String(dec)             },
            ].map(({ key, label, value }) => (
              <div key={key} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ width: 50, fontSize: 11, color: 'var(--ui-text-dim)', fontWeight: 600 }}>{label}</span>
                <code style={{ flex: 1, background: 'rgba(0,0,0,0.3)', padding: '4px 8px', borderRadius: 6, fontSize: 12, fontFamily: 'monospace', color: '#fff' }}>{value}</code>
                <button className="v6-chip" style={{ padding: '4px 8px' }} onClick={() => copy(key, value)}>
                  {copied === key ? <Check size={12}/> : <Copy size={12}/>}
                </button>
              </div>
            ))}
          </div>
        </div>
      </aside>

      <main className="tool-stage" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px', overflowY: 'auto' }}>

        {/* Chat preview */}
        <div className="tool-card">
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ui-text-dim)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Vista previa — Chat</div>
          <div style={{ background: '#313338', borderRadius: 8, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: color, flexShrink: 0 }} />
              <div>
                <span style={{ color: color, fontWeight: 700, fontSize: 14 }}>{roleName || 'Rol'}</span>
                <span style={{ marginLeft: 8, fontSize: 10, background: '#23272a', color: '#fff', padding: '1px 5px', borderRadius: 3, verticalAlign: 'middle' }}>BOT</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, color: '#dcddde' }}>Hola </span>
              <span style={{ background: 'rgba(88,101,242,0.3)', color: '#dee0fc', padding: '0 4px', borderRadius: 3, fontSize: 13 }}>@{roleName || 'Rol'}</span>
              <span style={{ fontSize: 13, color: '#dcddde' }}> ¿Cómo están hoy?</span>
            </div>
          </div>
        </div>

        {/* Role chip preview */}
        <div className="tool-card">
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ui-text-dim)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Vista previa — Chip de Rol</div>
          <div style={{ background: '#2b2d31', borderRadius: 8, padding: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              background: color + '28', border: `1px solid ${color}60`,
              borderRadius: 4, padding: '4px 10px', fontWeight: 600, fontSize: 13, color: color,
              display: 'flex', alignItems: 'center', gap: '6px',
            }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
              {roleName || 'Rol'}
            </div>
          </div>
        </div>

        {/* Member list preview */}
        <div className="tool-card">
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ui-text-dim)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Vista previa — Lista de Miembros</div>
          <div style={{ background: '#2b2d31', borderRadius: 8, padding: '12px 8px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: color, textTransform: 'uppercase', padding: '0 8px 6px', letterSpacing: '0.06em' }}>
              {roleName || 'Rol'} — 3
            </div>
            {['Zephyr✦', 'CrimsonBlade', 'Nexus'].map((name, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '3px 8px', borderRadius: 4 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: `hsl(${(i * 80 + 220) % 360},60%,50%)` }} />
                <span style={{ fontSize: 14, fontWeight: 500, color: i === 0 ? color : '#dcddde' }}>{name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Color swatch */}
        <div className="tool-card">
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ui-text-dim)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Swatch</div>
          <div style={{
            height: 80, borderRadius: 10, background: color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 18, color: textOnColor, letterSpacing: '0.04em',
          }}>
            {color.toUpperCase()}
          </div>
        </div>

      </main>
    </div>
  );
}
