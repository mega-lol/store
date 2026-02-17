export type DecalType = 'image' | 'text';

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
  targetMeshName?: string;
  targetParentName?: string;
}

export interface HatConfig {
  id: string;
  hatColor: string;
  bandColor?: string;
  texture?: string;
  text: string;
  backText?: string;
  font: string;
  textColor: string;
  size: 'S' | 'M' | 'L' | 'XL';
  countryCode?: string;
  countryName?: string;
  flagCode?: string;
  decals: Decal[];
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
  '#FFFFFF', '#F0F0F0', '#FFD700', '#CC0000',
  '#C0C0C0', '#000000',
];

export const DEFAULT_HAT: HatConfig = {
  id: '',
  hatColor: '#FFFFFF',
  bandColor: '#FFFFFF',
  text: 'YOUR BRAND',
  backText: '',
  font: 'Vinegar',
  textColor: '#000000',
  size: 'M',
  flagCode: undefined,
  decals: [],
};

export const COUNTRY_HATS: CountryHat[] = [
  {
    id: 'india',
    hatColor: '#FF9933',
    bandColor: '#138808',
    text: 'INDIA\nPRIDE',
    backText: 'INDIA',
    font: 'Vinegar',
    textColor: '#000080',
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
    text: 'IRAN\nPRIDE',
    backText: 'IRAN',
    font: 'Vinegar',
    textColor: '#ffffff',
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
    text: 'CAMBODIA\nPRIDE',
    backText: 'CAMBODIA',
    font: 'Vinegar',
    textColor: '#ffffff',
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
    text: 'UKRAINE\nPRIDE',
    backText: 'UKRAINE',
    font: 'Vinegar',
    textColor: '#FFD700',
    size: 'M',
    countryCode: 'UA',
    countryName: 'Ukraine',
    flagCode: 'UA',
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

  if (!supportedValuesOf) return COUNTRY_CODE_FALLBACK;

  const displayNames = new Intl.DisplayNames(['en'], { type: 'region' });
  const extras = ['XK', 'TW', 'PS', 'VA'];
  const codeSet = new Set<string>();

  for (const code of supportedValuesOf('region')) {
    if (/^[A-Z]{2}$/.test(code) && code !== 'EU') {
      codeSet.add(code);
    }
  }
  for (const code of extras) codeSet.add(code);

  return Array.from(codeSet)
    .map((code) => ({ code, name: displayNames.of(code) || code }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export const COUNTRY_CODES = buildCountryCodes();
