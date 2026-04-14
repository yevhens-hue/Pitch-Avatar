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
        
        <h2 className={styles.title}>Create New Presentation</h2>
        
        <div className={styles.formGroup}>
          <input type="text" placeholder="Presentation Name" className={styles.input} />
        </div>

        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${activeTab === 'file' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('file')}
          >
            Upload File
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'video' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('video')}
          >
            Upload Video
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'scratch' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('scratch')}
          >
            Start from scratch
          </button>
        </div>

        {activeTab === 'video' ? (
          <div className={styles.videoUploadSection}>
             <input type="text" placeholder="YouTube Link" className={styles.input} />
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
                          {videoUpload.file ? videoUpload.file.name : 'Drag & drop files here'}
                        </p>
                        <label className={styles.dropBtn}>
                          or click to choose
                          <input type="file" hidden accept=".mp4" onChange={videoUpload.handleFileChange} />
                        </label>
                    </div>
                    <div className={styles.divider}></div>
                    <div className={styles.rightDrop}>
                        <p className={styles.dropTitle}>Choose from</p>
                        <div className={styles.googleDrive}>
                            <span className={styles.driveIcon}>▲</span>
                            Google Drive
                        </div>
                    </div>
                </div>
             </div>
             <p className={styles.helperText}>
                Upload .mp4 video up to 500 MB and up to 5 minutes duration
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
                       {fileUpload.file ? fileUpload.file.name : 'Drag & drop files here'}
                     </p>
                     <label className={styles.dropBtn}>
                       or click to choose
                       <input type="file" hidden accept=".pdf,.ppt,.pptx" onChange={fileUpload.handleFileChange} />
                     </label>
                  </div>
                  <div className={styles.divider}></div>
                  <div className={styles.rightDrop}>
                     <p className={styles.dropTitle}>Choose from</p>
                     <div className={styles.googleDrive}>
                        <span className={styles.driveIcon}>▲</span>
                        Google Drive
                     </div>
                  </div>
               </div>
            </div>
            <p className={styles.helperText}>
                Upload .pdf, .ppt or .pptx file up to 100 MB, containing no more than 100 slides
            </p>
          </div>
        )}

        <div className={styles.advancedWrapper}>
            <button className={styles.advancedToggle} onClick={() => setShowAdvanced(!showAdvanced)}>
                Advanced Settings {showAdvanced ? '▲' : '▼'}
            </button>
            
            {showAdvanced && (
                <div className={styles.advancedList}>
                    <div className={styles.advancedItemHeader}>
                        <span>Presentation Goals</span>
                        <div className={styles.toggle}></div>
                    </div>

                    <div className={styles.sectionDivider}></div>
                    
                    <div className={styles.advancedItemHeader}>
                        <span>Text Script Settings</span>
                        <div className={styles.toggleActive}></div>
                    </div>
                    
                    <div className={styles.subSection}>
                        <div className={styles.subTabs}>
                            <button className={styles.subTabActive}>Generate Script</button>
                            <button className={styles.subTab}>Notes</button>
                        </div>
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label>Language</label>
                                <select className={styles.select}><option>English</option></select>
                            </div>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Word Count in Script</label>
                            <input type="text" className={styles.inputSmall} defaultValue="30" />
                        </div>
                    </div>

                    <div className={styles.sectionDivider}></div>

                    <div className={styles.advancedItemHeader}>
                        <span>AI Video Avatar & Voice Settings</span>
                        <div className={styles.toggleActive}></div>
                    </div>

                    <div className={styles.subSection}>
                        <div className={styles.formGroup}>
                            <label>Select Option</label>
                            <select className={styles.select}><option>Avatar Generation</option></select>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Available on</label>
                            <select className={styles.select}><option>Avatar on First Slide</option></select>
                        </div>

                        <h4 className={styles.innerTitle}>Voice</h4>
                        <div className={styles.subTabs}>
                            <button className={styles.subTabActive}>AI Library</button>
                            <button className={styles.subTab}>Cloned Voices</button>
                        </div>

                        <div className={styles.formGroup}>
                           <label>Accent</label>
                           <select className={styles.select}><option>English (United Kingdom)</option></select>
                        </div>
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label>Voice Style *</label>
                                <select className={styles.select}><option>Libby</option></select>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Mood *</label>
                                <select className={styles.select}><option>friendly</option></select>
                            </div>
                        </div>

                        <h4 className={styles.innerTitle}>AI Avatar</h4>
                        <div className={styles.avatarGridSmall}>
                            <div className={styles.avatarAdd}>
                                <span className={styles.plus}>+</span>
                                <span>Add Your Own</span>
                            </div>
                            <div className={styles.avatarImg} style={{ backgroundColor: '#eee' }}>👤</div>
                            <div className={styles.avatarImg} style={{ backgroundColor: '#ddd' }}>👤</div>
                        </div>
                    </div>
                </div>
            )}
        </div>

        <div className={styles.footer}>
           <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
           <button className={styles.createBtn} disabled>Create</button>
        </div>
      </div>
    </div>
  )
}
