'use client';

import { useRef, useState, type PointerEvent, type ReactNode } from 'react';

interface SwipeActionProps {
  children: ReactNode;
  onAction: () => void;
  actionLabel: string;
  disabled?: boolean;
}

const ACTION_WIDTH = 92;

export function SwipeAction({ children, onAction, actionLabel, disabled = false }: SwipeActionProps) {
  const [revealed, setRevealed] = useState(false);
  const [offset, setOffset] = useState(0);
  const startXRef = useRef(0);
  const isDraggingRef = useRef(false);

  const close = () => {
    setRevealed(false);
    setOffset(0);
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    startXRef.current = event.clientX;
    isDraggingRef.current = true;
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (disabled || !isDraggingRef.current) return;
    const delta = event.clientX - startXRef.current;
    if (delta >= 0) {
      setOffset(0);
      return;
    }
    setOffset(Math.max(-ACTION_WIDTH, delta));
  };

  const onPointerUp = () => {
    if (disabled) return;
    isDraggingRef.current = false;
    if (offset <= -ACTION_WIDTH / 2) {
      setRevealed(true);
      setOffset(-ACTION_WIDTH);
      return;
    }
    close();
  };

  const translateX = revealed ? -ACTION_WIDTH : offset;

  return (
    <div className="relative overflow-hidden">
      <button
        type="button"
        onClick={onAction}
        className="absolute right-0 top-0 bottom-0 w-[92px] border border-danger bg-danger text-background font-sans text-xs uppercase tracking-wide touch-manipulation"
        aria-label={actionLabel}
      >
        {actionLabel}
      </button>

      <div
        style={{ transform: `translateX(${translateX}px)` }}
        className="transition-transform duration-200"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={close}
        onClick={() => {
          if (revealed) close();
        }}
      >
        {children}
      </div>
    </div>
  );
}
