import * as THREE from 'three';

export type ThemeKey = 'sunset' | 'vibrant-sunset' | 'enchanted-midnight-garden' | 'golden-summer-glow' | 'black-white';

export interface ThemeScene {
  bgColor: string;
  fogColor: string;
  ambientColor: string;
  light1Color: string;
  light2Color: string;
  lineColor: string;
  /** Ordered list of hex colors for the particle palette. */
  particlePalette: string[];
  /** Four colors for the halftone portrait shader (dark→bright). */
  portraitPalette: [string, string, string, string];
  /** Line color for the halftone portrait wireframe. */
  portraitLineColor: string;
  /** Color of nav-node dots on the portrait (unlit / lit). */
  portraitMarkColor: string;
  portraitMarkColorLit: string;
  useAdditiveBlending: boolean;
  showStars: boolean;
}

/** CSS custom-property overrides applied to <html> when this theme is active. */
export type ThemeVars = Record<string, string>;

export interface Theme {
  key: ThemeKey;
  label: string;
  /** CSS variable key → value pairs applied to document.documentElement. */
  vars: ThemeVars;
  /** Colors consumed directly by Three.js / WebGL code. */
  scene: ThemeScene;
}

// ---------------------------------------------------------------------------
// Sunset – warm dark (default)
// ---------------------------------------------------------------------------
const sunset: Theme = {
  key: 'sunset',
  label: 'Sunset',
  vars: {
    '--c-bg': '#0B0202',
    '--c-bg-70': 'rgba(11,2,2,0.70)',
    '--c-bg-95': 'rgba(11,2,2,0.95)',
    '--c-text': '#ffffff',
    '--c-text-muted': 'rgba(255,255,255,0.50)',
    '--c-text-dim': 'rgba(255,255,255,0.40)',
    '--c-accent': '#FF6900',
    '--c-accent-10': 'rgba(255,105,0,0.10)',
    '--c-accent-20': 'rgba(255,105,0,0.20)',
    '--c-accent-30': 'rgba(255,105,0,0.30)',
    '--c-accent-40': 'rgba(255,105,0,0.40)',
    '--c-accent-60': 'rgba(255,105,0,0.60)',
    '--c-accent-70': 'rgba(255,105,0,0.70)',
    '--c-accentH': '#FFA000',
    '--c-accentH-60': 'rgba(255,160,0,0.60)',
    '--c-accentH-70': 'rgba(255,160,0,0.70)',
    '--c-accentH-80': 'rgba(255,160,0,0.80)',
    '--c-danger': '#C90008',
    '--c-border': '#790B20',
    '--c-border-40': 'rgba(121,11,32,0.40)',
    '--c-border-50': 'rgba(121,11,32,0.50)',
    '--c-grad-from': '#C90008',
    '--c-grad-to': '#FF6900',
    '--c-scan': 'rgba(255,105,0,0.10)',
    '--c-scrollbar': '#790B20',
    '--c-focus': '#FF6900',
    '--c-grid': 'rgba(255,255,255,0.12)',
  },
  scene: {
    bgColor: '#0B0202',
    fogColor: '#0B0202',
    ambientColor: '#FF6900',
    light1Color: '#FFA000',
    light2Color: '#C90008',
    lineColor: '#C90008',
    particlePalette: ['#FF6900', '#FFA000', '#C90008', '#790B20', '#FF8C42'],
    portraitPalette: ['#790B20', '#C90008', '#FF6900', '#FFA000'],
    portraitLineColor: '#FF6900',
    portraitMarkColor: '#FF6900',
    portraitMarkColorLit: '#FFA000',
    useAdditiveBlending: true,
    showStars: true,
  },
};

// ---------------------------------------------------------------------------
// Vibrant Sunset – fire orange + deep violet
// Palette: #FF6D00 #FF7900 #FF8500 #FF9100 #FF9E00 #240046 #3C096C #5A189A #7B2CBF #9D4EDD
// ---------------------------------------------------------------------------
const vibrantSunset: Theme = {
  key: 'vibrant-sunset',
  label: 'Vibrant Sunset',
  vars: {
    '--c-bg': '#240046',
    '--c-bg-70': 'rgba(36,0,70,0.70)',
    '--c-bg-95': 'rgba(36,0,70,0.95)',
    '--c-text': '#ffffff',
    '--c-text-muted': 'rgba(255,255,255,0.55)',
    '--c-text-dim': 'rgba(255,255,255,0.35)',
    '--c-accent': '#FF6D00',
    '--c-accent-10': 'rgba(255,109,0,0.10)',
    '--c-accent-20': 'rgba(255,109,0,0.20)',
    '--c-accent-30': 'rgba(255,109,0,0.30)',
    '--c-accent-40': 'rgba(255,109,0,0.40)',
    '--c-accent-60': 'rgba(255,109,0,0.60)',
    '--c-accent-70': 'rgba(255,109,0,0.70)',
    '--c-accentH': '#FF9E00',
    '--c-accentH-60': 'rgba(255,158,0,0.60)',
    '--c-accentH-70': 'rgba(255,158,0,0.70)',
    '--c-accentH-80': 'rgba(255,158,0,0.80)',
    '--c-danger': '#9D4EDD',
    '--c-border': '#3C096C',
    '--c-border-40': 'rgba(60,9,108,0.40)',
    '--c-border-50': 'rgba(60,9,108,0.50)',
    '--c-grad-from': '#9D4EDD',
    '--c-grad-to': '#FF6D00',
    '--c-scan': 'rgba(255,109,0,0.10)',
    '--c-scrollbar': '#3C096C',
    '--c-focus': '#FF6D00',
    '--c-grid': 'rgba(255,255,255,0.12)',
  },
  scene: {
    bgColor: '#240046',
    fogColor: '#240046',
    ambientColor: '#FF6D00',
    light1Color: '#FF9E00',
    light2Color: '#9D4EDD',
    lineColor: '#9D4EDD',
    particlePalette: ['#FF6D00', '#FF9E00', '#9D4EDD', '#7B2CBF', '#5A189A'],
    portraitPalette: ['#3C096C', '#9D4EDD', '#FF6D00', '#FF9E00'],
    portraitLineColor: '#FF6D00',
    portraitMarkColor: '#FF6D00',
    portraitMarkColorLit: '#FF9E00',
    useAdditiveBlending: true,
    showStars: true,
  },
};

// ---------------------------------------------------------------------------
// Enchanted Midnight Garden – dark indigo + cobalt + pale blue + moonlit cream
// Palette: #3C3744 #090C9B #3066BE #B4C5E4 #FBFFF1
// ---------------------------------------------------------------------------
const enchantedMidnightGarden: Theme = {
  key: 'enchanted-midnight-garden',
  label: 'Midnight Garden',
  vars: {
    '--c-bg': '#3C3744',
    '--c-bg-70': 'rgba(60,55,68,0.70)',
    '--c-bg-95': 'rgba(60,55,68,0.95)',
    '--c-text': '#FBFFF1',
    '--c-text-muted': 'rgba(251,255,241,0.65)',
    '--c-text-dim': 'rgba(251,255,241,0.40)',
    '--c-accent': '#3066BE',
    '--c-accent-10': 'rgba(48,102,190,0.10)',
    '--c-accent-20': 'rgba(48,102,190,0.20)',
    '--c-accent-30': 'rgba(48,102,190,0.30)',
    '--c-accent-40': 'rgba(48,102,190,0.40)',
    '--c-accent-60': 'rgba(48,102,190,0.60)',
    '--c-accent-70': 'rgba(48,102,190,0.70)',
    '--c-accentH': '#B4C5E4',
    '--c-accentH-60': 'rgba(180,197,228,0.60)',
    '--c-accentH-70': 'rgba(180,197,228,0.70)',
    '--c-accentH-80': 'rgba(180,197,228,0.80)',
    '--c-danger': '#090C9B',
    '--c-border': '#090C9B',
    '--c-border-40': 'rgba(9,12,155,0.40)',
    '--c-border-50': 'rgba(9,12,155,0.50)',
    '--c-grad-from': '#090C9B',
    '--c-grad-to': '#3066BE',
    '--c-scan': 'rgba(48,102,190,0.10)',
    '--c-scrollbar': '#090C9B',
    '--c-focus': '#3066BE',
    '--c-grid': 'rgba(255,255,255,0.12)',
  },
  scene: {
    bgColor: '#3C3744',
    fogColor: '#3C3744',
    ambientColor: '#3066BE',
    light1Color: '#B4C5E4',
    light2Color: '#090C9B',
    lineColor: '#3066BE',
    particlePalette: ['#090C9B', '#3066BE', '#3C3744', '#B4C5E4', '#FBFFF1'],
    portraitPalette: ['#090C9B', '#3066BE', '#B4C5E4', '#FBFFF1'],
    portraitLineColor: '#3066BE',
    portraitMarkColor: '#3066BE',
    portraitMarkColorLit: '#B4C5E4',
    useAdditiveBlending: true,
    showStars: true,
  },
};

// ---------------------------------------------------------------------------
// Golden Summer Glow – deep navy + warm gold + coral
// Palette: #0D3B66 #FAF0CA #F4D35E #EE964B #F95738
// ---------------------------------------------------------------------------
const goldenSummerGlow: Theme = {
  key: 'golden-summer-glow',
  label: 'Golden Summer Glow',
  vars: {
    '--c-bg': '#0D3B66',
    '--c-bg-70': 'rgba(13,59,102,0.70)',
    '--c-bg-95': 'rgba(13,59,102,0.95)',
    '--c-text': '#FAF0CA',
    '--c-text-muted': 'rgba(250,240,202,0.65)',
    '--c-text-dim': 'rgba(250,240,202,0.40)',
    '--c-accent': '#F4D35E',
    '--c-accent-10': 'rgba(244,211,94,0.10)',
    '--c-accent-20': 'rgba(244,211,94,0.20)',
    '--c-accent-30': 'rgba(244,211,94,0.30)',
    '--c-accent-40': 'rgba(244,211,94,0.40)',
    '--c-accent-60': 'rgba(244,211,94,0.60)',
    '--c-accent-70': 'rgba(244,211,94,0.70)',
    '--c-accentH': '#EE964B',
    '--c-accentH-60': 'rgba(238,150,75,0.60)',
    '--c-accentH-70': 'rgba(238,150,75,0.70)',
    '--c-accentH-80': 'rgba(238,150,75,0.80)',
    '--c-danger': '#F95738',
    '--c-border': '#F95738',
    '--c-border-40': 'rgba(249,87,56,0.40)',
    '--c-border-50': 'rgba(249,87,56,0.50)',
    '--c-grad-from': '#F95738',
    '--c-grad-to': '#F4D35E',
    '--c-scan': 'rgba(244,211,94,0.10)',
    '--c-scrollbar': '#EE964B',
    '--c-focus': '#F4D35E',
    '--c-grid': 'rgba(255,255,255,0.12)',
  },
  scene: {
    bgColor: '#0D3B66',
    fogColor: '#0D3B66',
    ambientColor: '#F4D35E',
    light1Color: '#EE964B',
    light2Color: '#F95738',
    lineColor: '#F95738',
    particlePalette: ['#F4D35E', '#EE964B', '#F95738', '#FAF0CA', '#0D3B66'],
    portraitPalette: ['#0D3B66', '#F95738', '#EE964B', '#F4D35E'],
    portraitLineColor: '#EE964B',
    portraitMarkColor: '#F4D35E',
    portraitMarkColorLit: '#EE964B',
    useAdditiveBlending: true,
    showStars: true,
  },
};

// ---------------------------------------------------------------------------
// Black & White – white background, black accents
// ---------------------------------------------------------------------------
const blackWhite: Theme = {
  key: 'black-white',
  label: 'Black & White',
  vars: {
    '--c-bg': '#ffffff',
    '--c-bg-70': 'rgba(255,255,255,0.70)',
    '--c-bg-95': 'rgba(245,245,245,0.97)',
    '--c-text': '#000000',
    '--c-text-muted': 'rgba(0,0,0,0.55)',
    '--c-text-dim': 'rgba(0,0,0,0.35)',
    '--c-accent': '#000000',
    '--c-accent-10': 'rgba(0,0,0,0.08)',
    '--c-accent-20': 'rgba(0,0,0,0.15)',
    '--c-accent-30': 'rgba(0,0,0,0.25)',
    '--c-accent-40': 'rgba(0,0,0,0.40)',
    '--c-accent-60': 'rgba(0,0,0,0.60)',
    '--c-accent-70': 'rgba(0,0,0,0.70)',
    '--c-accentH': '#333333',
    '--c-accentH-60': 'rgba(51,51,51,0.60)',
    '--c-accentH-70': 'rgba(51,51,51,0.70)',
    '--c-accentH-80': 'rgba(51,51,51,0.80)',
    '--c-danger': '#555555',
    '--c-border': '#aaaaaa',
    '--c-border-40': 'rgba(170,170,170,0.40)',
    '--c-border-50': 'rgba(170,170,170,0.50)',
    '--c-grad-from': '#000000',
    '--c-grad-to': '#555555',
    '--c-scan': 'rgba(0,0,0,0.04)',
    '--c-scrollbar': '#aaaaaa',
    '--c-focus': '#000000',
    '--c-grid': 'rgba(0,0,0,0.12)',
  },
  scene: {
    bgColor: '#ffffff',
    fogColor: '#ffffff',
    ambientColor: '#555555',
    light1Color: '#888888',
    light2Color: '#333333',
    lineColor: '#000000',
    particlePalette: ['#000000', '#333333', '#555555', '#888888', '#aaaaaa'],
    portraitPalette: ['#000000', '#000000', '#111111', '#222222'],
    portraitLineColor: '#000000',
    portraitMarkColor: '#000000',
    portraitMarkColorLit: '#333333',
    useAdditiveBlending: false,
    showStars: false,
  },
};

// ---------------------------------------------------------------------------
// Registry – add new themes here; order determines dropdown order.
// ---------------------------------------------------------------------------
export const THEMES: Theme[] = [sunset, vibrantSunset, goldenSummerGlow, enchantedMidnightGarden, blackWhite];

export const DEFAULT_THEME_KEY: ThemeKey = 'sunset';

export function getTheme(key: ThemeKey): Theme {
  return THEMES.find((t) => t.key === key) ?? sunset;
}

/** Build a THREE.Blending value from the theme config. */
export function resolveBlending(theme: Theme): THREE.Blending {
  return theme.scene.useAdditiveBlending ? THREE.AdditiveBlending : THREE.NormalBlending;
}
