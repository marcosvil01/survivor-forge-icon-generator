import { useState, useCallback } from 'react';
import { Plus, Trash2, Copy, Check } from 'lucide-react';

interface EmbedField { name: string; value: string; inline: boolean; }

interface EmbedData {
  color: string; authorName: string; authorIcon: string; authorUrl: string;
  title: string; titleUrl: string; description: string; thumbnail: string;
  image: string; fields: EmbedField[]; footerText: string; footerIcon: string; timestamp: boolean;
}

const defaultEmbed: EmbedData = {
  color: '#5865f2', authorName: '', authorIcon: '', authorUrl: '',
  title: '¡Título del embed!', titleUrl: '',
  description: 'Esta es la descripción del embed. Puedes usar **negrita**, *cursiva*, `código`, [enlaces](https://discord.com) y demás markdown de Discord.',
  thumbnail: '', image: '', fields: [
    { name: 'Campo 1', value: 'Valor del campo', inline: true },
    { name: 'Campo 2', value: 'Otro valor', inline: true },
  ],
  footerText: 'Footer de ejemplo • Zona Muerta RP', footerIcon: '', timestamp: true,
};

function renderMd(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code style="background:rgba(255,255,255,0.1);border-radius:3px;padding:0 3px;font-size:0.85em">$1</code>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" style="color:#00b0f4;text-decoration:none">$1</a>')
    .replace(/\n/g, '<br>');
}

const SECTIONS = ['General', 'Autor', 'Campos', 'Media', 'Footer'] as const;
type Section = typeof SECTIONS[number];

export default function EmbedBuilder() {
  const [embed, setEmbed] = useState<EmbedData>(defaultEmbed);
  const [copied, setCopied] = useState(false);
  const [sec, setSec] = useState<Section>('General');

  const set = (key: keyof EmbedData, val: any) => setEmbed(e => ({ ...e, [key]: val }));
  const setField = (i: number, key: keyof EmbedField, val: any) =>
    setEmbed(e => { const f = [...e.fields]; f[i] = { ...f[i], [key]: val }; return { ...e, fields: f }; });
  const addField = () => { if (embed.fields.length >= 25) return; setEmbed(e => ({ ...e, fields: [...e.fields, { name: 'Campo', value: 'Valor', inline: false }] })); };
  const removeField = (i: number) => setEmbed(e => ({ ...e, fields: e.fields.filter((_, j) => j !== i) }));

  const jsonObj = {
    embeds: [{
      color: parseInt(embed.color.replace('#', ''), 16),
      ...(embed.authorName ? { author: { name: embed.authorName, ...(embed.authorIcon ? { icon_url: embed.authorIcon } : {}), ...(embed.authorUrl ? { url: embed.authorUrl } : {}) } } : {}),
      ...(embed.title ? { title: embed.title, ...(embed.titleUrl ? { url: embed.titleUrl } : {}) } : {}),
      ...(embed.description ? { description: embed.description } : {}),
      ...(embed.thumbnail ? { thumbnail: { url: embed.thumbnail } } : {}),
      ...(embed.fields.length ? { fields: embed.fields.map(f => ({ name: f.name, value: f.value, inline: f.inline })) } : {}),
      ...(embed.image ? { image: { url: embed.image } } : {}),
      ...(embed.footerText ? { footer: { text: embed.footerText, ...(embed.footerIcon ? { icon_url: embed.footerIcon } : {}) } } : {}),
      ...(embed.timestamp ? { timestamp: new Date().toISOString() } : {}),
    }]
  };
  const json = JSON.stringify(jsonObj, null, 2);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(json);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }, [json]);

  return (
    <div className="tool-layout">
      <aside className="tool-sidebar">
        <div className="tool-header"><h2>Embed Builder</h2><p>Editor visual de embeds para bots Discord</p></div>

        <div className="tool-section-nav">
          {SECTIONS.map(s => (
            <button key={s} className={`tool-sec-btn ${sec === s ? 'active' : ''}`} onClick={() => setSec(s)}>{s}</button>
          ))}
        </div>

        {sec === 'General' && (
          <div className="tool-form">
            <label className="tool-label">Color</label>
            <div className="v6-control-row" style={{ marginTop: 0 }}>
              <input type="color" className="v6-color-input" value={embed.color} onChange={e => set('color', e.target.value)} />
              <input className="tool-input" value={embed.color} onChange={e => set('color', e.target.value)} style={{ fontFamily: 'monospace' }} />
            </div>
            <label className="tool-label">Título</label>
            <input className="tool-input" value={embed.title} onChange={e => set('title', e.target.value)} placeholder="Título del embed" />
            <label className="tool-label">URL del título</label>
            <input className="tool-input" value={embed.titleUrl} onChange={e => set('titleUrl', e.target.value)} placeholder="https://..." />
            <label className="tool-label">Descripción</label>
            <textarea className="tool-textarea" value={embed.description} onChange={e => set('description', e.target.value)} placeholder="Soporta **markdown** de Discord..." rows={5} />
          </div>
        )}

        {sec === 'Autor' && (
          <div className="tool-form">
            <label className="tool-label">Nombre del autor</label>
            <input className="tool-input" value={embed.authorName} onChange={e => set('authorName', e.target.value)} placeholder="Nombre..." />
            <label className="tool-label">URL del icono del autor</label>
            <input className="tool-input" value={embed.authorIcon} onChange={e => set('authorIcon', e.target.value)} placeholder="https://..." />
            <label className="tool-label">URL del autor (clickable)</label>
            <input className="tool-input" value={embed.authorUrl} onChange={e => set('authorUrl', e.target.value)} placeholder="https://..." />
          </div>
        )}

        {sec === 'Campos' && (
          <div className="tool-form">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span className="v6-label" style={{ marginBottom: 0 }}>Campos ({embed.fields.length}/25)</span>
              <button className="v6-chip active" onClick={addField} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Plus size={12} /> Añadir</button>
            </div>
            {embed.fields.map((f, i) => (
              <div key={i} className="embed-field-editor">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--ui-text-dim)', fontWeight: 600 }}>Campo {i + 1}</span>
                  <button className="tool-icon-btn" onClick={() => removeField(i)}><Trash2 size={13} /></button>
                </div>
                <input className="tool-input" value={f.name} onChange={e => setField(i, 'name', e.target.value)} placeholder="Nombre" style={{ marginBottom: '4px' }} />
                <textarea className="tool-textarea" value={f.value} onChange={e => setField(i, 'value', e.target.value)} placeholder="Valor" rows={2} style={{ marginBottom: '6px' }} />
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer', color: 'var(--ui-text-dim)' }}>
                  <input type="checkbox" checked={f.inline} onChange={e => setField(i, 'inline', e.target.checked)} /> Inline
                </label>
              </div>
            ))}
          </div>
        )}

        {sec === 'Media' && (
          <div className="tool-form">
            <label className="tool-label">Thumbnail (esquina superior derecha)</label>
            <input className="tool-input" value={embed.thumbnail} onChange={e => set('thumbnail', e.target.value)} placeholder="https://i.imgur.com/..." />
            <label className="tool-label">Imagen grande (parte inferior)</label>
            <input className="tool-input" value={embed.image} onChange={e => set('image', e.target.value)} placeholder="https://i.imgur.com/..." />
          </div>
        )}

        {sec === 'Footer' && (
          <div className="tool-form">
            <label className="tool-label">Texto del footer</label>
            <input className="tool-input" value={embed.footerText} onChange={e => set('footerText', e.target.value)} placeholder="Footer..." />
            <label className="tool-label">Icono del footer (URL)</label>
            <input className="tool-input" value={embed.footerIcon} onChange={e => set('footerIcon', e.target.value)} placeholder="https://..." />
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '14px', fontSize: '13px' }}>
              <input type="checkbox" checked={embed.timestamp} onChange={e => set('timestamp', e.target.checked)} />
              Incluir timestamp actual
            </label>
          </div>
        )}
      </aside>

      <main className="tool-stage">
        <div className="embed-preview-wrap">
          <div className="embed-discord-bg">
            <div className="embed-chat-row">
              <div className="embed-avatar" />
              <div className="embed-msg-area">
                <div className="embed-username">BotZonaMuerta <span className="embed-bot-tag">BOT</span></div>
                <div className="embed-box" style={{ borderLeftColor: embed.color }}>
                  {embed.thumbnail && (
                    <img src={embed.thumbnail} alt="" className="embed-thumbnail" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  )}
                  {embed.authorName && (
                    <div className="embed-author">
                      {embed.authorIcon && <img src={embed.authorIcon} alt="" className="embed-author-icon" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
                      <span>{embed.authorName}</span>
                    </div>
                  )}
                  {embed.title && (
                    <div className="embed-title">
                      {embed.titleUrl ? <a href={embed.titleUrl} target="_blank" rel="noreferrer" style={{ color: '#00b0f4' }}>{embed.title}</a> : embed.title}
                    </div>
                  )}
                  {embed.description && <div className="embed-desc" dangerouslySetInnerHTML={{ __html: renderMd(embed.description) }} />}
                  {embed.fields.length > 0 && (
                    <div className="embed-fields">
                      {embed.fields.map((f, i) => (
                        <div key={i} className={`embed-field${f.inline ? ' inline' : ''}`}>
                          <div className="embed-field-name">{f.name}</div>
                          <div className="embed-field-value" dangerouslySetInnerHTML={{ __html: renderMd(f.value) }} />
                        </div>
                      ))}
                    </div>
                  )}
                  {embed.image && <img src={embed.image} alt="" className="embed-image" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
                  {(embed.footerText || embed.timestamp) && (
                    <div className="embed-footer">
                      {embed.footerIcon && <img src={embed.footerIcon} alt="" className="embed-footer-icon" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
                      {embed.footerText}{embed.footerText && embed.timestamp ? ' • ' : ''}
                      {embed.timestamp && new Date().toLocaleString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="tool-json-wrap">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span className="v6-label" style={{ marginBottom: 0 }}>JSON para bots (pega en discord.js / raw API)</span>
            <button className="v6-chip" onClick={handleCopy} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {copied ? <><Check size={12} /> Copiado</> : <><Copy size={12} /> Copiar JSON</>}
            </button>
          </div>
          <pre className="tool-json">{json}</pre>
        </div>
      </main>
    </div>
  );
}
