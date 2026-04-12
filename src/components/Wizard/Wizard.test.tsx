import { render, screen, fireEvent } from '@testing-library/react';
import Wizard from './Wizard';

describe('Wizard Component', () => {
  it('should render the first step (Upload File)', () => {
    render(<Wizard />);
    expect(screen.getByText('Upload Presentation')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
  });

  it('should navigate to next step when Next is clicked', () => {
    render(<Wizard />);
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);
    expect(screen.getByText('Choose Avatar')).toBeInTheDocument();
  });
});
