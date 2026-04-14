'use client'

import React, { useState } from 'react'
import styles from './Creator.module.css'

const STEPS = [
  { id: 1, label: 'Create Avatar' },
  { id: 2, label: 'Presentation Content' },
  { id: 3, label: 'Avatar Instructions' },
  { id: 4, label: 'Knowledge Base' }
]

const MOCK_AVATARS = [
  { id: '1', emoji: '🧑‍💼' },
  { id: '2', emoji: '👩‍💼' },
  { id: '3', emoji: '🤵' },
  { id: '4', emoji: '🧕' },
  { id: '5', emoji: '👨‍💼' },
  { id: '6', emoji: '👩‍💼' },
  { id: '7', emoji: '👴' },
  { id: '8', emoji: '👩' },
  { id: '9', emoji: '👨' },
  { id: '10', emoji: '🧒' },
  { id: '11', emoji: '👤' },
  { id: '12', emoji: '👩‍🔬' }
]

export default function ChatAvatarCreator() {
  const [activeStep, setActiveStep] = useState(1)
  const [selectedAvatar, setSelectedAvatar] = useState('1')
  
  return (
    <div className={styles.creatorContainer}>
      {/* Left panel: Steps */}
      <aside className={styles.sidebar}>
        <div className={styles.header}>
            <span className={styles.backArrow}>←</span>
            <h2>Creating your AI Chat Avatar</h2>
        </div>
        <nav className={styles.stepsNav}>
            {STEPS.map((step) => (
                <div key={step.id} className={`${styles.stepItem} ${activeStep === step.id ? styles.stepActive : ''}`}>
                    <div className={styles.stepNum}>{step.id}</div>
                    <div className={styles.stepLabel}>{step.label}</div>
                </div>
            ))}
        </nav>
      </aside>

      {/* Main Form */}
      <main className={styles.mainContent}>
        <div className={styles.formCard}>
           {activeStep === 1 && (
             <>
               <h3 className={styles.sectionTitle}>Create Avatar</h3>
               <div className={styles.formGroup}>
                 <label>Project Name</label>
                 <input type="text" defaultValue="Avatar Project [2026]" />
               </div>
               <div className={styles.formGroup}>
                 <label>Avatar Name</label>
                 <input type="text" defaultValue="Chat Avatar [2026]" />
               </div>
               <div className={styles.row}>
                 <div className={styles.formGroup}>
                   <label>Default Language</label>
                   <select className={styles.select}>
                     <option>English</option>
                     <option>Spanish</option>
                   </select>
                 </div>
                 <div className={styles.formGroup}>
                   <label>Voice</label>
                   <select className={styles.select}>
                     <option>Florian Multilingual</option>
                   </select>
                 </div>
               </div>
               <button className={styles.addLangBtn}>+ Add Language</button>
               <div className={styles.photoSection}>
                  <h4>Photo</h4>
                  <div className={styles.avatarGrid}>
                     <div className={styles.uploadBox}>
                        <span className={styles.plus}>+</span>
                        <span>Add Your Own</span>
                     </div>
                     {MOCK_AVATARS.map((avatar) => (
                        <div 
                            key={avatar.id} 
                            className={`${styles.avatarItem} ${selectedAvatar === avatar.id ? styles.avatarSelected : ''}`}
                            onClick={() => setSelectedAvatar(avatar.id)}
                        >
                            <div className={styles.emojiContainer}>{avatar.emoji}</div>
                        </div>
                     ))}
                  </div>
               </div>
             </>
           )}

           {activeStep === 2 && (
             <>
               <h3 className={styles.sectionTitle}>Presentation Content</h3>
               <p className={styles.description}>Select the files based on which the avatar will conduct the presentation.</p>
               <div className={styles.uploadLarge}>
                  <div className={styles.plusBig}>+</div>
                  <p>Upload PDF or PPTX</p>
               </div>
             </>
           )}

           {activeStep === 3 && (
             <>
               <h3 className={styles.sectionTitle}>Avatar Instructions</h3>
               <div className={styles.formGroup}>
                  <label>How should the avatar behave?</label>
                  <textarea 
                    className={styles.textarea} 
                    placeholder="Example: You are a friendly sales manager..." 
                    rows={10} 
                  />
               </div>
             </>
           )}

           {activeStep === 4 && (
             <>
               <h3 className={styles.sectionTitle}>Knowledge Base</h3>
               <p className={styles.description}>Add additional documents so the AI can answer customer questions.</p>
               <div className={styles.dropDoc}>
                  <span>📄 Click to add files</span>
               </div>
             </>
           )}
        </div>

        <div className={styles.footer}>
           <button className={styles.exitBtn} onClick={() => window.history.back()}>Exit</button>
           <button 
                className={styles.nextBtn} 
                onClick={() => activeStep < 4 ? setActiveStep(activeStep + 1) : alert('Ready!')}
            >
             {activeStep === 4 ? 'Create' : 'Next'}
           </button>
        </div>
      </main>
    </div>
  )
}
