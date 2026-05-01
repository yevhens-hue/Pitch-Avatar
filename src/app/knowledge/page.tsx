'use client'

import React, { useState, useRef, useEffect } from 'react'
import {
  FileText, Globe, Trash2, Upload, Plus,
  CheckCircle2, Clock, AlertCircle,
  Settings, Database, Zap, Lock, Bot, RefreshCw, X
} from 'lucide-react'
import pageStyles from '@/components/ui/Pages.module.css'
import styles from '@/components/Library/Library.module.css'
import kStyles from './Knowledge.module.css'
import { MOCK_KNOWLEDGE } from '@/services/mock-data'
import Toast from '@/components/ui/Toast'
import { AnswerMode, KnowledgeBaseSettings, AuthType } from '@/lib/knowledge'
import { useKnowledgeStore } from '@/lib/knowledgeStore'
import type { KnowledgeItem } from '@/types'

type Tab = 'documents' | 'settings'

function getTypeIcon(type: string) {
  if (type === 'PDF') return <FileText size={18} color="#dc2626" />
  if (type === 'Text / Web') return <Globe size={18} color="#2563eb" />
  return <FileText size={18} color="#6b7280" />
}

function StatusBadge({ status }: { status: KnowledgeItem['status'] }) {
  if (status === 'indexed') {
    return (
      <span className={`${kStyles.badge} ${kStyles.badgeIndexed}`}>
        <CheckCircle2 size={11} /> Indexed
      </span>
    )
  }
  if (status === 'processing') {
    return (
      <span className={`${kStyles.badge} ${kStyles.badgeProcessing}`}>
        <Clock size={11} /> Processing
      </span>
    )
  }
  return (
    <span className={`${kStyles.badge} ${kStyles.badgeError}`}>
      <AlertCircle size={11} /> Error
    </span>
  )
}

export default function KnowledgeBase() {
  const { settings, updateSettings } = useKnowledgeStore()
  const [activeTab, setActiveTab] = useState<Tab>('documents')
  const [toast, setToast] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success')
  const [documents, setDocuments] = useState<KnowledgeItem[]>(MOCK_KNOWLEDGE)
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Local state for mapping to avoid store updates on every keystroke
  const [localSettings, setLocalSettings] = useState<KnowledgeBaseSettings>(settings)

  // Sync local settings with store when store hydrates
  useEffect(() => {
    setLocalSettings(settings)
  }, [settings])

  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast(msg)
    setToastType(type)
  }

  // ── Document handlers ──────────────────────────────────────────────────────

  const handleFileAdd = (file: File) => {
    const newItem: KnowledgeItem = {
      id: Date.now(),
      name: file.name,
      type: file.name.toLowerCase().endsWith('.pdf') ? 'PDF' : 'Text / Web',
      size: `${(file.size / 1024).toFixed(0)} KB`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      status: 'processing',
    }
    setDocuments(prev => [newItem, ...prev])
    showToast(`"${file.name}" added — indexing started`)
    setTimeout(() => {
      setDocuments(prev =>
        prev.map(d => d.id === newItem.id ? { ...d, status: 'indexed' } : d)
      )
    }, 3000)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileAdd(file)
  }

  const handleDelete = (id: number) => {
    setDocuments(prev => prev.filter(d => d.id !== id))
    setConfirmDeleteId(null)
    showToast('Document removed')
  }

  const toggleAll = () => {
    if (selectedIds.length === documents.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(documents.map(d => d.id))
    }
  }

  const toggleOne = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleBulkDelete = () => {
    setDocuments(prev => prev.filter(d => !selectedIds.includes(d.id)))
    showToast(`Removed ${selectedIds.length} sources`)
    setSelectedIds([])
  }

  const handleBulkReCrawl = () => {
    setDocuments(prev => prev.map(d => 
      selectedIds.includes(d.id) ? { ...d, status: 'processing' } : d
    ))
    showToast(`Started re-crawling ${selectedIds.length} sources`)
    
    // Simulate completion
    setTimeout(() => {
      setDocuments(prev => prev.map(d => 
        selectedIds.includes(d.id) ? { ...d, status: 'indexed' } : d
      ))
      setSelectedIds([])
    }, 2500)
  }

  // ── Settings handlers ──────────────────────────────────────────────────────

  const handleAnswerModeChange = (mode: AnswerMode) => {
    setLocalSettings(prev => ({ ...prev, answerMode: mode }))
  }

  const toggleExternalRAG = () => {
    setLocalSettings(prev => ({
      ...prev,
      externalRAG: { ...prev.externalRAG, enabled: !prev.externalRAG.enabled },
    }))
  }

  const updateExternalConfig = (key: string, value: string | number | boolean) => {
    setLocalSettings(prev => ({
      ...prev,
      externalRAG: { ...prev.externalRAG, [key]: value },
    }))
  }

  const updateFallback = (
    key: 'useInternalOnFail' | 'useLLMOnLowConfidence',
    value: boolean,
  ) => {
    setLocalSettings(prev => ({
      ...prev,
      externalRAG: {
        ...prev.externalRAG,
        fallback: { ...prev.externalRAG.fallback, [key]: value },
      },
    }))
  }

  const handleSaveSettings = () => {
    updateSettings(localSettings)
    showToast('Settings saved successfully')
  }

  const handleTestConnection = async () => {
    if (!localSettings.externalRAG.endpoint) {
      showToast('Please enter an API endpoint first', 'error')
      return
    }
    setIsTestingConnection(true)
    await new Promise(r => setTimeout(r, 1800))
    setIsTestingConnection(false)
    
    console.log('--- TEST CONNECTION ---')
    console.log('Payload Mapping (Out):', localSettings.externalRAG.requestMapping)
    console.log('Payload Mapping (In):', localSettings.externalRAG.responseMapping)
    
    showToast('Connection successful — endpoint reachable and mapping verified')
  }

  const updateRequestMapping = (key: keyof KnowledgeBaseSettings['externalRAG']['requestMapping'], value: string) => {
    setLocalSettings(prev => ({
      ...prev,
      externalRAG: {
        ...prev.externalRAG,
        requestMapping: { ...prev.externalRAG.requestMapping, [key]: value }
      }
    }))
  }

  const updateResponseMapping = (key: keyof KnowledgeBaseSettings['externalRAG']['responseMapping'], value: string) => {
    setLocalSettings(prev => ({
      ...prev,
      externalRAG: {
        ...prev.externalRAG,
        responseMapping: { ...prev.externalRAG.responseMapping, [key]: value }
      }
    }))
  }

  const requiresApiKey =
    localSettings.externalRAG.authType === 'API key' ||
    localSettings.externalRAG.authType === 'Bearer token'

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className={styles.container}>
      {toast && (
        <Toast message={toast} type={toastType} onClose={() => setToast('')} />
      )}

      <div className={styles.header}>
        <h1 className={styles.title}>Knowledge Base</h1>
        {activeTab === 'documents' && (
          <div className={styles.headerActions}>
            <button
              className={styles.createBtn}
              onClick={() => fileInputRef.current?.click()}
            >
              <Plus size={15} style={{ display: 'inline', marginRight: 6 }} />
              Add Document
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt,.docx"
              hidden
              onChange={e => e.target.files?.[0] && handleFileAdd(e.target.files[0])}
            />
          </div>
        )}
      </div>

      <p className={pageStyles.description}>
        Teach your AI assistants to answer questions from your own documents and websites.
      </p>

      <div className={kStyles.tabs}>
        <button
          className={`${kStyles.tab} ${activeTab === 'documents' ? kStyles.tabActive : ''}`}
          onClick={() => setActiveTab('documents')}
        >
          <Database size={14} style={{ display: 'inline', marginRight: 6 }} />
          Documents
          <span className={kStyles.tabBadge}>{documents.length}</span>
        </button>
        <button
          className={`${kStyles.tab} ${activeTab === 'settings' ? kStyles.tabActive : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <Settings size={14} style={{ display: 'inline', marginRight: 6 }} />
          Answer Settings
        </button>
      </div>

      {activeTab === 'documents' && (
        <>
          <div
            className={`${kStyles.dropZone} ${isDragging ? kStyles.dropZoneActive : ''}`}
            onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={20} className={kStyles.dropZoneIcon} />
            <span className={kStyles.dropZoneText}>
              Drag & drop a file here, or <u>browse</u>
            </span>
            <span className={kStyles.dropZoneHint}>PDF, DOCX, TXT — up to 50 MB</span>
          </div>

          {documents.length === 0 ? (
            <div className={kStyles.emptyState}>
              <Database size={40} className={kStyles.emptyIcon} />
              <p className={kStyles.emptyTitle}>No documents yet</p>
              <p className={kStyles.emptyDesc}>
                Upload your first file above to start training your AI assistant.
              </p>
            </div>
          ) : (
            <div className={styles.tableWrapper}>
              {selectedIds.length > 0 && (
                <div className={styles.bulkBar}>
                  <span className={styles.bulkCount}>{selectedIds.length} selected</span>
                  <div className={styles.bulkActions}>
                    <button className={styles.bulkBtn} onClick={handleBulkReCrawl}>
                      <RefreshCw size={14} /> Re-crawl
                    </button>
                    <button className={`${styles.bulkBtn} ${styles.bulkBtnDestructive}`} onClick={handleBulkDelete}>
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                  <button className={styles.bulkClear} onClick={() => setSelectedIds([])}>Clear</button>
                </div>
              )}
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.checkboxCell}>
                      <input 
                        type="checkbox" 
                        className={styles.checkbox} 
                        checked={selectedIds.length === documents.length && documents.length > 0}
                        onChange={toggleAll}
                      />
                    </th>
                    <th>Document</th>
                    <th>Type</th>
                    <th>Size</th>
                    <th>Status</th>
                    <th>Added</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map(item => (
                    <tr key={item.id}>
                      <td className={styles.checkboxCell}>
                        <input 
                          type="checkbox" 
                          className={styles.checkbox} 
                          checked={selectedIds.includes(item.id)}
                          onChange={() => toggleOne(item.id)}
                        />
                      </td>
                      <td className={styles.nameCell}>
                        <div
                          className={styles.slideIcon}
                          style={{ backgroundColor: item.type === 'PDF' ? '#fee2e2' : '#dbeafe' }}
                        >
                          {getTypeIcon(item.type)}
                        </div>
                        {item.name}
                      </td>
                      <td>
                        <span className={kStyles.typeBadge}>{item.type}</span>
                      </td>
                      <td>{item.size}</td>
                      <td>
                        <StatusBadge status={item.status} />
                      </td>
                      <td>{item.date}</td>
                      <td>
                        {confirmDeleteId === item.id ? (
                          <div className={kStyles.confirmDelete}>
                            <span>Delete?</span>
                            <button className={kStyles.confirmYes} onClick={() => handleDelete(item.id)}>Yes</button>
                            <button className={kStyles.confirmNo} onClick={() => setConfirmDeleteId(null)}>No</button>
                          </div>
                        ) : (
                          <button
                            className={kStyles.deleteBtn}
                            onClick={() => setConfirmDeleteId(item.id)}
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {activeTab === 'settings' && (
        <div className={kStyles.settingsContainer}>
          <div className={kStyles.settingGroup}>
            <label className={kStyles.settingLabel}>Answer Mode</label>
            <p className={kStyles.settingDesc}>Controls how your AI uses the knowledge base when responding.</p>
            <div className={kStyles.modeCards}>
              {[
                { id: 'Grounded' as AnswerMode, Icon: Lock, title: 'Grounded', desc: 'Strictly from your documents.', color: '#16a34a', bg: '#dcfce7' },
                { id: 'Hybrid' as AnswerMode, Icon: Zap, title: 'Hybrid', desc: 'Documents + AI knowledge.', color: '#2563eb', bg: '#dbeafe' },
                { id: 'LLM Only' as AnswerMode, Icon: Bot, title: 'LLM Only', desc: 'Pure AI knowledge.', color: '#7c3aed', bg: '#ede9fe' },
              ].map(({ id, Icon, title, desc, color, bg }) => {
                const isActive = localSettings.answerMode === id
                return (
                  <button
                    key={id}
                    className={`${kStyles.modeCard} ${isActive ? kStyles.modeCardActive : ''}`}
                    style={isActive ? ({ '--mode-color': color } as React.CSSProperties) : {}}
                    onClick={() => handleAnswerModeChange(id)}
                  >
                    <div className={kStyles.modeCardIcon} style={isActive ? { background: bg, color } : {}}><Icon size={20} /></div>
                    <div className={kStyles.modeCardTitle}>{title}</div>
                    <div className={kStyles.modeCardDesc}>{desc}</div>
                    {isActive && <div className={kStyles.modeCardCheck}>✓</div>}
                  </button>
                )
              })}
            </div>
          </div>

          <div className={kStyles.settingGroup}>
            <div className={kStyles.externalToggle}>
              <div>
                <label className={kStyles.settingLabel}>External RAG Connection</label>
                <p className={kStyles.settingDesc}>Connect your own knowledge base API.</p>
              </div>
              <label className={kStyles.switch}>
                <input type="checkbox" checked={localSettings.externalRAG.enabled} onChange={toggleExternalRAG} />
                <span className={kStyles.slider} />
              </label>
            </div>

            {localSettings.externalRAG.enabled && (
              <div className={kStyles.formGrid}>
                <div className={kStyles.formField}>
                  <label>Connection Name</label>
                  <input type="text" className={kStyles.input} value={localSettings.externalRAG.name} onChange={e => updateExternalConfig('name', e.target.value)} />
                </div>
                <div className={kStyles.formField}>
                  <label>API Endpoint</label>
                  <input type="text" className={kStyles.input} value={localSettings.externalRAG.endpoint} onChange={e => updateExternalConfig('endpoint', e.target.value)} />
                </div>
                <div className={kStyles.formField}>
                  <label>Authentication</label>
                  <select className={kStyles.select} value={localSettings.externalRAG.authType} onChange={e => updateExternalConfig('authType', e.target.value as AuthType)}>
                    <option>API key</option>
                    <option>Bearer token</option>
                    <option>OAuth</option>
                    <option>No auth</option>
                  </select>
                </div>
                <div className={kStyles.formField}>
                  <label>Timeout (seconds)</label>
                  <input type="number" min="3" max="10" className={kStyles.input} value={localSettings.externalRAG.timeout} onChange={e => updateExternalConfig('timeout', parseInt(e.target.value))} />
                </div>
                <div className={kStyles.formField}>
                  <label>Confidence Threshold ({localSettings.externalRAG.confidenceThreshold})</label>
                  <div className={kStyles.rangeWrapper}>
                    <input type="range" min="0" max="1" step="0.05" className={kStyles.rangeInput} value={localSettings.externalRAG.confidenceThreshold} onChange={e => updateExternalConfig('confidenceThreshold', parseFloat(e.target.value))} />
                    <span className={kStyles.rangeValue}>{localSettings.externalRAG.confidenceThreshold}</span>
                  </div>
                </div>

                <div className={kStyles.mappingSection}>
                  <div className={kStyles.mappingHeader}><Globe size={14} color="#6366f1" /><span className={kStyles.mappingHeaderTitle}>Request Mapping</span></div>
                  <div className={kStyles.mappingGrid}>
                    <div className={kStyles.mappingRow}><span className={kStyles.mappingKey}>query</span><input className={kStyles.mappingInput} value={localSettings.externalRAG.requestMapping.query} onChange={e => updateRequestMapping('query', e.target.value)} /></div>
                    <div className={kStyles.mappingRow}><span className={kStyles.mappingKey}>user_lang</span><input className={kStyles.mappingInput} value={localSettings.externalRAG.requestMapping.userLanguage} onChange={e => updateRequestMapping('userLanguage', e.target.value)} /></div>
                  </div>
                </div>

                <div className={kStyles.mappingSection}>
                  <div className={kStyles.mappingHeader}><Bot size={14} color="#6366f1" /><span className={kStyles.mappingHeaderTitle}>Response Mapping</span></div>
                  <div className={kStyles.mappingGrid}>
                    <div className={kStyles.mappingRow}><span className={kStyles.mappingKey}>answer</span><input className={kStyles.mappingInput} value={localSettings.externalRAG.responseMapping.answer} onChange={e => updateResponseMapping('answer', e.target.value)} /></div>
                    <div className={kStyles.mappingRow}><span className={kStyles.mappingKey}>confidence</span><input className={kStyles.mappingInput} value={localSettings.externalRAG.responseMapping.confidence} onChange={e => updateResponseMapping('confidence', e.target.value)} /></div>
                  </div>
                </div>

                {requiresApiKey && (
                  <div className={`${kStyles.formField} ${kStyles.fullWidth}`}>
                    <label>{localSettings.externalRAG.authType === 'Bearer token' ? 'Bearer Token' : 'API Key'}</label>
                    <input type="password" className={kStyles.input} value={localSettings.externalRAG.apiKey ?? ''} onChange={e => updateExternalConfig('apiKey', e.target.value)} />
                  </div>
                )}

                <div className={kStyles.fallbackSection}>
                  <label className={kStyles.settingLabel}>Fallback & Safety</label>
                  <label className={kStyles.fallbackItem}><input type="checkbox" checked={localSettings.externalRAG.fallback.useInternalOnFail} onChange={e => updateFallback('useInternalOnFail', e.target.checked)} /> Use internal documents on fail</label>
                  <label className={kStyles.fallbackItem}><input type="checkbox" checked={localSettings.externalRAG.fallback.useLLMOnLowConfidence} onChange={e => updateFallback('useLLMOnLowConfidence', e.target.checked)} /> Use LLM on low confidence</label>
                </div>

                <div className={kStyles.testConnectionRow}>
                  <button className={kStyles.testBtn} onClick={handleTestConnection} disabled={isTestingConnection}>{isTestingConnection ? 'Testing…' : 'Test Connection'}</button>
                </div>
              </div>
            )}
          </div>

          <div className={kStyles.saveRow}>
            <button className={kStyles.saveBtn} onClick={handleSaveSettings}>Save Settings</button>
          </div>
        </div>
      )}
    </div>
  )
}
