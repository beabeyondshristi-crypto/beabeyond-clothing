'use client';

import { useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';

const subscribe = () => () => {};

// Renders overlays at <body> level so fixed positioning is always relative to the viewport,
// whatever transforms or animations their parents have. Renders nothing during SSR/hydration.
export default function Portal({ children }: { children: React.ReactNode }) {
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  if (!mounted) return null;
  return createPortal(children, document.body);
}
