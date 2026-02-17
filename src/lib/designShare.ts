import { HatConfig } from '@/types/hat';

function toBase64Utf8(value: string): string {
  return btoa(unescape(encodeURIComponent(value)));
}

function fromBase64Utf8(value: string): string {
  return decodeURIComponent(escape(atob(value)));
}

function sanitizeForShare(config: HatConfig): HatConfig {
  return {
    ...config,
    // Blob/object URLs are local to a browser session and should not be shared.
    texture: config.texture?.startsWith('blob:') ? undefined : config.texture,
    decals: config.decals.map((decal) => ({
      ...decal,
      url: decal.type === 'image' && decal.url?.startsWith('blob:') ? undefined : decal.url,
    })),
  };
}

export function encodeDesign(config: HatConfig): string {
  const json = JSON.stringify(sanitizeForShare(config));
  return toBase64Utf8(json);
}

export function decodeDesign(encoded: string): Partial<HatConfig> | null {
  try {
    const json = fromBase64Utf8(encoded);
    return JSON.parse(json) as Partial<HatConfig>;
  } catch {
    return null;
  }
}

export function buildShareUrl(config: HatConfig): string {
  const url = new URL(window.location.href);
  url.searchParams.set('d', encodeDesign(config));
  return url.toString();
}
