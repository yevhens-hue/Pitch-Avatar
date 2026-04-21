import React, { useState } from 'react';
import styles from './ProjectEditor.module.css';
import { Layers, User, BookOpen, Key, FileText, Settings, PlayCircle } from 'lucide-react';
import TutorialVideo from '@/components/Wizard/TutorialVideo';

const TUTORIAL_VIDEO = 'https://www.youtube.com/watch?v=OKzPnlCteX4'

type Tab = 'slides' | 'avatar' | 'knowledge' | 'role' | 'instructions' | 'settings';

const ProjectEditor: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('slides');
  const [activeSlide, setActiveSlide] = useState(1);
  const [script, setScript] = useState('');
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  const tutorialGlowStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: 24,
    right: 24,
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    padding: '0.875rem 1.25rem',
    fontWeight: 700,
    fontSize: '0.875rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    boxShadow: '0 4px 14px rgba(99,102,241,0.4)',
    zIndex: 999,
  }

  return (
    <div className={styles.container}>
      {/* Editor Main Navigation (Tabs) */}
      <div className={styles.tabNav}>
        <button className={`${styles.tabBtn} ${activeTab === 'slides' ? styles.tabActive : ''}`} onClick={() => setActiveTab('slides')}>
          <Layers size={18} /> Slides
        </button>
        <button className={`${styles.tabBtn} ${activeTab === 'avatar' ? styles.tabActive : ''}`} onClick={() => setActiveTab('avatar')}>
          <User size={18} /> Avatar
        </button>
        <button className={`${styles.tabBtn} ${activeTab === 'knowledge' ? styles.tabActive : ''}`} onClick={() => setActiveTab('knowledge')}>
          <BookOpen size={18} /> Knowledge Base
        </button>
        <button className={`${styles.tabBtn} ${activeTab === 'role' ? styles.tabActive : ''}`} onClick={() => setActiveTab('role')}>
          <Key size={18} /> Role
        </button>
        <button className={`${styles.tabBtn} ${activeTab === 'instructions' ? styles.tabActive : ''}`} onClick={() => setActiveTab('instructions')}>
          <FileText size={18} /> Instructions
        </button>
        <button className={`${styles.tabBtn} ${activeTab === 'settings' ? styles.tabActive : ''}`} onClick={() => setActiveTab('settings')}>
          <Settings size={18} /> Settings
        </button>
      </div>

      <div className={styles.editorContent}>
        {/* Slides Tab */}
        {activeTab === 'slides' && (
          <>
            <div className={styles.panel} style={{ flex: '0 0 250px' }}>
              <h3 className={styles.panelTitle}>Slides</h3>
              <div className={styles.slideList}>
                {[1, 2, 3].map((slide) => (
                  <div 
                    key={slide}
                    className={`${styles.slideItem} ${activeSlide === slide ? styles.active : ''}`}
                    onClick={() => setActiveSlide(slide)}
                  >
                    Slide {slide}
                  </div>
                ))}
              </div>
              <button className={styles.addSlideBtn}>+ Create with AI</button>
            </div>

            <div className={`${styles.panel} ${styles.mainEditor}`}>
              <div className={styles.previewArea}>
                <span style={{opacity: 0.5}}>Slide {activeSlide} Visual Preview</span>
              </div>
              <div style={{ marginTop: '1rem' }}>
                <h3 className={styles.panelTitle}>Script Editor (Text-to-Speech)</h3>
                <textarea 
                  className={styles.scriptEditor}
                  placeholder="Enter script for this slide..."
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                />
              </div>
            </div>
          </>
        )}

        {/* Avatar Tab */}
        {activeTab === 'avatar' && (
          <div className={styles.panel} style={{ flex: 1, maxWidth: '600px', margin: '0 auto' }}>
            <h3 className={styles.panelTitle}>Avatar Settings</h3>
            <div className={styles.settingGroup}>
              <label>AI Persona</label>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <div style={{ width: 100, height: 100, borderRadius: '50%', background: '#444' }}></div>
                <div>
                  <h4 style={{ margin: '0 0 0.5rem 0' }}>Professional Presenter</h4>
                  <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.7 }}>English - Native</p>
                  <button className={styles.actionBtn} style={{ marginTop: '0.5rem' }}>Change Avatar</button>
                </div>
              </div>
            </div>
            <div className={styles.settingGroup}>
              <label>Avatar Options</label>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked /> Display as Video
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked /> Speaks Aloud
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Knowledge Base Tab */}
        {activeTab === 'knowledge' && (
          <div className={styles.panel} style={{ flex: 1, maxWidth: '800px', margin: '0 auto' }}>
            <h3 className={styles.panelTitle}>Project Knowledge Base</h3>
            <p style={{ opacity: 0.7, marginBottom: '1.5rem' }}>Upload PDFs, PPTX or create Q&A pairs to train your AI assistant.</p>
            <div className={styles.settingGroup}>
              <button className={styles.uploadBtn}>Upload Documents</button>
            </div>
            <table className={styles.kbTable}>
              <thead>
                <tr>
                  <th>File Name</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>presentation_data.pdf</td>
                  <td>Document</td>
                  <td><span style={{ color: '#34d399' }}>Processed</span></td>
                  <td><button className={styles.textBtn}>Delete</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Role Tab */}
        {activeTab === 'role' && (
          <div className={styles.panel} style={{ flex: 1, maxWidth: '800px', margin: '0 auto' }}>
            <h3 className={styles.panelTitle}>AI Role & Persona</h3>
            <div className={styles.settingGroup}>
              <label>Objective</label>
              <textarea 
                className={styles.scriptEditor}
                style={{ height: '80px' }}
                placeholder="What is the primary goal of this AI?"
                defaultValue="To educate users about our enterprise plans and qualify leads."
              />
            </div>
            <div className={styles.settingGroup}>
              <label>Industry Context</label>
              <input type="text" className={styles.input} defaultValue="B2B SaaS / Human Resources" />
            </div>
          </div>
        )}

        {/* Instructions Tab */}
        {activeTab === 'instructions' && (
          <div className={styles.panel} style={{ flex: 1, maxWidth: '800px', margin: '0 auto' }}>
            <h3 className={styles.panelTitle}>System Instructions</h3>
            <p style={{ opacity: 0.7, marginBottom: '1rem' }}>Define specific rules and workflows for the conversation.</p>
            <div className={styles.settingGroup}>
              <label>Base Prompt</label>
              <textarea 
                className={styles.scriptEditor}
                style={{ height: '150px' }}
                placeholder="Enter system prompt..."
                defaultValue="You are an expert sales associate. Always be polite. Only answer questions based on the uploaded Knowledge Base documents. If you don't know the answer, offload to human support."
              />
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className={styles.panel} style={{ flex: 1, maxWidth: '800px', margin: '0 auto' }}>
            <h3 className={styles.panelTitle}>Project Settings</h3>
            <div className={styles.settingGroup}>
              <label>Project Name</label>
              <input type="text" className={styles.input} defaultValue="Enterprise Sales Pitch 2026" />
            </div>
            <div className={styles.settingGroup}>
              <label>Viewer Layout</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked /> Show Chat Widget
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked /> Show Microphone Input
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked /> Show Slide Counter
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked /> Enable Fullscreen
                </label>
              </div>
            </div>
            <div className={styles.settingGroup} style={{ marginTop: '2rem', padding: '1rem', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}>
              <h4 style={{ margin: '0 0 1rem 0' }}>AI Compliance (EU AI Act)</h4>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked /> Show AI Disclosure to users
              </label>
              <input type="text" className={styles.input} style={{ marginTop: '0.5rem' }} defaultValue="This is an AI avatar. Your responses may be recorded." />
            </div>
          </div>
        )}
      </div>
      {/* Floating Watch Tutorial button */}
      <button style={tutorialGlowStyle} onClick={() => setIsTutorialOpen(prev => !prev)}>
        <PlayCircle size={16} />
        {isTutorialOpen ? 'Close Tutorial' : 'Watch Tutorial'}
      </button>

      {isTutorialOpen && (
        <TutorialVideo
          videoUrl={TUTORIAL_VIDEO}
          title="How to use the editor"
          stepLabel="Editor"
          onClose={() => setIsTutorialOpen(false)}
        />
      )}
    </div>
  );
};

export default ProjectEditor;
