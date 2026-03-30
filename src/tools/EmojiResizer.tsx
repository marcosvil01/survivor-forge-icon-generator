import { useState, useRef, useCallback } from 'react';
import { Upload, Download, ImageIcon } from 'lucide-react';

const SIZES = [32, 48, 64, 96, 128, 256] as const;
type Size = typeof SIZES[number];

const GUIDELINES = [
  { label: 'Emoji servidor',    size: '≤128×128', max: '256 KB', fmt: 'PNG/GIF/WebP' },
  { label: 'Sticker',           size: '320×320',  max: '512 KB', fmt: 'PNG/GIF/JSON' },
  { label: 'Icono de rol',      size: '64×64',    max: '256 KB', fmt: 'PNG/JPEG/WebP' },
  { label: 'Icono de servidor', size: '≥512×512', max: '10 MB',  fmt: 'PNG/JPEG/WebP' },
];

export default function EmojiResizer() {
  const [srcUrl, setSrcUrl]   = useState<string | null>(null);
  const [size,   setSize]     = useState<Size>(64);
  const [isDrag, setIsDrag]   = useState(false);
  const canvasRef             = useRef<HTMLCanvasElement>(null);
  const fileRef               = useRef<HTMLInputElement>(null);

  const drawToCanvas = useCallback((url: string, targetSize: Size) => {
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width  = targetSize;
      canvas.height = targetSize;
      const ctx = canvas.getContext('2d')!;
      ctx.clearRect(0, 0, targetSize, targetSize);
      ctx.imageSmoothingEnabled  = true;
      ctx.imageSmoothingQuality = 'high';
      // Contain — preserve aspect ratio, center
      const scale = Math.min(targetSize / img.width, targetSize / img.height);
      const w = img.width  * scale;
      const h = img.height * scale;
      const x = (targetSize - w) / 2;
      const y = (targetSize - h) / 2;
      ctx.drawImage(img, x, y, w, h);
    };
    img.src = url;
  }, []);

  const loadFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = e => {
      const url = e.target?.result as string;
      setSrcUrl(url);
      drawToCanvas(url, size);
    };
    reader.readAsDataURL(file);
  }, [size, drawToCanvas]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDrag(false);
    const file = e.dataTransfer.files[0];
    if (file) loadFile(file);
  };

  const handleSizeChange = (newSize: Size) => {
    setSize(newSize);
    if (srcUrl) drawToCanvas(srcUrl, newSize);
  };

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement('a');
    a.href     = canvas.toDataURL('image/png');
    a.download = `emoji_${size}x${size}.png`;
    a.click();
  };

  return (
    <div className="tool-layout">
      <aside className="tool-sidebar">
        <div className="tool-header">
          <h2>Emoji Resizer</h2>
          <p>Redimensiona imágenes para emojis, stickers e iconos de Discord</p>
        </div>

        <div className="tool-form">
          {/* Drop zone */}
          <div
            className={`emoji-drop-zone ${isDrag ? 'drag' : ''}`}
            onDragOver={e => { e.preventDefault(); setIsDrag(true); }}
            onDragLeave={() => setIsDrag(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
          >
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
              onChange={e => { const f = e.target.files?.[0]; if (f) loadFile(f); }} />
            {srcUrl
              ? <img src={srcUrl} alt="source" style={{ width: 80, height: 80, objectFit: 'contain', borderRadius: 8 }} />
              : <div style={{ textAlign: 'center', color: 'var(--ui-text-dim)', pointerEvents: 'none' }}>
                  <Upload size={32} style={{ marginBottom: 8 }} />
                  <div style={{ fontSize: 13, fontWeight: 600 }}>Arrastra o haz clic</div>
                  <div style={{ fontSize: 11, marginTop: 4 }}>PNG · GIF · WebP · JPEG</div>
                </div>
            }
          </div>

          <span className="v6-label">Tamaño de salida</span>
          <div className="v6-chips-wrap">
            {SIZES.map(s => (
              <button key={s} className={`v6-chip ${size === s ? 'active' : ''}`} onClick={() => handleSizeChange(s)}>
                {s}×{s}
              </button>
            ))}
          </div>

          <button className="v6-export-btn" disabled={!srcUrl} onClick={download} style={{ marginTop: 8 }}>
            <Download size={15} /> Descargar PNG
          </button>
        </div>

        <div style={{ marginTop: 'auto', padding: '12px 0 4px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ui-text-dim)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Guías Discord</div>
          {GUIDELINES.map(g => (
            <div key={g.label} style={{ display: 'flex', flexDirection: 'column', padding: '5px 0', borderBottom: '1px solid var(--ui-border)' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>{g.label}</span>
              <span style={{ fontSize: 11, color: 'var(--ui-text-dim)' }}>{g.size} · máx {g.max} · {g.fmt}</span>
            </div>
          ))}
        </div>
      </aside>

      <main className="tool-stage" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '32px 24px', gap: '24px', overflowY: 'auto' }}>
        {!srcUrl ? (
          <div style={{ color: 'var(--ui-text-dim)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginTop: 80 }}>
            <ImageIcon size={64} opacity={0.3} />
            <p style={{ fontSize: 14 }}>Sube una imagen para ver la vista previa</p>
          </div>
        ) : (
          <>
            <div className="tool-card" style={{ width: '100%', maxWidth: 500, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ui-text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', alignSelf: 'flex-start' }}>
                Vista previa — {size}×{size} px
              </div>
              {/* Checkered bg to show transparency */}
              <div style={{ background: 'repeating-conic-gradient(#3a3a3a 0% 25%, #2a2a2a 0% 50%) 0 0 / 16px 16px', borderRadius: 12, padding: 16, display: 'inline-flex' }}>
                <canvas ref={canvasRef} style={{ borderRadius: 8, imageRendering: 'pixelated' }} />
              </div>
            </div>

            {/* Preview strip */}
            <div className="tool-card" style={{ width: '100%', maxWidth: 500 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ui-text-dim)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Preview de tamaños
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20, flexWrap: 'wrap' }}>
                {([16, 32, 64] as const).map(s => (
                  <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{ background: 'repeating-conic-gradient(#3a3a3a 0% 25%, #2a2a2a 0% 50%) 0 0 / 8px 8px', borderRadius: 4, padding: 2 }}>
                      <img src={srcUrl} alt="" style={{ width: s, height: s, objectFit: 'contain', display: 'block', borderRadius: 3, imageRendering: s <= 32 ? 'pixelated' : 'auto' }} />
                    </div>
                    <span style={{ fontSize: 10, color: 'var(--ui-text-dim)' }}>{s}px</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Discord chat preview */}
            <div className="tool-card" style={{ width: '100%', maxWidth: 500 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ui-text-dim)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Vista previa en chat
              </div>
              <div style={{ background: '#313338', borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#5865f2', flexShrink: 0 }} />
                <div>
                  <div style={{ marginBottom: 4 }}>
                    <span style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>Usuario </span>
                    <span style={{ color: '#b5bac1', fontSize: 12 }}>hoy a las 12:00</span>
                  </div>
                  <div style={{ color: '#dcddde', fontSize: 15 }}>
                    Mira este emoji {' '}
                    <img src={srcUrl} alt="emoji" style={{ width: 22, height: 22, objectFit: 'contain', verticalAlign: 'middle' }} />
                    {' '} ¡qué genial!
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
