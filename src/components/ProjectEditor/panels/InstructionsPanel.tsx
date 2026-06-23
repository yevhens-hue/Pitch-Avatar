'use client'

import React, { useState } from 'react'
import { Settings2, ChevronDown, Plus, BookOpen } from 'lucide-react'
import styles from './InstructionsPanel.module.css'

const ROLES = [
  { name: 'Demo role', desc: 'Shows how businesses can automate and personalize their customer interactions through Avatars' },
  { name: 'Sales Consultant', desc: 'Designed to understand what customers need and show them how the product or service can help' },
  { name: 'Customer Success Manager', desc: 'Helps users get the best results from product and keep them happy' },
  { name: 'Support Agent', desc: 'Answers questions about product or service and connects users with human support when needed' },
  { name: 'Coach', desc: 'Guides users through educational content or professional development tasks' },
]

const DEFAULT_INSTRUCTIONS = [
  { name: 'Show relevant slide and play', desc: 'Avatar navigates to the most relevant slide based on user question' },
  { name: 'Intro message', desc: 'Avatar greets audience with a warm welcome before the presentation' },
  { name: 'Goodbye message', desc: 'Avatar sends a closing message at the end of the session' },
  { name: 'Show digest', desc: 'Avatar summarizes key points covered so far' },
  { name: 'Collect Data - Listener First Name', desc: "Avatar asks and stores the listener's first name" },
]

const LIBRARY_ITEMS = [
  { title: 'About avatar info', desc: 'Avatar tells about its features and guides users on how it can help' },
  { title: 'Go to Main Menu Slide', desc: 'Takes the user to the main menu slide by voice command or chat' },
  { title: 'Intro message new for demo', desc: 'Avatar greets your audience with a warm welcome before the presentation' },
  { title: 'Show page', desc: 'Avatar redirects the listener to any page you specify by URL' },
  { title: 'Answer with Generated Image', desc: 'Answer with Generated Image on Slide' },
  { title: 'Call human to join', desc: "If Avatar cannot handle user's question it offers to connect with a human" },
  { title: 'Schedule meeting', desc: 'Avatar suggests scheduling a meeting and helps book the time' },
  { title: 'Show relevant links', desc: 'Shows relevant links from Knowledge Base' },
  { title: 'Change language', desc: 'Avatar detects and switches languages when needed' },
  { title: 'Pricing request', desc: "Control Avatar's answer about pricing" },
  { title: 'Irrelevant request', desc: "Avatar's reaction to a question that is out of scope" },
]

interface InstructionsPanelProps {
  projectId?: string
}

const InstructionsPanel: React.FC<InstructionsPanelProps> = () => {
  const [selectedRole, setSelectedRole] = useState('Demo role')
  const [isLibraryOpen, setIsLibraryOpen] = useState(false)
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false)
  const [instructions, setInstructions] = useState('')
  const [activeInstructions, setActiveInstructions] = useState(DEFAULT_INSTRUCTIONS)

  const addFromLibrary = (item: typeof LIBRARY_ITEMS[0]) => {
    if (!activeInstructions.find(i => i.name === item.title)) {
      setActiveInstructions(prev => [...prev, { name: item.title, desc: item.desc }])
    }
    setIsLibraryOpen(false)
  }

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h2 className={styles.panelTitle}>Instructions</h2>
        <p className={styles.panelSubtitle}>Configure how your avatar behaves and responds during conversations.</p>
      </div>

      <div className={styles.panelBody}>
        {/* Role selector */}
        <div className={styles.field}>
          <div className={styles.fieldRow}>
            <label className={styles.label} htmlFor="role-select">Name</label>
            <button
              className={styles.linkBtn}
              onClick={() => setIsCreateRoleOpen(true)}
              id="add-custom-role-btn"
            >
              <Plus size={14} /> Add custom role
            </button>
          </div>
          <div className={styles.selectWrap}>
            <select
              id="role-select"
              className={styles.select}
              value={selectedRole}
              onChange={e => setSelectedRole(e.target.value)}
            >
              {ROLES.map(r => <option key={r.name}>{r.name}</option>)}
            </select>
            <ChevronDown size={16} className={styles.selectIcon} />
          </div>
          {ROLES.find(r => r.name === selectedRole) && (
            <p className={styles.roleDesc}>{ROLES.find(r => r.name === selectedRole)!.desc}</p>
          )}
        </div>

        {/* Selected Instructions table */}
        <div className={styles.field}>
          <div className={styles.fieldRow}>
            <label className={styles.label}>Selected Instructions</label>
            <button
              className={styles.outlineBtn}
              onClick={() => setIsLibraryOpen(true)}
              id="add-instruction-btn"
            >
              <BookOpen size={14} /> + Add instruction
            </button>
          </div>
          <div className={styles.table}>
            <div className={styles.tableHead}>
              <span className={styles.colName}>Name</span>
              <span className={styles.colDesc}>Description</span>
              <span className={styles.colActions}>Settings</span>
            </div>
            {activeInstructions.map((inst, idx) => (
              <div key={idx} className={styles.tableRow}>
                <span className={styles.colName}>{inst.name}</span>
                <span className={styles.colDesc}>{inst.desc}</span>
                <span className={styles.colActions}>
                  <Settings2 size={16} color="#6b7280" style={{ cursor: 'pointer' }} />
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Instructions */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="custom-instructions-textarea">Custom Instructions</label>
          <textarea
            id="custom-instructions-textarea"
            className={styles.textarea}
            value={instructions}
            onChange={e => setInstructions(e.target.value)}
            placeholder="Here you can describe your target audience and give clear instructions on how your avatar should respond.&#10;For example, specify what to say when someone asks about discounts, prices, affiliate programs, delivery times, or specific unique aspects of your business."
          />
          <div className={styles.charCount}>{instructions.length}/7000 characters</div>
        </div>
      </div>

      {/* ── Instruction Library Modal ── */}
      {isLibraryOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsLibraryOpen(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()} role="dialog" aria-label="Instructions Library">
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Instructions Library</h2>
              <button onClick={() => setIsLibraryOpen(false)} className={styles.closeBtn} aria-label="Close library">✕</button>
            </div>
            <div className={styles.libraryGrid}>
              {LIBRARY_ITEMS.map((item, idx) => (
                <div key={idx} className={styles.libraryItem}>
                  <div className={styles.libraryItemInfo}>
                    <h3 className={styles.libraryItemTitle}>{item.title}</h3>
                    <p className={styles.libraryItemDesc}>{item.desc}</p>
                  </div>
                  <button
                    className={styles.addBtn}
                    onClick={() => addFromLibrary(item)}
                    aria-label={`Add ${item.title}`}
                  >+</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Create New Role Modal ── */}
      {isCreateRoleOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsCreateRoleOpen(false)}>
          <div className={styles.modal} style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()} role="dialog" aria-label="Create new role">
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Create new role</h2>
              <button onClick={() => setIsCreateRoleOpen(false)} className={styles.closeBtn} aria-label="Close">✕</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="new-role-name">Name</label>
                <input id="new-role-name" className={styles.input} placeholder="Enter role name" />
                <div className={styles.charCount}>0/50 characters</div>
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="new-role-desc">Description</label>
                <textarea id="new-role-desc" className={styles.textarea} style={{ minHeight: 80 }} placeholder="Describe your role" />
                <div className={styles.charCount}>0/200 characters</div>
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="new-role-instructions">Instructions</label>
                <textarea id="new-role-instructions" className={styles.textarea} style={{ minHeight: 120 }} placeholder="Enter instructions for your role" />
                <div className={styles.charCount}>0/7000 characters</div>
              </div>
              <div className={styles.infoBox}>
                <span>ⓘ</span>
                <p>These instructions define how your avatar will interact with users during chat sessions.</p>
              </div>
              <div className={styles.modalFooter}>
                <button className={styles.primaryBtn} onClick={() => setIsCreateRoleOpen(false)}>Create</button>
                <button className={styles.linkBtn} onClick={() => setIsCreateRoleOpen(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default InstructionsPanel
