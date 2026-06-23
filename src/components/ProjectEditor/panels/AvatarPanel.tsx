'use client'

import React, { useState } from 'react'
import { ChevronDown, Info, Plus } from 'lucide-react'
import styles from './AvatarPanel.module.css'

const AVATARS = [
  { id: '1', pos: '0% 0%' },
  { id: '2', pos: '33.33% 0%' },
  { id: '3', pos: '66.66% 0%' },
  { id: '4', pos: '100% 0%' },
  { id: '5', pos: '0% 50%' },
  { id: '6', pos: '33.33% 50%' },
  { id: '7', pos: '66.66% 50%' },
  { id: '8', pos: '100% 50%' },
  { id: '9', pos: '0% 100%' },
  { id: '10', pos: '33.33% 100%' },
  { id: '11', pos: '66.66% 100%' },
  { id: '12', pos: '100% 100%' },
]

const MOODS = ['Friendly', 'Professional', 'Enthusiastic', 'Calm', 'Empathetic']
const LANGUAGES = ['English', 'Spanish', 'German', 'French', 'Italian', 'Portuguese', 'Polish', 'Ukrainian', 'Russian']
const VOICES = ['Seraphina Multilingual', 'Florian (Multilingual)', 'Emma (Friendly)', 'James (Authoritative)', 'Sofia (Warm)', 'Alex (Professional)']
const ACCENTS = ['American English', 'British English', 'Australian English', 'Neutral']

type Tab = 'general' | 'voice'

interface AvatarPanelProps {
  projectId?: string
}

const AvatarPanel: React.FC<AvatarPanelProps> = () => {
  const [activeTab, setActiveTab] = useState<Tab>('general')
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)

  // General tab state
  const [avatarMood, setAvatarMood] = useState('Friendly')
  const [displayAsVideo, setDisplayAsVideo] = useState(true)
  const [avatarName, setAvatarName] = useState('Assistant')
  const [selectedAvatar, setSelectedAvatar] = useState('1')

  // Voice tab state
  const [voice, setVoice] = useState('Seraphina Multilingual')
  const [language, setLanguage] = useState('English')
  const [voiceAccent, setVoiceAccent] = useState('American English')
  const [speaksAloud, setSpeaksAloud] = useState(true)
  const [voiceQuestions, setVoiceQuestions] = useState(true)

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h2 className={styles.panelTitle}>Avatar</h2>
        <p className={styles.panelSubtitle}>Avatar appearance and voice configuration.</p>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'general' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('general')}
          id="avatar-tab-general"
        >
          General
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'voice' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('voice')}
          id="avatar-tab-voice"
        >
          Voice Settings
        </button>
      </div>

      <div className={styles.panelBody}>
        {/* ── General Tab ── */}
        {activeTab === 'general' && (
          <>
            {/* Avatar Mood */}
            <div className={styles.field}>
              <label className={styles.label}>
                Avatar Mood
                <span className={styles.sublabel}>Настрій аватара</span>
              </label>
              <div className={styles.selectWrap}>
                <select
                  className={styles.select}
                  value={avatarMood}
                  onChange={e => setAvatarMood(e.target.value)}
                  id="avatar-mood-select"
                >
                  {MOODS.map(m => <option key={m}>{m}</option>)}
                </select>
                <ChevronDown size={16} className={styles.selectIcon} />
              </div>
            </div>

            {/* Display as Video */}
            <div className={styles.field}>
              <label className={styles.label}>
                Display as Video
                <span className={styles.sublabel}>Показувати як відео</span>
              </label>
              <button
                className={`${styles.toggle} ${displayAsVideo ? styles.toggleOn : ''}`}
                onClick={() => setDisplayAsVideo(v => !v)}
                role="switch"
                aria-checked={displayAsVideo}
                id="avatar-display-video-toggle"
              >
                <span className={styles.toggleKnob} />
                <span className={styles.toggleLabel}>{displayAsVideo ? 'Yes' : 'No'}</span>
              </button>
            </div>

            {/* Avatar Name */}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="avatar-name-input">
                Avatar Name
                <span className={styles.sublabel}>Ім&apos;я аватара</span>
              </label>
              <input
                id="avatar-name-input"
                className={styles.input}
                value={avatarName}
                onChange={e => setAvatarName(e.target.value)}
                placeholder="Assistant"
              />
            </div>

            {/* Project Avatar photo */}
            <div className={styles.field}>
              <label className={styles.label}>
                Project Avatar
                <span className={styles.sublabel}>Аватар проєкту</span>
              </label>
              <span className={styles.sublabelStandalone}>Photo</span>
              <div className={styles.avatarGrid} aria-label="Select avatar photo">
                {/* Upload slot */}
                <button className={styles.avatarUpload} aria-label="Upload custom avatar photo">
                  <Plus size={20} />
                  <span>Add own</span>
                </button>
                {AVATARS.map(a => (
                  <button
                    key={a.id}
                    className={`${styles.avatarItem} ${selectedAvatar === a.id ? styles.avatarSelected : ''}`}
                    onClick={() => setSelectedAvatar(a.id)}
                    aria-label={`Avatar option ${a.id}`}
                    style={{
                      backgroundImage: 'url(/avatars-grid.png)',
                      backgroundSize: '400% 300%',
                      backgroundPosition: a.pos,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Advanced section */}
            <button
              className={styles.advancedToggle}
              onClick={() => setIsAdvancedOpen(v => !v)}
              id="avatar-advanced-toggle"
            >
              <ChevronDown
                size={16}
                className={`${styles.advancedChevron} ${isAdvancedOpen ? styles.advancedChevronOpen : ''}`}
              />
              Advanced {isAdvancedOpen ? '' : '(3)'}
            </button>

            {isAdvancedOpen && (
              <div className={styles.advancedSection}>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="avatar-language-select">
                    Default Language
                  </label>
                  <div className={styles.selectWrap}>
                    <select
                      id="avatar-language-select"
                      className={styles.select}
                      value={language}
                      onChange={e => setLanguage(e.target.value)}
                    >
                      {LANGUAGES.map(l => <option key={l}>{l}</option>)}
                    </select>
                    <ChevronDown size={16} className={styles.selectIcon} />
                  </div>
                </div>
                <button className={styles.addLangBtn}>
                  <Plus size={14} /> Add language
                </button>
              </div>
            )}
          </>
        )}

        {/* ── Voice Settings Tab ── */}
        {activeTab === 'voice' && (
          <>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="project-voice-select">
                Project Voice
                <span className={styles.sublabel}>Голос проєкту</span>
              </label>
              <div className={styles.selectWrap}>
                <select
                  id="project-voice-select"
                  className={styles.select}
                  value={voice}
                  onChange={e => setVoice(e.target.value)}
                >
                  {VOICES.map(v => <option key={v}>{v}</option>)}
                </select>
                <ChevronDown size={16} className={styles.selectIcon} />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="voice-accent-select">
                Voice Accent
              </label>
              <div className={styles.selectWrap}>
                <select
                  id="voice-accent-select"
                  className={styles.select}
                  value={voiceAccent}
                  onChange={e => setVoiceAccent(e.target.value)}
                >
                  {ACCENTS.map(a => <option key={a}>{a}</option>)}
                </select>
                <ChevronDown size={16} className={styles.selectIcon} />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>
                Avatar Speaks Response Aloud
              </label>
              <button
                className={`${styles.toggle} ${speaksAloud ? styles.toggleOn : ''}`}
                onClick={() => setSpeaksAloud(v => !v)}
                role="switch"
                aria-checked={speaksAloud}
                id="avatar-speaks-aloud-toggle"
              >
                <span className={styles.toggleKnob} />
                <span className={styles.toggleLabel}>{speaksAloud ? 'Yes' : 'No'}</span>
              </button>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>
                Users Can Ask Questions by Voice
              </label>
              <button
                className={`${styles.toggle} ${voiceQuestions ? styles.toggleOn : ''}`}
                onClick={() => setVoiceQuestions(v => !v)}
                role="switch"
                aria-checked={voiceQuestions}
                id="avatar-voice-questions-toggle"
              >
                <span className={styles.toggleKnob} />
                <span className={styles.toggleLabel}>{voiceQuestions ? 'Yes' : 'No'}</span>
              </button>
            </div>

            {/* Advanced */}
            <button
              className={styles.advancedToggle}
              onClick={() => setIsAdvancedOpen(v => !v)}
              id="voice-advanced-toggle"
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
                  <label className={styles.label}>
                    Voice Speed
                    <Info size={13} className={styles.infoIcon} />
                  </label>
                  <input type="range" min={0.5} max={2} step={0.1} defaultValue={1} className={styles.rangeInput} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>
                    Voice Pitch
                    <Info size={13} className={styles.infoIcon} />
                  </label>
                  <input type="range" min={0.5} max={2} step={0.1} defaultValue={1.15} className={styles.rangeInput} />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default AvatarPanel
