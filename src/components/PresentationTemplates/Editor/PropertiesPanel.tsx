'use client'

import React, { useState } from 'react'
import { Info, Hash, Mic, Video, Wand2, Plus } from 'lucide-react'
import { SelectedElement } from './TemplateEditor'
import styles from './PropertiesPanel.module.css'

interface PropertiesPanelProps {
  selectedElement: SelectedElement | null
  onUpdateElement: (updates: Partial<SelectedElement>) => void
}

type TabType = 'script' | 'about' | 'elements'

export default function PropertiesPanel({ selectedElement, onUpdateElement }: PropertiesPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('script')
  const [scriptText, setScriptText] = useState('')

  if (selectedElement) {
    return (
      <div className={styles.panel}>
        <div className={styles.header}>
          <h3>Control - {selectedElement.type}</h3>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>Parameter</div>
          <div className={styles.paramInputWrapper}>
            <input 
              type="text" 
              className={styles.input} 
              defaultValue="Resulting Presentation Current Slide Text" 
            />
            <Hash size={16} color="#9ca3af" className={styles.paramIcon} />
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>Position</div>
          <div className={styles.grid2}>
            <div className={styles.inputGroup}>
              <label>X</label>
              <input 
                type="number" 
                className={styles.input} 
                value={selectedElement.x}
                onChange={e => onUpdateElement({ x: Number(e.target.value) })}
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Y</label>
              <input 
                type="number" 
                className={styles.input} 
                value={selectedElement.y}
                onChange={e => onUpdateElement({ y: Number(e.target.value) })}
              />
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>Size</div>
          <div className={styles.grid2}>
            <div className={styles.inputGroup}>
              <label>W</label>
              <input 
                type="number" 
                className={styles.input} 
                value={selectedElement.w}
                onChange={e => onUpdateElement({ w: Number(e.target.value) })}
              />
            </div>
            <div className={styles.inputGroup}>
              <label>H</label>
              <input 
                type="number" 
                className={styles.input} 
                value={selectedElement.h}
                onChange={e => onUpdateElement({ h: Number(e.target.value) })}
              />
            </div>
          </div>
        </div>

        {/* Accordions Mock */}
        <div className={styles.accordion}>
          <div className={styles.accordionHeader}>
            <div style={{display: 'flex', gap: 8, alignItems: 'center'}}>
              Text <Info size={14} color="#9ca3af" />
            </div>
            <Plus size={16} color="#9ca3af" />
          </div>
        </div>
        <div className={styles.accordion}>
          <div className={styles.accordionHeader}>
            <div style={{display: 'flex', gap: 8, alignItems: 'center'}}>
              Font <Info size={14} color="#9ca3af" />
            </div>
            <Plus size={16} color="#9ca3af" />
          </div>
        </div>
        <div className={styles.accordion}>
          <div className={styles.accordionHeader}>
            <div style={{display: 'flex', gap: 8, alignItems: 'center'}}>
              Border <Info size={14} color="#9ca3af" />
            </div>
            <Plus size={16} color="#9ca3af" />
          </div>
        </div>
      </div>
    )
  }

  // default state (no selection)
  return (
    <div className={styles.panel}>
      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'script' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('script')}
        >
          Script
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'about' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('about')}
        >
          About
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'elements' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('elements')}
        >
          Elements
        </button>
      </div>

      <div className={styles.tabContent}>
        {activeTab === 'script' && (
          <div className={styles.scriptTab}>
            <div className={styles.sectionTitle}>Slide Script</div>
            <div className={styles.textareaWrapper}>
              <textarea 
                className={styles.textarea}
                placeholder="Enter slide script or let AI generate it for you"
                value={scriptText}
                onChange={e => setScriptText(e.target.value)}
              />
              <div className={styles.charCount}>{scriptText.length}/20000</div>
            </div>
            <button className={styles.aiBtn}>
              <Wand2 size={16} /> Generate script with AI
            </button>

            <div className={styles.mediaRow}>
              <div className={styles.mediaHeader}>Audio</div>
              <div className={styles.mediaControls}>
                <Mic size={16} color="#9ca3af" />
                <span className={styles.mediaText}>Start recording</span>
              </div>
              <button className={styles.aiBtnSecondary}>
                <Wand2 size={14} /> Generate audio with AI
              </button>
            </div>

            <div className={styles.mediaRow}>
              <div className={styles.mediaHeader}>Video</div>
              <div className={styles.mediaControls}>
                <Video size={16} color="#9ca3af" />
                <span className={styles.mediaText}>Start recording</span>
              </div>
              <button className={styles.aiBtnSecondary}>
                <User size={14} /> Create avatar with AI
              </button>
            </div>
          </div>
        )}

        {activeTab === 'about' && (
          <div className={styles.aboutTab}>
            <div className={styles.inputGroup}>
              <label>Slide Topic</label>
              <input type="text" className={styles.input} />
            </div>
            <div className={styles.inputGroup}>
              <label>Internal ID</label>
              <input type="text" className={styles.input} />
            </div>
            <div className={styles.inputGroup}>
              <label>Which question does this slide answer?</label>
              <textarea className={styles.textarea} style={{ height: 80 }} placeholder="Enter answer" />
            </div>
          </div>
        )}

        {activeTab === 'elements' && (
          <div className={styles.elementsTab}>
            <div className={styles.sectionTitle}>Templates</div>
            <div className={styles.sectionTitle}>Text Input</div>
            <button className={styles.elementBtn}>Text Input (Area)</button>
            <button className={styles.elementBtn}>Checkbox</button>
            <button className={styles.elementBtn}>Radio Button</button>

            <div className={styles.sectionTitle} style={{marginTop: 16}}>Text Output</div>
            <button className={styles.elementBtn}>Text Output (Area)</button>
            <button className={styles.elementBtn}>Image</button>
            <button className={styles.elementBtn}>Button</button>
          </div>
        )}
      </div>
    </div>
  )
}

function User(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
}
