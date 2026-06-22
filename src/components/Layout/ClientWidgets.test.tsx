import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import ClientWidgets from './ClientWidgets';

jest.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      user_metadata: { main_goal: 'create_a_short_video_with_ai_avatar' }
    },
    loading: false,
    signOut: jest.fn()
  })
}));

describe('ClientWidgets', () => {
  it('renders without error in isLabMode=false', () => {
    const { container } = render(<ClientWidgets isLabMode={false} />);
    expect(container).toBeInTheDocument();
  });

  it('renders without error in isLabMode=true', () => {
    const { container } = render(<ClientWidgets isLabMode={true} />);
    expect(container).toBeInTheDocument();
  });
});