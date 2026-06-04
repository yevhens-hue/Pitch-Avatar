import React, { useState } from 'react';
import styles from './ProjectEditor.module.css';
import { 
  Play, Plus, Image as ImageIcon, Settings, 
  Volume2, Mic, Languages, Sparkles, Layout,
  MessageSquare, MoreHorizontal, ArrowLeft,
  Music, Type, Layers, Video
} from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';
import { useRouter } from 'next/navigation';

type RightTab = 'avatar' | 'voice' | 'settings' | 'knowledge';
type ToolMode = 'script' | 'media' | 'background';

const ProjectEditor: React.FC = () => {
  const { showToast } = useToast();
  const router = useRouter();
  
  const [activeSlide, setActiveSlide] = useState(1);
  const [slides, setSlides] = useState([
    { id: 1, text: "Welcome to our platform.", duration: "0:05", bg: "default" },
    { id: 2, text: "Let's review the quarterly results.", duration: "0:08", bg: "default" },
    { id: 3, text: "Thank you for watching.", duration: "0:04", bg: "default" },
  ]);
  
  const [activeTab, setActiveTab] = useState<RightTab>('avatar');
  const [activeTool, setActiveTool] = useState<ToolMode>('script');
  
  const currentSlide = slides.find(s => s.id === activeSlide) || slides[0];

  const handleScriptChange = (text: string) => {
    setSlides(prev => prev.map(s => s.id === activeSlide ? { ...s, text } : s));
  };

  return (
    <div className={styles.container}>
      {/* HEADER / TOP BAR */}
      <div className={styles.topBar}>
        <div className={styles.topBarLeft}>
          <button className={styles.iconBtn} onClick={() => router.push('/projects')}>
            <ArrowLeft size={18} />
          </button>
          <div className={styles.projectName}>
            <input type="text" defaultValue="Untitled Presentation" className={styles.titleInput} />
            <span className={styles.projectStatus}>Draft</span>
          </div>
        </div>
        <div className={styles.topBarRight}>
          <button className={styles.secondaryBtn} onClick={() => showToast("Saved", "success")}>Save</button>
          <button className={styles.primaryBtn} onClick={() => router.push('/play')}>
            <Play size={14} /> Preview
          </button>
          <button className={styles.primaryBtn} style={{background: '#6366f1'}}>
            Generate Video
          </button>
        </div>
      </div>

      <div className={styles.workspace}>
        {/* LEFT PANEL: Slides List */}
        <div className={styles.leftPanel}>
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>Slides</span>
          </div>
          
          <div className={styles.slideList}>
            {slides.map((slide, index) => (
              <div 
                key={slide.id}
                className={`${styles.slideThumbnail} ${activeSlide === slide.id ? styles.active : ''}`}
                onClick={() => setActiveSlide(slide.id)}
              >
                <div className={styles.slidePreviewBox}>
                  <ImageIcon size={24} opacity={0.3} />
                  <div className={styles.slideDuration}>{slide.duration}</div>
                </div>
                <div className={styles.slideFooter}>
                  <span className={styles.slideNumber}>{index + 1}</span>
                  <button className={styles.iconBtnSmall}><MoreHorizontal size={14}/></button>
                </div>
              </div>
            ))}
          </div>
          
          <button className={styles.addSlideBtn} onClick={() => {
            const newId = slides.length + 1;
            setSlides([...slides, { id: newId, text: "", duration: "0:00", bg: "default" }]);
            setActiveSlide(newId);
          }}>
            <Plus size={16} /> Add Slide
          </button>
        </div>

        {/* CENTER PANEL: Stage & Script */}
        <div className={styles.centerPanel}>
          {/* Main Toolbar */}
          <div className={styles.centerToolbar}>
            <button className={`${styles.toolBtn} ${activeTool === 'script' ? styles.activeTool : ''}`} onClick={() => setActiveTool('script')}>
              <Type size={16} /> Script
            </button>
            <button className={`${styles.toolBtn} ${activeTool === 'media' ? styles.activeTool : ''}`} onClick={() => setActiveTool('media')}>
              <Video size={16} /> Media
            </button>
            <button className={`${styles.toolBtn} ${activeTool === 'background' ? styles.activeTool : ''}`} onClick={() => setActiveTool('background')}>
              <ImageIcon size={16} /> Background
            </button>
          </div>

          <div className={styles.stageArea}>
            <div className={styles.mainStage}>
              <div className={styles.stageContent}>
                 Slide {activeSlide} Visuals
              </div>
              <div className={styles.avatarOverlay}>
                <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200&h=200" alt="Avatar" />
              </div>
            </div>
          </div>
          
          {activeTool === 'script' && (
            <div className={styles.scriptPanel}>
              <div className={styles.scriptHeader}>
                <div className={styles.scriptHeaderLeft}>
                  <Volume2 size={16} opacity={0.7} />
                  <span style={{fontWeight: 500, fontSize: '0.9rem'}}>Avatar Speech</span>
                </div>
                <div className={styles.scriptHeaderRight}>
                  <button className={styles.generateBtn} onClick={() => showToast("AI Script Generation coming soon", "info")}>
                    <Sparkles size={14} /> AI Rewrite
                  </button>
                </div>
              </div>
              
              <textarea 
                className={styles.scriptTextarea}
                placeholder="Type the script here. The AI avatar will read this text aloud..."
                value={currentSlide.text}
                onChange={(e) => handleScriptChange(e.target.value)}
              />
              
              <div className={styles.scriptFooter}>
                <div className={styles.scriptMetrics}>
                  <span>{currentSlide.text.length} chars</span>
                  <span className={styles.dot}>•</span>
                  <span>~{Math.ceil(currentSlide.text.length / 15)} sec</span>
                </div>
                <button className={styles.listenBtn} onClick={() => showToast("Playing audio preview...", "info")}>
                  <Play size={14} /> Listen
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANEL: Inspector */}
        <div className={styles.rightPanel}>
          <div className={styles.inspectorTabs}>
            <button className={`${styles.inspectorTab} ${activeTab === 'avatar' ? styles.active : ''}`} onClick={() => setActiveTab('avatar')}>Avatar</button>
            <button className={`${styles.inspectorTab} ${activeTab === 'voice' ? styles.active : ''}`} onClick={() => setActiveTab('voice')}>Voice</button>
            <button className={`${styles.inspectorTab} ${activeTab === 'settings' ? styles.active : ''}`} onClick={() => setActiveTab('settings')}>Settings</button>
            <button className={`${styles.inspectorTab} ${activeTab === 'knowledge' ? styles.active : ''}`} onClick={() => setActiveTab('knowledge')}>Knowledge Base</button>
          </div>

          <div className={styles.inspectorContent}>
            {activeTab === 'avatar' && (
              <div className={styles.inspectorSection}>
                <label className={styles.sectionLabel}>Select Avatar</label>
                <div className={styles.avatarGrid}>
                  <div className={`${styles.avatarItem} ${styles.active}`}><img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=100&h=100" alt="Ava" /></div>
                  <div className={styles.avatarItem}><img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=100&h=100" alt="Bob" /></div>
                  <div className={styles.avatarItem}><img src="https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=100&h=100" alt="Cat" /></div>
                </div>
                
                <label className={styles.sectionLabel} style={{marginTop: '1.5rem'}}>Position & Size</label>
                <select className={styles.select}>
                  <option>Bottom Right</option>
                  <option>Bottom Left</option>
                  <option>Top Right</option>
                  <option>Top Left</option>
                </select>
                <div className={styles.sliderGroup} style={{marginTop: '1rem'}}>
                  <span style={{fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)'}}>Size</span>
                  <input type="range" min="50" max="200" defaultValue="100" className={styles.range} />
                </div>
              </div>
            )}

            {activeTab === 'voice' && (
              <div className={styles.inspectorSection}>
                <label className={styles.sectionLabel}>Language</label>
                <select className={styles.select}>
                  <option>English (US)</option>
                  <option>English (UK)</option>
                  <option>Spanish</option>
                  <option>French</option>
                </select>

                <label className={styles.sectionLabel} style={{marginTop: '1.5rem'}}>Voice Style</label>
                <div className={styles.voiceList}>
                  <div className={`${styles.voiceItem} ${styles.active}`}>
                    <div className={styles.voiceName}>Professional Female</div>
                    <button className={styles.iconBtnSmall}><Play size={12}/></button>
                  </div>
                  <div className={styles.voiceItem}>
                    <div className={styles.voiceName}>Energetic Male</div>
                    <button className={styles.iconBtnSmall}><Play size={12}/></button>
                  </div>
                </div>
                
                <div className={styles.toggleGroup} style={{marginTop: '1.5rem'}}>
                  <label className={styles.toggleLabel}>
                    <input type="checkbox" /> Apply voice to all slides
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className={styles.inspectorSection}>
                <label className={styles.sectionLabel}>Viewer Experience</label>
                <div className={styles.toggleList}>
                  <label className={styles.toggleLabel}>
                    <input type="checkbox" defaultChecked /> Enable AI Chat (Sara)
                  </label>
                  <label className={styles.toggleLabel}>
                    <input type="checkbox" defaultChecked /> Enable Voice Questions
                  </label>
                  <label className={styles.toggleLabel}>
                    <input type="checkbox" defaultChecked /> Show Subtitles
                  </label>
                </div>

                <label className={styles.sectionLabel} style={{marginTop: '1.5rem'}}>Lead Generation</label>
                <select className={styles.select}>
                  <option>Before presentation</option>
                  <option>After presentation</option>
                  <option>Don't collect leads</option>
                </select>
              </div>
            )}

            {activeTab === 'knowledge' && (
              <div className={styles.inspectorSection}>
                <p className={styles.helperText}>
                  Train the AI to answer questions from your viewers while they watch the presentation.
                </p>
                <label className={styles.sectionLabel} style={{marginTop: '1rem'}}>Upload Documents</label>
                <div className={styles.uploadArea}>
                  <Plus size={20} opacity={0.5} style={{marginBottom: '0.5rem'}}/>
                  <span>Upload PDF, DOCX or TXT</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectEditor;
