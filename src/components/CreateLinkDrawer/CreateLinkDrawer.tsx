import React, { useState } from 'react'
import { X } from 'lucide-react'
import styles from './CreateLinkDrawer.module.css'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/ToastProvider'

type TabId = 'basic' | 'personalization' | 'lead_form' | 'advanced'

interface CreateLinkDrawerProps {
  isOpen: boolean
  onClose: () => void
  projectId?: string
}

export default function CreateLinkDrawer({ isOpen, onClose, projectId }: CreateLinkDrawerProps) {
  const [activeTab, setActiveTab] = useState<TabId>('basic')
  const { showToast } = useToast()

  if (!isOpen) return null

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.drawerContent} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Link settings</h2>
          <button className={styles.modalClose} onClick={onClose}><X size={20} /></button>
        </div>

        <div className={styles.drawerTabs}>
          <button
            className={cn(styles.drawerTab, activeTab === 'basic' && styles.drawerTabActive)}
            onClick={() => setActiveTab('basic')}
          >
            Basic settings
          </button>
          <button
            className={cn(styles.drawerTab, activeTab === 'personalization' && styles.drawerTabActive)}
            onClick={() => setActiveTab('personalization')}
          >
            Personalization
          </button>
          <button
            className={cn(styles.drawerTab, activeTab === 'lead_form' && styles.drawerTabActive)}
            onClick={() => setActiveTab('lead_form')}
          >
            Lead form
          </button>
          <button
            className={cn(styles.drawerTab, activeTab === 'advanced' && styles.drawerTabActive)}
            onClick={() => setActiveTab('advanced')}
          >
            Advanced
          </button>
        </div>

        <div className={styles.modalBody}>
          {activeTab === 'basic' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Link name</label>
                <input type="text" className={styles.input} placeholder="My new link" />
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Start slide</label>
                  <select className={styles.select}>
                    <option>Slide 1</option>
                  </select>
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Enable link on date</label>
                  <input type="date" className={styles.input} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>End of work</label>
                  <input type="date" className={styles.input} />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Presentation language</label>
                <select className={styles.select}>
                  <option>English</option>
                </select>
              </div>

              <div className={styles.toggleRow}>
                <label className={styles.formLabel}>Access by password</label>
                <label className={styles.toggleSwitch}>
                  <input type="checkbox" className={styles.hiddenCheckbox} />
                  <span className={styles.toggleKnob}></span>
                </label>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Pitch avatar interface language</label>
                <select className={styles.select}>
                  <option>English</option>
                </select>
              </div>

              <div className={styles.toggleRow}>
                <label className={styles.formLabel}>Subtitles on</label>
                <label className={styles.toggleSwitch}>
                  <input type="checkbox" className={styles.hiddenCheckbox} />
                  <span className={styles.toggleKnob}></span>
                </label>
              </div>
              
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Custom tracking pixel id</label>
                <input type="text" className={styles.input} />
              </div>

              <div className={styles.toggleRow}>
                <label className={styles.formLabel}>Allow search engine indexing</label>
                <label className={styles.toggleSwitch}>
                  <input type="checkbox" className={styles.hiddenCheckbox} />
                  <span className={styles.toggleKnob}></span>
                </label>
              </div>

            </div>
          )}
          {activeTab === 'personalization' && <div className={styles.placeholderText}>Personalization settings coming soon...</div>}
          {activeTab === 'lead_form' && <div className={styles.placeholderText}>Lead form settings coming soon...</div>}
          {activeTab === 'advanced' && <div className={styles.placeholderText}>Advanced settings coming soon...</div>}
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button className={styles.createBtn} onClick={() => {
            showToast("Link created successfully", "success")
            onClose()
          }}>
            Create link
          </button>
        </div>
      </div>
    </div>
  )
}
