import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import ConversationalOnboarding from './page';

jest.mock('@/components/Wizard/variants/ChatWizard', () => {
  return function MockChatWizard() {
    return <div data-testid="conversational-wizard">Chat Wizard</div>;
  };
});

describe('Conversational Onboarding Page', () => {
  it('renders chat wizard component', () => {
    render(<ConversationalOnboarding />);
    expect(screen.getByTestId('conversational-wizard')).toBeInTheDocument();
  });
});