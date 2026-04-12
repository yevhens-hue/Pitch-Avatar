import { render, screen, fireEvent } from '@testing-library/react';
import Player from './Player';

describe('Player Component', () => {
  it('should render the player stage and chat', () => {
    render(<Player />);
    expect(screen.getByText('AI Avatar')).toBeInTheDocument();
    expect(screen.getByText('AI Assistant')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ask a question...')).toBeInTheDocument();
  });

  it('should handle sending a chat message', async () => {
    render(<Player />);
    const input = screen.getByPlaceholderText('Ask a question...');
    const sendBtn = screen.getByText('➤');

    fireEvent.change(input, { target: { value: 'How does this work?' } });
    fireEvent.click(sendBtn);

    expect(screen.getByText('How does this work?')).toBeInTheDocument();
  });
});
