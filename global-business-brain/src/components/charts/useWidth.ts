'use client';

import { useEffect, useRef, useState } from 'react';

/** Measures the container width so the SVG can be drawn at real pixels (crisp text, no distortion). */
export function useWidth<T extends HTMLElement>(fallback = 300) {
  const ref = useRef<T | null>(null);
  const [width, setWidth] = useState(fallback);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setWidth(Math.max(260, Math.floor(el.getBoundingClientRect().width)));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return { ref, width };
}
