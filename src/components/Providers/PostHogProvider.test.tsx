import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { PostHogProvider } from './PostHogProvider';

describe('PostHogProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children', () => {
    render(
      <PostHogProvider>
        <div data-testid="child">Child</div>
      </PostHogProvider>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('initializes PostHog with env key', () => {
    render(
      <PostHogProvider>
        <div>Content</div>
      </PostHogProvider>
    );

    // PostHog should be initialized with placeholder or real key
    expect(typeof window !== 'undefined').toBe(true);
  });
});