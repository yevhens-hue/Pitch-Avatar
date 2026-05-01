import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import Page from './page';

jest.mock('@/components/Profile/Profile', () => {
  return function MockProfile() {
    return <div data-testid="profile-component">Profile Component</div>;
  };
});

describe('Profile Page', () => {
  it('renders profile component', () => {
    render(<Page />);
    expect(screen.getByTestId('profile-component')).toBeInTheDocument();
  });
});