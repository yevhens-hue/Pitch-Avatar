'use client';

import React from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface SelectionToolbarProps {
  element: HTMLElement;
  onClose: () => void;
  onUpdate: (el: HTMLElement) => void;
}

export default function SelectionToolbar({ element, onClose, onUpdate }: SelectionToolbarProps) {
  const rect = element.getBoundingClientRect();

  const handleExpand = () => {
    if (element.parentElement && element.parentElement !== document.body) {
      onUpdate(element.parentElement);
    }
  };

  const handleShrink = () => {
    if (element.firstElementChild instanceof HTMLElement) {
      onUpdate(element.firstElementChild);
    }
  };

  const handlePrev = () => {
    if (element.previousElementSibling instanceof HTMLElement) {
      onUpdate(element.previousElementSibling);
    }
  };

  const handleNext = () => {
    if (element.nextElementSibling instanceof HTMLElement) {
      onUpdate(element.nextElementSibling);
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: rect.top - 45,
        left: rect.left,
        display: 'flex',
        gap: '4px',
        background: 'white',
        padding: '4px',
        borderRadius: '6px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        pointerEvents: 'auto',
        zIndex: 10001,
      }}
    >
      <ToolbarButton onClick={handleExpand} title="Expand selection (Parent)"><ChevronUp size={16} /></ToolbarButton>
      <ToolbarButton onClick={handleShrink} title="Shrink selection (First Child)"><ChevronDown size={16} /></ToolbarButton>
      <div style={{ width: '1px', background: '#eee', margin: '0 4px' }} />
      <ToolbarButton onClick={handlePrev} title="Previous sibling"><ChevronLeft size={16} /></ToolbarButton>
      <ToolbarButton onClick={handleNext} title="Next sibling"><ChevronRight size={16} /></ToolbarButton>
      <div style={{ width: '1px', background: '#eee', margin: '0 4px' }} />
      <ToolbarButton onClick={onClose} title="Cancel selection" color="#ef4444"><X size={16} /></ToolbarButton>
    </div>
  );
}

function ToolbarButton({ children, onClick, title, color = '#6366f1' }: { children: React.ReactNode, onClick: () => void, title: string, color?: string }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: '28px',
        height: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        borderRadius: '4px',
        color: '#475569',
        transition: 'all 0.2s',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = '#f1f5f9')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      {React.cloneElement(children as any, { color })}
    </button>
  );
}
