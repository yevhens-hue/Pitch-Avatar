'use client'

import React, { useState } from 'react'
import styles from './CreatePresentationModal.module.css'
import { useFileUpload } from '@/hooks'

interface CreatePresentationModalProps {
  isOpen: boolean
  onClose: () => void
  defaultTab?: string
}

export default function CreatePresentationModal({ isOpen, onClose, defaultTab }: CreatePresentationModalProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || 'file')
  const [showAdvanced, setShowAdvanced] = useState(false)

  const fileUpload = useFileUpload()
  const videoUpload = useFileUpload({ accept: '.mp4' })

  if (!isOpen) return null

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>✕</button>
        
        <h2 className={styles.title}>Создать новую презентацию</h2>
        
        <div className={styles.formGroup}>
          <input type="text" placeholder="Название презентации" className={styles.input} />
        </div>

        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${activeTab === 'file' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('file')}
          >
            Загрузить файл
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'video' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('video')}
          >
            Загрузить видео
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'scratch' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('scratch')}
          >
            Начать с нуля
          </button>
        </div>

        {activeTab === 'video' ? (
          <div className={styles.videoUploadSection}>
             <input type="text" placeholder="Ссылка на YouTube" className={styles.input} />
             <div className={styles.orDivider}>or</div>
             <div
               className={`${styles.dropzone} ${videoUpload.isHovering ? styles.dropzoneActive : ''}`}
               onDragOver={videoUpload.handleDragOver}
               onDragLeave={() => videoUpload.setIsHovering(false)}
               onDrop={videoUpload.handleDrop}
             >
                <div className={styles.dropContent}>
                    <div className={styles.leftDrop}>
                        <p className={styles.dropTitle}>
                          {videoUpload.file ? videoUpload.file.name : 'Перетащите файлы сюда'}
                        </p>
                        <label className={styles.dropBtn}>
                          или нажмите, чтобы выбрать
                          <input type="file" hidden accept=".mp4" onChange={videoUpload.handleFileChange} />
                        </label>
                    </div>
                    <div className={styles.divider}></div>
                    <div className={styles.rightDrop}>
                        <p className={styles.dropTitle}>Выберите из</p>
                        <div className={styles.googleDrive}>
                            <span className={styles.driveIcon}>▲</span>
                            Google Drive
                        </div>
                    </div>
                </div>
             </div>
             <p className={styles.helperText}>
                Загрузите видео .mp4 размером до 500 МБ и длительностью до 5 минут
             </p>
          </div>
        ) : (
          <div className={styles.fileUploadSection}>
            <div
              className={`${styles.dropzone} ${fileUpload.isHovering ? styles.dropzoneActive : ''}`}
              onDragOver={fileUpload.handleDragOver}
              onDragLeave={() => fileUpload.setIsHovering(false)}
              onDrop={fileUpload.handleDrop}
            >
               <div className={styles.dropContent}>
                  <div className={styles.leftDrop}>
                     <p className={styles.dropTitle}>
                       {fileUpload.file ? fileUpload.file.name : 'Перетащите файлы сюда'}
                     </p>
                     <label className={styles.dropBtn}>
                       или нажмите, чтобы выбрать
                       <input type="file" hidden accept=".pdf,.ppt,.pptx" onChange={fileUpload.handleFileChange} />
                     </label>
                  </div>
                  <div className={styles.divider}></div>
                  <div className={styles.rightDrop}>
                     <p className={styles.dropTitle}>Выберите из</p>
                     <div className={styles.googleDrive}>
                        <span className={styles.driveIcon}>▲</span>
                        Google Drive
                     </div>
                  </div>
               </div>
            </div>
            <p className={styles.helperText}>
                Загрузите файл .pdf, .ppt или .pptx размером до 100 МБ, содержащий не более 100 слайдов
            </p>
          </div>
        )}

        <div className={styles.advancedWrapper}>
            <button className={styles.advancedToggle} onClick={() => setShowAdvanced(!showAdvanced)}>
                Расширенные настройки {showAdvanced ? '▲' : '▼'}
            </button>
            
            {showAdvanced && (
                <div className={styles.advancedList}>
                    <div className={styles.advancedItemHeader}>
                        <span>Цели презентации</span>
                        <div className={styles.toggle}></div>
                    </div>

                    <div className={styles.sectionDivider}></div>
                    
                    <div className={styles.advancedItemHeader}>
                        <span>Настройки текст-скрипта</span>
                        <div className={styles.toggleActive}></div>
                    </div>
                    
                    <div className={styles.subSection}>
                        <div className={styles.subTabs}>
                            <button className={styles.subTabActive}>Сгенерировать скрипт</button>
                            <button className={styles.subTab}>Заметки</button>
                        </div>
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label>Язык</label>
                                <select className={styles.select}><option>Английский</option></select>
                            </div>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Количество слов в скрипте</label>
                            <input type="text" className={styles.inputSmall} defaultValue="30" />
                        </div>
                    </div>

                    <div className={styles.sectionDivider}></div>

                    <div className={styles.advancedItemHeader}>
                        <span>Настройки видео аватара и голоса</span>
                        <div className={styles.toggleActive}></div>
                    </div>

                    <div className={styles.subSection}>
                        <div className={styles.formGroup}>
                            <label>Выберите вариант</label>
                            <select className={styles.select}><option>Генерация аватара</option></select>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Доступно на</label>
                            <select className={styles.select}><option>Аватар на первом слайде</option></select>
                        </div>

                        <h4 className={styles.innerTitle}>Голос</h4>
                        <div className={styles.subTabs}>
                            <button className={styles.subTabActive}>ИИ Библиотека</button>
                            <button className={styles.subTab}>Клонированные голоса</button>
                        </div>

                        <div className={styles.formGroup}>
                           <label>Акцент</label>
                           <select className={styles.select}><option>English (United Kingdom)</option></select>
                        </div>
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label>Стиль голоса *</label>
                                <select className={styles.select}><option>Libby</option></select>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Настроение *</label>
                                <select className={styles.select}><option>friendly</option></select>
                            </div>
                        </div>

                        <h4 className={styles.innerTitle}>ИИ-аватар</h4>
                        <div className={styles.avatarGridSmall}>
                            <div className={styles.avatarAdd}>
                                <span className={styles.plus}>+</span>
                                <span>Добавить собственное</span>
                            </div>
                            <div className={styles.avatarImg} style={{ backgroundColor: '#eee' }}>👤</div>
                            <div className={styles.avatarImg} style={{ backgroundColor: '#ddd' }}>👤</div>
                        </div>
                    </div>
                </div>
            )}
        </div>

        <div className={styles.footer}>
           <button className={styles.cancelBtn} onClick={onClose}>Отмена</button>
           <button className={styles.createBtn} disabled>Создать</button>
        </div>
      </div>
    </div>
  )
}
