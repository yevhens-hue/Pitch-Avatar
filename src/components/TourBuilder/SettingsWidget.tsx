'use client';

import React, { useState } from 'react';
import { X, Code, Palette, Settings } from 'lucide-react';

interface SettingsWidgetProps {
  element: HTMLElement;
  onClose: () => void;
}

export default function SettingsWidget({ element, onClose }: SettingsWidgetProps) {
  const [activeTab, setActiveTab] = useState<'selection' | 'design'>('selection');

  const getSelector = (el: HTMLElement) => {
    if (el.dataset.tour) return `[data-tour="${el.dataset.tour}"]`;
    if (el.id) return `#${el.id}`;
    let selector = el.tagName.toLowerCase();
    if (el.className && typeof el.className === 'string') {
      selector += '.' + el.className.split(' ').join('.');
    }
    return selector;
  };

  const getParentChain = (el: HTMLElement) => {
    const chain = [];
    let curr: HTMLElement | null = el.parentElement;
    while (curr && curr !== document.body) {
      chain.unshift(curr.tagName.toLowerCase() + (curr.id ? `#${curr.id}` : ''));
      curr = curr.parentElement;
    }
    return chain.join(' > ');
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: '100px',
        right: '20px',
        width: '320px',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        pointerEvents: 'auto',
        zIndex: 10002,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <div style={{ padding: '16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Element Settings</h3>
        <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b' }}>
          <X size={18} />
        </button>
      </div>

      <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0' }}>
        <Tab active={activeTab === 'selection'} onClick={() => setActiveTab('selection')} icon={<Code size={16} />}>Selection</Tab>
        <Tab active={activeTab === 'design'} onClick={() => setActiveTab('design')} icon={<Palette size={16} />}>Design</Tab>
      </div>

      <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
        {activeTab === 'selection' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Section of the page</label>
              <div style={{ padding: '8px', background: '#f1f5f9', borderRadius: '6px', fontSize: '12px', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                {getParentChain(element) || 'Root'}
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>CSS Selector</label>
              <div style={{ padding: '12px', background: '#6366f1', color: 'white', borderRadius: '6px', fontSize: '13px', fontFamily: 'monospace', fontWeight: 500 }}>
                {getSelector(element)}
              </div>
              <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>
                💡 Use this selector to target this element in your tour.
              </p>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>HTML Tag</label>
              <div style={{ padding: '8px', background: '#f1f5f9', borderRadius: '6px', fontSize: '12px' }}>
                &lt;{element.tagName.toLowerCase()}&gt;
              </div>
            </div>
          </div>
        ) : (
          <div style={{ color: '#64748b', textAlign: 'center', padding: '20px 0' }}>
            <Settings size={40} style={{ opacity: 0.2, marginBottom: '12px' }} />
            <p>Design settings coming soon...</p>
          </div>
        )}
      </div>

      <div style={{ padding: '16px', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
        <button 
          style={{ width: '100%', padding: '10px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
          onClick={onClose}
        >
          Save Highlight
        </button>
      </div>
    </div>
  );
}

function Tab({ children, active, onClick, icon }: { children: React.ReactNode, active: boolean, onClick: () => void, icon: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: '12px',
        border: 'none',
        background: 'transparent',
        borderBottom: active ? '2px solid #6366f1' : 'none',
        color: active ? '#6366f1' : '#64748b',
        fontWeight: active ? 600 : 500,
        fontSize: '14px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px'
      }}
    >
      {icon}
      {children}
    </button>
  );
}
