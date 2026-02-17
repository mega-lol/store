const LOCAL_FONT_FAMILIES = new Set([
  'Vinegar',
  'Times New Roman',
  'Georgia',
  'Inter',
  'Bebas Neue',
]);

const loadedGoogleFonts = new Set<string>();

export function toFontStack(fontFamily?: string): string {
  const family = (fontFamily || 'Vinegar').trim() || 'Vinegar';
  const escaped = family.replace(/"/g, '\\"');
  return `"${escaped}", "Vinegar", "Times New Roman", serif`;
}

export function applySiteFont(fontFamily?: string): void {
  if (typeof document === 'undefined') return;
  document.documentElement.style.setProperty('--site-font-family', toFontStack(fontFamily));
}

function buildGoogleFontHref(fontFamily: string): string {
  const family = fontFamily.trim().replace(/\s+/g, '+');
  return `https://fonts.googleapis.com/css2?family=${family}:wght@400;700;900&display=swap`;
}

export function isLocalFontFamily(fontFamily: string): boolean {
  return LOCAL_FONT_FAMILIES.has(fontFamily.trim());
}

export async function ensureFontLoaded(fontFamily: string): Promise<void> {
  const family = fontFamily.trim();
  if (!family || isLocalFontFamily(family) || typeof document === 'undefined') return;
  if (loadedGoogleFonts.has(family)) return;

  const id = `gf-${family.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  if (!document.getElementById(id)) {
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = buildGoogleFontHref(family);
    document.head.appendChild(link);
  }

  try {
    await document.fonts.load(`900 16px "${family}"`);
  } catch {
    // No-op: if the font fails, browser fallback stack is used.
  }

  loadedGoogleFonts.add(family);
}
