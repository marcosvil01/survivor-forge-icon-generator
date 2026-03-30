import { useState, useRef, useCallback } from "react";
import { Copy, Check } from "lucide-react";

// ─── Discord markdown formatter ──────────────────────────────────────────────

function parseDiscord(input: string): string {
  // Process line by line for block-level, then inline
  const lines = input.split("\n");
  const result: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    // Code block
    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      result.push(`<div class="dc-codeblock"><span class="dc-cblang">${escHtml(lang)}</span><pre>${escHtml(codeLines.join("\n"))}</pre></div>`);
      i++;
      continue;
    }
    // Block quote
    if (line.startsWith("> ")) {
      result.push(`<div class="dc-blockquote">${inlineMarkdown(line.slice(2))}</div>`);
      i++; continue;
    }
    // Heading (discord doesn't have headings, but show them)
    if (line.startsWith("# "))  { result.push(`<div class="dc-h1">${inlineMarkdown(line.slice(2))}</div>`); i++; continue; }
    if (line.startsWith("## ")) { result.push(`<div class="dc-h2">${inlineMarkdown(line.slice(3))}</div>`); i++; continue; }
    if (line.startsWith("### ")){ result.push(`<div class="dc-h3">${inlineMarkdown(line.slice(4))}</div>`); i++; continue; }
    // Separator
    if (line.trim() === "---")  { result.push(`<div class="dc-sep"></div>`); i++; continue; }
    // Normal line
    result.push(`<div class="dc-line">${inlineMarkdown(line) || "\u200b"}</div>`);
    i++;
  }
  return result.join("");
}

function escHtml(s: string) {
  return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

function inlineMarkdown(s: string): string {
  let r = escHtml(s);
  // Bold italic
  r = r.replace(/\*\*\*(.*?)\*\*\*/g,  '<strong><em>$1</em></strong>');
  r = r.replace(/\_\_\_(.*?)\_\_\_/g,   '<strong><em>$1</em></strong>');
  // Bold
  r = r.replace(/\*\*(.*?)\*\*/g,       '<strong>$1</strong>');
  r = r.replace(/\_\_(.*?)\_\_/g,        '<strong>$1</strong>');
  // Italic
  r = r.replace(/\*(.*?)\*/g,           '<em>$1</em>');
  r = r.replace(/\_(.*?)\_/g,           '<em>$1</em>');
  // Underline
  r = r.replace(/__u__(.*?)__u__/g,     '<u>$1</u>');
  // Strikethrough
  r = r.replace(/~~(.*?)~~/g,           '<s>$1</s>');
  // Spoiler
  r = r.replace(/\|\|(.*?)\|\|/g,       '<span class="dc-spoiler" onclick="this.classList.toggle(\'revealed\')">$1</span>');
  // Inline code
  r = r.replace(/`([^`]+)`/g,           '<code class="dc-inline-code">$1</code>');
  // Mentions
  r = r.replace(/@everyone|@here/g,     m => `<span class="dc-mention">${m}</span>`);
  r = r.replace(/@(\w+)/g,              '<span class="dc-mention">@$1</span>');
  r = r.replace(/#(\w+)/g,              '<span class="dc-channel">#$1</span>');
  return r;
}

// ─── Toolbar buttons ──────────────────────────────────────────────────────────

interface Fmt {
  icon: string;
  title: string;
  wrap?: [string, string];
  insert?: string;
  block?: boolean;
}

const TOOLBAR: (Fmt | "sep")[] = [
  { icon: "B",   title: "Negrita",        wrap: ["**",   "**"]  },
  { icon: "I",   title: "Cursiva",        wrap: ["*",    "*"]   },
  { icon: "U",   title: "Subrayado",      wrap: ["__u__","__u__"] },
  { icon: "S",   title: "Tachado",        wrap: ["~~",   "~~"]  },
  "sep",
  { icon: "||",  title: "Spoiler",        wrap: ["||",   "||"]  },
  { icon: "`",   title: "Código inline",  wrap: ["`",    "`"]   },
  { icon: "```", title: "Bloque código",  wrap: ["```\n","```"] },
  "sep",
  { icon: ">",   title: "Cita",          wrap: ["> ",   ""]    },
  { icon: "—",   title: "Separador",     insert: "---"         },
  "sep",
  { icon: "@👤",  title: "Mención usuario",insert: "@usuario"  },
  { icon: "#",   title: "Canal",          insert: "#canal"      },
  { icon: "@!",  title: "@everyone",      insert: "@everyone"   },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function MsgFormatter() {
  const [text,   setText]   = useState(`# Título del anuncio

¡Hola @everyone! 👋

Bienvenidos al **servidor oficial**. Recuerda leer el reglamento en #reglas.

> Este es un mensaje de prueba con __formato__ de Discord.

Aquí van las novedades importantes:
- \`/rank\` — Ver tu rango
- \`/help\` — Lista de comandos

||Spoiler: habrá evento este fin de semana 🎉||

\`\`\`js
// Ejemplo de código
const msg = await channel.send("¡Hola!");
\`\`\``);
  const [copied, setCopied] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);

  const wrap = useCallback((before: string, after: string) => {
    const ta = taRef.current;
    if (!ta) return;
    const start = ta.selectionStart, end = ta.selectionEnd;
    const sel = text.slice(start, end);
    const newText = text.slice(0, start) + before + sel + after + text.slice(end);
    setText(newText);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(start + before.length, start + before.length + sel.length);
    });
  }, [text]);

  const insert = useCallback((snippet: string) => {
    const ta = taRef.current;
    if (!ta) return;
    const pos = ta.selectionStart;
    const newText = text.slice(0, pos) + snippet + text.slice(pos);
    setText(newText);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(pos + snippet.length, pos + snippet.length);
    });
  }, [text]);

  const handleFmt = (f: Fmt) => {
    if (f.insert !== undefined) { insert(f.insert); return; }
    if (f.wrap)                 { wrap(f.wrap[0], f.wrap[1]); }
  };

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true); setTimeout(() => setCopied(false), 2200);
  }, [text]);

  return (
    <div className="tool-layout">
      <aside className="tool-sidebar">
        <div className="tool-header">
          <h2>Formateador de mensajes</h2>
          <p>Editor con sintaxis Markdown de Discord y preview en tiempo real</p>
        </div>

        <div className="tool-form" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <span className="v6-label">Referencia rápida</span>
          <div className="mf-cheatsheet">
            {[
              { syntax: "**texto**",   result: "Negrita"      },
              { syntax: "*texto*",     result: "Cursiva"      },
              { syntax: "__u__texto__u__", result: "Subrayado" },
              { syntax: "~~texto~~",   result: "Tachado"      },
              { syntax: "||texto||",   result: "Spoiler"      },
              { syntax: "`código`",    result: "Inline code"  },
              { syntax: "```\\ncódigo```", result: "Bloque código" },
              { syntax: "> texto",     result: "Cita"         },
              { syntax: "@usuario",    result: "Mención"      },
              { syntax: "#canal",      result: "Canal"        },
              { syntax: "# Texto",     result: "Título H1"    },
              { syntax: "## Texto",    result: "Título H2"    },
              { syntax: "---",         result: "Separador"    },
            ].map(row => (
              <div key={row.syntax} className="mf-cheat-row">
                <code className="mf-cheat-code">{row.syntax}</code>
                <span className="mf-cheat-label">{row.result}</span>
              </div>
            ))}
          </div>

          <p className="v6-hint" style={{ marginTop: 8 }}>
            💡 Selecciona texto en el editor y haz clic en un botón de formato para aplicarlo.
            Los spoilers se pueden revelar en la preview haciendo click.
          </p>
        </div>
      </aside>

      <main className="tool-stage" style={{ flexDirection: "column", overflow: "hidden" }}>
        {/* Toolbar */}
        <div className="mf-toolbar">
          {TOOLBAR.map((item, i) =>
            item === "sep"
              ? <div key={`sep-${i}`} className="mf-toolbar-sep" />
              : (
                <button key={item.title} className="mf-toolbar-btn" title={item.title}
                  onClick={() => handleFmt(item)}>
                  {item.icon}
                </button>
              )
          )}
          <div style={{ flex: 1 }} />
          <button className={`rc-copy-btn ${copied ? "done" : ""}`} onClick={handleCopy}
            style={{ marginRight: 8, fontSize: 12 }}>
            {copied ? <><Check size={13} /> Copiado</> : <><Copy size={13} /> Copiar texto</>}
          </button>
        </div>

        {/* Split pane: editor | preview */}
        <div className="mf-split">
          {/* Editor */}
          <div className="mf-pane">
            <div className="mf-pane-header">✏️ Editor</div>
            <textarea
              ref={taRef}
              className="mf-editor"
              value={text}
              onChange={e => setText(e.target.value)}
              spellCheck={false}
              placeholder="Escribe tu mensaje aquí..."
            />
          </div>

          {/* Discord preview */}
          <div className="mf-pane">
            <div className="mf-pane-header">👁 Preview Discord</div>
            <div className="mf-preview-wrap">
              <div className="mf-discord-bg">
                <div className="mf-chat-row">
                  <div className="mf-avatar" />
                  <div className="mf-msg-area">
                    <div className="mf-username">BotAnuncio<span className="mf-bot-tag">BOT</span></div>
                    <div
                      className="mf-content dc-msg"
                      dangerouslySetInnerHTML={{ __html: parseDiscord(text) }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
