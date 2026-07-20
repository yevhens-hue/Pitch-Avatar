'use client'

import React, { useState } from 'react';
import styles from './ProjectEditor.module.css';
import {
  HelpCircle,
  Settings,
  UploadCloud,
  Info,
  Wand2,
  BookOpen,
  Share2,
  Eye,
  Download,
  Save,
  User,
  MessageSquare,
  ChevronLeft,
  ArrowUp,
  ArrowDown,
  Plus,
  X,
  MoreHorizontal,
  Target,
  LayoutGrid,
  Trash2,
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
import { useUIStore } from '@/lib/store';

import AvatarPanel from './panels/AvatarPanel';
import Button from '@/components/ui/Button';
import InstructionsPanel from './panels/InstructionsPanel';
import KnowledgeBasePanel from './panels/KnowledgeBasePanel';
import SettingsPanel from './panels/SettingsPanel';
import ImportPanel from './panels/ImportPanel';
import ShareAssignPanel from './panels/ShareAssignPanel';
import CoachQASetPanel from './panels/CoachQASetPanel';
import CoachSettingsPanel from './panels/CoachSettingsPanel';

interface Slide {
  id: number;
  text: string;
  audioUrl?: string;
  thumbnailUrl?: string;
  title?: string;
  [key: string]: unknown;
}

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
    typeof r.id === 'number'
      ? r.id
      : typeof r.id === 'string'
        ? Number(r.id) || index + 1
        : index + 1;
  return {
    ...r,
    id,
    text,
    audioUrl: typeof r.audioUrl === 'string' ? r.audioUrl : undefined,
    thumbnailUrl: typeof r.thumbnailUrl === 'string' ? r.thumbnailUrl : undefined,
    title: typeof r.title === 'string' ? r.title : undefined,
  };
}

export type MenuItemId =
  | 'slides'
  | 'settings'
  | 'avatar'
  | 'instructions'
  | 'knowledge-base'
  | 'coach-qa-set'
  | 'coach-settings'
  | 'create-ai'
  | 'import'
  | 'share'
  | 'access'
  | 'goals'
  | 'more'
  | 'divider';

interface MenuItem {
  id: MenuItemId;
  label: string;
  icon: React.ReactNode;
}

const ALL_MENU_ITEMS: MenuItem[] = [
  { id: 'slides', label: 'Slides', icon: <LayoutGrid size={18} /> },
  { id: 'access', label: 'Access', icon: <User size={18} /> },
  { id: 'goals', label: 'Goals', icon: <Target size={18} /> },
  { id: 'divider', label: '', icon: <></> },
  { id: 'coach-qa-set', label: 'Coach Q&A Set', icon: <HelpCircle size={18} /> },
  { id: 'coach-settings', label: 'Coach Settings', icon: <Settings size={18} /> },
  { id: 'more', label: 'More', icon: <MoreHorizontal size={18} /> },
  { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
  { id: 'avatar', label: 'Avatar', icon: <User size={18} /> },
  { id: 'instructions', label: 'Instructions', icon: <MessageSquare size={18} /> },
  { id: 'knowledge-base', label: 'Knowledge Base', icon: <BookOpen size={18} /> },
  { id: 'import', label: 'Import', icon: <UploadCloud size={18} /> },
  { id: 'share', label: 'Share/Assign', icon: <Share2 size={18} /> },
  { id: 'create-ai', label: 'Create with AI', icon: <Wand2 size={18} /> },
];

function getVisibleMenuItems(projectType?: ProjectType, isWidget?: boolean, isCoachMode?: boolean): MenuItemId[] {
  if (!projectType) return ['slides', 'settings', 'import', 'share'];

  const isPresentation = projectType === 'slides' || projectType === 'presentation' || projectType === 'from-scratch';
  const isChatAvatar = projectType === 'chat-avatar' || projectType === 'assistant';
  const isWidgetProject = projectType === 'widget' || isWidget === true;
  const isVideo = projectType === 'video';

  let items: MenuItemId[] = [];

  if (isPresentation) {
    items = ['slides'];
    if (isCoachMode) items.push('divider', 'coach-qa-set', 'coach-settings');
    items.push('settings', 'avatar', 'instructions', 'knowledge-base', 'import', 'share');
  } else if (isVideo) {
    items = ['slides', 'settings', 'import', 'share'];
  } else if (isWidgetProject) {
    items = ['avatar'];
    if (isCoachMode) items.push('divider', 'coach-qa-set', 'coach-settings');
    items.push('instructions', 'knowledge-base', 'settings', 'share');
  } else if (isChatAvatar) {
    items = ['avatar'];
    if (isCoachMode) items.push('divider', 'coach-qa-set', 'coach-settings');
    items.push('instructions', 'knowledge-base', 'settings', 'import', 'share');
  } else {
    items = ['slides', 'settings', 'import', 'share'];
  }

  return items;
}

type RightTab = 'script' | 'elements' | 'chat';

interface ProjectEditorProps {
  projectId?: string;
}

const ProjectEditor: React.FC<ProjectEditorProps> = ({ projectId }) => {
  const { showToast } = useToast();
  const router = useRouter();
  const { activeSkinDomain } = useUIStore();

  const [projectTitle, setProjectTitle] = useState('Untitled Project');
  const [projectType, setProjectType] = useState<ProjectType | undefined>(undefined);
  const [isWidget, setIsWidget] = useState(false);
  const [isCoachMode, setIsCoachMode] = useState(false);
  const { user } = useAuth();

  const [activeMenuItem, setActiveMenuItem] = useState<MenuItemId>('slides');
  const [activeSlide, setActiveSlide] = useState(1);
  const [slides, setSlides] = useState<Slide[]>([
    { id: 1, text: '' },
    { id: 2, text: '' },
  ]);
  const [activeTab, setActiveTab] = useState<RightTab>('script');

  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingText, setIsGeneratingText] = useState(false);

  const { scenarios, setScenarios } = useCoachStore();
  const [showAddQAModal, setShowAddQAModal] = useState(false);

  React.useEffect(() => {
    if (projectId) {
      getProjectById(projectId)
        .then(project => {
          if (project) {
            setProjectTitle(project.title);
            setProjectType(project.type);
            setIsWidget(project.isWidget ?? false);
            setIsCoachMode(project.isCoachMode ?? false);
            if (project.slides && project.slides.length > 0) {
              const normalised = (project.slides as unknown[]).map((raw, index) => normaliseSlide(raw, index));
              setSlides(normalised);
              setActiveSlide(normalised[0].id);
            }

            const {
              setIsCoachMode: setStoreCoachMode,
              setSettings,
              setScenarios,
              setTraineeRole,
            } = useCoachStore.getState();
            setStoreCoachMode(project.isCoachMode ?? false);
            if (project.metadata?.coachSettings) {
              const coachSettings = project.metadata.coachSettings as CoachSettings;
              setSettings(coachSettings);
              if (coachSettings.traineeRoleId) setTraineeRole(coachSettings.traineeRoleId);
            }
            if (project.metadata?.coachScenarios) {
              setScenarios(project.metadata.coachScenarios);
            }

            if (project.type === 'chat-avatar' || project.type === 'assistant' || project.type === 'widget') {
              setActiveMenuItem('avatar');
            }
          }
        })
        .catch(console.error);
    }
  }, [projectId]);

  React.useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && projectId) {
        getProjectById(projectId)
          .then(project => {
            if (project?.metadata?.coachScenarios) {
              useCoachStore.getState().setScenarios(project.metadata.coachScenarios);
            }
          })
          .catch(console.error);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [projectId]);

  const visibleMenuItems = ALL_MENU_ITEMS
    .filter(item => getVisibleMenuItems(projectType, isWidget, isCoachMode).includes(item.id))
    .map(item => {
      if (item.id === 'share' && activeSkinDomain === 'hr') {
        return { ...item, label: 'Enrollments', icon: <User size={18} /> };
      }
      return item;
    });

  React.useEffect(() => {
    const validIds = getVisibleMenuItems(projectType, isWidget, isCoachMode);
    if (!validIds.includes(activeMenuItem)) {
      setActiveMenuItem(validIds[0] as MenuItemId);
    }
  }, [projectType, isWidget, isCoachMode, activeMenuItem]);

  const handleSave = async () => {
    if (!projectId) return;
    setIsSaving(true);
    try {
      const result = await updateProjectSlides(projectId, slides);
      if (result.success) {
        showToast('Slides saved successfully', 'success');
        trackActivationEvent('tour_generate_video', user?.id, user?.user_metadata?.main_goal);
      } else {
        showToast(`Failed to save slides: ${result.error}`, 'error');
      }
    } catch (error) {
      console.error(error);
      showToast('Error saving slides', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const currentSlide: Slide = slides.find(slide => slide.id === activeSlide) ?? slides[0] ?? { id: 1, text: '' };
  const currentSlideIndex = Math.max(0, slides.findIndex(slide => slide.id === activeSlide));
  const slidePreviewLines = (currentSlide.text ?? '')
    .split(/\n+/)
    .map(line => line.trim())
    .filter(Boolean);
  const stageEyebrow = isCoachMode ? 'Coach-ready slide' : 'Slide narrative';
  const stageTitle = currentSlide.title || slidePreviewLines[0] || 'Start shaping this slide';
  const stageSubtitle =
    slidePreviewLines[1] ||
    'Write the story on the right to preview the structure, emphasis, and pacing of this slide.';
  const stageHighlights = slidePreviewLines.slice(currentSlide.title ? 0 : 2).slice(0, 3);
  const stageBodyPreview = slidePreviewLines.join(' ').trim();
  const projectKindLabel = projectType ? projectType.replace(/-/g, ' ') : 'presentation';
  const projectModeLabel = isCoachMode ? 'Coach editor' : 'Project editor';
  const assignedQuestionsCount = scenarios.filter(scenario => scenario.expectedSlideId === String(activeSlide)).length;

  const handleScriptChange = (text: string) => {
    setSlides(previous => previous.map(slide => (slide.id === activeSlide ? { ...slide, text } : slide)) as Slide[]);
  };

  const handleAddSlide = () => {
    const newId = slides.length > 0 ? Math.max(...slides.map(slide => slide.id)) + 1 : 1;
    setSlides(previous => [...previous, { id: newId, text: '' }] as Slide[]);
    setActiveSlide(newId);
  };

  const handleRemoveSlide = (event: React.MouseEvent, id: number) => {
    event.stopPropagation();
    if (slides.length <= 1) {
      showToast('You must have at least one slide', 'error');
      return;
    }
    const newSlides = slides.filter(slide => slide.id !== id) as Slide[];
    setSlides(newSlides);
    if (activeSlide === id) setActiveSlide(newSlides[0].id);
  };

  const handleMoveSlide = (event: React.MouseEvent, index: number, direction: 'up' | 'down') => {
    event.stopPropagation();
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
        body: JSON.stringify({
          prompt: currentSlide.text,
          slideNumber: slides.findIndex(slide => slide.id === activeSlide) + 1,
          projectTitle,
        }),
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

  const slideScenarios = [...scenarios]
    .filter(scenario => String(scenario.expectedSlideId) === String(activeSlide))
    .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));

  const unassignedScenarios = scenarios.filter(
    scenario => !scenario.expectedSlideId || String(scenario.expectedSlideId) === 'any' || String(scenario.expectedSlideId) === 'none',
  );

  const handleAssignScenario = (scenarioId: string) => {
    const updated = scenarios.map(scenario => {
      if (scenario.id === scenarioId) {
        return { ...scenario, expectedSlideId: String(activeSlide), orderIndex: slideScenarios.length };
      }
      return scenario;
    });
    setScenarios(updated);
    if (projectId) updateCoachScenarios(projectId, updated);
    setShowAddQAModal(false);
  };

  const handleRemoveScenarioFromSlide = (scenarioId: string) => {
    const updated = scenarios.map(scenario =>
      scenario.id === scenarioId ? { ...scenario, expectedSlideId: undefined, orderIndex: undefined } : scenario,
    );
    setScenarios(updated);
    if (projectId) updateCoachScenarios(projectId, updated);
  };

  const handleMoveScenario = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === slideScenarios.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const currentScenario = slideScenarios[index];
    const targetScenario = slideScenarios[targetIndex];

    const updated = scenarios.map(scenario => {
      if (scenario.id === currentScenario.id) return { ...scenario, orderIndex: targetIndex };
      if (scenario.id === targetScenario.id) return { ...scenario, orderIndex: index };
      return scenario;
    });

    setScenarios(updated);
    if (projectId) updateCoachScenarios(projectId, updated);
  };

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
      case 'coach-settings': {
        const hasPresentation =
          projectType === 'slides' || projectType === 'presentation' || projectType === 'from-scratch';
        return (
          <CoachSettingsPanel
            projectId={projectId}
            hasPresentation={hasPresentation}
            onOpenQuestionSet={() => setActiveMenuItem('coach-qa-set')}
          />
        );
      }
      case 'settings':
        return <SettingsPanel projectId={projectId} projectTitle={projectTitle} projectType={projectType} />;
      case 'import':
        return <ImportPanel projectId={projectId} />;
      case 'create-ai':
        return (
          <div className={styles.createAiPanel}>
            <h2 className={styles.createAiTitle}>Create with AI</h2>
            <p className={styles.createAiDescription}>
              Generate slides, scripts, and avatars automatically using AI.
            </p>
            <Button variant="primary" className={styles.generateButton} onClick={handleGenerateText} disabled={isGeneratingText}>
              {isGeneratingText ? 'Generating...' : 'Draft slide script'}
            </Button>
          </div>
        );
      case 'share':
        return (
          <ShareAssignPanel
            projectId={projectId}
            projectTitle={projectTitle}
            projectType={projectType}
            isOpen={true}
            onClose={() => {}}
          />
        );
      case 'slides':
      default:
        return renderSlidesWorkspace();
    }
  };

  const renderSlidesWorkspace = () => (
    <div className={styles.workspace}>
      <aside className={styles.leftPanel}>
        <div className={styles.leftPanelHeader}>
          <div>
            <div className={styles.panelEyebrow}>Slide rail</div>
            <div className={styles.leftPanelTitle}>{slides.length} slides</div>
          </div>
          <div className={styles.leftPanelMeta}>Now editing #{currentSlideIndex + 1}</div>
        </div>

        <div className={styles.slideRail}>
          {slides.map((slide, index) => {
            const isActive = activeSlide === slide.id;
            const previewText = slide.title || slide.text || 'Empty slide';
            return (
              <div
                key={slide.id}
                className={`${styles.slideThumbnail} ${isActive ? styles.active : ''}`}
                onClick={() => setActiveSlide(slide.id)}
                role="button"
                tabIndex={0}
                onKeyDown={event => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setActiveSlide(slide.id);
                  }
                }}
              >
                <div className={styles.slideNumber}>{index + 1}</div>
                {slide.thumbnailUrl ? (
                  <img
                    src={slide.thumbnailUrl}
                    alt={`Slide ${index + 1}`}
                    className={styles.slideThumbnailImage}
                  />
                ) : (
                  <div className={styles.slideThumbnailContent}>
                    <div className={styles.slideThumbnailKicker}>Slide {index + 1}</div>
                    <div className={styles.slideThumbnailTitle}>{slide.title || 'Untitled frame'}</div>
                    <div className={styles.slideThumbnailText}>
                      {previewText.slice(0, 88)}
                      {previewText.length > 88 ? '…' : ''}
                    </div>
                  </div>
                )}
                <div className={styles.slideActions}>
                  <button
                    onClick={event => handleMoveSlide(event, index, 'up')}
                    disabled={index === 0}
                    title="Move up"
                    aria-label="Move slide up"
                  >
                    <ArrowUp size={12} />
                  </button>
                  <button
                    onClick={event => handleMoveSlide(event, index, 'down')}
                    disabled={index === slides.length - 1}
                    title="Move down"
                    aria-label="Move slide down"
                  >
                    <ArrowDown size={12} />
                  </button>
                  <button
                    onClick={event => handleRemoveSlide(event, slide.id)}
                    title="Delete slide"
                    aria-label="Delete slide"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <button className={styles.addSlideBtn} onClick={handleAddSlide} aria-label="Add new slide">
          <Plus size={16} />
          Add Slide
        </button>
      </aside>

      <section className={styles.centerPanel}>
        <div className={styles.stageFrame}>
          <div className={styles.stageFrameHeader}>
            <div>
              <div className={styles.panelEyebrow}>Live canvas preview</div>
              <div className={styles.stageFrameTitle}>{projectModeLabel}</div>
            </div>
            <div className={styles.stageFrameMeta}>
              {stageHighlights.length > 0 ? `${stageHighlights.length} talking points` : 'Awaiting script'}
            </div>
          </div>

          <div className={styles.mainStage}>
            <div className={styles.stageTopRow}>
              <div className={styles.stageHeader}>{stageEyebrow}</div>
              <div className={styles.stageStatusPill}>{projectKindLabel}</div>
            </div>

            <div className={styles.stageContent}>
              <div className={styles.stageTitle}>{stageTitle}</div>
              <div className={styles.stageSubtitle}>{stageSubtitle}</div>

              {stageHighlights.length > 0 ? (
                <div className={styles.stageHighlightsList}>
                  {stageHighlights.map((highlight, index) => (
                    <div key={`${highlight}-${index}`} className={styles.stageHighlightRow}>
                      <span className={styles.stageHighlightDot} aria-hidden="true" />
                      <span className={styles.stageHighlightText}>{highlight}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.stageEmptyState}>
                  Add script content to generate a richer preview and reveal the flow of this slide.
                </div>
              )}

              <div className={styles.stageNarrativeBlock}>
                <div className={styles.stageNarrativeLabel}>Narrative preview</div>
                <div className={styles.stageBodyPreview}>
                  {stageBodyPreview || 'Your script will appear here as soon as you start writing.'}
                </div>
              </div>
            </div>

            <div className={styles.stageFooter}>
              <span>Slide {currentSlideIndex + 1}</span>
              <span>{currentSlide.text ? `${currentSlide.text.length} characters in script` : 'No script yet'}</span>
              {isCoachMode && <span>{assignedQuestionsCount} coach questions linked</span>}
            </div>
          </div>
        </div>
      </section>

      <aside className={styles.rightPanel}>
        <div className={styles.inspectorHeader}>
          <div>
            <div className={styles.panelEyebrow}>Inspector</div>
            <div className={styles.inspectorTitle}>Slide {currentSlideIndex + 1}</div>
          </div>
          <div className={styles.inspectorMeta}>{currentSlide.text ? `${currentSlide.text.length} chars` : 'Draft'}</div>
        </div>

        <div className={styles.inspectorTabs}>
          <button
            className={`${styles.inspectorTab} ${activeTab === 'script' ? styles.active : ''}`}
            onClick={() => setActiveTab('script')}
          >
            Script
          </button>
          <button
            className={`${styles.inspectorTab} ${activeTab === 'elements' ? styles.active : ''}`}
            onClick={() => setActiveTab('elements')}
          >
            Elements
          </button>
          {isCoachMode && (
            <button
              className={`${styles.inspectorTab} ${styles.coachInspectorTab} ${activeTab === 'chat' ? styles.active : ''}`}
              onClick={() => setActiveTab('chat')}
            >
              Coach Q&amp;A
            </button>
          )}
        </div>

        <div
          className={`${styles.inspectorContent} ${styles.inspectorColumn} ${activeTab === 'chat' && !isCoachMode ? styles.inspectorContentFlush : ''}`}
        >
          {activeTab === 'script' && (
            <>
              <div className={styles.scriptIntroCard}>
                <div className={styles.scriptIntroIcon}>
                  <Info size={16} />
                </div>
                <div className={styles.scriptIntroText}>
                  <div className={styles.scriptIntroTitle}>Script text for this slide</div>
                  <p className={styles.scriptIntroDescription}>
                    Keep the message concise, then refine the tone and structure with AI if needed.
                  </p>
                </div>
              </div>

              <div className={styles.fieldWrap}>
                <textarea
                  className={styles.scriptTextarea}
                  value={currentSlide.text ?? ''}
                  onChange={event => handleScriptChange(event.target.value)}
                  placeholder="Write your slide script here, or use AI to generate it..."
                />
              </div>

              <div className={styles.scriptMetaRow}>
                <span className={styles.charCount}>{(currentSlide.text ?? '').length}/20000 characters</span>
                <span className={styles.scriptMetaHint}>Use short paragraphs to keep the preview clean.</span>
              </div>

              <Button
                variant="primary"
                className={styles.generateButton}
                onClick={handleGenerateText}
                disabled={isGeneratingText}
              >
                {isGeneratingText ? 'Generating...' : 'Draft script'}
              </Button>
            </>
          )}
          {activeTab === 'elements' && (
            <div className={styles.placeholderPanel}>
              <div className={styles.placeholderTitle}>Elements settings are coming soon</div>
              <p className={styles.placeholderText}>
                Use the script and coach tabs for now to shape content, flow, and question timing.
              </p>
            </div>
          )}
          {activeTab === 'chat' && isCoachMode && (
            <div className={styles.coachInspector}>
              <div className={styles.coachInfoCard}>
                <div className={styles.coachInfoIcon}>
                  <HelpCircle size={16} />
                </div>
                <div className={styles.coachInspectorHeader}>
                  <div className={styles.coachInfoMetaRow}>
                    <h3 className={styles.coachInspectorTitle}>Questions on this slide</h3>
                    <span className={styles.coachInfoMeta}>{slideScenarios.length} assigned</span>
                  </div>
                  <p className={styles.coachInspectorSubtitle}>
                    Control which questions belong to slide {currentSlideIndex + 1} and keep the training flow tidy.
                  </p>
                </div>
              </div>

              <section className={styles.coachSectionCard}>
                <div className={styles.coachSectionHeaderRow}>
                  <h3 className={styles.coachSectionTitle}>Assigned questions</h3>
                  <span className={styles.coachSectionHint}>Reorder or remove questions for this specific slide.</span>
                </div>
                <div className={styles.coachScenarioList}>
                  {slideScenarios.length === 0 && (
                    <div className={styles.coachScenarioEmpty}>
                      <strong className={styles.coachScenarioEmptyTitle}>No questions assigned yet</strong>
                      <span className={styles.coachScenarioEmptyText}>
                        Pick a question from the set below to make this slide interactive in Coach Mode.
                      </span>
                    </div>
                  )}
                  {slideScenarios.map((scenario, index) => (
                    <div key={scenario.id} className={styles.coachScenarioItem}>
                      <div className={styles.coachScenarioItemMain}>
                        <div className={styles.coachScenarioIndex}>{index + 1}</div>
                        <span className={styles.coachScenarioText}>{scenario.questionText}</span>
                      </div>
                      <div className={styles.coachScenarioActions}>
                        <div className={styles.coachMoveControls}>
                          <button
                            type="button"
                            className={styles.coachMoveBtn}
                            onClick={() => handleMoveScenario(index, 'up')}
                            disabled={index === 0}
                            aria-label={`Move question ${index + 1} up`}
                          >
                            <ArrowUp size={12} />
                          </button>
                          <button
                            type="button"
                            className={styles.coachMoveBtn}
                            onClick={() => handleMoveScenario(index, 'down')}
                            disabled={index === slideScenarios.length - 1}
                            aria-label={`Move question ${index + 1} down`}
                          >
                            <ArrowDown size={12} />
                          </button>
                        </div>
                        <button
                          type="button"
                          className={styles.coachRemoveBtn}
                          onClick={() => handleRemoveScenarioFromSlide(scenario.id)}
                          aria-label={`Remove question ${index + 1} from slide`}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className={styles.coachAssignWrap}>
                  <Button
                    variant="secondary"
                    className={`${styles.fullWidthButton} ${styles.coachAssignButton}`}
                    onClick={() => setShowAddQAModal(!showAddQAModal)}
                  >
                    + Add Q&amp;A from Set
                  </Button>
                  {showAddQAModal && (
                    <div className={styles.coachAssignMenu}>
                      {unassignedScenarios.length === 0 ? (
                        <div className={styles.coachAssignEmpty}>No other questions available in the set.</div>
                      ) : (
                        unassignedScenarios.map(scenario => (
                          <button
                            key={scenario.id}
                            type="button"
                            className={styles.coachAssignItem}
                            onClick={() => handleAssignScenario(scenario.id)}
                          >
                            <span className={styles.coachAssignItemText}>{scenario.questionText}</span>
                            <Plus size={14} />
                          </button>
                        ))
                      )}
                    </div>
                  )}
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
      </aside>
    </div>
  );

  return (
    <div className={styles.container}>
      <header className={styles.topBar}>
        <div className={styles.topBarMain}>
          <div className={styles.topBarLeft}>
            <button className={styles.backBtn} onClick={() => router.push('/projects')} aria-label="Back to projects">
              <ChevronLeft size={20} />
            </button>
            <div className={styles.projectIdentity}>
              <div className={styles.panelEyebrow}>{projectModeLabel}</div>
              <div className={styles.projectTitleRow}>
                <div className={styles.projectTitle}>{projectTitle}</div>
                <span className={styles.projectBadge}>{slides.length} slides</span>
                {isCoachMode && <span className={styles.projectBadgeMuted}>Coach enabled</span>}
              </div>
            </div>
          </div>

          <div className={styles.topBarRight}>
            <button
              className={styles.iconBtn}
              aria-label="Preview"
              title={projectId ? 'Open preview' : 'Save the project first to preview'}
              disabled={!projectId}
              onClick={() => projectId && window.open(`/preview/${projectId}`, '_blank')}
            >
              <Eye size={18} />
            </button>
            <button className={styles.iconBtn} aria-label="Download" title="Download">
              <Download size={18} />
            </button>
            <Button variant="primary" size="sm" className={styles.saveButton} onClick={handleSave} disabled={isSaving}>
              <Save size={14} />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>

        <div className={styles.topBarNavRow}>
          <nav className={styles.topBarCenter} aria-label="Project editor navigation">
            {visibleMenuItems.map(item => {
              if (item.id === 'divider') {
                return <div key="divider" className={styles.navDivider} />;
              }
              const isCoachItem = item.id === 'coach-qa-set' || item.id === 'coach-settings';
              return (
                <button
                  key={item.id}
                  id={`menu-${item.id}`}
                  className={`${styles.mainTab} ${isCoachItem ? styles.mainTabCoach : ''} ${activeMenuItem === item.id ? styles.active : ''}`}
                  onClick={() => setActiveMenuItem(item.id)}
                  aria-current={activeMenuItem === item.id ? 'page' : undefined}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <main className={`${styles.contentArea} ${activeMenuItem !== 'slides' ? styles.contentAreaPanel : ''}`}>
        {renderPanelContent()}
      </main>
    </div>
  );
};

export default ProjectEditor;
