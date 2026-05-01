import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import VideoPresentationPage from './page';

jest.mock('@/components/Wizard/VideoWizard', () => {
  return function MockVideoWizard() {
    return <div data-testid="video-wizard-page">Video Wizard</div>;
  };
});

describe('Video Presentation Page', () => {
  it('renders video wizard component', () => {
    render(<VideoPresentationPage />);
    expect(screen.getByTestId('video-wizard-page')).toBeInTheDocument();
  });
});