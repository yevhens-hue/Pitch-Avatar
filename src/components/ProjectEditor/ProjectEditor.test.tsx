import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';

// ── CSS mock ──────────────────────────────────────────────────────────
jest.mock('@/components/ProjectEditor/ProjectEditor.module.css', () => ({
  container: 'container', topBar: 'topBar', topBarLeft: 'topBarLeft', backBtn: 'backBtn',
  projectTitle: 'projectTitle', topBarCenter: 'topBarCenter', mainTab: 'mainTab',
  active: 'active', topBarRight: 'topBarRight', iconBtn: 'iconBtn', langSelect: 'langSelect',
  btnOutline: 'btnOutline', btnSolid: 'btnSolid', contentArea: 'contentArea',
  contentAreaPanel: 'contentAreaPanel', workspace: 'workspace',
  leftPanel: 'leftPanel', slideThumbnail: 'slideThumbnail', slideThumbnailBadge: 'slideThumbnailBadge',
  slideNumber: 'slideNumber', slideActions: 'slideActions', addSlideBtn: 'addSlideBtn',
  centerPanel: 'centerPanel', mainStage: 'mainStage', stageContent: 'stageContent',
  stageHeader: 'stageHeader', stageTitle: 'stageTitle', stageSubtitle: 'stageSubtitle',
  stageBoxes: 'stageBoxes', stageBox: 'stageBox', stageFooter: 'stageFooter', stagePill: 'stagePill',
  rightPanel: 'rightPanel', inspectorTabs: 'inspectorTabs', inspectorTab: 'inspectorTab',
  inspectorContent: 'inspectorContent', sectionHeader: 'sectionHeader', sectionTitle: 'sectionTitle',
  infoIcon: 'infoIcon', scriptTextarea: 'scriptTextarea', charCount: 'charCount', generateBtn: 'generateBtn',
  toolRow: 'toolRow', toolIcon: 'toolIcon', toolBtnOutline: 'toolBtnOutline', toolActionIcon: 'toolActionIcon',
}));

// ── Panel mocks ───────────────────────────────────────────────────────
jest.mock('./panels/AvatarPanel', () => () => <div data-testid="avatar-panel" />);
jest.mock('./panels/InstructionsPanel', () => () => <div data-testid="instructions-panel" />);
jest.mock('./panels/KnowledgeBasePanel', () => () => <div data-testid="kb-panel" />);
jest.mock('./panels/SettingsPanel', () => () => <div data-testid="settings-panel" />);
jest.mock('./panels/ImportPanel', () => () => <div data-testid="import-panel" />);

// ── Icon mock ─────────────────────────────────────────────────────────
function MockIcon() { return null; }
jest.mock('lucide-react', () => ({
  ChevronLeft: MockIcon, Monitor: MockIcon, User: MockIcon, BookOpen: MockIcon,
  Settings: MockIcon, MessageSquare: MockIcon, Eye: MockIcon, Download: MockIcon,
  Share2: MockIcon, Save: MockIcon, UploadCloud: MockIcon, Dumbbell: MockIcon,
  Wand2: MockIcon, Mic: MockIcon, Play: MockIcon, Volume2: MockIcon, Video: MockIcon,
  Trash2: MockIcon, ArrowUp: MockIcon, ArrowDown: MockIcon, Plus: MockIcon, Info: MockIcon, Hash: MockIcon, HelpCircle: MockIcon, X: MockIcon
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), prefetch: jest.fn(), back: jest.fn() }),
}));
jest.mock('@/components/ui/ToastProvider', () => ({
  useToast: jest.fn(() => ({ showToast: jest.fn() })),
}));
jest.mock('@/app/actions/projects', () => ({
  getProjectById: jest.fn(() => Promise.resolve({
    id: '123',
    title: 'Untitled Project',
    type: 'slides',
    status: 'draft',
    userId: 'user1',
    isCoachMode: false
  })),
}));
jest.mock('@/app/actions/projectSlides', () => ({
  updateProjectSlides: jest.fn(() => Promise.resolve({ success: true })),
}));
jest.mock('../ShareEnrollModal/ShareEnrollModal', () => () => <div data-testid="share-enroll-modal" />);
jest.mock('@/widgets/Sara/ui/components/ChatPanel', () => () => <div data-testid="chat-panel" />);
jest.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ user: null }),
}));
jest.mock('@/lib/stonly', () => ({
  trackActivationEvent: jest.fn(),
}));
jest.mock('@/lib/supabase', () => ({
  supabase: { storage: { from: jest.fn(() => ({ upload: jest.fn(), getPublicUrl: jest.fn(() => ({ data: { publicUrl: '' } })) })) } },
}));

import ProjectEditor from './ProjectEditor';

describe('ProjectEditor — Universal Menu', () => {
  it('renders project title', () => {
    render(<ProjectEditor />);
    expect(screen.getByText('Untitled Project')).toBeInTheDocument();
  });

  it('shows Slides menu item by default (no project type)', () => {
    render(<ProjectEditor />);
    expect(screen.getByText('Slides')).toBeInTheDocument();
  });

  it('shows Settings and Import in the menu', () => {
    render(<ProjectEditor />);
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Import')).toBeInTheDocument();
  });

  it('does NOT show Avatar menu item when no projectType', () => {
    render(<ProjectEditor />);
    expect(screen.queryByText('Avatar')).not.toBeInTheDocument();
  });

  it('shows slide ID badges in the slides panel', () => {
    render(<ProjectEditor />);
    expect(screen.getAllByText(/Slide ID/).length).toBeGreaterThanOrEqual(1);
  });

  it('switches to Settings panel on click', () => {
    render(<ProjectEditor />);
    fireEvent.click(screen.getByText('Settings'));
    expect(screen.getByTestId('settings-panel')).toBeInTheDocument();
  });

  it('switches to Import panel on click', () => {
    render(<ProjectEditor />);
    fireEvent.click(screen.getByText('Import'));
    expect(screen.getByTestId('import-panel')).toBeInTheDocument();
  });

  it('renders inspector tabs when Slides is active', () => {
    render(<ProjectEditor />);
    expect(screen.getByText('Script')).toBeInTheDocument();
    expect(screen.getByText('Elements')).toBeInTheDocument();
  });

  it('switches inspector tab on click', () => {
    render(<ProjectEditor />);
    fireEvent.click(screen.getByText('Elements'));
    expect(screen.getByText('Elements settings coming soon.')).toBeInTheDocument();
  });

  it('has Share/Assign menu item', () => {
    render(<ProjectEditor />);
    expect(screen.getByText('Share/Assign')).toBeInTheDocument();
  });
});

import { getProjectById } from '@/app/actions/projects';

describe('ProjectEditor — Coach Mode', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('shows Coach Q&A Set and Coach Settings tabs when in Coach Mode', async () => {
    (getProjectById as jest.Mock).mockResolvedValueOnce({
      id: '123',
      title: 'Coach Project',
      type: 'slides',
      status: 'draft',
      userId: 'user1',
      isCoachMode: true
    });

    render(<ProjectEditor projectId="123" />);

    // We have to wait for the effect to fetch project and update state
    const qaTab = await screen.findByText('Coach Q&A Set');
    expect(qaTab).toBeInTheDocument();
    
    expect(screen.getByText('Coach Settings')).toBeInTheDocument();
  });

  it('hides Coach tabs for normal projects', async () => {
    (getProjectById as jest.Mock).mockResolvedValueOnce({
      id: '123',
      title: 'Normal Project',
      type: 'slides',
      status: 'draft',
      userId: 'user1',
      isCoachMode: false
    });

    render(<ProjectEditor projectId="123" />);
    
    // Wait for basic render
    await screen.findByText('Slides');

    expect(screen.queryByText('Coach Q&A Set')).not.toBeInTheDocument();
    expect(screen.queryByText('Coach Settings')).not.toBeInTheDocument();
  });
});
