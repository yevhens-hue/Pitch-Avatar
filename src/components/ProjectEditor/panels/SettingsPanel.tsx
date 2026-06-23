'use client'

import React, { useState } from 'react'
import { ChevronDown, Info } from 'lucide-react'
import styles from './SettingsPanel.module.css'

const LANGUAGES = ['English', 'Spanish', 'German', 'French', 'Italian', 'Portuguese', 'Polish', 'Ukrainian', 'Russian']

interface SettingsPanelProps {
  projectId?: string
  projectTitle?: string
  projectType?: string
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  projectTitle = 'Untitled Project',
  projectType,
}) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)
  const isAvatarProject = projectType === 'chat-avatar' || projectType === 'assistant' || projectType === 'widget'

  // Basic settings
  const [name, setName] = useState(projectTitle)
  const [language, setLanguage] = useState('English')
  const [author, setAuthor] = useState('')

  // Avatar-specific toggles
  const [avatarAsVideo, setAvatarAsVideo] = useState(true)
  const [speaksAloud, setSpeaksAloud] = useState(true)
  const [voiceQuestions, setVoiceQuestions] = useState(true)

  // Access settings
  const [accessType, setAccessType] = useState<'public' | 'private' | 'password'>('public')
  const [password, setPassword] = useState('')
  const [allowDownload, setAllowDownload] = useState(false)
  const [showBranding, setShowBranding] = useState(true)

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h2 className={styles.panelTitle}>Settings</h2>
        <p className={styles.panelSubtitle}>Project configuration and access parameters.</p>
      </div>

      <div className={styles.panelBody}>
        {/* ── General section ── */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>General</h3>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="settings-project-name">Project Name</label>
            <input
              id="settings-project-name"
              className={styles.input}
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter project name"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="settings-language">Language</label>
            <div className={styles.selectWrap}>
              <select
                id="settings-language"
                className={styles.select}
                value={language}
                onChange={e => setLanguage(e.target.value)}
              >
                {LANGUAGES.map(l => <option key={l}>{l}</option>)}
              </select>
              <ChevronDown size={16} className={styles.selectIcon} />
            </div>
          </div>
        </div>

        {/* ── Avatar toggles (only for avatar projects) ── */}
        {isAvatarProject && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Avatar Behavior</h3>

            <div className={styles.toggleField}>
              <div className={styles.toggleInfo}>
                <span className={styles.toggleName}>Avatar displays as video</span>
                <Info size={13} className={styles.infoIcon} />
              </div>
              <button
                className={`${styles.toggle} ${avatarAsVideo ? styles.toggleOn : ''}`}
                onClick={() => setAvatarAsVideo(v => !v)}
                role="switch"
                aria-checked={avatarAsVideo}
                id="settings-avatar-video-toggle"
              >
                <span className={styles.toggleKnob} />
              </button>
            </div>

            <div className={styles.toggleField}>
              <div className={styles.toggleInfo}>
                <span className={styles.toggleName}>Avatar speaks response aloud</span>
                <Info size={13} className={styles.infoIcon} />
              </div>
              <button
                className={`${styles.toggle} ${speaksAloud ? styles.toggleOn : ''}`}
                onClick={() => setSpeaksAloud(v => !v)}
                role="switch"
                aria-checked={speaksAloud}
                id="settings-speaks-aloud-toggle"
              >
                <span className={styles.toggleKnob} />
              </button>
            </div>

            <div className={styles.toggleField}>
              <div className={styles.toggleInfo}>
                <span className={styles.toggleName}>Users can ask questions by voice</span>
                <Info size={13} className={styles.infoIcon} />
              </div>
              <button
                className={`${styles.toggle} ${voiceQuestions ? styles.toggleOn : ''}`}
                onClick={() => setVoiceQuestions(v => !v)}
                role="switch"
                aria-checked={voiceQuestions}
                id="settings-voice-questions-toggle"
              >
                <span className={styles.toggleKnob} />
              </button>
            </div>
          </div>
        )}

        {/* ── Access section ── */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Access</h3>

          <div className={styles.field}>
            <label className={styles.label}>Visibility</label>
            <div className={styles.radioGroup}>
              {(['public', 'private', 'password'] as const).map(opt => (
                <label key={opt} className={styles.radioLabel} htmlFor={`access-${opt}`}>
                  <input
                    type="radio"
                    id={`access-${opt}`}
                    name="access"
                    value={opt}
                    checked={accessType === opt}
                    onChange={() => setAccessType(opt)}
                    className={styles.radio}
                  />
                  <span className={styles.radioText}>
                    {opt === 'public' ? '🌐 Public' : opt === 'private' ? '🔒 Private' : '🔑 Password protected'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {accessType === 'password' && (
            <div className={styles.field}>
              <label className={styles.label} htmlFor="settings-password">Password</label>
              <input
                id="settings-password"
                type="password"
                className={styles.input}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter access password"
              />
            </div>
          )}

          <div className={styles.toggleField}>
            <div className={styles.toggleInfo}>
              <span className={styles.toggleName}>Allow download</span>
            </div>
            <button
              className={`${styles.toggle} ${allowDownload ? styles.toggleOn : ''}`}
              onClick={() => setAllowDownload(v => !v)}
              role="switch"
              aria-checked={allowDownload}
              id="settings-allow-download-toggle"
            >
              <span className={styles.toggleKnob} />
            </button>
          </div>

          <div className={styles.toggleField}>
            <div className={styles.toggleInfo}>
              <span className={styles.toggleName}>Show branding</span>
            </div>
            <button
              className={`${styles.toggle} ${showBranding ? styles.toggleOn : ''}`}
              onClick={() => setShowBranding(v => !v)}
              role="switch"
              aria-checked={showBranding}
              id="settings-show-branding-toggle"
            >
              <span className={styles.toggleKnob} />
            </button>
          </div>
        </div>

        {/* ── Advanced toggle ── */}
        <button
          className={styles.advancedToggle}
          onClick={() => setIsAdvancedOpen(v => !v)}
          id="settings-advanced-toggle"
        >
          <ChevronDown
            size={16}
            className={`${styles.advancedChevron} ${isAdvancedOpen ? styles.advancedChevronOpen : ''}`}
          />
          Advanced {isAdvancedOpen ? '' : '(2)'}
        </button>

        {isAdvancedOpen && (
          <div className={styles.advancedSection}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="settings-author">Author</label>
              <input
                id="settings-author"
                className={styles.input}
                value={author}
                onChange={e => setAuthor(e.target.value)}
                placeholder="Your name or organization"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Slide Icon</label>
              <div className={styles.iconUploadBox}>
                <span className={styles.iconUploadIcon}>🖼</span>
                <span className={styles.iconUploadText}>Click to upload icon (PNG, 64×64px)</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SettingsPanel
