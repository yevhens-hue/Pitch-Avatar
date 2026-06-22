import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';

jest.mock('@/components/ProjectEditor/ProjectEditor.module.css', () => ({
  container: 'container', editorRoot: 'editorRoot', sidebar: 'sidebar',
  slideList: 'slideList', slideItem: 'slideItem', activeSlide: 'activeSlide',
  rightPanel: 'rightPanel', tabBar: 'tabBar', tabBtn: 'tabBtn',
  activeTab: 'activeTab', scriptArea: 'scriptArea', previewArea: 'previewArea',
  saveBtn: 'saveBtn', settingsSection: 'settingsSection', settingsGroup: 'settingsGroup',
  voiceSelect: 'voiceSelect', avatarSelect: 'avatarSelect', fieldLabel: 'fieldLabel',
  topBar: 'topBar', topBarLeft: 'topBarLeft', backBtn: 'backBtn', projectTitle: 'projectTitle',
  topBarCenter: 'topBarCenter', mainTab: 'mainTab', active: 'active', moreDropdownContainer: 'moreDropdownContainer',
  moreDropdown: 'moreDropdown', moreDropdownItem: 'moreDropdownItem', topBarRight: 'topBarRight',
  iconBtn: 'iconBtn', langSelect: 'langSelect', btnOutline: 'btnOutline', btnSolid: 'btnSolid',
  leftPanel: 'leftPanel', slideThumbnail: 'slideThumbnail', slideThumbnailBadge: 'slideThumbnailBadge',
  slideNumber: 'slideNumber', slideActions: 'slideActions', addSlideBtn: 'addSlideBtn',
  centerPanel: 'centerPanel', mainStage: 'mainStage', stageContent: 'stageContent',
  stageHeader: 'stageHeader', stageTitle: 'stageTitle', stageSubtitle: 'stageSubtitle',
  stageBoxes: 'stageBoxes', stageBox: 'stageBox', stageFooter: 'stageFooter', stagePill: 'stagePill',
  inspectorTabs: 'inspectorTabs', inspectorTab: 'inspectorTab', inspectorTabChevron: 'inspectorTabChevron',
  inspectorContent: 'inspectorContent', sectionHeader: 'sectionHeader', sectionTitle: 'sectionTitle',
  infoIcon: 'infoIcon', scriptTextarea: 'scriptTextarea', charCount: 'charCount', generateBtn: 'generateBtn',
  toolRow: 'toolRow', toolIcon: 'toolIcon', toolBtnOutline: 'toolBtnOutline', toolActionIcon: 'toolActionIcon'
}));

function MockIcon() { return null; }
jest.mock('lucide-react', () => ({
  ChevronLeft: MockIcon, ChevronsLeft: MockIcon, ChevronsRight: MockIcon,
  Monitor: MockIcon, User: MockIcon, Target: MockIcon, MessageSquare: MockIcon,
  MoreVertical: MockIcon, Eye: MockIcon, Download: MockIcon, Share2: MockIcon,
  Save: MockIcon, X: MockIcon, Info: MockIcon, Folder: MockIcon, Image: MockIcon,
  Settings: MockIcon, Hash: MockIcon, Wand2: MockIcon, Mic: MockIcon, Play: MockIcon,
  UploadCloud: MockIcon, Volume2: MockIcon, Video: MockIcon, Trash2: MockIcon,
  ArrowUp: MockIcon, ArrowDown: MockIcon, Plus: MockIcon, Dumbbell: MockIcon
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), prefetch: jest.fn(), back: jest.fn() }),
}));
jest.mock('@/components/ui/ToastProvider', () => ({
  useToast: jest.fn(() => ({ showToast: jest.fn() })),
}));
jest.mock('@/app/actions/projects', () => ({
  getProjectById: jest.fn(() => Promise.resolve(null)),
}));
jest.mock('@/app/actions/projectSlides', () => ({
  updateProjectSlides: jest.fn(() => Promise.resolve({ success: true })),
}));
jest.mock('../ShareEnrollModal/ShareEnrollModal', () => () => <div data-testid="share-enroll-modal" />);
jest.mock('@/widgets/Sara/ui/components/ChatPanel', () => () => <div data-testid="chat-panel" />);

import ProjectEditor from './ProjectEditor';

describe('ProjectEditor', () => {
  it('renders project title', () => {
    render(<ProjectEditor />);
    expect(screen.getByText('Untitled Project')).toBeInTheDocument();
  });

  it('renders top navigation tabs', () => {
    render(<ProjectEditor />);
    expect(screen.getByText('Slides')).toBeInTheDocument();
    expect(screen.getByText('Access')).toBeInTheDocument();
    expect(screen.getByText('Goals')).toBeInTheDocument();
  });

  it('renders slide ID badges in sidebar', () => {
    render(<ProjectEditor />);
    expect(screen.getAllByText('Slide ID 1').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Slide ID 2').length).toBeGreaterThanOrEqual(1);
  });

  it('renders inspector panel tabs', () => {
    render(<ProjectEditor />);
    expect(screen.getByText('Script')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Elements')).toBeInTheDocument();
  });

  it('switches inspector tab on click', () => {
    render(<ProjectEditor />);
    fireEvent.click(screen.getByText('About'));
    expect(screen.getByText('About settings coming soon.')).toBeInTheDocument();
  });
});
