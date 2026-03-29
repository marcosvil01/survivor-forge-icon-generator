import { useState, useRef, useMemo, useCallback } from 'react';
import { toPng, toCanvas } from 'html-to-image';
import { motion, AnimatePresence } from 'framer-motion';
import { GIFEncoder, quantize, applyPalette } from 'gifenc';

import * as RiIcons from 'react-icons/ri';
import * as GiIcons from 'react-icons/gi';
import * as FaIcons from 'react-icons/fa6';
import * as MdIcons from 'react-icons/md';
import { Search, Download, ShieldCheck, Skull, Diamond, Grid3X3, ShieldAlert, Award, HeartPulse, AlertTriangle, Copy, Check, FlipHorizontal2, FlipVertical2 } from 'lucide-react';
import './App.css';

const CATEGORIES = {
  'Staff': {
    icon: <ShieldCheck size={16} />,
    icons: ['RiShieldUserFill', 'RiShieldCheckFill', 'FaShieldHalved', 'MdSecurity', 'RiVipCrownFill', 'GiImperialCrown', 'GiAxeInStump', 'RiPoliceBadgeFill']
  },
  'Zombie': {
    icon: <Skull size={16} />,
    icons: ['GiSkullMask', 'GiBiohazard', 'GiGooeySplat', 'GiCurvyKnife', 'GiBrute', 'GiZombieHand', 'GiBrain', 'GiRaiseZombie']
  },
  'Prestigio': {
    icon: <Diamond size={16} />,
    icons: ['GiDiamondHard', 'GiGoldBar', 'GiTrophyCup', 'GiStarMedal', 'GiAura', 'GiJewelCrown', 'GiLightningBolt', 'GiFlame']
  },
  'Policia': {
    icon: <ShieldAlert size={16} />,
    icons: ['RiPoliceBadgeFill', 'MdLocalPolice', 'GiHandcuffs', 'FaShieldHalved', 'GiPistolGun', 'RiCarFill', 'MdBadge', 'RiShieldCheckFill']
  },
  'Militar': {
    icon: <Award size={16} />,
    icons: ['MdMilitaryTech', 'GiMedal', 'GiGrenade', 'GiCrossedSwords', 'GiRifle', 'GiDogTag', 'GiRank3', 'GiStarMedal']
  },
  'EMS': {
    icon: <HeartPulse size={16} />,
    icons: ['MdLocalHospital', 'GiFirstAidKit', 'GiMedicalPack', 'MdEmergency', 'FaHospital', 'GiMedicalPackAlt', 'FaFireExtinguisher', 'GiHeartOrgan']
  },
  'Criminal': {
    icon: <AlertTriangle size={16} />,
    icons: ['GiSkullBones', 'GiBandMask', 'GiPoison', 'GiDagger', 'GiFlintlockPistol', 'GiChainedArrowHeads', 'GiKnife', 'GiCrimeSceneMarker']
  }
};

const ALL_ICON_LIBS: any = { ...RiIcons, ...GiIcons, ...FaIcons, ...MdIcons };
const ALL_ICON_KEYS = Object.keys(ALL_ICON_LIBS);

const LIB_PREFIXES = ['Ri', 'Gi', 'Fa', 'Md'] as const;
type LibPrefix = (typeof LIB_PREFIXES)[number] | 'all';

const PAGE_SIZE = 60;

const EFFECT_PRESETS = [
  { id: 'none',   label: 'Ninguno' },
  { id: 'glow',   label: 'Glow'    },
  { id: 'neon',   label: 'Neon'    },
  { id: 'shadow', label: 'Sombra'    },
  { id: 'stroke', label: 'Contorno'  },
] as const;
type EffectId = (typeof EFFECT_PRESETS)[number]['id'];

const GIF_ANIMS = [
  { id: 'pulseglow', label: '✦ Pulse Glow' },
  { id: 'neonflare', label: '⚡ Neon Flare' },
  { id: 'spin',      label: '↻ Rotacion'   },
  { id: 'rainbow',   label: '🌈 Rainbow'   },
  { id: 'breathe',   label: '◎ Respirar'   },
  { id: 'shake',     label: '↔ Shake'      },
  { id: 'shimmer',   label: '✦ Shimmer'    },
] as const;
type GifAnim = (typeof GIF_ANIMS)[number]['id'];

interface PresetConfig {
  name: string;
  accentColor: string;
  icon: string;
  bgType: 'transparent' | 'solid' | 'gradient';
  bgColor: string;
  bgColor2: string;
  gradientAngle: number;
  iconColor: string;
  effect: EffectId;
  glowColor: string;
  glowSize: number;
  borderRadius: number;
}

const PRESETS: PresetConfig[] = [
  {
    name: 'Admin',        accentColor: '#5865f2',
    icon: 'RiShieldCheckFill',
    bgType: 'gradient',   bgColor: '#0f1227', bgColor2: '#3b3f8c', gradientAngle: 145,
    iconColor: '#ffffff', effect: 'glow',     glowColor: '#5865f2', glowSize: 22, borderRadius: 14,
  },
  {
    name: 'VIP Gold',     accentColor: '#f0a500',
    icon: 'GiJewelCrown',
    bgType: 'gradient',   bgColor: '#1a0f00', bgColor2: '#4a2c00', gradientAngle: 130,
    iconColor: '#ffd700', effect: 'neon',     glowColor: '#f0a500', glowSize: 18, borderRadius: 50,
  },
  {
    name: 'Survivor',     accentColor: '#ed4245',
    icon: 'GiSkullMask',
    bgType: 'gradient',   bgColor: '#1a0000', bgColor2: '#5a0000', gradientAngle: 160,
    iconColor: '#ff4444', effect: 'neon',     glowColor: '#ed4245', glowSize: 20, borderRadius: 10,
  },
  {
    name: 'Zombie',       accentColor: '#57f287',
    icon: 'GiBiohazard',
    bgType: 'gradient',   bgColor: '#031a07', bgColor2: '#0f4a1a', gradientAngle: 135,
    iconColor: '#57f287', effect: 'neon',     glowColor: '#57f287', glowSize: 22, borderRadius: 0,
  },
  {
    name: 'Moderador',    accentColor: '#00b0f4',
    icon: 'RiShieldUserFill',
    bgType: 'gradient',   bgColor: '#001a2e', bgColor2: '#004466', gradientAngle: 120,
    iconColor: '#00c6ff', effect: 'glow',     glowColor: '#00b0f4', glowSize: 16, borderRadius: 18,
  },
  {
    name: 'Prestige',     accentColor: '#eb459e',
    icon: 'GiDiamondHard',
    bgType: 'gradient',   bgColor: '#1a0030', bgColor2: '#4a0060', gradientAngle: 140,
    iconColor: '#ffffff', effect: 'neon',     glowColor: '#eb459e', glowSize: 24, borderRadius: 64,
  },
  {
    name: 'Leyenda',      accentColor: '#fee75c',
    icon: 'GiTrophyCup',
    bgType: 'gradient',   bgColor: '#0f0f0f', bgColor2: '#2a1f00', gradientAngle: 150,
    iconColor: '#fee75c', effect: 'glow',     glowColor: '#fee75c', glowSize: 20, borderRadius: 12,
  },
  {
    name: 'Supremo',      accentColor: '#c084fc',
    icon: 'GiImperialCrown',
    bgType: 'gradient',   bgColor: '#0a0014', bgColor2: '#2d0060', gradientAngle: 135,
    iconColor: '#e9d5ff', effect: 'neon',     glowColor: '#a855f7', glowSize: 26, borderRadius: 128,
  },
  {
    name: 'Policia',      accentColor: '#4fc3f7',
    icon: 'RiPoliceBadgeFill',
    bgType: 'gradient',   bgColor: '#001a3a', bgColor2: '#003875', gradientAngle: 140,
    iconColor: '#4fc3f7', effect: 'glow',     glowColor: '#00b4ff', glowSize: 16, borderRadius: 12,
  },
  {
    name: 'Medico',       accentColor: '#57f287',
    icon: 'GiFirstAidKit',
    bgType: 'gradient',   bgColor: '#001a0a', bgColor2: '#004422', gradientAngle: 150,
    iconColor: '#ffffff', effect: 'glow',     glowColor: '#57f287', glowSize: 14, borderRadius: 16,
  },
  {
    name: 'Narco',        accentColor: '#4ade80',
    icon: 'GiPoison',
    bgType: 'gradient',   bgColor: '#030d03', bgColor2: '#1a3a1a', gradientAngle: 135,
    iconColor: '#4ade80', effect: 'neon',     glowColor: '#22c55e', glowSize: 18, borderRadius: 8,
  },
  {
    name: 'Militar',      accentColor: '#c8b96e',
    icon: 'MdMilitaryTech',
    bgType: 'gradient',   bgColor: '#0c1008', bgColor2: '#2a3018', gradientAngle: 145,
    iconColor: '#c8b96e', effect: 'shadow',   glowColor: '#a8a870', glowSize: 14, borderRadius: 6,
  },
  {
    name: 'Booster',      accentColor: '#c084fc',
    icon: 'GiAura',
    bgType: 'gradient',   bgColor: '#13001f', bgColor2: '#3d0063', gradientAngle: 135,
    iconColor: '#e879f9', effect: 'neon',     glowColor: '#c084fc', glowSize: 26, borderRadius: 128,
  },
];

function buildFilter(effect: EffectId, color: string, size: number): string | undefined {
  switch (effect) {
    case 'glow':
      return `drop-shadow(0 0 ${size}px ${color}) drop-shadow(0 0 ${size * 2}px ${color}66)`;
    case 'neon':
      return `drop-shadow(0 0 2px #fff) drop-shadow(0 0 ${size}px ${color}) drop-shadow(0 0 ${size * 2}px ${color}) drop-shadow(0 0 ${size * 3}px ${color}88)`;
    case 'shadow':
      return 'drop-shadow(3px 4px 8px rgba(0,0,0,0.9))';
    case 'stroke': {
      const px = Math.max(1, Math.round(size / 8));
      const p = `${px}px`;
      return `drop-shadow(${p} 0 0 ${color}) drop-shadow(-${p} 0 0 ${color}) drop-shadow(0 ${p} 0 ${color}) drop-shadow(0 -${p} 0 ${color})`;
    }
    default:
      return undefined;
  }
}

function applyGifFrame(el: HTMLElement, animation: GifAnim, t: number, glowColor: string, glowSize: number, baseTransform = '') {
  const sin = 0.5 + 0.5 * Math.sin(t * Math.PI * 2);
  const compose = (anim: string) => [baseTransform, anim].filter(Boolean).join(' ');
  switch (animation) {
    case 'pulseglow': {
      const s = glowSize * 0.2 + glowSize * sin * 2;
      el.style.filter = `drop-shadow(0 0 ${s}px ${glowColor}) drop-shadow(0 0 ${s * 2}px ${glowColor}77)`;
      el.style.transform = baseTransform;
      break;
    }
    case 'neonflare': {
      const s = glowSize * 0.3 + glowSize * sin * 1.5;
      el.style.filter = `drop-shadow(0 0 3px #fff) drop-shadow(0 0 ${s}px ${glowColor}) drop-shadow(0 0 ${s * 2}px ${glowColor}99)`;
      el.style.transform = compose(`scale(${0.97 + 0.06 * sin})`);
      break;
    }
    case 'spin': {
      el.style.transform = compose(`rotate(${t * 360}deg)`);
      el.style.filter = `drop-shadow(0 0 ${glowSize * 0.4}px ${glowColor}88)`;
      break;
    }
    case 'rainbow': {
      el.style.filter = `hue-rotate(${t * 360}deg) drop-shadow(0 0 ${glowSize * 0.5}px currentColor)`;
      el.style.transform = baseTransform;
      break;
    }
    case 'breathe': {
      const scale = 0.72 + 0.28 * sin;
      el.style.filter = `drop-shadow(0 0 ${glowSize * sin}px ${glowColor})`;
      el.style.transform = compose(`scale(${scale})`);
      break;
    }
    case 'shake': {
      const x = Math.sin(t * Math.PI * 6) * 8;
      el.style.transform = compose(`translateX(${x}px)`);
      el.style.filter = `drop-shadow(0 0 ${glowSize * 0.4}px ${glowColor}88)`;
      break;
    }
    case 'shimmer': {
      const bright = 1 + 0.8 * sin;
      el.style.filter = `brightness(${bright.toFixed(2)}) drop-shadow(0 0 ${(glowSize * sin).toFixed(1)}px ${glowColor})`;
      el.style.transform = baseTransform;
      break;
    }
  }
}

function getGifPreviewAnimProps(animation: GifAnim, glowColor: string, glowSize: number) {
  switch (animation) {
    case 'pulseglow':
      return {
        animate: { filter: [`drop-shadow(0 0 ${glowSize * 0.2}px ${glowColor})`, `drop-shadow(0 0 ${glowSize * 2.2}px ${glowColor}) drop-shadow(0 0 ${glowSize * 4}px ${glowColor}77)`, `drop-shadow(0 0 ${glowSize * 0.2}px ${glowColor})`] },
        transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' },
      };
    case 'neonflare':
      return {
        animate: { filter: [`drop-shadow(0 0 2px #fff) drop-shadow(0 0 ${glowSize * 0.4}px ${glowColor})`, `drop-shadow(0 0 4px #fff) drop-shadow(0 0 ${glowSize * 1.8}px ${glowColor}) drop-shadow(0 0 ${glowSize * 3}px ${glowColor}99)`, `drop-shadow(0 0 2px #fff) drop-shadow(0 0 ${glowSize * 0.4}px ${glowColor})`], scale: [1, 1.05, 1] },
        transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' },
      };
    case 'spin':
      return { animate: { rotate: 360 }, transition: { duration: 2, repeat: Infinity, ease: 'linear' } };
    case 'rainbow':
      return { animate: { filter: ['hue-rotate(0deg)', 'hue-rotate(180deg)', 'hue-rotate(360deg)'] }, transition: { duration: 2, repeat: Infinity, ease: 'linear' } };
    case 'breathe':
      return {
        animate: { scale: [0.72, 1, 0.72], filter: [`drop-shadow(0 0 0px ${glowColor})`, `drop-shadow(0 0 ${glowSize}px ${glowColor})`, `drop-shadow(0 0 0px ${glowColor})`] },
        transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
      };
    case 'shake':
      return {
        animate: { x: [0, 8, -8, 6, -6, 0] },
        transition: { duration: 0.5, repeat: Infinity, ease: 'easeInOut' },
      };
    case 'shimmer':
      return {
        animate: { filter: [`brightness(1) drop-shadow(0 0 0px ${glowColor})`, `brightness(1.8) drop-shadow(0 0 ${glowSize}px ${glowColor})`, `brightness(1) drop-shadow(0 0 0px ${glowColor})`] },
        transition: { duration: 1.0, repeat: Infinity, ease: 'easeInOut' },
      };
    default:
      return {};
  }
}

function App() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const iconRef   = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab]     = useState<keyof typeof CATEGORIES | 'Search' | 'All'>('Staff');
  const [searchTerm, setSearchTerm]   = useState('');
  const [selectedIconName, setSelectedIconName] = useState('RiShieldUserFill');
  const [browsePage, setBrowsePage]   = useState(0);
  const [browseLib, setBrowseLib]     = useState<LibPrefix>('all');
  const [searchLimit, setSearchLimit] = useState(50);

  const [bgType, setBgType]           = useState<'transparent' | 'solid' | 'gradient'>('transparent');
  const [bgColor, setBgColor]         = useState('#2b2d31');
  const [bgColor2, setBgColor2]       = useState('#5865f2');
  const [gradientAngle, setGradientAngle] = useState(135);

  const [iconColor, setIconColor]     = useState('#5865f2');
  const [iconSize, setIconSize]       = useState(180);
  const [borderRadius, setBorderRadius] = useState(12);

  const [effect, setEffect]           = useState<EffectId>('none');
  const [glowColor, setGlowColor]     = useState('#5865f2');
  const [glowSize, setGlowSize]       = useState(15);

  const [useText, setUseText]         = useState(false);
  const [customText, setCustomText]   = useState('A');
  const [textColor, setTextColor]     = useState('#ffffff');

  const [exportSize, setExportSize]   = useState<64 | 128 | 256>(128);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportProgress, setExportProgress] = useState(0);

  const [isGifMode, setIsGifMode]       = useState(false);
  const [gifAnimation, setGifAnimation] = useState<GifAnim>('pulseglow');
  const gifFrames = 24;

  const [iconRotation, setIconRotation] = useState(0);
  const [flipH, setFlipH]               = useState(false);
  const [flipV, setFlipV]               = useState(false);
  const [copied, setCopied]             = useState(false);

  const computedBg = useMemo(() => {
    if (bgType === 'transparent') return 'transparent';
    if (bgType === 'gradient') return `linear-gradient(${gradientAngle}deg, ${bgColor}, ${bgColor2})`;
    return bgColor;
  }, [bgType, bgColor, bgColor2, gradientAngle]);

  const iconTransform = useMemo(() => {
    const parts: string[] = [];
    if (iconRotation !== 0) parts.push(`rotate(${iconRotation}deg)`);
    if (flipH) parts.push('scaleX(-1)');
    if (flipV) parts.push('scaleY(-1)');
    return parts.length ? parts.join(' ') : undefined;
  }, [iconRotation, flipH, flipV]);

  const browseKeys = useMemo(
    () => browseLib === 'all' ? ALL_ICON_KEYS : ALL_ICON_KEYS.filter(k => k.startsWith(browseLib)),
    [browseLib]
  );

  const { displayIcons, hasMore } = useMemo(() => {
    if (activeTab === 'All') {
      const slice = browseKeys.slice(0, (browsePage + 1) * PAGE_SIZE);
      return { displayIcons: slice, hasMore: slice.length < browseKeys.length };
    }
    if (activeTab === 'Search') {
      if (!searchTerm) return { displayIcons: [] as string[], hasMore: false };
      const matched = ALL_ICON_KEYS.filter(k => k.toLowerCase().includes(searchTerm.toLowerCase()));
      return { displayIcons: matched.slice(0, searchLimit), hasMore: matched.length > searchLimit };
    }
    return { displayIcons: CATEGORIES[activeTab as keyof typeof CATEGORIES].icons, hasMore: false };
  }, [activeTab, browseKeys, browsePage, searchTerm, searchLimit]);

  const CurrentIcon = ALL_ICON_LIBS[selectedIconName] || RiIcons.RiShieldUserFill;
  const iconFilter  = buildFilter(effect, glowColor, glowSize);
  const gifPreviewProps = isGifMode ? getGifPreviewAnimProps(gifAnimation, glowColor, glowSize) : {};

  const applyPreset = useCallback((p: PresetConfig) => {
    setSelectedIconName(p.icon);
    setBgType(p.bgType);
    setBgColor(p.bgColor);
    setBgColor2(p.bgColor2);
    setGradientAngle(p.gradientAngle);
    setIconColor(p.iconColor);
    setEffect(p.effect);
    setGlowColor(p.glowColor);
    setGlowSize(p.glowSize);
    setBorderRadius(p.borderRadius);
    setIconRotation(0);
    setFlipH(false);
    setFlipV(false);
  }, []);

  const handleExport = useCallback(async () => {
    if (!canvasRef.current) return;
    setIsExporting(true);
    setExportError(null);
    try {
      const dataUrl = await toPng(canvasRef.current, {
        cacheBust: true,
        pixelRatio: exportSize / 256,
        style: { transform: 'none' },
      });
      const a = document.createElement('a');
      a.download = `role-icon-${selectedIconName}-${exportSize}px.png`;
      a.href = dataUrl;
      a.click();
    } catch (err) {
      console.error(err);
      setExportError('Error al exportar PNG. Intenta de nuevo.');
    } finally {
      setIsExporting(false);
    }
  }, [selectedIconName, exportSize]);

  const handleCopyClipboard = useCallback(async () => {
    if (!canvasRef.current) return;
    try {
      const dataUrl = await toPng(canvasRef.current, {
        cacheBust: true,
        pixelRatio: exportSize / 256,
        style: { transform: 'none' },
      });
      const res  = await fetch(dataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  }, [exportSize]);

  const handleGifExport = useCallback(async () => {
    if (!canvasRef.current || !iconRef.current) return;
    setIsExporting(true);
    setExportError(null);
    setExportProgress(0);

    const originalFilter    = iconRef.current.style.filter;
    const originalTransform = iconRef.current.style.transform;
    const baseTransform     = [
      iconRotation !== 0 ? `rotate(${iconRotation}deg)` : '',
      flipH ? 'scaleX(-1)' : '',
      flipV ? 'scaleY(-1)' : '',
    ].filter(Boolean).join(' ');

    try {
      const encoder = GIFEncoder();

      for (let i = 0; i < gifFrames; i++) {
        const t = i / gifFrames;

        applyGifFrame(iconRef.current!, gifAnimation, t, glowColor, glowSize, baseTransform);
        await new Promise<void>(r => requestAnimationFrame(() => r()));

        const canvas   = await toCanvas(canvasRef.current!, {
          pixelRatio: exportSize / 256,
          cacheBust: false,
          style: { transform: 'none' },
        });
        const ctx      = canvas.getContext('2d')!;
        const imgData  = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const palette  = quantize(imgData.data, 256);
        const index    = applyPalette(imgData.data, palette);

        encoder.writeFrame(index, canvas.width, canvas.height, {
          palette,
          delay: 5,
          ...(i === 0 ? { repeat: 0 } : {}),
        });

        setExportProgress(Math.round(((i + 1) / gifFrames) * 100));
      }

      iconRef.current!.style.filter    = originalFilter;
      iconRef.current!.style.transform = originalTransform;

      encoder.finish();
      const bytes = encoder.bytes();
      const blob  = new Blob([bytes], { type: 'image/gif' });
      const url   = URL.createObjectURL(blob);
      const a     = document.createElement('a');
      a.href = url; a.download = `role-icon-${selectedIconName}-animated.gif`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      if (iconRef.current) {
        iconRef.current.style.filter    = originalFilter;
        iconRef.current.style.transform = originalTransform;
      }
      setExportError('Error al generar GIF. Intenta de nuevo.');
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  }, [selectedIconName, exportSize, gifAnimation, gifFrames, glowColor, glowSize, iconRotation, flipH, flipV]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="v6-layout">

      <aside className="v6-sidebar">
        <div className="v6-logo">SURVIVOR FORGE <span>v6 Final</span></div>

        {/* PRESETS */}
        <div className="v6-section">
          <span className="v6-label">Presets Rapidos</span>
          <div className="v6-presets-scroll">
            {PRESETS.map(p => {
              const IconComp = ALL_ICON_LIBS[p.icon];
              return (
                <button
                  key={p.name}
                  className="v6-preset-card"
                  onClick={() => applyPreset(p)}
                  title={p.name}
                  style={{
                    background: p.bgType === 'gradient'
                      ? `linear-gradient(${p.gradientAngle}deg, ${p.bgColor}, ${p.bgColor2})`
                      : p.bgColor,
                    boxShadow: `0 0 10px ${p.accentColor}55`,
                  }}
                >
                  <div style={{ filter: buildFilter(p.effect, p.glowColor, p.glowSize * 0.5), display: 'flex' }}>
                    {IconComp && <IconComp size={22} color={p.iconColor} />}
                  </div>
                  <span className="v6-preset-label">{p.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ICON SELECTION */}
        <div className="v6-section">
          <span className="v6-label">Seleccion de Icono</span>
          <div className="v6-tabs">
            {Object.keys(CATEGORIES).map(cat => (
              <button key={cat} title={cat} onClick={() => { setActiveTab(cat as any); setSearchTerm(''); }}
                className={`v6-tab ${activeTab === cat ? 'active' : ''}`}>
                {(CATEGORIES as any)[cat].icon}
              </button>
            ))}
            <button title="Ver todos" onClick={() => { setActiveTab('All'); setBrowsePage(0); }}
              className={`v6-tab ${activeTab === 'All' ? 'active' : ''}`}><Grid3X3 size={16} /></button>
            <button title="Buscar" onClick={() => setActiveTab('Search')}
              className={`v6-tab ${activeTab === 'Search' ? 'active' : ''}`}><Search size={16} /></button>
          </div>

          {activeTab === 'Search' && (
            <input type="text" placeholder="Buscar icono... (ej: shield, star, skull)"
              className="v6-search-input" value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setSearchLimit(50); }} />
          )}
          {activeTab === 'All' && (
            <div className="v6-chips-wrap">
              {(['all', ...LIB_PREFIXES] as const).map(lib => (
                <button key={lib} className={`v6-chip ${browseLib === lib ? 'active' : ''}`}
                  onClick={() => { setBrowseLib(lib as LibPrefix); setBrowsePage(0); }}>
                  {lib === 'all' ? 'Todos' : lib}
                </button>
              ))}
            </div>
          )}

          <div className={`v6-icon-grid${activeTab === 'All' || activeTab === 'Search' ? ' large' : ''}`}>
            {displayIcons.map((name: string) => {
              const IconComp = ALL_ICON_LIBS[name];
              return IconComp ? (
                <button key={name} title={name}
                  className={`v6-icon-btn ${selectedIconName === name ? 'active' : ''}`}
                  onClick={() => setSelectedIconName(name)}><IconComp size={20} /></button>
              ) : null;
            })}
          </div>
          {activeTab === 'All' && hasMore && (
            <button className="v6-load-more" onClick={() => setBrowsePage(p => p + 1)}>
              Cargar mas ({browseKeys.length - displayIcons.length} restantes)
            </button>
          )}
          {activeTab === 'Search' && hasMore && (
            <button className="v6-load-more" onClick={() => setSearchLimit(l => l + 50)}>Cargar mas resultados</button>
          )}
        </div>

        {/* BACKGROUND */}
        <div className="v6-section">
          <span className="v6-label">Fondo</span>
          <div className="v6-chips-wrap">
            {(['transparent', 'solid', 'gradient'] as const).map(t => (
              <button key={t} className={`v6-chip ${bgType === t ? 'active' : ''}`} onClick={() => setBgType(t)}>
                {t === 'transparent' ? 'Transparente' : t === 'solid' ? 'Solido' : 'Degradado'}
              </button>
            ))}
          </div>
          {bgType !== 'transparent' && (
            <div className="v6-control-row">
              <input type="color" className="v6-color-input" value={bgColor} onChange={e => setBgColor(e.target.value)} />
              {bgType === 'gradient' && <>
                <input type="color" className="v6-color-input" value={bgColor2} onChange={e => setBgColor2(e.target.value)} />
                <span className="v6-dim-text">{gradientAngle}°</span>
                <input type="range" className="v6-slider" min="0" max="360" value={gradientAngle} onChange={e => setGradientAngle(Number(e.target.value))} />
              </>}
            </div>
          )}
        </div>

        {/* ICON COLOR & SCALE */}
        <div className="v6-section">
          <span className="v6-label">Color y Escala del Icono</span>
          <div className="v6-control-row">
            <input type="color" className="v6-color-input" value={iconColor} onChange={e => setIconColor(e.target.value)} />
            <input type="range" className="v6-slider" min="50" max="250" value={iconSize} onChange={e => setIconSize(Number(e.target.value))} />
          </div>
        </div>

        {/* EFFECTS */}
        <div className="v6-section">
          <span className="v6-label">Efectos de Luz</span>
          <div className="v6-chips-wrap">
            {EFFECT_PRESETS.map(ep => (
              <button key={ep.id} className={`v6-chip ${effect === ep.id ? 'active' : ''}`} onClick={() => setEffect(ep.id)}>{ep.label}</button>
            ))}
          </div>
          {effect !== 'none' && (
            <div className="v6-control-row" style={{ marginTop: '10px' }}>
              <input type="color" className="v6-color-input" style={{ width: '32px', height: '32px' }} value={glowColor} onChange={e => setGlowColor(e.target.value)} />
              <span className="v6-dim-text">{glowSize}px</span>
              <input type="range" className="v6-slider" min="5" max="40" value={glowSize} onChange={e => setGlowSize(Number(e.target.value))} />
            </div>
          )}
        </div>

        {/* TRANSFORM */}
        <div className="v6-section">
          <span className="v6-label">Transformacion</span>
          <div className="v6-control-row">
            <span className="v6-dim-text">Rot</span>
            <input type="range" className="v6-slider" min="0" max="360" value={iconRotation}
              onChange={e => setIconRotation(Number(e.target.value))} />
            <span className="v6-dim-text">{iconRotation}°</span>
          </div>
          <div className="v6-control-row" style={{ marginTop: '8px' }}>
            <button className={`v6-chip ${flipH ? 'active' : ''}`} onClick={() => setFlipH(f => !f)}
              style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <FlipHorizontal2 size={12} /> Voltear H
            </button>
            <button className={`v6-chip ${flipV ? 'active' : ''}`} onClick={() => setFlipV(f => !f)}
              style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <FlipVertical2 size={12} /> Voltear V
            </button>
            {(iconRotation !== 0 || flipH || flipV) && (
              <button className="v6-chip" onClick={() => { setIconRotation(0); setFlipH(false); setFlipV(false); }}>Reset</button>
            )}
          </div>
        </div>

        {/* SHAPE */}
        <div className="v6-section">
          <span className="v6-label">Forma del Rol</span>
          <div className="v6-control-row">
            <span className="v6-dim-text">Radio</span>
            <input type="range" className="v6-slider" min="0" max="128" value={borderRadius} onChange={e => setBorderRadius(Number(e.target.value))} />
          </div>
        </div>

        {/* TEXT */}
        <div className="v6-section">
          <span className="v6-label">Texto Superpuesto</span>
          <div className="v6-control-row">
            <input type="checkbox" id="usetext" checked={useText} onChange={e => setUseText(e.target.checked)} />
            <label htmlFor="usetext" style={{ fontSize: '12px', cursor: 'pointer' }}>Añadir texto</label>
          </div>
          {useText && (
            <div className="v6-control-row" style={{ marginTop: '8px' }}>
              <input type="text" maxLength={3} value={customText} onChange={e => setCustomText(e.target.value)} className="v6-text-input" />
              <input type="color" className="v6-color-input" style={{ width: '32px', height: '32px' }} value={textColor} onChange={e => setTextColor(e.target.value)} />
            </div>
          )}
        </div>

        {/* EXPORT */}
        <div className="v6-section">
          <span className="v6-label">Exportacion</span>
          <div className="v6-export-toggle">
            <button className={`v6-export-mode-btn ${!isGifMode ? 'active' : ''}`} onClick={() => setIsGifMode(false)}>PNG Estatico</button>
            <button className={`v6-export-mode-btn ${isGifMode ? 'active' : ''}`} onClick={() => setIsGifMode(true)}>GIF Animado</button>
          </div>
          <div className="v6-chips-wrap" style={{ marginTop: '10px' }}>
            {([64, 128, 256] as const).map(size => (
              <button key={size} className={`v6-chip ${exportSize === size ? 'active' : ''}`} onClick={() => setExportSize(size)}>{size}px</button>
            ))}
          </div>
          {isGifMode && (
            <>
              <span className="v6-label" style={{ marginTop: '12px', display: 'block' }}>Animacion GIF</span>
              <div className="v6-gif-anims">
                {GIF_ANIMS.map(a => (
                  <button key={a.id} className={`v6-gif-anim-btn ${gifAnimation === a.id ? 'active' : ''}`}
                    onClick={() => setGifAnimation(a.id)}>{a.label}</button>
                ))}
              </div>
              <p className="v6-hint">Discord soporta GIF en servidores con <strong>Boost Nivel 3</strong>. {gifFrames} frames · {(gifFrames * 50) / 1000}s bucle</p>
            </>
          )}
        </div>

        <div className="v6-copy-row">
          <button className={`v6-download-btn${isGifMode ? ' gif' : ''}`}
            style={{ flex: 1 }}
            onClick={isGifMode ? handleGifExport : handleExport} disabled={isExporting}>
            <Download size={18} />
            {isExporting
              ? (isGifMode ? `Generando GIF... ${exportProgress}%` : 'Procesando...')
              : (isGifMode ? `Exportar GIF (${exportSize}px)` : `Descargar PNG (${exportSize}px)`)}
          </button>
          <button className={`v6-copy-btn${copied ? ' copied' : ''}`}
            onClick={handleCopyClipboard} title="Copiar PNG al portapapeles" disabled={isExporting}>
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>

        {isExporting && isGifMode && (
          <div className="v6-progress-bar"><div className="v6-progress-fill" style={{ width: `${exportProgress}%` }} /></div>
        )}
        {exportError && <div className="v6-export-error">{exportError}</div>}
      </aside>

      {/* STAGE */}
      <main className="v6-stage">
        <div className="v6-canvas-wrap">
          {bgType === 'transparent' && <div className="v6-checker-bg" style={{ borderRadius: `${borderRadius}px` }} />}
          <div
            className={`v6-canvas-master${isGifMode ? ' gif-mode' : ''}`}
            ref={canvasRef}
            style={{ background: computedBg, borderRadius: `${borderRadius}px` }}
          >
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedIconName}
              initial={{ scale: 0.5, opacity: 0 }}
              {...('animate' in gifPreviewProps
                ? { animate: { scale: 1, opacity: 1, ...gifPreviewProps.animate }, transition: (gifPreviewProps as any).transition }
                : { animate: { scale: 1, opacity: 1 }, transition: { type: 'spring', damping: 15 } }
              )}
              style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >
              <div ref={iconRef} style={{ display: 'flex', filter: iconFilter, transform: iconTransform }}>
                <CurrentIcon size={iconSize} color={iconColor} />
              </div>
            </motion.div>
          </AnimatePresence>
          {useText && (
            <div className="v6-text-preview" style={{ color: textColor, fontSize: `${iconSize / 4}px` }}>{customText}</div>
          )}
          {isGifMode && <div className="v6-gif-badge">GIF</div>}
          </div>
        </div>

        <div className="v6-preview-row">
          <div className="discord-mock-v6">
            <div className="disc-avatar-v6" />
            <div className="disc-message-v6">
              <div className="disc-user-v6">
                <span style={{ color: iconColor }}>Survivor Admin</span>
                <div className="disc-role-icon-v6" style={{ background: computedBg, borderRadius: `${Math.ceil(borderRadius / 12)}px`, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <div style={{ filter: iconFilter, display: 'flex' }}>
                    <CurrentIcon size={14} color={iconColor} />
                  </div>
                </div>
              </div>
              <div className="disc-text-v6">Este es el simulador real. Tu icono se vera justo aqui, al lado del nombre en el chat.</div>
            </div>
          </div>

          <div className="discord-member-list-v6">
            <div className="dm-title-v6">MIEMBROS — Servidor</div>
            <div className="dm-member-row-v6">
              <div className="dm-avatar-small-v6" />
              <span className="dm-name-v6" style={{ color: iconColor }}>Survivor Admin</span>
              <div className="dm-role-icon-small-v6" style={{ background: computedBg, borderRadius: `${Math.ceil(borderRadius / 16)}px`, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ filter: iconFilter, display: 'flex' }}>
                  <CurrentIcon size={12} color={iconColor} />
                </div>
              </div>
            </div>
            <div className="dm-member-row-v6">
              <div className="dm-avatar-small-v6" style={{ background: '#555' }} />
              <span className="dm-name-v6">Usuario Estandar</span>
            </div>
            <div className="dm-member-row-v6">
              <div className="dm-avatar-small-v6" style={{ background: '#444' }} />
              <span className="dm-name-v6">Nuevo Miembro</span>
            </div>
          </div>
        </div>

        <div style={{ color: 'var(--ui-text-dim)', fontSize: '11px', textAlign: 'center' }}>
          Diseñado para servidores de Zona Muerta RP discord.zonamuerta.com // {isGifMode ? `GIF Animado · ${exportSize}x${exportSize}px` : `PNG · ${exportSize}x${exportSize}px`}
        </div>
      </main>
    </motion.div>
  );
}

export default App;
