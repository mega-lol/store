export interface HatConfig {
  id: string;
  hatColor: string;
  text: string;
  font: string;
  textColor: string;
  size: 'S' | 'M' | 'L' | 'XL';
}

export interface CartItem {
  hat: HatConfig;
  quantity: number;
}

export const FONTS = [
  { name: 'Classic Block', value: 'Bebas Neue' },
  { name: 'Clean Sans', value: 'Inter' },
  { name: 'Bold Serif', value: 'Georgia' },
  { name: 'Sporty', value: 'Impact' },
] as const;

export const PRESET_HAT_COLORS = [
  '#CC0000', '#1a1a6e', '#1a472a', '#222222',
  '#F5F5DC', '#8B4513', '#FFD700', '#FF6B00',
];

export const PRESET_TEXT_COLORS = [
  '#FFFFFF', '#FFD700', '#CC0000', '#000000',
  '#C0C0C0', '#1a472a', '#FF6B00', '#1a1a6e',
];

export const DEFAULT_HAT: HatConfig = {
  id: '',
  hatColor: '#CC0000',
  text: 'MAKE AMERICA\nGREAT AGAIN',
  font: 'Bebas Neue',
  textColor: '#FFFFFF',
  size: 'M',
};
