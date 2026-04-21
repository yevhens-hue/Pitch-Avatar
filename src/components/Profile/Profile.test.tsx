import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { UserContext } from '@/context/UserContext';
import type { User, Subscription } from '@/types';
import Profile from './Profile';

const mockUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  avatarInitial: 'JD',
  company: 'Acme Inc',
};

const mockSubscription: Subscription = {
  plan: 'trial',
  trialDaysLeft: 14,
  aiMinutesTotal: 100,
  aiMinutesUsed: 10,
};

const renderProfile = () => {
  return render(
    <UserContext.Provider value={{ user: mockUser, subscription: mockSubscription, isLoading: false }}>
      <Profile />
    </UserContext.Provider>
  );
};

describe('Profile', () => {
  it('renders user name', () => {
    renderProfile();

    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
  });

  it('renders user email', () => {
    renderProfile();

    expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
  });

  it('renders user company', () => {
    renderProfile();

    expect(screen.getByDisplayValue('Acme Inc')).toBeInTheDocument();
  });

  it('renders avatar initial', () => {
    renderProfile();

    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('renders account plan', () => {
    renderProfile();

    expect(screen.getByText('Trial')).toBeInTheDocument();
  });

  it('renders personal information section', () => {
    renderProfile();

    expect(screen.getByText('Personal Information')).toBeInTheDocument();
  });

  it('renders profile photo section', () => {
    renderProfile();

    expect(screen.getByText('Profile Photo')).toBeInTheDocument();
  });

  it('renders subscription plan section', () => {
    renderProfile();

    expect(screen.getByText('Subscription Plan')).toBeInTheDocument();
  });

  it('renders change password button', () => {
    renderProfile();

    expect(screen.getByText('Change password')).toBeInTheDocument();
  });

  it('renders save changes button', () => {
    renderProfile();

    expect(screen.getByText('Save changes')).toBeInTheDocument();
  });
});