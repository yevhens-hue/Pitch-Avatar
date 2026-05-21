import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { useContext } from 'react';
import { UserProvider } from './UserProvider';
import { UserContext } from './UserContext';
import * as userService from '@/services/user-service';
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

jest.mock('@/services/user-service');

const mockFetchSync = userService.fetchCurrentUserSync as jest.Mock;

describe('UserProvider', () => {
  it('provides user from sync fetch', async () => {
    mockFetchSync.mockReturnValue({ user: mockUser, subscription: mockSubscription });

    render(
      <UserProvider>
        <TestConsumer />
      </UserProvider>
    );

    expect(screen.getByTestId('user-name')).toHaveTextContent('Test User');
  });
});
