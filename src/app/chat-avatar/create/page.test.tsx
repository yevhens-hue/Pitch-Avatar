import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import Page from './page';

jest.mock('@/components/ChatAvatar/Creator/Creator', () => {
  return function MockCreator() {
    return <div data-testid="chat-avatar-creator">Chat Avatar Creator</div>;
  };
});

describe('Chat Avatar Create Page', () => {
  it('renders chat avatar creator component', () => {
    render(<Page />);
    expect(screen.getByTestId('chat-avatar-creator')).toBeInTheDocument();
  });
});