import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock CSS modules
jest.mock('@/components/ProjectEditor/ProjectEditor.module.css', () => ({
  container: 'container',
  editorRoot: 'editorRoot',
  sidebar: 'sidebar',
  slideList: 'slideList',
  slideItem: 'slideItem',
  activeSlide: 'activeSlide',
  rightPanel: 'rightPanel',
  tabBar: 'tabBar',
  tabBtn: 'tabBtn',
  activeTab: 'activeTab',
  scriptArea: 'scriptArea',
  previewArea: 'previewArea',
  saveBtn: 'saveBtn',
  settingsSection: 'settingsSection',
  settingsGroup: 'settingsGroup',
  voiceSelect: 'voiceSelect',
  avatarSelect: 'avatarSelect',
  fieldLabel: 'fieldLabel',
}))

// Mock CSS modules for ProjectEditor
jest.mock('@/components/ShareEnrollModal/ShareEnrollModal.module.css', () => ({}))
jest.mock('@/components/Wizard/Wizard.module.css', () => ({}))
jest.mock('@/widgets/Sara/ui/components/ChatPanel.module.css', () => ({}))

// Mock lucide-react
jest.mock('lucide-react', () => {
  const MockIcon = () => null;
  return {
    ChevronLeft: MockIcon,
    Monitor: MockIcon,
    User: MockIcon,
    Target: MockIcon,
    MessageSquare: MockIcon,
    MoreVertical: MockIcon,
    Eye: MockIcon,
    Download: MockIcon,
    Share2: MockIcon,
    Save: MockIcon,
    X: MockIcon,
    Info: MockIcon,
    Folder: MockIcon,
    Image: MockIcon,
    Settings: MockIcon,
    Hash: MockIcon,
    Wand2: MockIcon,
    Mic: MockIcon,
    Play: MockIcon,
    UploadCloud: MockIcon,
    Volume2: MockIcon,
    Video: MockIcon,
    Trash2: MockIcon,
    ArrowUp: MockIcon,
    ArrowDown: MockIcon,
    Plus: MockIcon,
  };
});

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
}))

jest.mock('@/components/ui/ToastProvider', () => ({
  useToast: jest.fn(() => ({
    showToast: jest.fn(),
  })),
}))

jest.mock('@/app/actions/projects', () => ({
  getProjectById: jest.fn(() => Promise.resolve(null)),
  updateProjectSlides: jest.fn(() => Promise.resolve({ success: true })),
}))

import ProjectEditor from './ProjectEditor';

describe('ProjectEditor', () => {
  it('renders editor tabs navigation', () => {
    render(<ProjectEditor />);
    expect(screen.getAllByText('Slides')[0]).toBeInTheDocument();
    expect(screen.getByText('Avatar')).toBeInTheDocument();
    expect(screen.getByText('Knowledge Base')).toBeInTheDocument();
    expect(screen.getByText('Role')).toBeInTheDocument();
    expect(screen.getByText('Instructions')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('renders slides list and thumbnail panel by default', () => {
    render(<ProjectEditor />);
    expect(screen.getByText('Slide 1')).toBeInTheDocument();
    expect(screen.getByText('Slide 2')).toBeInTheDocument();
    expect(screen.getByText('Slide 3')).toBeInTheDocument();
  });

  it('renders script editor and visual preview', () => {
    render(<ProjectEditor />);
    expect(screen.getByPlaceholderText('Enter script for this slide...')).toBeInTheDocument();
    expect(screen.getByText('Slide 1 Visual Preview')).toBeInTheDocument();
  });

  it('switches tabs on click', () => {
    render(<ProjectEditor />);

    fireEvent.click(screen.getByText('Settings'));
    expect(screen.getByText('Project Name')).toBeInTheDocument();
    expect(screen.getByText('Viewer Layout')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Avatar'));
    expect(screen.getByText('Avatar Settings')).toBeInTheDocument();
  });
});