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

export type Colorway = 'black' | 'white';

/** Embroidery finish: metallic gold, metallic rose gold, or tonal thread
 * matching the hat (black on black, white on white). */
export type Finish = 'gold' | 'rose' | 'tonal';

export const FINISHES: { key: Finish; label: string }[] = [
  { key: 'gold', label: 'Gold' },
  { key: 'rose', label: 'Rose Gold' },
  { key: 'tonal', label: 'Tonal' },
];

/** Thread color per finish. Tonal sits one step off the base — the sheen
 * difference is what makes real tone-on-tone embroidery readable. */
export function finishTint(finish: Finish, hatColor: string): string {
  if (finish === 'gold') return '#F5C800';
  if (finish === 'rose') return '#D98E7E';
  return hatColor === '#000000' ? '#242424' : '#E9E5DC';
}

export interface HatConfig {
  id: string;
  colorway: Colorway;
  finish: Finish;
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

export interface CartItem {
  hat: HatConfig;
  quantity: number;
}

export const HAT_PRICE = 50.0;

const BASE_URL = import.meta.env.BASE_URL || '/';

const INSIDE_LABEL_DECAL: Decal = {
  id: 'inside-out-out-label',
  type: 'image',
  url: `${BASE_URL}images/inside_label.png`,
  position: [0, 20, 60],
  rotation: [0, 0, 0],
  scale: [55, 30, 55],
  normal: [0, -1, 0.3],
  spin: 0,
  zone: 'inside',
  style: 'flat',
};

/** Front text: one white-glyph asset, tinted per finish. Metallic finishes
 * keep the gold-embroidery sheen; tonal reads as thread via plain embroidery. */
function frontText(finish: Finish, hatColor: string): Decal {
  return {
    id: 'front-mega-text',
    type: 'image',
    url: `${BASE_URL}images/front_text.png`,
    color: finishTint(finish, hatColor),
    position: [0, 58, 85],
    rotation: [0, 0, 0],
    scale: [105, 50, 105],
    normal: [0, 0.15, 1],
    spin: 0,
    zone: 'front',
    style: finish === 'tonal' ? 'embroidery' : 'gold-embroidery',
  };
}

export function buildHat(colorway: Colorway, finish: Finish = 'gold'): HatConfig {
  const isBlack = colorway === 'black';
  const hatColor = isBlack ? '#000000' : '#FFFFFF';
  return {
    id: `osage-${colorway}-${finish}`,
    colorway,
    finish,
    hatColor,
    bandColor: hatColor,
    text: '',
    backText: '',
    brimText: '',
    font: 'Vinegar',
    textColor: finishTint(finish, hatColor),
    textStyle: finish === 'tonal' ? 'embroidery' : 'gold-embroidery',
    size: 'M',
    decals: [frontText(finish, hatColor), INSIDE_LABEL_DECAL],
  };
}

export const HAT_BLACK: HatConfig = buildHat('black');
export const HAT_WHITE: HatConfig = buildHat('white');

export const DEFAULT_HAT: HatConfig = HAT_BLACK;
