// Swatch fills for the colour names used in the catalogue; unknown names fall back to grey
const SWATCHES: Record<string, string> = {
  black: '#000000', white: '#ffffff', ivory: '#f6f1e7', cream: '#efe8d8', natural: '#e8dcc4',
  grey: '#9ca3af', gray: '#9ca3af', charcoal: '#36454f', slate: '#5f6b7a', navy: '#1f2a44', tan: '#c19a6b',
};

export function swatchColor(name: string): string {
  return SWATCHES[name.toLowerCase()] ?? '#d1d5db';
}
