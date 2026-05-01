import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { UserProvider } from './UserProvider';
import { UserContext } from './UserContext';
import type { User, Subscription } from '@/types';

const mockUser: User = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  avatarInitial: 'TU',
};

const mockSubscription: Subscription = {
  plan: 'trial',
  trialDaysLeft: 7,
  aiMinutesTotal: 100,
  aiMinutesUsed: 10,
};

const TestConsumer = () => {
  const { user, subscription, isLoading } = useContext(UserContext);
  return (
    <div>
      <div data-testid="user-name">{user?.name || 'no user'}</div>
      <div data-testid="subscription-plan">{subscription?.plan || 'no plan'}</div>
      <div data-testid="is-loading">{isLoading.toString()}</div>
    </div>
  );
};

describe('UserProvider', () => {
  it('provides user from sync fetch', async () => {
    // This test will use mocked fetchCurrentUserSync
    const { fetchCurrentUserSync } = require('@/services/user-service');
    fetchCurrentUserSync.mockReturnValue({ user: mockUser, subscription: mockSubscription });

    render(
      <UserProvider>
        <TestConsumer />
      </UserProvider>
    );

    expect(screen.getByTestId('user-name')).toHaveTextContent('Test User');
  });
});