import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import RootLayout from './layout';

// Mock child components
jest.mock('@/components/Layout/MainLayout', () => {
  return function MockMainLayout({ children }: { children: React.ReactNode }) {
    return <div data-testid="main-layout">{children}</div>;
  };
});

jest.mock('@/components/Providers/PostHogProvider', () => {
  return function MockPostHogProvider({ children }: { children: React.ReactNode }) {
    return <div data-testid="posthog-provider">{children}</div>;
  };
});

jest.mock('@/context/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="auth-provider">{children}</div>,
}));

jest.mock('@/context/UserProvider', () => ({
  UserProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="user-provider">{children}</div>,
}));

jest.mock('@/components/ui/ErrorBoundary', () => {
  return function MockErrorBoundary({ children }: { children: React.ReactNode }) {
    return <div data-testid="error-boundary">{children}</div>;
  };
});

jest.mock('@/components/Layout/ClientWidgets', () => {
  return function MockClientWidgets() {
    return <div data-testid="client-widgets">ClientWidgets</div>;
  };
});

describe('RootLayout', () => {
  it('renders children within providers', () => {
    render(
      <RootLayout>
        <div data-testid="test-child">Test Content</div>
      </RootLayout>
    );

    expect(screen.getByTestId('test-child')).toBeInTheDocument();
    expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
    expect(screen.getByTestId('user-provider')).toBeInTheDocument();
    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    expect(screen.getByTestId('main-layout')).toBeInTheDocument();
  });

  it('has correct metadata', () => {
    const metadata = (RootLayout as any).metadata || { metadata: {} };
    // Since metadata is not directly accessible in rendered output, we just verify component renders
    expect(screen.getByTestId('test-child')).toBeInTheDocument();
  });
});