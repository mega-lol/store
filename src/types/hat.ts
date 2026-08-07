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

/** Classic is the clean single mark; Heritage carries the full set —
 * dove and globe patch flanking the snapback, gold laurels and Khmer
 * blessing on the brim, panda by the inside label. */
export type Style = 'classic' | 'heritage';

export interface HatConfig {
  id: string;
  colorway: Colorway;
  finish: Finish;
  style: Style;
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
  url: `${BASE_URL}images/inside_label.webp`,
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
    url: `${BASE_URL}images/front_text.webp`,
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

// Heritage rear panels, per official_hatdesign.jpg: panda with the dove just
// left of it on the wearer-left panel, globe patch on the wearer-right panel —
// all above and clear of the snapback opening. Panda lives OUTSIDE, not inside.
const HERITAGE_DECALS: Decal[] = [
  {
    id: 'heritage-panda',
    type: 'image',
    url: `${BASE_URL}images/panda_decal.webp`,
    position: [30, 44, -84],
    rotation: [0, Math.PI, 0],
    scale: [30, 36, 45],
    normal: [0.15, 0.05, -1],
    spin: 0,
    zone: 'back',
    style: 'embroidery',
  },
  {
    id: 'heritage-dove',
    type: 'image',
    url: `${BASE_URL}images/dove_decal.webp`,
    position: [42, 51, -79],
    rotation: [0, Math.PI, 0],
    scale: [22, 22, 42],
    normal: [0.35, 0.05, -0.92],
    spin: Math.PI,
    zone: 'back',
    style: 'embroidery',
  },
  {
    id: 'heritage-patch7',
    type: 'image',
    url: `${BASE_URL}images/patch7_decal.webp`,
    position: [-42, 46, -78],
    rotation: [0, Math.PI, 0],
    scale: [28, 30, 45],
    normal: [-0.4, 0.05, -0.9],
    spin: Math.PI,
    zone: 'back',
    style: 'embroidery',
  },
];

/** The Khmer blessing on the brim — "founded for peace". Setting it is what
 * turns on the brim text and the gold laurels either side of it. */
const BRIM_BLESSING = 'បង្កើតឡើងដើម្បីសន្តិភាព';

export function buildHat(
  colorway: Colorway,
  finish: Finish = 'gold',
  style: Style = 'classic',
): HatConfig {
  const isBlack = colorway === 'black';
  const hatColor = isBlack ? '#000000' : '#FFFFFF';
  const heritage = style === 'heritage';
  return {
    id: `osage-${colorway}-${finish}-${style}`,
    colorway,
    finish,
    style,
    hatColor,
    bandColor: hatColor,
    text: '',
    backText: '',
    brimText: heritage ? BRIM_BLESSING : '',
    font: 'Vinegar',
    textColor: finishTint(finish, hatColor),
    textStyle: finish === 'tonal' ? 'embroidery' : 'gold-embroidery',
    size: 'M',
    decals: [
      frontText(finish, hatColor),
      INSIDE_LABEL_DECAL,
      ...(heritage ? HERITAGE_DECALS : []),
    ],
  };
}

export const HAT_BLACK: HatConfig = buildHat('black');
export const HAT_WHITE: HatConfig = buildHat('white');

export const DEFAULT_HAT: HatConfig = HAT_BLACK;
