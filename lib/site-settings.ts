// Site-wide content editable from Admin → Content → Site Settings.
// Stored as one row per key in `site_settings` (value is JSON); these defaults fill any gaps.

export interface SiteSettings {
  announcement: { enabled: boolean; items: string[] };
  services: { title: string; text: string }[];
  footer: { tagline: string; instagram: string; tiktok: string; pinterest: string };
  contact: { email: string; phone: string };
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  announcement: {
    enabled: true,
    items: ['Free shipping over ₹200', 'New drops every week', 'Easy 14-day returns', 'Crafted in small batches', 'Members get early access'],
  },
  services: [
    { title: 'Free Shipping', text: 'On all orders over ₹200' },
    { title: 'Easy Returns', text: '14 days, no questions asked' },
    { title: 'Secure Checkout', text: 'Encrypted payments' },
    { title: 'Members Club', text: 'Early access to new drops' },
  ],
  footer: {
    tagline: 'Minimalism, structure, and timeless design. Made in small batches, built to last.',
    instagram: 'https://instagram.com',
    tiktok: 'https://tiktok.com',
    pinterest: 'https://pinterest.com',
  },
  contact: { email: 'hello@beabeyond.com', phone: '+91 98765 43210' },
};

export type SiteSettingKey = keyof SiteSettings;
export const SITE_SETTING_KEYS = Object.keys(DEFAULT_SITE_SETTINGS) as SiteSettingKey[];

export function mergeSiteSettings(rows: { key: string; value: unknown }[] | null | undefined): SiteSettings {
  const merged: SiteSettings = structuredClone(DEFAULT_SITE_SETTINGS);
  for (const row of rows || []) {
    if (!(row.key in merged)) continue;
    const value = typeof row.value === 'string' ? JSON.parse(row.value) : row.value;
    const key = row.key as SiteSettingKey;
    const base = merged[key];
    (merged as unknown as Record<string, unknown>)[key] = Array.isArray(base) ? value : { ...base, ...(value as object) };
  }
  return merged;
}
