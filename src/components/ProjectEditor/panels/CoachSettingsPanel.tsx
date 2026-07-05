'use client'

import React, { useEffect, useState, useCallback } from 'react'
import styles from './KnowledgeBasePanel.module.css'
import cStyles from './CoachPanels.module.css'
import { CoachSettings } from '@/types/coach'
import { useCoachStore } from '@/lib/useCoachStore'
import { updateCoachSettings } from '@/app/actions/coachActions'
import debounce from 'lodash/debounce'

interface CoachSettingsPanelProps {
  projectId?: string
}

const CoachSettingsPanel: React.FC<CoachSettingsPanelProps> = ({ projectId }) => {
  const { settings, setSettings } = useCoachStore()
  
  // Local state for immediate UI updates
  const [localSettings, setLocalSettings] = useState<Partial<CoachSettings>>(settings || {
    testFormat: 'text_voice',
    questionTiming: 'on_slides',
    questionOrder: 'sequential',
    feedbackFlags: {
      immediateFeedback: true,
      showCorrectAnswers: true,
      alwaysShowScore: false
    },
    passingScore: 70
  })

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings)
    }
  }, [settings])

  // Debounced save
  const saveSettings = useCallback(
    debounce(async (newSettings: Partial<CoachSettings>) => {
      if (!projectId) return;
      try {
        await updateCoachSettings(projectId, newSettings as CoachSettings);
        setSettings(newSettings as CoachSettings);
      } catch (e) {
        console.error('Failed to save coach settings', e);
      }
    }, 1000),
    [projectId, setSettings]
  )

  const handleChange = (updater: (s: Partial<CoachSettings>) => Partial<CoachSettings>) => {
    setLocalSettings(prev => {
      const next = updater(prev);
      saveSettings(next);
      return next;
    });
  }

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <div className={styles.headerTop}>
          <div>
            <h2 className={styles.panelTitle}>Coach Settings</h2>
            <p className={styles.panelSubtitle}>Configure global training parameters for this project.</p>
          </div>
        </div>
      </div>

      <div className={styles.panelBody} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* Test Type */}
        <div>
          <h3 className={cStyles.sectionTitle}>Test Format</h3>
          <div className={cStyles.settingsSectionDesc}>Format of checking student answers</div>
          <div className={cStyles.btnGroup}>
            <button 
              className={localSettings.testFormat === 'text_voice' ? cStyles.groupBtnActive : cStyles.groupBtn}
              onClick={() => handleChange(s => ({ ...s, testFormat: 'text_voice' }))}
            >Text / voice</button>
            <button 
              className={localSettings.testFormat === 'text_slide' ? cStyles.groupBtnActive : cStyles.groupBtn}
              onClick={() => handleChange(s => ({ ...s, testFormat: 'text_slide' }))}
            >Text + correct slide</button>
            <button 
              className={localSettings.testFormat === 'slide_only' ? cStyles.groupBtnActive : cStyles.groupBtn}
              onClick={() => handleChange(s => ({ ...s, testFormat: 'slide_only' }))}
            >Only correct slide</button>
          </div>
        </div>

        {/* Q&A Selection */}
        <div>
          <h3 className={cStyles.sectionTitle}>Test Set Selection</h3>
          <div className={cStyles.settingsSectionDesc}>All active questions from Test Set will be asked in this training.</div>
          <div className={cStyles.qaSelectBox}>
            <div className={cStyles.qaSelectRow}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><input type="checkbox" defaultChecked /> Pricing Category</label>
              <span>10</span>
            </div>
            <div className={cStyles.qaSelectRow}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><input type="checkbox" defaultChecked /> Objection Category</label>
              <span>10</span>
            </div>
            <div className={cStyles.qaSelectRow}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><input type="checkbox" /> Technical Category</label>
              <span>10</span>
            </div>
            <div className={cStyles.qaSelectRow}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><input type="checkbox" /> Discovery Category</label>
              <span>20</span>
            </div>
            <div className={cStyles.qaSelectTotal}>Active: <span className={cStyles.qaSelectTotalActive}>7 Q</span> in this training</div>
          </div>
        </div>

        {/* Timing & Order */}
        <div style={{ display: 'flex', gap: '32px' }}>
          <div style={{ flex: 1 }}>
            <h3 className={cStyles.sectionTitle}>Question Timing</h3>
            <div className={cStyles.btnGroup}>
              <button 
                className={localSettings.questionTiming === 'before' ? cStyles.groupBtnActive : cStyles.groupBtn}
                onClick={() => handleChange(s => ({ ...s, questionTiming: 'before' }))}
              >Before</button>
              <button 
                className={localSettings.questionTiming === 'on_slides' ? cStyles.groupBtnActive : cStyles.groupBtn}
                onClick={() => handleChange(s => ({ ...s, questionTiming: 'on_slides' }))}
              >On slides</button>
              <button 
                className={localSettings.questionTiming === 'after' ? cStyles.groupBtnActive : cStyles.groupBtn}
                onClick={() => handleChange(s => ({ ...s, questionTiming: 'after' }))}
              >After</button>
              <button 
                className={localSettings.questionTiming === 'no_slides' ? cStyles.groupBtnActive : cStyles.groupBtn}
                onClick={() => handleChange(s => ({ ...s, questionTiming: 'no_slides' }))}
              >No slides</button>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <h3 className={cStyles.sectionTitle}>Question Order</h3>
            <div className={cStyles.btnGroup}>
              <button 
                className={localSettings.questionOrder === 'sequential' ? cStyles.groupBtnActive : cStyles.groupBtn}
                onClick={() => handleChange(s => ({ ...s, questionOrder: 'sequential' }))}
              >Sequential</button>
              <button 
                className={localSettings.questionOrder === 'random_n' ? cStyles.groupBtnActive : cStyles.groupBtn}
                onClick={() => handleChange(s => ({ ...s, questionOrder: 'random_n' }))}
              >Random N</button>
            </div>
          </div>
        </div>

        {/* Display Flags */}
        <div className={cStyles.flagsBox}>
          <h3 className={cStyles.flagsTitle}>Display Flags</h3>
          <div className={cStyles.flagsDesc}>2x2x2 = 8 combinations. What the student sees.</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label className={cStyles.checkboxRow}>
              <input 
                type="checkbox" 
                checked={localSettings.feedbackFlags?.immediateFeedback} 
                onChange={e => handleChange(s => ({ ...s, feedbackFlags: { ...s.feedbackFlags!, immediateFeedback: e.target.checked } }))} 
                style={{ marginTop: '2px' }} 
              />
              <div>
                <strong>Evaluate correctness immediately</strong> — correct / almost / no
              </div>
            </label>
            <label className={cStyles.checkboxRow}>
              <input 
                type="checkbox" 
                checked={localSettings.feedbackFlags?.showCorrectAnswers} 
                onChange={e => handleChange(s => ({ ...s, feedbackFlags: { ...s.feedbackFlags!, showCorrectAnswers: e.target.checked } }))} 
                style={{ marginTop: '2px' }} 
              />
              <div>
                <strong>Show correct answer</strong> after each question
              </div>
            </label>
            <label className={cStyles.checkboxRow}>
              <input 
                type="checkbox" 
                checked={localSettings.feedbackFlags?.alwaysShowScore} 
                onChange={e => handleChange(s => ({ ...s, feedbackFlags: { ...s.feedbackFlags!, alwaysShowScore: e.target.checked } }))} 
                style={{ marginTop: '2px' }} 
              />
              <div>
                <strong>Show current score constantly</strong> — otherwise at the end
              </div>
            </label>
          </div>
        </div>

        {/* Bottom Row: Passing & Reporting */}
        <div style={{ display: 'flex', gap: '32px' }}>
          <div style={{ flex: 1 }}>
            <h3 className={cStyles.sectionTitle}>PASSING SCORE</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#374151' }}>
              <span>Min:</span>
              <input 
                type="number" 
                value={localSettings.passingScore} 
                onChange={e => handleChange(s => ({ ...s, passingScore: parseInt(e.target.value) || 0 }))} 
                className={cStyles.smallInput} 
              />
              <span>%</span>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <h3 className={cStyles.sectionTitle}>REPORTING</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px', color: '#374151' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><input type="checkbox" defaultChecked /> Coach</label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><input type="checkbox" /> Trainee</label>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default CoachSettingsPanel
