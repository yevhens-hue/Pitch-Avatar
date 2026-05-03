'use client'

import React, { useState } from 'react'
import styles from './ShareModal.module.css'

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  link?: string
  scriptCode?: string
}

export default function ShareModal({ 
  isOpen, 
  onClose,
  link = "https://slides.pitchavatar.com/bhok2",
  scriptCode = `<script\n  type="module"\n  src="https://slides.pitchavatar.com/widget/embed.js"\n  data-chat-id="bhok2"\n></script>`
}: ShareModalProps) {
  const [chatOpenByDefault, setChatOpenByDefault] = useState(false)
  const [openFullCentered, setOpenFullCentered] = useState(false)
  const [openCustomPosition, setOpenCustomPosition] = useState(false)
  
  const [showTooltip, setShowTooltip] = useState(false)

  if (!isOpen) return null

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // Could add toast notification here
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>✕</button>
        
        <h2 className={styles.title}>Ваша ссылка готова</h2>
        
        <div className={styles.qrContainer}>
          {/* Simple QR Code placeholder SVG */}
          <svg className={styles.qrCode} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
             <rect width="100" height="100" fill="#fff"/>
             <path d="M10 10h25v25H10zm5 5v15h15V15zM65 10h25v25H65zm5 5v15h15V15zM10 65h25v25H10zm5 5v15h15V15z" fill="#000"/>
             <path d="M45 10h10v10H45zm0 15h10v10H45zm0 15h10v10H45zm0 15h10v10H45zm0 15h10v10H45z" fill="#000"/>
             <path d="M10 45h10v10H10zm15 0h10v10H25zm50 0h10v10H75zm-15 0h10v10H60z" fill="#000"/>
             <path d="M65 65h10v10H65zm15 0h10v10H80zm-15 15h10v10H65zm15 0h10v10H80z" fill="#000"/>
             <rect x="20" y="20" width="5" height="5" fill="#000"/>
             <rect x="75" y="20" width="5" height="5" fill="#000"/>
             <rect x="20" y="75" width="5" height="5" fill="#000"/>
             <path d="M40 40h20v20H40z" fill="#000"/>
          </svg>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionBorder}>
            <span className={styles.sectionLabel}>Ссылка для просмотра слушателем</span>
            <div className={styles.inputGroup}>
              <input 
                type="text" 
                className={styles.input} 
                value={link} 
                readOnly 
              />
              <button 
                className={styles.copyBtn} 
                onClick={() => copyToClipboard(link)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                </svg>
                Скопировать ссылку
              </button>
            </div>
          </div>
        </div>

        <div className={styles.section} onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}>
          <div className={styles.sectionBorder}>
            <span className={styles.sectionLabel}>Вставить как скрипт</span>
            <button 
              className={styles.copyBtnScript} 
              onClick={() => copyToClipboard(scriptCode)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              Скопировать скрипт
            </button>
            
            <textarea 
              className={styles.textarea} 
              value={scriptCode} 
              readOnly 
            />
          </div>
          {showTooltip && (
            <div className={styles.tooltip}>
              Если посетитель вручную закроет виджет чата, он останется закрытым.
            </div>
          )}
        </div>

        <div className={styles.toggles}>
          <div className={styles.toggleRow}>
            <div 
              className={`${styles.toggleSwitch} ${chatOpenByDefault ? styles.toggleSwitchActive : ''}`} 
              onClick={() => setChatOpenByDefault(!chatOpenByDefault)}
            />
            <span className={styles.toggleLabel}>
              Чат по умолчанию открыт
              <span className={styles.infoIcon} title="Инфо">ⓘ</span>
            </span>
          </div>
          
          <div className={styles.toggleRow}>
            <div 
              className={`${styles.toggleSwitch} ${openFullCentered ? styles.toggleSwitchActive : ''}`} 
              onClick={() => setOpenFullCentered(!openFullCentered)}
            />
            <span className={styles.toggleLabel}>
              Open in full centered page
              <span className={styles.infoIcon} title="Инфо">ⓘ</span>
            </span>
          </div>

          <div className={styles.toggleRow}>
            <div 
              className={`${styles.toggleSwitch} ${openCustomPosition ? styles.toggleSwitchActive : ''}`} 
              onClick={() => setOpenCustomPosition(!openCustomPosition)}
            />
            <span className={styles.toggleLabel}>
              Open page with customize position settings
              <span className={styles.infoIcon} title="Инфо">ⓘ</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
