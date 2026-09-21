import { useRef, useCallback } from 'react';

interface UseLongPressOptions {
  onLongPress: () => void;
  onClick?: () => void;
  delay?: number;
}

export function useLongPress({ onLongPress, onClick, delay = 460 }: UseLongPressOptions) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startCoordsRef = useRef<{ x: number; y: number } | null>(null);
  const isLongPressActiveRef = useRef(false);

  const start = useCallback(
    (clientX: number, clientY: number) => {
      isLongPressActiveRef.current = false;
      startCoordsRef.current = { x: clientX, y: clientY };

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        isLongPressActiveRef.current = true;
        try {
          if (navigator.vibrate) {
            navigator.vibrate(40);
          }
        } catch (_) {}
        onLongPress();
      }, delay);
    },
    [onLongPress, delay]
  );

  const move = useCallback((clientX: number, clientY: number) => {
    if (!startCoordsRef.current) return;
    const deltaX = Math.abs(clientX - startCoordsRef.current.x);
    const deltaY = Math.abs(clientY - startCoordsRef.current.y);
    // If movement exceeds 10px, the user is scrolling or dragging, so cancel long press
    if (deltaX > 10 || deltaY > 10) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }
  }, []);

  const end = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    startCoordsRef.current = null;
  }, []);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (isLongPressActiveRef.current) {
        e.preventDefault();
        e.stopPropagation();
        isLongPressActiveRef.current = false;
        return;
      }
      if (onClick) {
        onClick();
      }
    },
    [onClick]
  );

  return {
    onTouchStart: (e: React.TouchEvent) => {
      const touch = e.touches[0];
      if (touch) start(touch.clientX, touch.clientY);
    },
    onTouchMove: (e: React.TouchEvent) => {
      const touch = e.touches[0];
      if (touch) move(touch.clientX, touch.clientY);
    },
    onTouchEnd: end,
    onTouchCancel: end,
    onMouseDown: (e: React.MouseEvent) => {
      // Primary mouse button only
      if (e.button === 0) {
        start(e.clientX, e.clientY);
      }
    },
    onMouseMove: (e: React.MouseEvent) => {
      move(e.clientX, e.clientY);
    },
    onMouseUp: end,
    onMouseLeave: end,
    onClick: handleClick,
  };
}
