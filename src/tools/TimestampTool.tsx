import { useState, useCallback } from 'react';
import { Copy, Check } from 'lucide-react';

const FORMATS = [
  { id: 't', label: 'Hora corta',       example: '16:20'    },
  { id: 'T', label: 'Hora larga',       example: '16:20:00' },
  { id: 'd', label: 'Fecha corta',      example: '20/04/2021' },
  { id: 'D', label: 'Fecha larga',      example: '20 de abril de 2021' },
  { id: 'f', label: 'Fecha/hora',       example: '20 de abril de 2021 16:20' },
  { id: 'F', label: 'Fecha/hora larga', example: 'martes, 20 de abril de 2021 16:20' },
  { id: 'R', label: 'Relativo',         example: 'hace 3 años' },
] as const;

type FmtId = typeof FORMATS[number]['id'];

function formatDate(d: Date, fmt: FmtId): string {
  const loc = 'es-ES';
  const rtf = new Intl.RelativeTimeFormat(loc, { numeric: 'auto' });
  switch (fmt) {
    case 't': return d.toLocaleTimeString(loc, { hour: '2-digit', minute: '2-digit' });
    case 'T': return d.toLocaleTimeString(loc, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    case 'd': return d.toLocaleDateString(loc);
    case 'D': return d.toLocaleDateString(loc, { day: 'numeric', month: 'long', year: 'numeric' });
    case 'f': return d.toLocaleString(loc, { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    case 'F': return d.toLocaleString(loc, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    case 'R': {
      const diff = d.getTime() - Date.now();
      const abs  = Math.abs(diff);
      if (abs < 60000)     return rtf.format(Math.round(diff / 1000),       'second');
      if (abs < 3600000)   return rtf.format(Math.round(diff / 60000),      'minute');
      if (abs < 86400000)  return rtf.format(Math.round(diff / 3600000),    'hour');
      if (abs < 2592000000)return rtf.format(Math.round(diff / 86400000),   'day');
      if (abs < 31536000000)return rtf.format(Math.round(diff / 2592000000),'month');
      return rtf.format(Math.round(diff / 31536000000), 'year');
    }
  }
}

function toLocalInput(d: Date): string {
  const p = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

export default function TimestampTool() {
  const [dateStr, setDateStr] = useState(toLocalInput(new Date()));
  const [copied, setCopied]   = useState<string | null>(null);

  const date  = new Date(dateStr);
  const valid = !isNaN(date.getTime());
  const unix  = valid ? Math.floor(date.getTime() / 1000) : 0;

  const copy = useCallback(async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id); setTimeout(() => setCopied(null), 2000);
  }, []);

  return (
    <div className="tool-centered">
      <div className="tool-card" style={{ maxWidth: '780px' }}>
        <div className="tool-header">
          <h2>Generador de Timestamps</h2>
          <p>Los timestamps de Discord se adaptan automáticamente a la zona horaria de cada usuario</p>
        </div>

        <div className="tool-form">
          <label className="tool-label">Fecha y hora</label>
          <input type="datetime-local" className="tool-input" style={{ fontSize: '15px', padding: '10px 14px', maxWidth: '320px' }}
            value={dateStr} onChange={e => setDateStr(e.target.value)} />
          {valid && (
            <p className="v6-hint" style={{ marginTop: '6px' }}>
              Unix timestamp: <code style={{ color: '#fff', fontFamily: 'monospace', background: 'rgba(0,0,0,0.3)', padding: '1px 6px', borderRadius: '4px' }}>{unix}</code>
            </p>
          )}
        </div>

        {valid && (
          <div className="ts-grid">
            {FORMATS.map(f => {
              const code    = `<t:${unix}:${f.id}>`;
              const preview = formatDate(date, f.id);
              return (
                <div key={f.id} className="ts-card">
                  <div className="ts-format-badge">:{f.id}</div>
                  <div className="ts-label">{f.label}</div>
                  <div className="ts-preview">{preview}</div>
                  <div className="ts-code">{code}</div>
                  <button className="ts-copy-btn" onClick={() => copy(code, f.id)}>
                    {copied === f.id ? <><Check size={12} /> Copiado</> : <><Copy size={12} /> Copiar</>}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <div className="v6-hint" style={{ marginTop: '20px', padding: '12px', background: 'rgba(88,101,242,0.08)', borderRadius: '8px', border: '1px solid rgba(88,101,242,0.15)' }}>
          💡 Copia el código y pégalo directamente en Discord o en tu bot. Se mostrará en la hora local de cada persona que lo vea.
        </div>
      </div>
    </div>
  );
}
