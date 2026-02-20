export type DecalType = 'image' | 'text';

export type PlacementZone =
  | 'front'
  | 'back'
  | 'left'
  | 'right'
  | 'brim-top'
  | 'brim-under'
  | 'rear-seam'
  | 'inside';

export interface Decal {
  id: string;
  type: DecalType;
  url?: string;
  text?: string;
  color?: string;
  font?: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  normal?: [number, number, number];
  spin?: number;
  zone?: PlacementZone;
  style?: TextStyle;
  targetMeshName?: string;
  targetParentName?: string;
}

export type TextStyle = 'flat' | 'embroidery' | 'gold-embroidery' | 'puff-3d';

export interface HatConfig {
  id: string;
  hatColor: string;
  bandColor?: string;
  texture?: string;
  text: string;
  backText?: string;
  brimText?: string;
  font: string;
  textColor: string;
  textStyle: TextStyle;
  size: 'S' | 'M' | 'L' | 'XL';
  countryCode?: string;
  countryName?: string;
  flagCode?: string;
  decals: Decal[];
}

export interface DesignPreset {
  id: string;
  name: string;
  thumbnail?: string;
  config: HatConfig;
}

export interface CountryHat extends HatConfig {
  countryCode: string;
  countryName: string;
}

export interface CartItem {
  hat: HatConfig;
  quantity: number;
}

export const FONTS = [
  { name: 'Vinegar', value: 'Vinegar' },
  { name: 'Times New Roman', value: 'Times New Roman' },
  { name: 'Classic Block', value: 'Bebas Neue' },
  { name: 'Clean Sans', value: 'Inter' },
  { name: 'Bold Serif', value: 'Georgia' },
  { name: 'Oswald', value: 'Oswald' },
  { name: 'Merriweather', value: 'Merriweather' },
] as const;

export const PRESET_HAT_COLORS = [
  '#CC0000', '#000000', '#1a1a6e', '#FFFFFF',
  '#1a472a', '#F5F5DC', '#FF6600', '#333333',
];

export const PRESET_TEXT_COLORS = [
  '#FFD700', '#FFFFFF', '#F0F0F0', '#CC0000',
  '#C0C0C0', '#000000',
];

export const TEXT_STYLES: { value: TextStyle; label: string }[] = [
  { value: 'flat', label: 'Flat Print' },
  { value: 'embroidery', label: 'Embroidery' },
  { value: 'gold-embroidery', label: 'Gold Embroidery' },
  { value: 'puff-3d', label: '3D Puff' },
];

export const PLACEMENT_ZONES: { value: PlacementZone; label: string }[] = [
  { value: 'front', label: 'Front Center' },
  { value: 'back', label: 'Back Center' },
  { value: 'left', label: 'Left Side' },
  { value: 'right', label: 'Right Side' },
  { value: 'brim-top', label: 'Brim Top' },
  { value: 'brim-under', label: 'Under Brim' },
  { value: 'rear-seam', label: 'Rear Seam' },
  { value: 'inside', label: 'Inside Band' },
];

const BASE_URL = import.meta.env.BASE_URL || '/';

export const DEFAULT_DECALS: Decal[] = [
  // "MAKE EARTH GREAT AGAIN" front text – gold embroidery on front of mainCap
  {
    id: 'default-front-text',
    type: 'image',
    url: `${BASE_URL}images/mega_front_text.png`,
    position: [0, 58, 85],
    rotation: [0, 0, 0],
    scale: [105, 50, 105],
    normal: [0, 0.15, 1],
    spin: 0,
    zone: 'front',
    style: 'gold-embroidery',
  },
  // Dove – back LEFT panel, just above snapback opening
  {
    id: 'default-dove',
    type: 'image',
    url: `${BASE_URL}images/dove_decal.png`,
    position: [-26, 28, -88],
    rotation: [0, Math.PI, 0],
    scale: [34, 34, 50],
    normal: [0, 0, -1],
    spin: Math.PI,
    zone: 'back',
    style: 'embroidery',
  },
  // Earth/globe "7" patch – back RIGHT panel, same height/size as dove
  {
    id: 'default-patch7',
    type: 'image',
    url: `${BASE_URL}images/patch7_decal.png`,
    position: [26, 28, -88],
    rotation: [0, Math.PI, 0],
    scale: [34, 34, 50],
    normal: [0, 0, -1],
    spin: Math.PI,
    zone: 'back',
    style: 'embroidery',
  },
  // Panda on inside label – "Out, Out, ..." (inside band / woven tag area)
  {
    id: 'default-inside-label',
    type: 'image',
    url: `${BASE_URL}images/inside_label.png`,
    position: [0, 20, 60],
    rotation: [0, 0, 0],
    scale: [55, 30, 55],
    normal: [0, -1, 0.3],
    spin: 0,
    zone: 'inside',
    style: 'flat',
  },
  // Panda – inside hat near label
  {
    id: 'default-panda',
    type: 'image',
    url: `${BASE_URL}images/panda_decal.png`,
    position: [-30, 18, 30],
    rotation: [0, 0, 0],
    scale: [22, 22, 40],
    normal: [0, -1, 0.2],
    spin: 0,
    zone: 'inside',
    style: 'flat',
  },
];

export const DEFAULT_HAT: HatConfig = {
  id: '',
  hatColor: '#FFFFFF',
  bandColor: '#D4A017',
  text: '',
  backText: '',
  brimText: 'បង្កើតឡើងដើម្បីសន្តិភាព',
  font: 'Vinegar',
  textColor: '#FFD700',
  textStyle: 'gold-embroidery',
  size: 'M',
  flagCode: undefined,
  decals: [...DEFAULT_DECALS],
};

export const BUILT_IN_PRESETS: DesignPreset[] = [
  {
    id: 'mega-gold',
    name: 'MEGA Gold',
    config: {
      id: 'mega-gold',
      hatColor: '#FFFFFF',
      bandColor: '#D4A017',
      text: 'MAKE EARTH\nGREAT AGAIN',
      backText: '',
      brimText: 'បង្កើតឡើងដើម្បីសន្តិភាព',
      font: 'Vinegar',
      textColor: '#FFD700',
      textStyle: 'gold-embroidery',
      size: 'M',
      decals: [...DEFAULT_DECALS],
    },
  },
  {
    id: 'mega-classic-black',
    name: 'MEGA Classic Black',
    config: {
      id: 'mega-classic-black',
      hatColor: '#000000',
      bandColor: '#000000',
      text: 'MAKE EARTH\nGREAT AGAIN',
      backText: '',
      font: 'Vinegar',
      textColor: '#FFD700',
      textStyle: 'gold-embroidery',
      size: 'M',
      decals: [...DEFAULT_DECALS],
    },
  },
  {
    id: 'mega-red',
    name: 'MEGA Red',
    config: {
      id: 'mega-red',
      hatColor: '#CC0000',
      bandColor: '#CC0000',
      text: 'MAKE EARTH\nGREAT AGAIN',
      backText: '',
      font: 'Vinegar',
      textColor: '#FFD700',
      textStyle: 'gold-embroidery',
      size: 'M',
      decals: [...DEFAULT_DECALS],
    },
  },
  {
    id: 'peace-dove',
    name: 'Peace Dove',
    config: {
      id: 'peace-dove',
      hatColor: '#FFFFFF',
      bandColor: '#FFFFFF',
      text: 'PEACE',
      backText: '',
      font: 'Vinegar',
      textColor: '#FFD700',
      textStyle: 'gold-embroidery',
      size: 'M',
      decals: [],
    },
  },
  {
    id: 'pope',
    name: 'POPEHAT',
    config: {
      id: 'pope',
      hatColor: '#FFFFFF',
      bandColor: '#FFD700',
      text: 'MAKE EARTH\nGREAT AGAIN',
      backText: 'CAMBODIA',
      brimText: 'បង្កើតឡើងដើម្បីសន្តិភាព',
      font: 'Vinegar',
      textColor: '#FFD700',
      textStyle: 'gold-embroidery',
      size: 'M',
      flagCode: 'VA',
      decals: [],
    },
  },
  {
    id: 'light-mega',
    name: 'Light MEGA ($80)',
    config: {
      id: 'light-mega',
      hatColor: '#FFFFFF',
      bandColor: '#FFFFFF',
      text: 'MAKE EARTH\nGREAT AGAIN',
      backText: 'MAKE EARTH\nGREAT AGAIN',
      font: 'Vinegar',
      textColor: '#FFFFFF',
      textStyle: 'flat',
      size: 'M',
      decals: [],
    },
  },
  {
    id: 'dark-mega',
    name: 'Dark MEGA ($80)',
    config: {
      id: 'dark-mega',
      hatColor: '#000000',
      bandColor: '#000000',
      text: 'MAKE EARTH\nGREAT AGAIN',
      backText: 'MAKE EARTH\nGREAT AGAIN',
      font: 'Vinegar',
      textColor: '#000000',
      textStyle: 'flat',
      size: 'M',
      decals: [],
    },
  },
];

export const COUNTRY_HATS: CountryHat[] = [
  {
    id: 'india',
    hatColor: '#FF9933',
    bandColor: '#138808',
    text: 'MAKE INDIA\nGREAT AGAIN',
    backText: 'INDIA',
    font: 'Vinegar',
    textColor: '#000080',
    textStyle: 'embroidery',
    size: 'M',
    countryCode: 'IN',
    countryName: 'India',
    flagCode: 'IN',
    decals: [],
  },
  {
    id: 'iran',
    hatColor: '#239f40',
    bandColor: '#da0000',
    text: 'MAKE IRAN\nGREAT AGAIN',
    backText: 'IRAN',
    font: 'Vinegar',
    textColor: '#ffffff',
    textStyle: 'embroidery',
    size: 'M',
    countryCode: 'IR',
    countryName: 'Iran',
    flagCode: 'IR',
    decals: [],
  },
  {
    id: 'cambodia',
    hatColor: '#032EA1',
    bandColor: '#E00025',
    text: 'MAKE CAMBODIA\nGREAT AGAIN',
    backText: 'CAMBODIA',
    font: 'Vinegar',
    textColor: '#ffffff',
    textStyle: 'embroidery',
    size: 'M',
    countryCode: 'KH',
    countryName: 'Cambodia',
    flagCode: 'KH',
    decals: [],
  },
  {
    id: 'ukraine',
    hatColor: '#0057B7',
    bandColor: '#FFD700',
    text: 'MAKE UKRAINE\nGREAT AGAIN',
    backText: 'UKRAINE',
    font: 'Vinegar',
    textColor: '#FFD700',
    textStyle: 'gold-embroidery',
    size: 'M',
    countryCode: 'UA',
    countryName: 'Ukraine',
    flagCode: 'UA',
    decals: [],
  },
  {
    id: 'vatican',
    hatColor: '#FFFFFF',
    bandColor: '#FFD700',
    text: 'MAKE EARTH\nGREAT AGAIN',
    backText: 'POPEHAT',
    font: 'Vinegar',
    textColor: '#FFD700',
    textStyle: 'gold-embroidery',
    size: 'M',
    countryCode: 'VA',
    countryName: 'Vatican City',
    flagCode: 'VA',
    decals: [],
  },
];

const COUNTRY_CODE_FALLBACK = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'MX', name: 'Mexico' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Germany' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'CN', name: 'China' },
  { code: 'JP', name: 'Japan' },
  { code: 'KR', name: 'South Korea' },
  { code: 'IN', name: 'India' },
  { code: 'BR', name: 'Brazil' },
  { code: 'RU', name: 'Russia' },
  { code: 'AU', name: 'Australia' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'EG', name: 'Egypt' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'IL', name: 'Israel' },
  { code: 'TR', name: 'Turkey' },
  { code: 'KH', name: 'Cambodia' },
  { code: 'UA', name: 'Ukraine' },
  { code: 'IR', name: 'Iran' },
];

function buildCountryCodes(): Array<{ code: string; name: string }> {
  if (typeof Intl === 'undefined') return COUNTRY_CODE_FALLBACK;

  const supportedValuesOf = (Intl as unknown as {
    supportedValuesOf?: (type: string) => string[];
  }).supportedValuesOf;

  try {
    const displayNames = new Intl.DisplayNames(['en'], { type: 'region' });
    const codeSet = new Set<string>();
    const extras = ['XK', 'TW', 'PS', 'VA'];

    // 'region' is not supported in some runtimes; wrap it safely.
    if (supportedValuesOf) {
      try {
        for (const code of supportedValuesOf('region')) {
          if (/^[A-Z]{2}$/.test(code) && code !== 'EU') {
            codeSet.add(code);
          }
        }
      } catch {
        // Fallback below.
      }
    }

    // Brute-force 2-letter region codes to cover full flag list where available.
    if (codeSet.size === 0) {
      for (let a = 65; a <= 90; a += 1) {
        for (let b = 65; b <= 90; b += 1) {
          const code = String.fromCharCode(a, b);
          const name = displayNames.of(code);
          if (!name || name === code) continue;
          if (/^Unknown Region/i.test(name)) continue;
          if (code === 'EU') continue;
          codeSet.add(code);
        }
      }
    }

    for (const code of extras) codeSet.add(code);

    return Array.from(codeSet)
      .map((code) => ({ code, name: displayNames.of(code) || code }))
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch {
    return COUNTRY_CODE_FALLBACK;
  }
}

export const COUNTRY_CODES = buildCountryCodes();
