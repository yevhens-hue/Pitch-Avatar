'use client'

import React, { useState, useEffect, useRef } from 'react'
import { X, UploadCloud, Info } from 'lucide-react'
import { PresentationTemplate, PRODUCT_TYPES, TEMPLATE_TYPES } from '@/data/presentation-templates'
import styles from './TemplateModal.module.css'

interface TemplateModalProps {
  isOpen: boolean
  onClose: () => void
  template?: PresentationTemplate | null
  onSave: (template: Partial<PresentationTemplate>) => void
}

export default function TemplateModal({ isOpen, onClose, template, onSave }: TemplateModalProps) {
  const [name, setName] = useState('')
  const [productType, setProductType] = useState(PRODUCT_TYPES[0])
  const [templateType, setTemplateType] = useState<'generate' | 'copy'>('generate')

  const [description, setDescription] = useState('')
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [isOnHomepage, setIsOnHomepage] = useState(false)
  const [order, setOrder] = useState(0)

  const [file, setFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isEdit = !!template

  useEffect(() => {
    if (isOpen) {
      if (template) {
        setName(template.name)
        setDescription(template.description || '')
        setSelectedProjectId(template.selectedProjectId || '')
        setIsOnHomepage(template.isOnHomepage || false)
        setOrder(template.order || 0)
        setProductType(template.productTypes[0] || PRODUCT_TYPES[0])
        setTemplateType((template.templateType || TEMPLATE_TYPES[0]) as 'generate' | 'copy')
      } else {
        setName('')
        setDescription('')
        setSelectedProjectId('')
        setIsOnHomepage(false)
        setOrder(0)
        setProductType(PRODUCT_TYPES[0])
        setTemplateType('generate')
      }
    }
  }, [isOpen, template])

  if (!isOpen) return null

  const handleSave = () => {
    onSave({
      id: template?.id || Math.random().toString(36).substr(2, 9),
      name,
      description,
      selectedProjectId,
      isOnHomepage,
      order,
      productTypes: [productType],
      accessType: 'system',
      templateType,
      createdAt: template?.createdAt || new Date().toLocaleString('en-US'),
    })
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0])
    }
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>add_content_btn</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} color="#64748b" />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.formGroup}>
            <label>Name *</label>
            <input 
              type="text" 
              placeholder="Name" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={styles.inputField}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Product Types *</label>
            <select 
              value={productType}
              onChange={(e) => setProductType(e.target.value)}
              className={styles.inputField}
            >
              {PRODUCT_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Access Type *</label>
            <select disabled className={styles.inputField}>
              <option value="system">system</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Template Type *</label>
            <select 
              value={templateType}
              onChange={(e) => setTemplateType(e.target.value as 'generate' | 'copy')}
              className={styles.inputField}
            >
              <option value="generate">To generate</option>
              {TEMPLATE_TYPES.filter(t => t !== 'generate').map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {!isEdit && (
            <div 
              className={styles.dndZone}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <h3 className={styles.dndTitle}>Drag and drop here or click "Browse"</h3>
              <UploadCloud size={100} color="#3b82f6" />
              <p className={styles.dndHelper}>dnd_files_size</p>
              
              <div className={styles.dndNotice}>
                <Info size={16} />
                <span>PowerPoint files with animation are currently not supported</span>
              </div>
              
              <input 
                type="file" 
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <button className={styles.btnBrowse} onClick={() => fileInputRef.current?.click()}>
                Browse
              </button>
              {file && <p className={styles.fileName}>{file.name}</p>}
            </div>
          )}
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.btnCancel} onClick={onClose}>CANCEL</button>
          <button 
            className={styles.btnSave} 
            onClick={handleSave}
            disabled={!name.trim()}
          >
            SAVE
          </button>
        </div>
      </div>
    </div>
  )
}
