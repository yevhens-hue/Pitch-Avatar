import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import ClientWidgets from './ClientWidgets';

describe('ClientWidgets', () => {
  it('renders without error in isLabMode=false', () => {
    const { container } = render(<ClientWidgets isLabMode={false} />);
    expect(container).toBeInTheDocument();
  });

  it('renders without error in isLabMode=true', () => {
    const { container } = render(<ClientWidgets isLabMode={true} />);
    expect(container).toBeInTheDocument();
  });
});