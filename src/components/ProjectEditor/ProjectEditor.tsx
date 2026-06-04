import React, { useState } from 'react';
import styles from './ProjectEditor.module.css';
import { 
  ChevronLeft, Monitor, User, Target, MessageSquare, MoreVertical,
  Eye, Download, Share2, Save, X, Info, Folder, Image as ImageIcon,
  Settings, Hash, Wand2, Mic, Play, UploadCloud, Volume2, Video
} from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';
import { useRouter } from 'next/navigation';

type RightTab = 'script' | 'about' | 'elements';

const ProjectEditor: React.FC = () => {
  const { showToast } = useToast();
  const router = useRouter();
  
  const [activeSlide, setActiveSlide] = useState(1);
  const [slides, setSlides] = useState([
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
  
  const currentSlide = slides.find(s => s.id === activeSlide) || slides[0];

  const handleScriptChange = (text: string) => {
    setSlides(prev => prev.map(s => s.id === activeSlide ? { ...s, text } : s));
  };

  return (
    <div className={styles.container}>
      {/* TOP BAR */}
      <div className={styles.topBar}>
        <div className={styles.topBarLeft}>
          <button className={styles.backBtn} onClick={() => router.push('/projects')}>
            <ChevronLeft size={20} />
          </button>
          <div className={styles.projectTitle}>PitchAvatar_HR_Main5_UA</div>
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
          <button className={styles.btnSolid}>
            <Save size={14} /> Save
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
            </div>
          ))}
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
                <div className={styles.stageBox}>2. Assignments</div>
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
            <button className={styles.inspectorTabChevron}>&gt;</button>
          </div>

          <div className={styles.inspectorContent}>
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
                <button className={styles.generateBtn}>
                  <Wand2 size={16} /> Generate text with AI
                </button>

                {/* Audio Section */}
                <div className={styles.sectionHeader} style={{marginTop: '1.5rem'}}>
                  <div className={styles.sectionTitle}>Audio <Info size={14} className={styles.infoIcon}/></div>
                </div>
                <div className={styles.toolRow}>
                  <Mic size={18} className={styles.toolIcon} />
                  <button className={styles.toolBtnOutline}>
                    <Volume2 size={14} /> Start
                  </button>
                  <button className={styles.toolActionIcon}><Play size={16}/></button>
                  <button className={styles.toolActionIcon}><Download size={16}/></button>
                  <button className={styles.toolActionIcon}><UploadCloud size={16}/></button>
                </div>
                <button className={styles.generateBtn}>
                  <Volume2 size={16} /> Generate audio with AI
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
          </div>
        </div>
      </div>

      {/* SHARE MODAL (Link settings) */}
      {isShareModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>Link settings</div>
              <button className={styles.modalClose} onClick={() => setIsShareModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className={styles.modalTabs}>
              <button className={`${styles.modalTab} ${styles.active}`}>Basic settings</button>
              <button className={styles.modalTab}>Personalization</button>
              <button className={styles.modalTab}>Lead form</button>
              <button className={styles.modalTab}>Advanced</button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.modalGroup}>
                <label className={styles.modalLabel}>Link title</label>
                <input type="text" className={styles.modalInput} defaultValue="PitchAvatar_HR_Main5_UA" />
              </div>
              
              <div className={styles.modalGroup}>
                <label className={styles.modalLabel}>Presenter</label>
                <select className={styles.modalSelect}>
                  <option>yevhen.shaforostov@roi4cio.com</option>
                </select>
              </div>
              
              <div className={styles.modalGroup}>
                <input type="text" className={styles.modalInput} placeholder="Link to calendar" />
              </div>
              
              <div className={styles.modalToggleRow}>
                <div className={styles.modalToggleText}>
                  Don't send notifications when the listener opens the link
                  <Info size={14} color="#999" />
                </div>
                <div 
                  className={`${styles.toggleSwitch} ${isNotificationsOff ? styles.active : ''}`}
                  onClick={() => setIsNotificationsOff(!isNotificationsOff)}
                />
              </div>
            </div>
            
            <div className={styles.modalFooter}>
              <button className={styles.btnSolid} onClick={() => {
                showToast("Link created!", "success");
                setIsShareModalOpen(false);
              }}>Create</button>
              <button className={styles.btnOutline} style={{border: 'none', color: '#0d6efd'}} onClick={() => setIsShareModalOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectEditor;
