'use client'

import React from 'react'
import styles from '@/components/Library/Library.module.css'
import pageStyles from '@/components/ui/Pages.module.css'
import kStyles from './Knowledge.module.css'
import { MOCK_KNOWLEDGE } from '@/services/mock-data'
import Toast from '@/components/ui/Toast'
import { AnswerMode, KnowledgeBaseSettings, DEFAULT_SETTINGS, AuthType } from '@/lib/knowledge'

export default function KnowledgeBase() {
  const [toast, setToast] = React.useState('')
  const [settings, setSettings] = React.useState<KnowledgeBaseSettings>(DEFAULT_SETTINGS)

  const handleAnswerModeChange = (mode: AnswerMode) => {
    setSettings({ ...settings, answerMode: mode })
    setToast(`Answer mode changed to ${mode}`)
  }

  const toggleExternalRAG = () => {
    setSettings({
      ...settings,
      externalRAG: { ...settings.externalRAG, enabled: !settings.externalRAG.enabled }
    })
  }

  const updateExternalConfig = (key: string, value: any) => {
    setSettings({
      ...settings,
      externalRAG: { ...settings.externalRAG, [key]: value }
    })
  }

  const updateFallback = (key: 'useInternalOnFail' | 'useLLMOnLowConfidence', value: boolean) => {
    setSettings({
      ...settings,
      externalRAG: {
        ...settings.externalRAG,
        fallback: { ...settings.externalRAG.fallback, [key]: value }
      }
    })
  }

  return (
    <div className={styles.container}>
      {toast && <Toast message={toast} onClose={() => setToast('')} />}
      <div className={styles.header}>
        <h1 className={styles.title}>Knowledge Base</h1>
        <div className={styles.headerActions}>
          <button className={styles.createBtn} id="stonly-knowledge-website-btn" onClick={() => setToast('Website indexing will be available in the next release!')}>+ Text / Website</button>
          <button className={styles.createBtn} id="stonly-knowledge-upload-btn" onClick={() => setToast('File upload will be available soon!')}>+ Upload File</button>
        </div>
      </div>

      <p className={pageStyles.description}>
        The Knowledge Base allows your AI assistants to answer questions based on your own documents and websites.
      </p>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Document Name</th>
              <th>Type</th>
              <th>Size</th>
              <th>Uploaded</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_KNOWLEDGE.map((item) => (
              <tr key={item.id}>
                <td className={styles.nameCell}>
                  <div className={styles.slideIcon} style={{ backgroundColor: '#e0e7ff' }}>📚</div>
                  {item.name}
                </td>
                <td>{item.type}</td>
                <td>{item.size}</td>
                <td>{item.date}</td>
                <td>
                  <button className={styles.gearBtn} aria-label="Delete document" title="Delete">🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={kStyles.settingsContainer}>
        <h2 className={kStyles.sectionTitle}>
          <span>⚙️</span> Answer Generation Settings
        </h2>

        <div className={kStyles.settingGroup}>
          <label className={kStyles.settingLabel}>Answer Mode</label>
          <div className={kStyles.radioGroup}>
            {[
              { id: 'Grounded', title: 'Grounded', desc: 'Answers only from RAG sources' },
              { id: 'Hybrid', title: 'Hybrid', desc: 'Combines RAG with LLM knowledge' },
              { id: 'LLM Only', title: 'LLM Only', desc: 'General LLM response' }
            ].map((mode) => (
              <label 
                key={mode.id} 
                className={`${kStyles.radioOption} ${settings.answerMode === mode.id ? kStyles.radioSelected : ''}`}
              >
                <input 
                  type="radio" 
                  name="answerMode" 
                  checked={settings.answerMode === mode.id}
                  onChange={() => handleAnswerModeChange(mode.id as AnswerMode)}
                />
                <div className={kStyles.optionText}>
                  <span className={kStyles.optionTitle}>{mode.title}</span>
                  <span className={kStyles.optionDesc}>{mode.desc}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className={kStyles.settingGroup}>
          <div className={kStyles.externalToggle}>
            <div>
              <label className={kStyles.settingLabel} style={{ marginBottom: 4 }}>External RAG Connection</label>
              <p className={kStyles.optionDesc}>Connect to your own knowledge base API</p>
            </div>
            <label className={kStyles.switch}>
              <input type="checkbox" checked={settings.externalRAG.enabled} onChange={toggleExternalRAG} />
              <span className={kStyles.slider}></span>
            </label>
          </div>

          {settings.externalRAG.enabled && (
            <div className={kStyles.formGrid}>
              <div className={kStyles.formField}>
                <label>Connection Name</label>
                <input 
                  type="text" 
                  className={kStyles.input} 
                  placeholder="e.g. Client Support RAG"
                  value={settings.externalRAG.name}
                  onChange={(e) => updateExternalConfig('name', e.target.value)}
                />
              </div>
              <div className={kStyles.formField}>
                <label>API Endpoint</label>
                <input 
                  type="text" 
                  className={kStyles.input} 
                  placeholder="https://api.yourdomain.com/rag"
                  value={settings.externalRAG.endpoint}
                  onChange={(e) => updateExternalConfig('endpoint', e.target.value)}
                />
              </div>
              <div className={kStyles.formField}>
                <label>Authentication</label>
                <select 
                  className={kStyles.select}
                  value={settings.externalRAG.authType}
                  onChange={(e) => updateExternalConfig('authType', e.target.value as AuthType)}
                >
                  <option>API key</option>
                  <option>Bearer token</option>
                  <option>OAuth</option>
                  <option>No auth</option>
                </select>
              </div>
              <div className={kStyles.formField}>
                <label>Timeout (seconds)</label>
                <input 
                  type="number" 
                  min="3" 
                  max="10" 
                  className={kStyles.input}
                  value={settings.externalRAG.timeout}
                  onChange={(e) => updateExternalConfig('timeout', parseInt(e.target.value))}
                />
              </div>

              <div className={kStyles.fallbackSection}>
                <label className={kStyles.settingLabel}>Fallback & Safety</label>
                <label className={kStyles.fallbackItem}>
                  <input 
                    type="checkbox" 
                    checked={settings.externalRAG.fallback.useInternalOnFail}
                    onChange={(e) => updateFallback('useInternalOnFail', e.target.checked)}
                  />
                  Use internal RAG if external connection fails
                </label>
                <label className={kStyles.fallbackItem}>
                  <input 
                    type="checkbox" 
                    checked={settings.externalRAG.fallback.useLLMOnLowConfidence}
                    onChange={(e) => updateFallback('useLLMOnLowConfidence', e.target.checked)}
                  />
                  Allow LLM knowledge if RAG confidence is below threshold
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
