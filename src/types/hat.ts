export type DecalType = 'image' | 'text';

export interface Decal {
  id: string;
  type: DecalType;
  url?: string; // For image decals
  text?: string; // For text decals
  color?: string; // For text decals
  font?: string; // For text decals
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}

export interface HatConfig {
  id: string;
  hatColor: string;
  texture?: string; // URL for the base hat texture
  text: string;
  backText?: string;
  font: string;
  textColor: string;
  size: 'S' | 'M' | 'L' | 'XL';
  countryCode?: string;
  countryName?: string;
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
  { name: 'Times New Roman', value: 'Times New Roman' },
  { name: 'Classic Block', value: 'Bebas Neue' },
  { name: 'Clean Sans', value: 'Inter' },
  { name: 'Bold Serif', value: 'Georgia' },
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
  text: 'MAKE EARTH\nGREAT AGAIN',
  backText: '',
  font: 'Times New Roman',
  textColor: '#000000',
  size: 'M',
  decals: [],
};

export const COUNTRY_MG_HATS: CountryHat[] = [
  {
    id: 'mega-earth',
    hatColor: '#CC0000',
    text: 'MAKE EARTH\nGREAT AGAIN',
    backText: 'MEGA',
    font: 'Times New Roman',
    textColor: '#FFFFFF',
    size: 'M',
    countryCode: 'EARTH',
    countryName: 'Earth',
    decals: []
  },
  {
    id: 'mg-iran',
    hatColor: '#000000',
    text: 'MAKE IRAN\nGREAT AGAIN',
    backText: '',
    font: 'Times New Roman',
    textColor: '#FFFFFF',
    size: 'M',
    countryCode: 'IR',
    countryName: 'Iran',
    decals: []
  },
  {
    id: 'mg-cambodia',
    hatColor: '#000000',
    text: 'MAKE CAMBODIA\nGREAT AGAIN',
    backText: '',
    font: 'Times New Roman',
    textColor: '#FFFFFF',
    size: 'M',
    countryCode: 'KH',
    countryName: 'Cambodia',
    decals: []
  },
  {
    id: 'mg-ukraine',
    hatColor: '#1a1a6e',
    text: 'MAKE UKRAINE\nGREAT AGAIN',
    backText: '',
    font: 'Times New Roman',
    textColor: '#FFD700',
    size: 'M',
    countryCode: 'UA',
    countryName: 'Ukraine',
    decals: []
  },
];

export const COUNTRY_CODES = [
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
