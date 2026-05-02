import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import TourBuilder from './TourBuilder';

jest.mock('@/lib/store', () => ({
  useUIStore: jest.fn(),
}));

jest.mock('@/components/TourBuilder/SelectionOverlay', () => {
  return function MockSelectionOverlay({ element, type }: { element: HTMLElement; type: 'hover' | 'select' }) {
    return <div data-testid={`selection-overlay-${type}`}>Overlay</div>;
  };
});

jest.mock('@/components/TourBuilder/SelectionToolbar', () => {
  return function MockSelectionToolbar({ element, onClose, onUpdate }: { element: HTMLElement; onClose: () => void; onUpdate: (el: HTMLElement) => void }) {
    return <div data-testid="selection-toolbar">Toolbar</div>;
  };
});

jest.mock('@/components/TourBuilder/SettingsWidget', () => {
  return function MockSettingsWidget({ element, onClose }: { element: HTMLElement; onClose: () => void }) {
    return <div data-testid="settings-widget">Settings</div>;
  };
});

describe('TourBuilder', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when builder mode is not active', () => {
    const { useUIStore } = require('@/lib/store');
    (useUIStore as jest.Mock).mockReturnValue({ isBuilderModeActive: false });
    const { container } = render(<TourBuilder />);
    expect(container.firstChild).toBeNull();
  });

  it('renders container when builder mode is active', () => {
    const { useUIStore } = require('@/lib/store');
    (useUIStore as jest.Mock).mockReturnValue({ isBuilderModeActive: true });
    render(<TourBuilder />);
    expect(screen.getByTestId('tour-builder')).toBeInTheDocument();
  });
});