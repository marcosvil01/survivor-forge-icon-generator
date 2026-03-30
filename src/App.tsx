import { useState } from 'react';
import { Shield, MessageSquare, Clock, Lock, Palette, Crop, Trophy, UserPlus, FileText, Layers } from 'lucide-react';
import { IconGenerator } from './tools/IconGenerator';
import EmbedBuilder from './tools/EmbedBuilder';
import TimestampTool from './tools/TimestampTool';
import PermCalc from './tools/PermCalc';
import ColorRolePicker from './tools/ColorRolePicker';
import EmojiResizer from './tools/EmojiResizer';
import RankCard from './tools/RankCard';
import WelcomeCard from './tools/WelcomeCard';
import MsgFormatter from './tools/MsgFormatter';
import TemplateCreator from './tools/TemplateCreator';
import './App.css';

const TOOLS = [
  { id: 'icon',      label: 'Role Icons',    Icon: Shield,        desc: 'Iconos de rol con glow y GIF' },
  { id: 'embed',     label: 'Embed Builder', Icon: MessageSquare, desc: 'Editor visual de embeds' },
  { id: 'timestamp', label: 'Timestamps',    Icon: Clock,         desc: 'Timestamps para Discord' },
  { id: 'perms',     label: 'Permisos',      Icon: Lock,          desc: 'Calculadora de permisos' },
  { id: 'color',     label: 'Color Roles',   Icon: Palette,       desc: 'Colores de rol Discord' },
  { id: 'emoji',     label: 'Emoji Resize',  Icon: Crop,          desc: 'Redimensionar emojis' },
  { id: 'rank',      label: 'Rank Card',     Icon: Trophy,        desc: 'Tarjetas de nivel – generador de código' },
  { id: 'welcome',   label: 'Welcome Card',  Icon: UserPlus,      desc: 'Tarjetas de bienvenida – generador de código' },
  { id: 'format',    label: 'Msg Format',    Icon: FileText,      desc: 'Formateador Markdown Discord' },
  { id: 'template',  label: 'Templates',     Icon: Layers,        desc: 'Creador mega de plantillas de servidor' },
] as const;

type ToolId = typeof TOOLS[number]['id'];

export default function App() {
  const [tool, setTool] = useState<ToolId>('icon');
  return (
    <div className="app-shell">
      <nav className="app-nav">
        <div className="app-nav-brand">
          <span className="app-nav-sword">⚔</span>
          <span className="app-nav-title">ZM Tools</span>
        </div>
        <div className="app-nav-items">
          {TOOLS.map(({ id, label, Icon, desc }) => (
            <button key={id} className={`app-nav-item ${tool === id ? 'active' : ''}`}
              onClick={() => setTool(id)} title={desc}>
              <Icon size={17} />
              <span>{label}</span>
            </button>
          ))}
        </div>
        <div className="app-nav-footer">
          <span>Zona Muerta RP</span>
        </div>
      </nav>
      <div className="app-content">
        {tool === 'icon'      && <IconGenerator />}
        {tool === 'embed'     && <EmbedBuilder />}
        {tool === 'timestamp' && <TimestampTool />}
        {tool === 'perms'     && <PermCalc />}
        {tool === 'color'     && <ColorRolePicker />}
        {tool === 'emoji'     && <EmojiResizer />}
        {tool === 'rank'      && <RankCard />}
        {tool === 'welcome'   && <WelcomeCard />}
        {tool === 'format'    && <MsgFormatter />}
        {tool === 'template'  && <TemplateCreator />}
      </div>
    </div>
  );
}
