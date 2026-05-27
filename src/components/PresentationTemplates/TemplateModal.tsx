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
  const [templateType, setTemplateType] = useState<'generate' | 'copy'>('generate')

  const [description, setDescription] = useState('')
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [isOnHomepage, setIsOnHomepage] = useState(false)
  const [order, setOrder] = useState(0)

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
            <label>Description</label>
            <textarea 
              placeholder="Description" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={styles.inputField}
              rows={3}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Selected Project (Reference) *</label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className={styles.inputField}
            >
              <option value="">Select a project...</option>
              <option value="1">Q1 Marketing Campaign</option>
              <option value="2">Sales Enablement</option>
              <option value="3">Customer Support Bot</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.checkboxLabel}>
              <input 
                type="checkbox" 
                checked={isOnHomepage}
                onChange={(e) => setIsOnHomepage(e.target.checked)}
              />
              Show on Homepage
            </label>
          </div>

          {isOnHomepage && (
            <div className={styles.formGroup}>
              <label>Order on Homepage</label>
              <input 
                type="number" 
                placeholder="0" 
                value={order}
                onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
                className={styles.inputField}
              />
            </div>
          )}

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
              {TEMPLATE_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {!isEdit && (
            <div className={styles.dndZone}>
              <UploadCloud size={40} color="#3b82f6" />
              <p className={styles.dndLabel}>Drag and drop here or click "Browse"</p>
              <p className={styles.dndNotice}>PowerPoint files with animation are currently not supported</p>
              <p className={styles.dndHelper}>dnd_files_size</p>
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
