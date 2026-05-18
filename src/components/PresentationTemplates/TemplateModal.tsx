'use client'

import React, { useState, useEffect } from 'react'
import { X, UploadCloud } from 'lucide-react'
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
  const [templateType, setTemplateType] = useState(TEMPLATE_TYPES[0])

  const isEdit = !!template

  useEffect(() => {
    if (isOpen) {
      if (template) {
        setName(template.name)
        setProductType(template.productTypes[0] || PRODUCT_TYPES[0])
        setTemplateType(template.templateType || TEMPLATE_TYPES[0])
      } else {
        setName('')
        setProductType(PRODUCT_TYPES[0])
        setTemplateType(TEMPLATE_TYPES[0])
      }
    }
  }, [isOpen, template])

  if (!isOpen) return null

  const handleSave = () => {
    onSave({
      id: template?.id || Math.random().toString(36).substr(2, 9),
      name,
      productTypes: [productType],
      accessType: 'system',
      templateType,
      createdAt: template?.createdAt || new Date().toLocaleString('ru-RU'),
    })
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
            <label>Название *</label>
            <input 
              type="text" 
              placeholder="Название" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={styles.inputField}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Типы продуктов *</label>
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
            <label>Тип доступа *</label>
            <select disabled className={styles.inputField}>
              <option value="system">system</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Тип шаблона *</label>
            <select 
              value={templateType}
              onChange={(e) => setTemplateType(e.target.value)}
              className={styles.inputField}
            >
              {TEMPLATE_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {!isEdit && (
            <div className={styles.dndZone}>
              <UploadCloud size={40} color="#3b82f6" />
              <p className={styles.dndLabel}>Перетащите сюда или нажмите "Обзор"</p>
              <p className={styles.dndNotice}>Файлы PowerPoint с анимацией в настоящее время не поддерживаются</p>
              <p className={styles.dndHelper}>dnd_files_size</p>
            </div>
          )}
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.btnCancel} onClick={onClose}>ОТМЕНА</button>
          <button 
            className={styles.btnSave} 
            onClick={handleSave}
            disabled={!name.trim()}
          >
            СОХРАНИТЬ
          </button>
        </div>
      </div>
    </div>
  )
}
