'use client'

import React, { useState, useRef } from 'react'
import { ChevronDown, Upload, Globe, Lock, Key, Info, Image } from 'lucide-react'
import styles from './SettingsPanel.module.css'

const LANGUAGES = ['English', 'Spanish', 'German', 'French', 'Italian', 'Portuguese', 'Polish', 'Ukrainian', 'Russian']

type SettingsTab = 'information' | 'access' | 'advanced'

interface SettingsPanelProps {
  projectId?: string
  projectTitle?: string
  projectType?: string
}

const ToggleSwitch = ({
  checked,
  onChange,
  id,
}: { checked: boolean; onChange: () => void; id: string }) => (
  <button
    className={`${styles.toggle} ${checked ? styles.toggleOn : ''}`}
    onClick={onChange}
    role="switch"
    aria-checked={checked}
    id={id}
    type="button"
  >
    <span className={styles.toggleKnob} />
  </button>
)

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  projectTitle = 'Untitled Project',
  projectType,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('information')
  const isAvatarProject = projectType === 'chat-avatar' || projectType === 'assistant' || projectType === 'widget'

  // Information tab state
  const [name, setName] = useState(projectTitle)
  const [language, setLanguage] = useState('English')
  const [author, setAuthor] = useState('')
  const [iconPreview, setIconPreview] = useState<string | null>(null)
  const iconInputRef = useRef<HTMLInputElement>(null)

  // Avatar-specific toggles (shown in Information for avatar projects)
  const [avatarAsVideo, setAvatarAsVideo] = useState(true)
  const [speaksAloud, setSpeaksAloud] = useState(true)
  const [voiceQuestions, setVoiceQuestions] = useState(true)

  // Access tab state
  const [accessType, setAccessType] = useState<'public' | 'private' | 'password'>('public')
  const [password, setPassword] = useState('')
  const [allowDownload, setAllowDownload] = useState(false)
  const [showBranding, setShowBranding] = useState(true)
  const [allowComments, setAllowComments] = useState(false)

  // Advanced tab
  const [analyticsCode, setAnalyticsCode] = useState('')
  const [customDomain, setCustomDomain] = useState('')

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setIconPreview(url)
    }
  }

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h2 className={styles.panelTitle}>Settings</h2>
        <p className={styles.panelSubtitle}>Project configuration and access parameters.</p>

        {/* Sub-tabs per Epic */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'information' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('information')}
            id="settings-tab-information"
          >
            Project Information
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'access' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('access')}
            id="settings-tab-access"
          >
            Access
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'advanced' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('advanced')}
            id="settings-tab-advanced"
          >
            Advanced
          </button>
        </div>
      </div>

      <div className={styles.panelBody}>

        {/* ── Project Information Tab ── */}
        {activeTab === 'information' && (
          <>
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

            <div className={styles.field}>
              <label className={styles.label}>Project Icon</label>
              <div className={styles.iconUploadArea} onClick={() => iconInputRef.current?.click()}>
                {iconPreview ? (
                  <img src={iconPreview} alt="Project icon" className={styles.iconPreview} />
                ) : (
                  <>
                    <div className={styles.iconPlaceholder}>
                      <Image size={24} color="#9ca3af" />
                    </div>
                    <div className={styles.iconUploadInfo}>
                      <Upload size={14} />
                      <span>Click to upload icon (PNG, 64×64px recommended)</span>
                    </div>
                  </>
                )}
              </div>
              <input
                ref={iconInputRef}
                type="file"
                accept="image/png,image/jpeg,image/svg+xml"
                style={{ display: 'none' }}
                onChange={handleIconChange}
                aria-label="Upload project icon"
              />
            </div>

            {/* Avatar Settings — only for avatar projects (per epic: Avatar Settings in Settings) */}
            {isAvatarProject && (
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Avatar Settings</h3>

                <div className={styles.toggleField}>
                  <div className={styles.toggleInfo}>
                    <span className={styles.toggleName}>Avatar displays as video</span>
                    <Info size={13} className={styles.infoIcon} />
                  </div>
                  <ToggleSwitch
                    checked={avatarAsVideo}
                    onChange={() => setAvatarAsVideo(v => !v)}
                    id="settings-avatar-video-toggle"
                  />
                </div>

                <div className={styles.toggleField}>
                  <div className={styles.toggleInfo}>
                    <span className={styles.toggleName}>Avatar speaks response aloud</span>
                    <Info size={13} className={styles.infoIcon} />
                  </div>
                  <ToggleSwitch
                    checked={speaksAloud}
                    onChange={() => setSpeaksAloud(v => !v)}
                    id="settings-speaks-aloud-toggle"
                  />
                </div>

                <div className={styles.toggleField}>
                  <div className={styles.toggleInfo}>
                    <span className={styles.toggleName}>Users can ask questions by voice</span>
                    <Info size={13} className={styles.infoIcon} />
                  </div>
                  <ToggleSwitch
                    checked={voiceQuestions}
                    onChange={() => setVoiceQuestions(v => !v)}
                    id="settings-voice-questions-toggle"
                  />
                </div>
              </div>
            )}
          </>
        )}

        {/* ── Access Tab ── */}
        {activeTab === 'access' && (
          <>
            <div className={styles.field}>
              <label className={styles.label}>Visibility</label>
              <div className={styles.accessCards}>
                <label
                  className={`${styles.accessCard} ${accessType === 'public' ? styles.accessCardActive : ''}`}
                  htmlFor="access-public"
                >
                  <input
                    type="radio"
                    id="access-public"
                    name="access"
                    value="public"
                    checked={accessType === 'public'}
                    onChange={() => setAccessType('public')}
                    className={styles.radioHidden}
                  />
                  <Globe size={20} className={styles.accessCardIcon} />
                  <div>
                    <div className={styles.accessCardTitle}>Public</div>
                    <div className={styles.accessCardDesc}>Anyone with the link can view</div>
                  </div>
                </label>

                <label
                  className={`${styles.accessCard} ${accessType === 'private' ? styles.accessCardActive : ''}`}
                  htmlFor="access-private"
                >
                  <input
                    type="radio"
                    id="access-private"
                    name="access"
                    value="private"
                    checked={accessType === 'private'}
                    onChange={() => setAccessType('private')}
                    className={styles.radioHidden}
                  />
                  <Lock size={20} className={styles.accessCardIcon} />
                  <div>
                    <div className={styles.accessCardTitle}>Private</div>
                    <div className={styles.accessCardDesc}>Only you can view</div>
                  </div>
                </label>

                <label
                  className={`${styles.accessCard} ${accessType === 'password' ? styles.accessCardActive : ''}`}
                  htmlFor="access-password"
                >
                  <input
                    type="radio"
                    id="access-password"
                    name="access"
                    value="password"
                    checked={accessType === 'password'}
                    onChange={() => setAccessType('password')}
                    className={styles.radioHidden}
                  />
                  <Key size={20} className={styles.accessCardIcon} />
                  <div>
                    <div className={styles.accessCardTitle}>Password Protected</div>
                    <div className={styles.accessCardDesc}>Requires a password to view</div>
                  </div>
                </label>
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

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Permissions</h3>

              <div className={styles.toggleField}>
                <div className={styles.toggleInfo}>
                  <span className={styles.toggleName}>Allow download</span>
                  <Info size={13} className={styles.infoIcon} />
                </div>
                <ToggleSwitch
                  checked={allowDownload}
                  onChange={() => setAllowDownload(v => !v)}
                  id="settings-allow-download-toggle"
                />
              </div>

              <div className={styles.toggleField}>
                <div className={styles.toggleInfo}>
                  <span className={styles.toggleName}>Show branding</span>
                  <Info size={13} className={styles.infoIcon} />
                </div>
                <ToggleSwitch
                  checked={showBranding}
                  onChange={() => setShowBranding(v => !v)}
                  id="settings-show-branding-toggle"
                />
              </div>

              <div className={styles.toggleField}>
                <div className={styles.toggleInfo}>
                  <span className={styles.toggleName}>Allow comments</span>
                </div>
                <ToggleSwitch
                  checked={allowComments}
                  onChange={() => setAllowComments(v => !v)}
                  id="settings-allow-comments-toggle"
                />
              </div>
            </div>
          </>
        )}

        {/* ── Advanced Tab ── */}
        {activeTab === 'advanced' && (
          <>
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
              <label className={styles.label} htmlFor="settings-custom-domain">Custom Domain</label>
              <input
                id="settings-custom-domain"
                className={styles.input}
                value={customDomain}
                onChange={e => setCustomDomain(e.target.value)}
                placeholder="e.g. slides.yourcompany.com"
              />
              <p className={styles.hint}>Connect a custom domain to your project sharing link.</p>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="settings-analytics">Analytics Code</label>
              <textarea
                id="settings-analytics"
                className={styles.textarea}
                value={analyticsCode}
                onChange={e => setAnalyticsCode(e.target.value)}
                placeholder="Paste your Google Analytics or other tracking code here"
                rows={4}
              />
            </div>

            <div className={styles.infoBox}>
              <Info size={16} />
              <p>Advanced settings are applied globally to all project sharing links and embeds.</p>
            </div>
          </>
        )}
      </div>

      {/* Save button */}
      <div className={styles.panelFooter}>
        <button className={styles.saveBtn} id="settings-save-btn">Save Changes</button>
      </div>
    </div>
  )
}

export default SettingsPanel
