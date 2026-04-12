'use client'

import React, { useState } from 'react'
import styles from './Creator.module.css'

const STEPS = [
  { id: 1, label: 'Создать аватара' },
  { id: 2, label: 'Контент для презентации' },
  { id: 3, label: 'Инструкции для аватара' },
  { id: 4, label: 'База знаний' }
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
      {/* Левая колонка: Этапы */}
      <aside className={styles.sidebar}>
        <div className={styles.header}>
            <span className={styles.backArrow}>←</span>
            <h2>Создаем вашего AI Чат-аватара</h2>
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

      {/* Основная форма */}
      <main className={styles.mainContent}>
        <div className={styles.formCard}>
           {activeStep === 1 && (
             <>
               <h3 className={styles.sectionTitle}>Создать аватара</h3>
               <div className={styles.formGroup}>
                 <label>Название проекта</label>
                 <input type="text" defaultValue="Avatar Project [31.03.2026]" />
               </div>
               <div className={styles.formGroup}>
                 <label>Имя аватара</label>
                 <input type="text" defaultValue="Chat Avatar [31.03.2026]" />
               </div>
               <div className={styles.row}>
                 <div className={styles.formGroup}>
                   <label>Язык по умолчанию</label>
                   <select className={styles.select}>
                     <option>English</option>
                     <option>Russian</option>
                   </select>
                 </div>
                 <div className={styles.formGroup}>
                   <label>Голос</label>
                   <select className={styles.select}>
                     <option>Florian Multilingual</option>
                   </select>
                 </div>
               </div>
               <button className={styles.addLangBtn}>+ Добавить язык</button>
               <div className={styles.photoSection}>
                  <h4>Фото</h4>
                  <div className={styles.avatarGrid}>
                     <div className={styles.uploadBox}>
                        <span className={styles.plus}>+</span>
                        <span>Добавить собственное</span>
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
               <h3 className={styles.sectionTitle}>Контент для презентации</h3>
               <p className={styles.description}>Выберите файлы, на основе которых аватар будет проводить презентацию.</p>
               <div className={styles.uploadLarge}>
                  <div className={styles.plusBig}>+</div>
                  <p>Загрузить PDF или PPTX</p>
               </div>
             </>
           )}

           {activeStep === 3 && (
             <>
               <h3 className={styles.sectionTitle}>Инструкции для аватара</h3>
               <div className={styles.formGroup}>
                  <label>Как аватар должен вести себя?</label>
                  <textarea 
                    className={styles.textarea} 
                    placeholder="Например: Ты дружелюбный менеджер по продажам..." 
                    rows={10} 
                  />
               </div>
             </>
           )}

           {activeStep === 4 && (
             <>
               <h3 className={styles.sectionTitle}>База знаний</h3>
               <p className={styles.description}>Добавьте дополнительные документы, чтобы ИИ мог отвечать на вопросы клиентов.</p>
               <div className={styles.dropDoc}>
                  <span>📄 Кликните, чтобы добавить файлы</span>
               </div>
             </>
           )}
        </div>

        <div className={styles.footer}>
           <button className={styles.exitBtn} onClick={() => window.history.back()}>Выход</button>
           <button 
                className={styles.nextBtn} 
                onClick={() => activeStep < 4 ? setActiveStep(activeStep + 1) : alert('Готово!')}
            >
             {activeStep === 4 ? 'Создать' : 'Далее'}
           </button>
        </div>
      </main>
    </div>
  )
}
