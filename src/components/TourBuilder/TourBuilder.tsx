'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useUIStore } from '@/lib/store';
import SelectionOverlay from '@/components/TourBuilder/SelectionOverlay';
import SelectionToolbar from '@/components/TourBuilder/SelectionToolbar';
import SettingsWidget from '@/components/TourBuilder/SettingsWidget';

export default function TourBuilder() {
  const { isBuilderModeActive } = useUIStore();
  const [hoveredElement, setHoveredElement] = useState<HTMLElement | null>(null);
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);
  const builderRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isBuilderModeActive || selectedElement) return;

    // We need to hide the overlay temporarily to find what's under it
    const elements = document.elementsFromPoint(e.clientX, e.clientY);
    const target = elements.find(el => 
      el !== builderRef.current && 
      !builderRef.current?.contains(el) &&
      el instanceof HTMLElement
    ) as HTMLElement | undefined;

    if (target && target !== document.body && target !== document.documentElement) {
      setHoveredElement(target);
    } else {
      setHoveredElement(null);
    }
  }, [isBuilderModeActive, selectedElement]);

  const handleClick = useCallback((e: MouseEvent) => {
    if (!isBuilderModeActive) return;

    if (hoveredElement) {
      e.preventDefault();
      e.stopPropagation();
      setSelectedElement(hoveredElement);
      setHoveredElement(null);
    }
  }, [isBuilderModeActive, hoveredElement]);

  useEffect(() => {
    if (isBuilderModeActive) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('click', handleClick, true);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick, true);
      setHoveredElement(null);
      setSelectedElement(null);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick, true);
    };
  }, [isBuilderModeActive, handleMouseMove, handleClick]);

  if (!isBuilderModeActive) return null;

  return (
    <div ref={builderRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 9999 }}>
      {hoveredElement && (
        <SelectionOverlay element={hoveredElement} type="hover" />
      )}
      {selectedElement && (
        <>
          <SelectionOverlay element={selectedElement} type="select" />
          <SelectionToolbar 
            element={selectedElement} 
            onClose={() => setSelectedElement(null)} 
            onUpdate={setSelectedElement}
          />
          <SettingsWidget 
            element={selectedElement} 
            onClose={() => setSelectedElement(null)} 
          />
        </>
      )}
    </div>
  );
}
