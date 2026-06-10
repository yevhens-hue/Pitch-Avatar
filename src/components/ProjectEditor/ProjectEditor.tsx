import React, { useState } from 'react';
import styles from './ProjectEditor.module.css';
import { 
  ChevronLeft, Monitor, User, Target, MessageSquare, MoreVertical,
  Eye, Download, Share2, Save, X, Info, Folder, Image as ImageIcon,
  Settings, Hash, Wand2, Mic, Play, UploadCloud, Volume2, Video,
  Trash2, ArrowUp, ArrowDown, Plus
} from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';
import { useRouter } from 'next/navigation';
import ShareEnrollModal from '../ShareEnrollModal/ShareEnrollModal';

import { getProjectById } from '@/app/actions/projects';
import { updateProjectSlides } from '@/app/actions/projectSlides';
import { Project } from '@/types';
import { supabase } from '@/lib/supabase';
import ChatPanel from '@/widgets/Sara/ui/components/ChatPanel';

type RightTab = 'script' | 'about' | 'elements' | 'chat';

interface ProjectEditorProps {
  projectId?: string;
}

const ProjectEditor: React.FC<ProjectEditorProps> = ({ projectId }) => {
  const { showToast } = useToast();
  const router = useRouter();
  
  const [activeSlide, setActiveSlide] = useState(1);
  const [slides, setSlides] = useState<any[]>([
    { id: 1, text: "Ця презентація — технічне завдання команді розробки..." },
    { id: 2, text: "" },
    { id: 3, text: "" },
    { id: 4, text: "" },
    { id: 5, text: "" },
    { id: 6, text: "" },
    { id: 7, text: "" },
  ]);
  
  const [activeTab, setActiveTab] = useState<RightTab>('script');
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isNotificationsOff, setIsNotificationsOff] = useState(false);
  const [projectTitle, setProjectTitle] = useState("Untitled Project");
  
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingText, setIsGeneratingText] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  
  React.useEffect(() => {
    if (projectId) {
      getProjectById(projectId).then(project => {
        if (project) {
          setProjectTitle(project.title);
          if (project.slides && project.slides.length > 0) {
            setSlides(project.slides);
            setActiveSlide(project.slides[0].id);
          }
        }
      }).catch(console.error);
    }
  }, [projectId]);

  const handleSave = async () => {
    if (!projectId) return;
    setIsSaving(true);
    try {
      const res = await updateProjectSlides(projectId, slides);
      if (res.success) {
        showToast('Slides saved successfully', 'success');
      } else {
        showToast('Failed to save slides: ' + res.error, 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error saving slides', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const currentSlide = slides.find(s => s.id === activeSlide) || slides[0];

  const handleScriptChange = (text: string) => {
    setSlides(prev => prev.map(s => s.id === activeSlide ? { ...s, text } : s));
  };

  const handleAddSlide = () => {
    const newId = slides.length > 0 ? Math.max(...slides.map(s => s.id)) + 1 : 1;
    const newSlide = { id: newId, text: "" };
    setSlides(prev => [...prev, newSlide]);
    setActiveSlide(newId);
  };

  const handleRemoveSlide = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (slides.length <= 1) {
      showToast('You must have at least one slide', 'error');
      return;
    }
    const newSlides = slides.filter(s => s.id !== id);
    setSlides(newSlides);
    if (activeSlide === id) {
      setActiveSlide(newSlides[0].id);
    }
  };

  const handleMoveSlide = (e: React.MouseEvent, index: number, direction: 'up' | 'down') => {
    e.stopPropagation();
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === slides.length - 1) return;

    const newSlides = [...slides];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = newSlides[index];
    newSlides[index] = newSlides[targetIndex];
    newSlides[targetIndex] = temp;
    setSlides(newSlides);
  };

  const handleGenerateText = async () => {
    if (!currentSlide) return;
    setIsGeneratingText(true);
    
    try {
      const response = await fetch('/api/ai/generate-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: currentSlide.text,
          slideNumber: slides.findIndex(s => s.id === activeSlide) + 1,
          projectTitle: projectTitle
        }),
      });
      
      const data = await response.json();
      if (response.ok && data.text) {
        handleScriptChange(data.text);
        showToast('Text generated successfully!', 'success');
      } else {
        showToast(data.error || 'Failed to generate text', 'error');
      }
    } catch (error) {
      console.error(error);
      showToast('Error connecting to AI service', 'error');
    } finally {
      setIsGeneratingText(false);
    }
  };

  const handleGenerateAudio = async () => {
    if (!currentSlide || !currentSlide.text) {
      showToast('Please add script text first', 'error');
      return;
    }
    setIsGeneratingAudio(true);
    
    try {
      const response = await fetch('/api/ai/generate-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: currentSlide.text }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate audio');
      }

      const audioBlob = await response.blob();
      const fileName = `slide_${projectId || 'temp'}_${currentSlide.id}_${Date.now()}.mp3`;
      const filePath = `audio/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('assets')
        .upload(filePath, audioBlob, { contentType: 'audio/mpeg' });

      if (uploadError) throw new Error(uploadError.message);

      const { data } = supabase.storage.from('assets').getPublicUrl(filePath);
      
      setSlides(prev => prev.map(s => s.id === activeSlide ? { ...s, audioUrl: data.publicUrl } : s));
      showToast('Audio generated successfully!', 'success');
    } catch (error: any) {
      console.error(error);
      showToast(error.message || 'Error generating audio', 'error');
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* TOP BAR */}
      <div className={styles.topBar}>
        <div className={styles.topBarLeft}>
          <button className={styles.backBtn} onClick={() => router.push('/projects')}>
            <ChevronLeft size={20} />
          </button>
          <div className={styles.projectTitle}>{projectTitle}</div>
        </div>
        
        <div className={styles.topBarCenter}>
          <button className={`${styles.mainTab} ${styles.active}`}>
            <Monitor size={18} />
            <span>Slides</span>
          </button>
          <button className={styles.mainTab}>
            <User size={18} />
            <span>Access</span>
          </button>
          <button className={styles.mainTab}>
            <Target size={18} />
            <span>Goals</span>
          </button>
          <button className={styles.mainTab}>
            <MessageSquare size={18} />
            <span>AI Chat</span>
          </button>
          
          <div className={styles.moreDropdownContainer}>
            <button className={styles.mainTab} onClick={() => setIsMoreOpen(!isMoreOpen)}>
              <MoreVertical size={18} />
              <span>More</span>
            </button>
            {isMoreOpen && (
              <div className={styles.moreDropdown}>
                <button className={styles.moreDropdownItem}><Info size={16} color="#666"/> Information</button>
                <button className={styles.moreDropdownItem}><Folder size={16} color="#666"/> Knowledge base</button>
                <button className={styles.moreDropdownItem}><ImageIcon size={16} color="#666"/> Media Hub</button>
                <button className={styles.moreDropdownItem}><Settings size={16} color="#666"/> Parameters</button>
              </div>
            )}
          </div>
        </div>

        <div className={styles.topBarRight}>
          <button className={styles.iconBtn}><Eye size={18} /></button>
          <button className={styles.iconBtn}><Download size={18} /></button>
          <select className={styles.langSelect}>
            <option>Ukrainian</option>
            <option>English</option>
          </select>
          <button className={styles.btnOutline} onClick={() => setIsShareModalOpen(true)}>
            <Share2 size={14} /> Share
          </button>
          <button className={styles.btnSolid} onClick={handleSave} disabled={isSaving}>
            <Save size={14} /> {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className={styles.workspace}>
        {/* LEFT PANEL: Slides List */}
        <div className={styles.leftPanel}>
          {slides.map((slide, index) => (
            <div 
              key={slide.id}
              className={`${styles.slideThumbnail} ${activeSlide === slide.id ? styles.active : ''}`}
              onClick={() => setActiveSlide(slide.id)}
            >
              <div className={styles.slideThumbnailBadge}>Slide ID {slide.id}</div>
              <div className={styles.slideNumber}>{index + 1}</div>
              <div className={styles.slideActions}>
                <button onClick={(e) => handleMoveSlide(e, index, 'up')} disabled={index === 0} title="Move Up"><ArrowUp size={14}/></button>
                <button onClick={(e) => handleMoveSlide(e, index, 'down')} disabled={index === slides.length - 1} title="Move Down"><ArrowDown size={14}/></button>
                <button onClick={(e) => handleRemoveSlide(e, slide.id)} title="Delete"><Trash2 size={14}/></button>
              </div>
            </div>
          ))}
          <button className={styles.addSlideBtn} onClick={handleAddSlide}>
            <Plus size={16} /> Add Slide
          </button>
        </div>

        {/* CENTER PANEL: Stage */}
        <div className={styles.centerPanel}>
          <div className={styles.mainStage}>
            <div className={styles.stageContent}>
              <div className={styles.stageHeader}>P I T C H  A V A T A R • H R  O N B O A R D I N G</div>
              <div className={styles.stageTitle}>Нові можливості платформи:<br/>Головні 5 User Stories</div>
              <div className={styles.stageSubtitle}>Огляд нових сутностей та функціоналу для команди розробки</div>
              <div className={styles.stageBoxes}>
                <div className={styles.stageBox}>1. Listeners CRUD</div>
                <div className={styles.stageBox}>2. Enrollments</div>
                <div className={styles.stageBox}>3. Listener Seats & Billing</div>
                <div className={styles.stageBox}>4. Results Analytics</div>
              </div>
            </div>
            <div className={styles.stageFooter}>
              Product Owner: Pitch Avatar | Для команди розробки | Травень 2026
            </div>
            <div className={styles.stagePill}>Slide ID {activeSlide}</div>
          </div>
        </div>

        {/* RIGHT PANEL: Inspector */}
        <div className={styles.rightPanel}>
          <div className={styles.inspectorTabs}>
            <button className={`${styles.inspectorTab} ${activeTab === 'script' ? styles.active : ''}`} onClick={() => setActiveTab('script')}>Script</button>
            <button className={`${styles.inspectorTab} ${activeTab === 'about' ? styles.active : ''}`} onClick={() => setActiveTab('about')}>About</button>
            <button className={`${styles.inspectorTab} ${activeTab === 'elements' ? styles.active : ''}`} onClick={() => setActiveTab('elements')}>Elements</button>
            <button className={`${styles.inspectorTab} ${activeTab === 'chat' ? styles.active : ''}`} onClick={() => setActiveTab('chat')}>AI Chat</button>
            <button className={styles.inspectorTabChevron}>&gt;</button>
          </div>

          <div className={styles.inspectorContent} style={{ padding: activeTab === 'chat' ? 0 : '1.5rem', display: 'flex', flexDirection: 'column' }}>
            {activeTab === 'script' && (
              <>
                {/* Script Section */}
                <div className={styles.sectionHeader}>
                  <div className={styles.sectionTitle}>Script text for the slide <Info size={14} className={styles.infoIcon}/></div>
                </div>
                <div style={{position: 'relative'}}>
                   <textarea 
                    className={styles.scriptTextarea}
                    value={currentSlide.text}
                    onChange={(e) => handleScriptChange(e.target.value)}
                  />
                  <Hash size={16} color="#999" style={{position: 'absolute', right: 10, top: 10}}/>
                </div>
                <div className={styles.charCount}>{currentSlide.text.length}/20000 characters</div>
                <button 
                  className={styles.generateBtn} 
                  onClick={handleGenerateText}
                  disabled={isGeneratingText}
                >
                  <Wand2 size={16} /> {isGeneratingText ? 'Generating...' : 'Generate text with AI'}
                </button>

                {/* Audio Section */}
                <div className={styles.sectionHeader} style={{marginTop: '1.5rem'}}>
                  <div className={styles.sectionTitle}>Audio <Info size={14} className={styles.infoIcon}/></div>
                </div>
                
                {currentSlide.audioUrl && (
                  <div style={{ marginBottom: '1rem' }}>
                    <audio controls src={currentSlide.audioUrl} style={{ width: '100%', height: '40px' }} />
                  </div>
                )}

                <div className={styles.toolRow}>
                  <Mic size={18} className={styles.toolIcon} />
                  <button className={styles.toolBtnOutline}>
                    <Volume2 size={14} /> Start
                  </button>
                  <button className={styles.toolActionIcon}><Play size={16}/></button>
                  <button className={styles.toolActionIcon}><Download size={16}/></button>
                  <button className={styles.toolActionIcon}><UploadCloud size={16}/></button>
                </div>
                <button 
                  className={styles.generateBtn} 
                  onClick={handleGenerateAudio}
                  disabled={isGeneratingAudio}
                >
                  <Volume2 size={16} /> {isGeneratingAudio ? 'Generating...' : 'Generate audio with AI'}
                </button>

                {/* Video Section */}
                <div className={styles.sectionHeader} style={{marginTop: '1.5rem'}}>
                  <div className={styles.sectionTitle}>Video <Info size={14} className={styles.infoIcon}/></div>
                </div>
                <div className={styles.toolRow}>
                  <Video size={18} className={styles.toolIcon} />
                  <button className={styles.toolBtnOutline}>
                    <Volume2 size={14} /> Start
                  </button>
                  <button className={styles.toolActionIcon} style={{visibility: 'hidden'}}><Play size={16}/></button>
                  <button className={styles.toolActionIcon}><Download size={16}/></button>
                  <button className={styles.toolActionIcon}><UploadCloud size={16}/></button>
                </div>
                <button className={styles.generateBtn}>
                  <User size={16} /> Generate avatar with AI
                </button>
              </>
            )}
            
            {activeTab === 'about' && <div style={{color: '#666', fontSize: '0.85rem'}}>About settings coming soon.</div>}
            {activeTab === 'elements' && <div style={{color: '#666', fontSize: '0.85rem'}}>Elements settings coming soon.</div>}
            {activeTab === 'chat' && (
              <div style={{ flex: 1, position: 'relative', height: '100%' }}>
                <ChatPanel />
              </div>
            )}
          </div>
        </div>
      </div>

      <ShareEnrollModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        projectTitle={projectTitle} 
        projectId={projectId || "mock-editor-project-id"}
      />
    </div>
  );
};

export default ProjectEditor;
