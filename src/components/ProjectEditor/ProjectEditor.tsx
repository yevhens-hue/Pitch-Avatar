import React, { useState } from 'react';
import styles from './ProjectEditor.module.css';
import { Plus, Play, Sparkles, Wand2, MonitorPlay, Mic, Languages, Settings, Layout, UploadCloud, Users, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';

type RightTab = 'avatar' | 'settings' | 'knowledge';

const ProjectEditor: React.FC = () => {
  const { showToast } = useToast();
  
  const [activeSlide, setActiveSlide] = useState(1);
  const [slides, setSlides] = useState([
    { id: 1, text: "Welcome to Pitch Avatar. Let's create an engaging presentation.", duration: "0:05" },
    { id: 2, text: "Our AI helps you present better and collect more leads.", duration: "0:08" },
    { id: 3, text: "Let's get started with your first pitch.", duration: "0:04" },
  ]);
  const [activeTab, setActiveTab] = useState<RightTab>('avatar');
  
  const currentSlide = slides.find(s => s.id === activeSlide) || slides[0];

  const handleScriptChange = (text: string) => {
    setSlides(prev => prev.map(s => s.id === activeSlide ? { ...s, text } : s));
  };

  const addSlide = () => {
    const newId = slides.length + 1;
    setSlides([...slides, { id: newId, text: "", duration: "0:00" }]);
    setActiveSlide(newId);
  };

  const handleGenerateScript = () => {
    showToast("Generating script with AI...", "info");
    setTimeout(() => {
      handleScriptChange(currentSlide.text + " (AI Generated: Here is an expanded script based on the visual context.)");
      showToast("Script generated successfully!", "success");
    }, 1500);
  };

  return (
    <div className={styles.container}>
      
      {/* LEFT PANEL: Slides List */}
      <div className={styles.leftPanel}>
        <div className={styles.panelTitle}>Slides</div>
        <div className={styles.slideList}>
          {slides.map((slide, index) => (
            <div 
              key={slide.id}
              className={`${styles.slideThumbnail} ${activeSlide === slide.id ? styles.active : ''}`}
              onClick={() => setActiveSlide(slide.id)}
            >
              <div className={styles.slidePreviewBox}>
                <ImageIcon size={24} opacity={0.5} />
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <span className={styles.slideNumber}>Slide {index + 1}</span>
                <span style={{fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)'}}>{slide.duration}</span>
              </div>
            </div>
          ))}
        </div>
        <button className={styles.addSlideBtn} onClick={addSlide}>
          <Plus size={16} /> Add Slide
        </button>
      </div>

      {/* CENTER PANEL: Stage & Script */}
      <div className={styles.centerPanel}>
        <div className={styles.stageArea}>
          <div className={styles.mainStage}>
            {/* Slide Visual Placeholder */}
            <div style={{fontSize: '2rem', color: '#ccc', fontWeight: 600}}>
              Slide {activeSlide} Content
            </div>
            
            {/* Avatar Overlay */}
            <div className={styles.avatarOverlay}>
              <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200&h=200" alt="Avatar" />
            </div>
          </div>
        </div>
        
        <div className={styles.scriptPanel}>
          <div className={styles.scriptHeader}>
            <div className={styles.scriptHeaderLeft}>
              <span style={{fontWeight: 600, fontSize: '0.9rem'}}>Speech Script</span>
              <span style={{fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)'}}>For Slide {activeSlide}</span>
            </div>
            <div className={styles.scriptHeaderRight}>
              <button className={styles.generateBtn} onClick={handleGenerateScript}>
                <Sparkles size={14} /> Generate with AI
              </button>
            </div>
          </div>
          
          <textarea 
            className={styles.scriptTextarea}
            placeholder="Type what the avatar should say on this slide..."
            value={currentSlide.text}
            onChange={(e) => handleScriptChange(e.target.value)}
          />
          
          <div className={styles.scriptFooter}>
            <div>{currentSlide.text.length} characters • ~{Math.ceil(currentSlide.text.length / 15)} seconds</div>
            <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
              <span style={{cursor: 'pointer'}} onClick={() => showToast("Previewing speech...", "info")}>
                <Play size={14} style={{marginRight: '0.25rem', verticalAlign: 'middle'}}/> Listen
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Inspector */}
      <div className={styles.rightPanel}>
        <div className={styles.inspectorTabs}>
          <button 
            className={`${styles.inspectorTab} ${activeTab === 'avatar' ? styles.active : ''}`}
            onClick={() => setActiveTab('avatar')}
          >
            Avatar
          </button>
          <button 
            className={`${styles.inspectorTab} ${activeTab === 'settings' ? styles.active : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </button>
          <button 
            className={`${styles.inspectorTab} ${activeTab === 'knowledge' ? styles.active : ''}`}
            onClick={() => setActiveTab('knowledge')}
          >
            Knowledge
          </button>
        </div>

        <div className={styles.inspectorContent}>
          {activeTab === 'avatar' && (
            <>
              <div className={styles.settingGroup}>
                <label>Voice Language</label>
                <div style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
                  <Languages size={16} opacity={0.6}/>
                  <select className={styles.select}>
                    <option>English (US) - Professional</option>
                    <option>English (UK) - Friendly</option>
                    <option>Spanish - Energetic</option>
                  </select>
                </div>
              </div>
              
              <div className={styles.settingGroup}>
                <label>Visual Avatar</label>
                <div className={styles.avatarGrid}>
                  <div className={`${styles.avatarItem} ${styles.active}`}>
                    <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200&h=200" alt="Avatar 1" />
                  </div>
                  <div className={styles.avatarItem}>
                    <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200&h=200" alt="Avatar 2" />
                  </div>
                  <div className={styles.avatarItem}>
                    <img src="https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200&h=200" alt="Avatar 3" />
                  </div>
                  <div className={styles.avatarItem} style={{display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)'}}>
                    <Plus size={24} opacity={0.5} />
                  </div>
                </div>
              </div>

              <div className={styles.settingGroup}>
                <label>Avatar Placement</label>
                <select className={styles.select}>
                  <option>Bottom Right</option>
                  <option>Bottom Left</option>
                  <option>Top Right</option>
                  <option>Top Left</option>
                  <option>Hidden (Voice Only)</option>
                </select>
              </div>
            </>
          )}

          {activeTab === 'settings' && (
            <>
              <div className={styles.settingGroup}>
                <label>Presentation Name</label>
                <input type="text" className={styles.input} defaultValue="Enterprise Sales Pitch" />
              </div>
              
              <div className={styles.settingGroup}>
                <label>Lead Generation Form</label>
                <select className={styles.select}>
                  <option>Show before presentation</option>
                  <option>Show after presentation</option>
                  <option>Do not show</option>
                </select>
              </div>
              
              <div className={styles.settingGroup}>
                <label>Viewer Experience</label>
                <div style={{display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '0.5rem'}}>
                  <label className={styles.toggleLabel}>
                    <input type="checkbox" defaultChecked /> Enable AI Chat Assistant
                  </label>
                  <label className={styles.toggleLabel}>
                    <input type="checkbox" defaultChecked /> Allow Voice Questions
                  </label>
                  <label className={styles.toggleLabel}>
                    <input type="checkbox" defaultChecked /> Show Slide Controls
                  </label>
                </div>
              </div>
            </>
          )}

          {activeTab === 'knowledge' && (
            <>
              <p style={{fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginBottom: '1rem'}}>
                Train your AI assistant so it can answer questions during the presentation.
              </p>
              
              <div className={styles.settingGroup}>
                <label>Base Prompt / Instructions</label>
                <textarea 
                  className={styles.textarea}
                  placeholder="You are an expert sales associate. Answer questions briefly..."
                  defaultValue="You are an expert sales associate. Only answer based on the provided slides."
                />
              </div>

              <div className={styles.settingGroup}>
                <label>Knowledge Documents</label>
                <div className={styles.uploadBox}>
                  <UploadCloud size={24} style={{marginBottom: '0.5rem'}} />
                  <div>Drop PDF/PPTX here to train AI</div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

    </div>
  );
};

export default ProjectEditor;
