// Fire-and-forget storefront events for Admin → Analytics. Never blocks the UI.
export type TrackEvent = 'view' | 'like' | 'unlike' | 'add_to_cart';

export function trackEvent(productId: string, type: TrackEvent) {
  try {
    const body = JSON.stringify({ product_id: productId, type });
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      navigator.sendBeacon('/api/track', new Blob([body], { type: 'application/json' }));
    } else {
      fetch('/api/track', { method: 'POST', body, headers: { 'Content-Type': 'application/json' }, keepalive: true }).catch(() => {});
    }
  } catch {}
}

// Count a product view once per browser session
export function trackViewOnce(productId: string) {
  try {
    const key = 'beabeyond_viewed';
    const seen: string[] = JSON.parse(sessionStorage.getItem(key) || '[]');
    if (seen.includes(productId)) return;
    sessionStorage.setItem(key, JSON.stringify([...seen, productId]));
  } catch {}
  trackEvent(productId, 'view');
}
