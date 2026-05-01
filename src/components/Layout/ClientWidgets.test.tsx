import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import ClientWidgets from './ClientWidgets';

describe('ClientWidgets', () => {
  it('renders children', () => {
    render(
      <ClientWidgets>
        <div data-testid="child">Test Child</div>
      </ClientWidgets>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });
});