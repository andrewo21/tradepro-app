"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface Position { x: number; y: number; }

const STORAGE_KEY_PREFIX = "assistant-pos-";

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

/**
 * Makes an element freely draggable within the viewport.
 * Position persists in localStorage across page navigations.
 * Click vs drag is distinguished by movement threshold (5px).
 */
export function useDraggable(id: string, defaultPos?: Partial<Position>) {
  const storageKey = STORAGE_KEY_PREFIX + id;

  // Initial position — bottom-right by default, restored from localStorage
  const [pos, setPos] = useState<Position>(() => {
    if (typeof window === "undefined") return { x: window.innerWidth - 120, y: window.innerHeight - 200 };
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    return {
      x: defaultPos?.x ?? (window.innerWidth  - 120),
      y: defaultPos?.y ?? (window.innerHeight - 200),
    };
  });

  const [isDragging, setIsDragging] = useState(false);
  const dragStart   = useRef<{ mx: number; my: number; px: number; py: number } | null>(null);
  const moved       = useRef(false);
  const elementSize = useRef({ w: 100, h: 160 });

  // Clamp position within viewport
  const clampPos = useCallback((x: number, y: number): Position => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const { w, h } = elementSize.current;
    return {
      x: clamp(x, 0, vw - w),
      y: clamp(y, 0, vh - h),
    };
  }, []);

  // Mouse move handler
  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!dragStart.current) return;
    const dx = e.clientX - dragStart.current.mx;
    const dy = e.clientY - dragStart.current.my;
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) moved.current = true;
    if (!moved.current) return;
    setIsDragging(true);
    const next = clampPos(dragStart.current.px + dx, dragStart.current.py + dy);
    setPos(next);
  }, [clampPos]);

  // Mouse up handler
  const onMouseUp = useCallback(() => {
    dragStart.current = null;
    setIsDragging(false);
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  }, [onMouseMove]);

  // Touch move
  const onTouchMove = useCallback((e: TouchEvent) => {
    if (!dragStart.current) return;
    const t = e.touches[0];
    const dx = t.clientX - dragStart.current.mx;
    const dy = t.clientY - dragStart.current.my;
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) moved.current = true;
    if (!moved.current) return;
    e.preventDefault();
    setIsDragging(true);
    const next = clampPos(dragStart.current.px + dx, dragStart.current.py + dy);
    setPos(next);
  }, [clampPos]);

  const onTouchEnd = useCallback(() => {
    dragStart.current = null;
    setIsDragging(false);
    window.removeEventListener("touchmove", onTouchMove);
    window.removeEventListener("touchend", onTouchEnd);
  }, [onTouchMove]);

  // Start drag — mouse
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    moved.current = false;
    dragStart.current = { mx: e.clientX, my: e.clientY, px: pos.x, py: pos.y };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }, [pos, onMouseMove, onMouseUp]);

  // Start drag — touch
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    moved.current = false;
    const t = e.touches[0];
    dragStart.current = { mx: t.clientX, my: t.clientY, px: pos.x, py: pos.y };
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
  }, [pos, onTouchMove, onTouchEnd]);

  // Persist position
  useEffect(() => {
    if (!isDragging) {
      try { localStorage.setItem(storageKey, JSON.stringify(pos)); } catch { /* ignore */ }
    }
  }, [pos, isDragging, storageKey]);

  // Re-clamp on resize
  useEffect(() => {
    function onResize() { setPos(p => clampPos(p.x, p.y)); }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [clampPos]);

  return {
    pos,
    isDragging,
    wasDragged: () => moved.current,
    dragHandlers: { onMouseDown, onTouchStart },
    setElementSize: (w: number, h: number) => { elementSize.current = { w, h }; },
  };
}
