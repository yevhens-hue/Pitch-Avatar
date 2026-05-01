import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { UserContext } from '@/context/UserContext';
import type { User } from '@/types';

const mockUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  avatarInitial: 'JD',
};

const renderWithContext = (ui: React.ReactElement) => {
  return render(
    <UserContext.Provider value={{ user: mockUser, subscription: null, isLoading: false }}>
      {ui}
    </UserContext.Provider>
  );
};

describe('UserContext', () => {
  it('provides user data', () => {
    const TestComponent = () => {
      const { user } = useContext(UserContext);
      return <div>{user?.name}</div>;
    };

    renderWithContext(<TestComponent />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('throws error when used outside provider', () => {
    const TestComponent = () => {
      useContext(UserContext);
      return null;
    };

    // Suppress console.error for this test
    const originalError = console.error;
    console.error = jest.fn();

    expect(() => renderWithContext(<TestComponent />)).not.toThrow('useUser must be used within UserProvider');

    console.error = originalError;
  });
});