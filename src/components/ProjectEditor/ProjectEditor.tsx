'use client'

import React, { useState } from 'react';
import styles from './ProjectEditor.module.css';
import {
  ChevronLeft, Monitor, User, BookOpen, Settings, MessageSquare,
  Eye, Download, Share2, Save, UploadCloud, Dumbbell,
  Wand2,
  Trash2, ArrowUp, ArrowDown, Plus, Info, Hash, X, HelpCircle
} from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';
import { useRouter } from 'next/navigation';
import { getProjectById } from '@/app/actions/projects';
import { updateProjectSlides } from '@/app/actions/projectSlides';
import { updateCoachScenarios } from '@/app/actions/coachActions';
import { ProjectType } from '@/types';
import { CoachSettings } from '@/types/coach';
import ChatPanel from '@/widgets/Sara/ui/components/ChatPanel';
import { useAuth } from '@/context/AuthContext';
import { trackActivationEvent } from '@/lib/stonly';
import { useCoachStore } from '@/lib/useCoachStore';

// Panel components
import AvatarPanel from './panels/AvatarPanel';
import Button from '@/components/ui/Button';
import InstructionsPanel from './panels/InstructionsPanel';
import KnowledgeBasePanel from './panels/KnowledgeBasePanel';
import SettingsPanel from './panels/SettingsPanel';
import ImportPanel from './panels/ImportPanel';
import ShareAssignPanel from './panels/ShareAssignPanel';
import CoachQASetPanel from './panels/CoachQASetPanel';
import CoachSettingsPanel from './panels/CoachSettingsPanel';

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
export type MenuItemId = 'slides' | 'settings' | 'avatar' | 'instructions' | 'knowledge-base' | 'coach-qa-set' | 'coach-settings' | 'create-ai' | 'import' | 'share';

interface MenuItem {
  id: MenuItemId;
  label: string;
  icon: React.ReactNode;
}

// Order matches Epic: Slides | Settings | Avatar | Instructions | Coach Q&A Set | Coach Settings | Knowledge Base | Import | Share/Assign
const ALL_MENU_ITEMS: MenuItem[] = [
  { id: 'slides',         label: 'Slides',          icon: <Monitor size={18} /> },
  { id: 'settings',       label: 'Settings',        icon: <Settings size={18} /> },
  { id: 'avatar',         label: 'Avatar',          icon: <User size={18} /> },
  { id: 'instructions',   label: 'Instructions',    icon: <MessageSquare size={18} /> },
  { id: 'coach-qa-set',   label: 'Coach Q&A Set',   icon: <HelpCircle size={18} /> },
  { id: 'coach-settings', label: 'Coach Settings',  icon: <Settings size={18} /> },
  { id: 'knowledge-base', label: 'Knowledge Base',  icon: <BookOpen size={18} /> },
  { id: 'import',         label: 'Import',          icon: <UploadCloud size={18} /> },
  { id: 'share',          label: 'Share/Assign',    icon: <Share2 size={18} /> },
  { id: 'create-ai',      label: 'Create with AI',  icon: <Wand2 size={18} /> },
];

/**
 * Returns visible menu items per project type — matches Epic AC exactly.
 *
 * Presentation / from-scratch / slides:
 *   Slides | Settings | Instructions | Knowledge Base | Import | Share/Assign
 *
 * AI Chat Avatar / assistant:
 *   Avatar | Instructions | Knowledge Base | Settings | Import | Share/Assign
 *
 * AI Chat Avatar with Slides (isChatAvatar && has slides panel):
 *   Slides | Avatar | Instructions | Knowledge Base | Settings | Import | Share/Assign
 *
 * Widget (no slides):
 *   Avatar | Instructions | Knowledge Base | Settings | Share/Assign
 *
 * Video:
 *   Slides | Settings | Import | Share/Assign
 *
 * Unknown / no type yet:
 *   Slides | Settings | Import | Share/Assign
 */
function getVisibleMenuItems(projectType?: ProjectType, isWidget?: boolean, isCoachMode?: boolean): MenuItemId[] {
  if (!projectType) return ['slides', 'settings', 'import', 'share'];

  const isPresentation = projectType === 'slides' || projectType === 'presentation' || projectType === 'from-scratch';
  const isChatAvatar = projectType === 'chat-avatar' || projectType === 'assistant';
  const isWidgetProject = projectType === 'widget' || isWidget === true;
  const isVideo = projectType === 'video';

  let items: MenuItemId[] = [];

  if (isPresentation) {
    items = ['slides', 'settings', 'instructions'];
    if (isCoachMode) items.push('coach-qa-set', 'coach-settings');
    items.push('knowledge-base', 'import', 'share');
  } else if (isVideo) {
    items = ['slides', 'settings', 'import', 'share'];
  } else if (isWidgetProject) {
    items = ['avatar', 'instructions'];
    if (isCoachMode) items.push('coach-qa-set', 'coach-settings');
    items.push('knowledge-base', 'settings', 'share');
  } else if (isChatAvatar) {
    items = ['avatar', 'instructions'];
    if (isCoachMode) items.push('coach-qa-set', 'coach-settings');
    items.push('knowledge-base', 'settings', 'import', 'share');
  } else {
    items = ['slides', 'settings', 'import', 'share'];
  }
  
  return items;
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
  const [isCoachMode, setIsCoachMode] = useState(false);
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
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingText, setIsGeneratingText] = useState(false);

  // Coach Q&A Tab states
  const { scenarios, setScenarios } = useCoachStore();
  const [askOrder, setAskOrder] = useState('sequential');
  const [askWhen, setAskWhen] = useState('onOpen');
  const [showAddQAModal, setShowAddQAModal] = useState(false);
  const askOrderOptions = [
    { id: 'sequential', label: 'Sequential' },
    { id: 'random', label: 'Random' },
    { id: 'all', label: 'All at once' },
  ] as const;
  const askWhenOptions = [
    { id: 'onOpen', label: 'On open' },
    { id: 'beforeNext', label: 'Before next' },
    { id: 'manual', label: 'Manual' },
  ] as const;

  React.useEffect(() => {
    if (projectId) {
      getProjectById(projectId).then(project => {
        if (project) {
          setProjectTitle(project.title);
          setProjectType(project.type);
          setIsWidget(project.isWidget ?? false);
          setIsCoachMode(project.isCoachMode ?? false);
          if (project.slides && project.slides.length > 0) {
            // Normalise every slide so .text is always a string
            const normalised = (project.slides as unknown[]).map(
              (raw, i) => normaliseSlide(raw, i)
            );
            setSlides(normalised);
            setActiveSlide(normalised[0].id);
          }
          
          // Initialize coach store
          const { setIsCoachMode: setStoreCoachMode, setSettings, setScenarios, setTraineeRole } = useCoachStore.getState();
          setStoreCoachMode(project.isCoachMode ?? false);
          if (project.metadata?.coachSettings) {
            setSettings(project.metadata.coachSettings as CoachSettings);
            if (project.metadata.coachSettings.traineeRole) {
              setTraineeRole(project.metadata.coachSettings.traineeRole);
            }
          }
          if (project.metadata?.coachScenarios) {
            setScenarios(project.metadata.coachScenarios);
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
    item => getVisibleMenuItems(projectType, isWidget, isCoachMode).includes(item.id)
  );

  // Ensure active menu item is always a valid visible item
  React.useEffect(() => {
    const validIds = getVisibleMenuItems(projectType, isWidget, isCoachMode);
    if (!validIds.includes(activeMenuItem)) {
      setActiveMenuItem(validIds[0] as MenuItemId);
    }
  }, [projectType, isWidget, isCoachMode, activeMenuItem]);

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

  // Coach Q&A Slide functions
  const slideScenarios = [...scenarios]
    .filter(s => s.expectedSlideId === String(activeSlide))
    .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
  
  const unassignedScenarios = scenarios.filter(s => s.expectedSlideId !== String(activeSlide));

  const handleAssignScenario = (scenarioId: string) => {
    const updated = scenarios.map(s => {
      if (s.id === scenarioId) {
        return { ...s, expectedSlideId: String(activeSlide), orderIndex: slideScenarios.length };
      }
      return s;
    });
    setScenarios(updated);
    if (projectId) updateCoachScenarios(projectId, updated);
    setShowAddQAModal(false);
  };

  const handleRemoveScenarioFromSlide = (scenarioId: string) => {
    const updated = scenarios.map(s => s.id === scenarioId ? { ...s, expectedSlideId: undefined, orderIndex: undefined } : s);
    setScenarios(updated);
    if (projectId) updateCoachScenarios(projectId, updated);
  };

  const handleMoveScenario = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === slideScenarios.length - 1) return;
    
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const currentScen = slideScenarios[index];
    const targetScen = slideScenarios[targetIndex];
    
    const updated = scenarios.map(s => {
      if (s.id === currentScen.id) return { ...s, orderIndex: targetIndex };
      if (s.id === targetScen.id) return { ...s, orderIndex: index };
      return s;
    });
    
    setScenarios(updated);
    if (projectId) updateCoachScenarios(projectId, updated);
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
      case 'coach-qa-set':
        return <CoachQASetPanel projectId={projectId} />;
      case 'coach-settings':
        return <CoachSettingsPanel projectId={projectId} />;
      case 'settings':
        return <SettingsPanel projectId={projectId} projectTitle={projectTitle} projectType={projectType} />;
      case 'import':
        return <ImportPanel projectId={projectId} />;
      case 'create-ai':
        return (
          <div className={styles.createAiPanel}>
            <h2 className={styles.createAiTitle}>Create with AI</h2>
            <p className={styles.createAiDescription}>Generate slides, scripts, and avatars automatically using AI.</p>
            <button className={styles.generateBtn} onClick={handleGenerateText} disabled={isGeneratingText}>
              <Wand2 size={16} /> {isGeneratingText ? 'Generating...' : 'Generate slide script with AI'}
            </button>
          </div>
        );
      case 'share':
        return <ShareAssignPanel projectId={projectId} projectTitle={projectTitle} projectType={projectType} isOpen={true} onClose={() => {}} />;
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
                className={styles.slideThumbnailImage}
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
            <div className={styles.stageTitle}>New platform features:<br />Top 5 User Stories</div>
            <div className={styles.stageSubtitle}>Overview of new entities and functionality for the dev team</div>
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
          <button className={`${styles.inspectorTab} ${activeTab === 'elements' ? styles.active : ''}`} onClick={() => setActiveTab('elements')}>Elements</button>
          {isCoachMode && (
            <button className={`${styles.inspectorTab} ${styles.coachInspectorTab} ${activeTab === 'chat' ? styles.active : ''}`} onClick={() => setActiveTab('chat')}>
              Coach Q&A <span className={styles.tabNewBadge}>NEW</span>
            </button>
          )}
        </div>
        <div
          className={`${styles.inspectorContent} ${styles.inspectorColumn} ${activeTab === 'chat' && !isCoachMode ? styles.inspectorContentFlush : ''}`}
        >
          {activeTab === 'script' && (
            <>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionTitle}>Script text for the slide <Info size={14} className={styles.infoIcon} /></div>
              </div>
              <div className={styles.fieldWrap}>
                <textarea
                  className={styles.scriptTextarea}
                  value={currentSlide.text ?? ''}
                  onChange={(e) => handleScriptChange(e.target.value)}
                  placeholder="Write your slide script here, or use AI to generate it..."
                />
                <Hash size={16} className={styles.fieldTrailingIcon} />
              </div>
              <div className={styles.charCount}>{(currentSlide.text ?? '').length}/20000 characters</div>
              <button className={styles.generateBtn} onClick={handleGenerateText} disabled={isGeneratingText}>
                <Wand2 size={16} /> {isGeneratingText ? 'Generating...' : 'Generate text with AI'}
              </button>
            </>
          )}
          {activeTab === 'elements' && <div className={styles.placeholderText}>Elements settings coming soon.</div>}
          {activeTab === 'chat' && isCoachMode && (
            <div className={styles.coachInspector}>
              <div className={styles.coachInfoCard}>
                <div className={styles.coachInfoIcon}>
                  <HelpCircle size={16} />
                </div>
                <div className={styles.coachInspectorHeader}>
                  <h3 className={styles.coachInspectorTitle}>Questions on this slide</h3>
                  <p className={styles.coachInspectorSubtitle}>
                    The avatar will ask these when the trainee opens slide {activeSlide}.
                  </p>
                </div>
              </div>

              <section className={styles.coachSectionCard}>
                <div className={styles.coachScenarioList}>
                  {slideScenarios.length === 0 && (
                    <div className={styles.coachScenarioEmpty}>
                      <span className={styles.coachScenarioEmptyBadge}>Q&amp;A</span>
                      <span>No questions assigned to this slide yet.</span>
                    </div>
                  )}
                  {slideScenarios.map((s, idx) => (
                    <div key={s.id} className={styles.coachScenarioItem}>
                      <div className={styles.coachScenarioItemMain}>
                        <div className={styles.coachScenarioIndex}>{idx + 1}</div>
                        <span className={styles.coachScenarioText}>{s.questionText}</span>
                      </div>
                      <div className={styles.coachScenarioActions}>
                        <div className={styles.coachMoveControls}>
                          <button
                            type="button"
                            className={styles.coachMoveBtn}
                            onClick={() => handleMoveScenario(idx, 'up')}
                            disabled={idx === 0}
                            aria-label={`Move question ${idx + 1} up`}
                          >
                            <ArrowUp size={12} />
                          </button>
                          <button
                            type="button"
                            className={styles.coachMoveBtn}
                            onClick={() => handleMoveScenario(idx, 'down')}
                            disabled={idx === slideScenarios.length - 1}
                            aria-label={`Move question ${idx + 1} down`}
                          >
                            <ArrowDown size={12} />
                          </button>
                        </div>
                        <button
                          type="button"
                          className={styles.coachRemoveBtn}
                          onClick={() => handleRemoveScenarioFromSlide(s.id)}
                          aria-label={`Remove question ${idx + 1} from slide`}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className={styles.coachAssignWrap}>
                  <Button variant="secondary" className={`${styles.fullWidthButton} ${styles.coachAssignButton}`} onClick={() => setShowAddQAModal(!showAddQAModal)}>
                    + Add Q&amp;A from Set
                  </Button>
                  {showAddQAModal && (
                    <div className={`card ${styles.coachAssignMenu}`}>
                      {unassignedScenarios.length === 0 ? (
                        <div className={styles.coachAssignEmpty}>No unassigned questions available in Set.</div>
                      ) : (
                        unassignedScenarios.map(scen => (
                          <button
                            key={scen.id}
                            type="button"
                            className={styles.coachAssignItem}
                            onClick={() => handleAssignScenario(scen.id)}
                          >
                            <span className={styles.coachAssignItemText}>{scen.questionText}</span>
                            <Plus size={14} />
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </section>

              <section className={styles.coachSectionCard}>
                <div className={styles.coachSectionHeaderRow}>
                  <h3 className={styles.coachSectionTitle}>Ask Order</h3>
                  <span className={styles.coachSectionHint}>Choose how the trainee receives slide questions.</span>
                </div>
                <div className={styles.coachOptionGrid} role="radiogroup" aria-label="Ask order">
                  {askOrderOptions.map(option => {
                    const isActive = askOrder === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        role="radio"
                        aria-checked={isActive}
                        className={`${styles.coachOptionCard} ${isActive ? styles.coachOptionCardActive : ''}`}
                        onClick={() => setAskOrder(option.id)}
                      >
                        <span className={styles.coachOptionLabel}>{option.label}</span>
                        {option.id === 'random' && (
                          <input
                            type="number"
                            defaultValue="2"
                            disabled={!isActive}
                            className={styles.coachOptionInput}
                            aria-label="Random question count"
                            onClick={event => event.stopPropagation()}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className={styles.coachSectionCard}>
                <div className={styles.coachSectionHeaderRow}>
                  <h3 className={styles.coachSectionTitle}>When to Ask</h3>
                  <span className={styles.coachSectionHint}>Set the trigger moment for these questions.</span>
                </div>
                <div className={styles.coachSegmentedGroup} role="tablist" aria-label="When to ask questions">
                  {askWhenOptions.map(option => (
                    <Button
                      key={option.id}
                      type="button"
                      variant={askWhen === option.id ? 'primary' : 'secondary'}
                      size="sm"
                      className={`${styles.coachSegmentedButton} ${askWhen === option.id ? styles.coachSegmentedButtonActive : ''}`}
                      onClick={() => setAskWhen(option.id)}
                      aria-pressed={askWhen === option.id}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </section>
            </div>
          )}
          {activeTab === 'chat' && !isCoachMode && (
            <div className={styles.chatPanelWrap}>
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
              {(item.id === 'coach-qa-set' || item.id === 'coach-settings') && <span className={styles.navNewBadge}>NEW</span>}
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
          <button className={styles.btnSolid} onClick={handleSave} disabled={isSaving}>
            <Save size={14} /> {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className={`${styles.contentArea} ${activeMenuItem !== 'slides' ? styles.contentAreaPanel : ''}`}>
        {renderPanelContent()}
      </div>
    </div>
  );
};

export default ProjectEditor;
