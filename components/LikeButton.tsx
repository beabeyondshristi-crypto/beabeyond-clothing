'use client';

import { useEffect, useState } from 'react';
import { trackEvent } from '@/lib/track';

const KEY = 'beabeyond_likes';

function readLikes(): string[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}

export default function LikeButton({ productId, className = '' }: { productId: string; className?: string }) {
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage is only readable after mount
    setLiked(readLikes().includes(productId));
  }, [productId]);

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const likes = readLikes();
    const next = !liked;
    try {
      localStorage.setItem(KEY, JSON.stringify(next ? [...likes, productId] : likes.filter((id) => id !== productId)));
    } catch {}
    setLiked(next);
    trackEvent(productId, next ? 'like' : 'unlike');
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={liked}
      aria-label={liked ? 'Remove from favourites' : 'Add to favourites'}
      className={`flex items-center justify-center transition-transform active:scale-90 ${className}`}
    >
      <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
        <path
          d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2Z"
          fill={liked ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
