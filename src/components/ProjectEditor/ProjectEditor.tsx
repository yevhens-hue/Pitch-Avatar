import React, { useState } from 'react';
import styles from './ProjectEditor.module.css';
import {
  ChevronLeft, Monitor, User, BookOpen, Settings, MessageSquare,
  Eye, Download, Share2, Save, UploadCloud, Dumbbell,
  Wand2, Mic, Play, Volume2, Video,
  Trash2, ArrowUp, ArrowDown, Plus, Info, Hash, LayoutTemplate
} from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';
import { useRouter } from 'next/navigation';
import ShareEnrollModal from '../ShareEnrollModal/ShareEnrollModal';
import { getProjectById } from '@/app/actions/projects';
import { updateProjectSlides } from '@/app/actions/projectSlides';
import { Project, ProjectType } from '@/types';
import { supabase } from '@/lib/supabase';
import ChatPanel from '@/widgets/Sara/ui/components/ChatPanel';
import { useAuth } from '@/context/AuthContext';
import { trackActivationEvent } from '@/lib/stonly';

// Panel components
import AvatarPanel from './panels/AvatarPanel';
import InstructionsPanel from './panels/InstructionsPanel';
import KnowledgeBasePanel from './panels/KnowledgeBasePanel';
import SettingsPanel from './panels/SettingsPanel';
import ImportPanel from './panels/ImportPanel';

// ── Slide normalisation ───────────────────────────────────────────────
interface Slide {
  id: number;
  text: string;
  audioUrl?: string;
  thumbnailUrl?: string;
  title?: string;
  [key: string]: unknown;
}

/** Normalise a raw slide from Supabase to the internal Slide shape */
function normaliseSlide(raw: unknown, index: number): Slide {
  if (!raw || typeof raw !== 'object') {
    return { id: index + 1, text: '' };
  }
  const r = raw as Record<string, unknown>;
  const text =
    (typeof r.text === 'string' ? r.text : null) ??
    (typeof r.script === 'string' ? r.script : null) ??
    (typeof r.content === 'string' ? r.content : null) ??
    '';
  const id =
    typeof r.id === 'number' ? r.id :
    typeof r.id === 'string' ? Number(r.id) || index + 1 :
    index + 1;
  return {
    ...r,
    id,
    text,
    audioUrl: typeof r.audioUrl === 'string' ? r.audioUrl : undefined,
    thumbnailUrl: typeof r.thumbnailUrl === 'string' ? r.thumbnailUrl : undefined,
    title: typeof r.title === 'string' ? r.title : undefined,
  };
}

// ── Menu item definition ──────────────────────────────────────────────
export type MenuItemId = 'slides' | 'settings' | 'avatar' | 'instructions' | 'knowledge-base' | 'create-ai' | 'import' | 'share';

interface MenuItem {
  id: MenuItemId;
  label: string;
  icon: React.ReactNode;
}

// Order matches Lovable reference: Slides | Settings | Avatar | KB | Instructions | Create with AI | Import | Share
const ALL_MENU_ITEMS: MenuItem[] = [
  { id: 'slides',         label: 'Slides',         icon: <Monitor size={18} /> },
  { id: 'settings',       label: 'Settings',       icon: <Settings size={18} /> },
  { id: 'avatar',         label: 'Avatar',         icon: <User size={18} /> },
  { id: 'knowledge-base', label: 'Knowledge Base',  icon: <BookOpen size={18} /> },
  { id: 'instructions',   label: 'Instructions',   icon: <MessageSquare size={18} /> },
  { id: 'create-ai',      label: 'Create with AI', icon: <Wand2 size={18} /> },
  { id: 'import',         label: 'Import',         icon: <UploadCloud size={18} /> },
  { id: 'share',          label: 'Share/Assign',   icon: <Share2 size={18} /> },
];

/** Returns visible menu items based on project type. Order follows ALL_MENU_ITEMS sequence. */
function getVisibleMenuItems(projectType?: ProjectType, isWidget?: boolean): MenuItemId[] {
  if (!projectType) return ['slides', 'settings', 'create-ai', 'import', 'share'];

  const isPresentation = projectType === 'slides' || projectType === 'presentation' || projectType === 'from-scratch';
  const isChatAvatar = projectType === 'chat-avatar' || projectType === 'assistant';
  const isWidgetProject = projectType === 'widget' || isWidget === true;
  const isVideo = projectType === 'video';

  if (isPresentation || isVideo) {
    return ['slides', 'settings', 'create-ai', 'import', 'share'];
  }
  if (isWidgetProject) {
    // Widget: no Slides panel
    return ['settings', 'avatar', 'knowledge-base', 'instructions', 'create-ai', 'import', 'share'];
  }
  if (isChatAvatar) {
    // Full Chat Avatar: all items
    return ['slides', 'settings', 'avatar', 'knowledge-base', 'instructions', 'create-ai', 'import', 'share'];
  }
  return ['slides', 'settings', 'create-ai', 'import', 'share'];
}

// ── Right inspector tabs (for Slides panel) ───────────────────────────
type RightTab = 'script' | 'about' | 'elements' | 'chat';

interface ProjectEditorProps {
  projectId?: string;
}

const ProjectEditor: React.FC<ProjectEditorProps> = ({ projectId }) => {
  const { showToast } = useToast();
  const router = useRouter();

  // Project data
  const [projectTitle, setProjectTitle] = useState('Untitled Project');
  const [projectType, setProjectType] = useState<ProjectType | undefined>(undefined);
  const [isWidget, setIsWidget] = useState(false);
  const { user } = useAuth();

  // Menu state
  const [activeMenuItem, setActiveMenuItem] = useState<MenuItemId>('slides');

  // Slides state – always Slide[] with guaranteed .text
  const [activeSlide, setActiveSlide] = useState(1);
  const [slides, setSlides] = useState<Slide[]>([
    { id: 1, text: '' },
    { id: 2, text: '' },
  ]);
  const [activeTab, setActiveTab] = useState<RightTab>('script');

  // Other UI
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingText, setIsGeneratingText] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);

  React.useEffect(() => {
    if (projectId) {
      getProjectById(projectId).then(project => {
        if (project) {
          setProjectTitle(project.title);
          setProjectType(project.type);
          setIsWidget(project.isWidget ?? false);
          if (project.slides && project.slides.length > 0) {
            // Normalise every slide so .text is always a string
            const normalised = (project.slides as unknown[]).map(
              (raw, i) => normaliseSlide(raw, i)
            );
            setSlides(normalised);
            setActiveSlide(normalised[0].id);
          }
          // Auto-navigate to avatar panel for avatar-type projects
          if (project.type === 'chat-avatar' || project.type === 'assistant' || project.type === 'widget') {
            setActiveMenuItem('avatar');
          }
        }
      }).catch(console.error);
    }
  }, [projectId]);

  const visibleMenuItems = ALL_MENU_ITEMS.filter(
    item => getVisibleMenuItems(projectType, isWidget).includes(item.id)
  );

  // Ensure active menu item is always a valid visible item
  React.useEffect(() => {
    const validIds = getVisibleMenuItems(projectType, isWidget);
    if (!validIds.includes(activeMenuItem)) {
      setActiveMenuItem(validIds[0] as MenuItemId);
    }
  }, [projectType, isWidget, activeMenuItem]);

  // ── Handlers ──────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!projectId) return;
    setIsSaving(true);
    try {
      const res = await updateProjectSlides(projectId, slides);
      if (res.success) {
        showToast('Slides saved successfully', 'success');
        trackActivationEvent('tour_generate_video', user?.id, user?.user_metadata?.main_goal);
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

  const currentSlide: Slide = slides.find(s => s.id === activeSlide) ?? slides[0] ?? { id: 1, text: '' };

  const handleScriptChange = (text: string) => {
    setSlides(prev => prev.map(s => s.id === activeSlide ? { ...s, text } : s) as Slide[]);
  };

  const handleAddSlide = () => {
    const newId = slides.length > 0 ? Math.max(...slides.map(s => s.id)) + 1 : 1;
    setSlides(prev => [...prev, { id: newId, text: '' }] as Slide[]);
    setActiveSlide(newId);
  };

  const handleRemoveSlide = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (slides.length <= 1) { showToast('You must have at least one slide', 'error'); return; }
    const newSlides = slides.filter(s => s.id !== id) as Slide[];
    setSlides(newSlides);
    if (activeSlide === id) setActiveSlide(newSlides[0].id);
  };

  const handleMoveSlide = (e: React.MouseEvent, index: number, direction: 'up' | 'down') => {
    e.stopPropagation();
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === slides.length - 1) return;
    const newSlides = [...slides];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newSlides[index], newSlides[targetIndex]] = [newSlides[targetIndex], newSlides[index]];
    setSlides(newSlides);
  };

  const handleGenerateText = async () => {
    if (!currentSlide) return;
    setIsGeneratingText(true);
    try {
      const response = await fetch('/api/ai/generate-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: currentSlide.text, slideNumber: slides.findIndex(s => s.id === activeSlide) + 1, projectTitle }),
      });
      const data = await response.json();
      if (response.ok && data.text) {
        handleScriptChange(data.text);
        showToast('Text generated successfully!', 'success');
        trackActivationEvent('tour_write_script', user?.id, user?.user_metadata?.main_goal);
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
    if (!currentSlide || !currentSlide.text) { showToast('Please add script text first', 'error'); return; }
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
      const { error: uploadError } = await supabase.storage.from('assets').upload(filePath, audioBlob, { contentType: 'audio/mpeg' });
      if (uploadError) throw new Error(uploadError.message);
      const { data } = supabase.storage.from('assets').getPublicUrl(filePath);
      setSlides(prev => prev.map(s => s.id === activeSlide ? { ...s, audioUrl: data.publicUrl } : s) as Slide[]);
      showToast('Audio generated successfully!', 'success');
    } catch (error: any) {
      console.error(error);
      showToast(error.message || 'Error generating audio', 'error');
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  // ── Render panel content ──────────────────────────────────────────
  const renderPanelContent = () => {
    switch (activeMenuItem) {
      case 'avatar':
        return <AvatarPanel projectId={projectId} />;
      case 'instructions':
        return <InstructionsPanel projectId={projectId} />;
      case 'knowledge-base':
        return <KnowledgeBasePanel projectId={projectId} />;
      case 'settings':
        return <SettingsPanel projectId={projectId} projectTitle={projectTitle} projectType={projectType} />;
      case 'import':
        return <ImportPanel projectId={projectId} />;
      case 'create-ai':
        return (
          <div style={{ padding: '2rem', maxWidth: 560 }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', marginBottom: '0.5rem' }}>Create with AI</h2>
            <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '1.5rem' }}>Generate slides, scripts, and avatars automatically using AI.</p>
            <button className={styles.generateBtn} onClick={handleGenerateText} disabled={isGeneratingText}>
              <Wand2 size={16} /> {isGeneratingText ? 'Generating...' : 'Generate slide script with AI'}
            </button>
          </div>
        );
      case 'share':
        return (
          <div style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', marginBottom: '0.5rem' }}>Share / Assign</h2>
            <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '1.5rem' }}>Share your project or assign it to listeners.</p>
            <button
              className={styles.btnSolid}
              onClick={() => setIsShareModalOpen(true)}
              id="share-assign-open-btn"
            >
              <Share2 size={16} /> Open Share & Assign
            </button>
          </div>
        );
      case 'slides':
      default:
        return renderSlidesWorkspace();
    }
  };

  // ── Slides workspace (3-column layout) ───────────────────────────
  const renderSlidesWorkspace = () => (
    <div className={styles.workspace}>
      {/* LEFT: slide list */}
      <div className={styles.leftPanel}>
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`${styles.slideThumbnail} ${activeSlide === slide.id ? styles.active : ''}`}
            onClick={() => setActiveSlide(slide.id)}
          >
            {/* Slide number badge */}
            <div className={styles.slideNumber}>{index + 1}</div>
            {/* Preview text */}
            {slide.thumbnailUrl ? (
              <img
                src={slide.thumbnailUrl}
                alt={`Slide ${index + 1}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 2 }}
              />
            ) : (
              <div className={styles.slideThumbnailContent}>
                {slide.title && <div className={styles.slideThumbnailTitle}>{slide.title}</div>}
                {slide.text && (
                  <div className={styles.slideThumbnailText}>
                    {slide.text.slice(0, 60)}{slide.text.length > 60 ? '…' : ''}
                  </div>
                )}
              </div>
            )}
            <div className={styles.slideActions}>
              <button onClick={(e) => handleMoveSlide(e, index, 'up')} disabled={index === 0} title="Move Up" aria-label="Move slide up"><ArrowUp size={12} /></button>
              <button onClick={(e) => handleMoveSlide(e, index, 'down')} disabled={index === slides.length - 1} title="Move Down" aria-label="Move slide down"><ArrowDown size={12} /></button>
              <button onClick={(e) => handleRemoveSlide(e, slide.id)} title="Delete" aria-label="Delete slide"><Trash2 size={12} /></button>
            </div>
          </div>
        ))}
        <button className={styles.addSlideBtn} onClick={handleAddSlide} aria-label="Add new slide">
          <Plus size={16} /> Add Slide
        </button>
      </div>

      {/* CENTER: stage */}
      <div className={styles.centerPanel}>
        <div className={styles.mainStage}>
          <div className={styles.stageContent}>
            <div className={styles.stageHeader}>P I T C H  A V A T A R • H R  O N B O A R D I N G</div>
            <div className={styles.stageTitle}>Нові можливості платформи:<br />Головні 5 User Stories</div>
            <div className={styles.stageSubtitle}>Огляд нових сутностей та функціоналу для команди розробки</div>
            <div className={styles.stageBoxes}>
              <div className={styles.stageBox}>1. Listeners CRUD</div>
              <div className={styles.stageBox}>2. Enrollments</div>
              <div className={styles.stageBox}>3. Listener Seats &amp; Billing</div>
            </div>
          </div>
          <div className={styles.stageFooter}>
            Product Owner: Pitch Avatar | Для команди розробки | Травень 2026
          </div>
          <div className={styles.stagePill}>Slide ID {activeSlide}</div>
        </div>
      </div>

      {/* RIGHT: inspector */}
      <div className={styles.rightPanel}>
        <div className={styles.inspectorTabs}>
          <button className={`${styles.inspectorTab} ${activeTab === 'script' ? styles.active : ''}`} onClick={() => setActiveTab('script')}>Script</button>
          <button className={`${styles.inspectorTab} ${activeTab === 'about' ? styles.active : ''}`} onClick={() => setActiveTab('about')}>About</button>
          <button className={`${styles.inspectorTab} ${activeTab === 'elements' ? styles.active : ''}`} onClick={() => setActiveTab('elements')}>Elements</button>
          <button className={`${styles.inspectorTab} ${activeTab === 'chat' ? styles.active : ''}`} onClick={() => setActiveTab('chat')}>AI Chat</button>
        </div>
        <div className={styles.inspectorContent} style={{ padding: activeTab === 'chat' ? 0 : '1.5rem', display: 'flex', flexDirection: 'column' }}>
          {activeTab === 'script' && (
            <>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionTitle}>Script text for the slide <Info size={14} className={styles.infoIcon} /></div>
              </div>
              <div style={{ position: 'relative' }}>
                <textarea
                  className={styles.scriptTextarea}
                  value={currentSlide.text ?? ''}
                  onChange={(e) => handleScriptChange(e.target.value)}
                  placeholder="Write your slide script here, or use AI to generate it..."
                />
                <Hash size={16} color="#999" style={{ position: 'absolute', right: 10, top: 10 }} />
              </div>
              <div className={styles.charCount}>{(currentSlide.text ?? '').length}/20000 characters</div>
              <button className={styles.generateBtn} onClick={handleGenerateText} disabled={isGeneratingText}>
                <Wand2 size={16} /> {isGeneratingText ? 'Generating...' : 'Generate text with AI'}
              </button>
              <div className={styles.sectionHeader} style={{ marginTop: '1.5rem' }}>
                <div className={styles.sectionTitle}>Audio <Info size={14} className={styles.infoIcon} /></div>
              </div>
              {currentSlide.audioUrl && (
                <div style={{ marginBottom: '1rem' }}>
                  <audio controls src={currentSlide.audioUrl} style={{ width: '100%', height: '40px' }} />
                </div>
              )}
              <div className={styles.toolRow}>
                <Mic size={18} className={styles.toolIcon} />
                <button className={styles.toolBtnOutline}><Volume2 size={14} /> Start</button>
                <button className={styles.toolActionIcon}><Play size={16} /></button>
                <button className={styles.toolActionIcon}><Download size={16} /></button>
              </div>
              <button className={styles.generateBtn} onClick={handleGenerateAudio} disabled={isGeneratingAudio}>
                <Volume2 size={16} /> {isGeneratingAudio ? 'Generating...' : 'Generate audio with AI'}
              </button>
              <div className={styles.sectionHeader} style={{ marginTop: '1.5rem' }}>
                <div className={styles.sectionTitle}>Video <Info size={14} className={styles.infoIcon} /></div>
              </div>
              <div className={styles.toolRow}>
                <Video size={18} className={styles.toolIcon} />
                <button className={styles.toolBtnOutline}><Volume2 size={14} /> Start</button>
                <button className={styles.toolActionIcon}><Download size={16} /></button>
              </div>
              <button className={styles.generateBtn} onClick={() => {
                showToast('Avatar generated successfully!', 'success');
                trackActivationEvent('tour_create_avatar', user?.id, user?.user_metadata?.main_goal);
              }}>
                <User size={16} /> Generate avatar with AI
              </button>
            </>
          )}
          {activeTab === 'about' && <div style={{ color: '#666', fontSize: '0.85rem' }}>About settings coming soon.</div>}
          {activeTab === 'elements' && <div style={{ color: '#666', fontSize: '0.85rem' }}>Elements settings coming soon.</div>}
          {activeTab === 'chat' && (
            <div style={{ flex: 1, position: 'relative', height: '100%' }}>
              <ChatPanel />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // ── Main render ──────────────────────────────────────────────────
  return (
    <div className={styles.container}>
      {/* TOP BAR */}
      <div className={styles.topBar}>
        <div className={styles.topBarLeft}>
          <button className={styles.backBtn} onClick={() => router.push('/projects')} aria-label="Back to projects">
            <ChevronLeft size={20} />
          </button>
          <div className={styles.projectTitle}>{projectTitle}</div>
        </div>

        {/* Universal adaptive menu */}
        <nav className={styles.topBarCenter} aria-label="Project editor navigation">
          {visibleMenuItems.map(item => (
            <button
              key={item.id}
              id={`menu-${item.id}`}
              className={`${styles.mainTab} ${activeMenuItem === item.id ? styles.active : ''}`}
              onClick={() => setActiveMenuItem(item.id)}
              aria-current={activeMenuItem === item.id ? 'page' : undefined}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className={styles.topBarRight}>
          <button
            className={styles.iconBtn}
            title="Train Mode"
            aria-label="Open Train Mode"
            onClick={() => router.push(`/coach/${projectId}`)}
          >
            <Dumbbell size={18} />
          </button>
          <button className={styles.iconBtn} aria-label="Preview"><Eye size={18} /></button>
          <button className={styles.iconBtn} aria-label="Download"><Download size={18} /></button>
          <select className={styles.langSelect} aria-label="Select language">
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

      {/* CONTENT AREA */}
      <div className={`${styles.contentArea} ${activeMenuItem !== 'slides' ? styles.contentAreaPanel : ''}`}>
        {renderPanelContent()}
      </div>

      <ShareEnrollModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        projectTitle={projectTitle}
        projectId={projectId || 'mock-editor-project-id'}
        projectType={projectType}
      />
    </div>
  );
};

export default ProjectEditor;
