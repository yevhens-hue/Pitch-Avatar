'use client'

import React, { useState } from 'react'

const TABS = [
  'Menu & Sections',
  'List Column',
  'Home Page',
  'Project Editor Menu Items',
  'Actions',
  'Share/Enroll',
  'Apply To'
];

export default function UISkinsAdmin() {
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [skinName, setSkinName] = useState('HR Onboarding');
  const [domain, setDomain] = useState('hr.pitchavatar.com');

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>UI Skins (Prototypes)</h1>
      <p style={{ color: '#64748b', marginBottom: '24px' }}>Customize the interface for different Use Cases, Subscriptions, and Domains.</p>

      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Skin Name</label>
            <input 
              type="text" 
              value={skinName}
              onChange={(e) => setSkinName(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Domain Routing (optional)</label>
            <input 
              type="text" 
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="e.g. hr.pitchavatar.com"
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: '24px' }}>
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '12px 16px',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === tab ? '2px solid #3b82f6' : '2px solid transparent',
                color: activeTab === tab ? '#3b82f6' : '#64748b',
                fontWeight: activeTab === tab ? 600 : 400,
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        <div style={{ minHeight: '300px' }}>
          {activeTab === 'Menu & Sections' && (
            <div>
              <h3 style={{ fontWeight: 600, marginBottom: '16px' }}>Configure Sidebar Navigation</h3>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>Select which menu items are visible to users with this skin.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" defaultChecked /> Home
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" defaultChecked /> Projects
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" defaultChecked /> Courses
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" /> Templates (Hidden)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" /> Knowledge Base (Hidden)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" /> Listeners (Hidden)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" /> Analytics (Hidden)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" /> Integrations (Hidden)
                </label>
              </div>
            </div>
          )}

          {activeTab === 'Share/Enroll' && (
            <div>
              <h3 style={{ fontWeight: 600, marginBottom: '16px' }}>Configure Share & Enroll Modal</h3>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>Hide unnecessary settings for simpler use cases.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" defaultChecked /> Show &quot;Generate Link&quot;
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" defaultChecked /> Show &quot;Enroll to Course&quot;
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" /> Show &quot;Lead Generation Forms&quot; (Hidden)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" /> Show &quot;CRM Sync&quot; (Hidden)
                </label>
              </div>
            </div>
          )}

          {/* Placeholder for other tabs */}
          {activeTab !== 'Menu & Sections' && activeTab !== 'Share/Enroll' && (
            <div style={{ color: '#94a3b8', fontStyle: 'italic', padding: '24px 0' }}>
              Settings for {activeTab} will be implemented in the next iteration.
            </div>
          )}
        </div>
        
        <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
          <button style={{ background: '#3b82f6', color: 'white', padding: '8px 16px', borderRadius: '6px', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
            Save Skin Configuration
          </button>
        </div>
      </div>
    </div>
  )
}
