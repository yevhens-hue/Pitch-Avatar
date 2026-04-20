'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SelectionOverlayProps {
  element: HTMLElement;
  type: 'hover' | 'select';
}

export default function SelectionOverlay({ element, type }: SelectionOverlayProps) {
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const updateRect = () => {
      setRect(element.getBoundingClientRect());
    };

    updateRect();
    window.addEventListener('scroll', updateRect);
    window.addEventListener('resize', updateRect);

    return () => {
      window.removeEventListener('scroll', updateRect);
      window.removeEventListener('resize', updateRect);
    };
  }, [element]);

  if (!rect) return null;

  const color = type === 'hover' ? 'rgba(99, 102, 241, 0.4)' : 'rgba(99, 102, 241, 1)';
  const borderWidth = type === 'hover' ? 2 : 3;

  return (
    <motion.div
      initial={false}
      animate={{
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      style={{
        position: 'fixed',
        border: `${borderWidth}px solid ${color}`,
        borderRadius: '4px',
        pointerEvents: 'none',
        zIndex: 10000,
        boxShadow: type === 'select' ? '0 0 0 9999px rgba(0, 0, 0, 0.3)' : 'none',
      }}
    >
      {type === 'select' && (
        <div style={{
          position: 'absolute',
          top: -30,
          left: 0,
          background: color,
          color: 'white',
          padding: '2px 8px',
          borderRadius: '4px 4px 0 0',
          fontSize: '12px',
          fontWeight: 'bold',
          whiteSpace: 'nowrap'
        }}>
          {element.tagName.toLowerCase()}
          {element.id && `#${element.id}`}
          {element.dataset.tour && ` [data-tour="${element.dataset.tour}"]`}
        </div>
      )}
    </motion.div>
  );
}
