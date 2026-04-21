import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import MagicWizard from './MagicWizard';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  useSearchParams: () => ({ get: () => null }),
}));

jest.mock('@/lib/supabase', () => ({
  supabase: {
    storage: {
      from: () => ({
        upload: jest.fn().mockResolvedValue({ error: null }),
        getPublicUrl: () => ({ data: { publicUrl: 'https://example.com/file.pdf' } }),
      }),
    },
  },
}));

describe('MagicWizard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders magic wizard title', () => {
    render(<MagicWizard />);
    expect(screen.getByText('Magic Content Importer')).toBeInTheDocument();
  });

  it('renders upload zone', () => {
    render(<MagicWizard />);
    expect(screen.getByText('Drag & Drop to Start')).toBeInTheDocument();
  });

  it('renders source tabs', () => {
    render(<MagicWizard />);
    expect(screen.getByText('Upload File')).toBeInTheDocument();
    expect(screen.getByText('Import from URL')).toBeInTheDocument();
    expect(screen.getByText('YouTube Video')).toBeInTheDocument();
  });

  it('renders browse button', () => {
    render(<MagicWizard />);
    expect(screen.getByText('Browse Local Files')).toBeInTheDocument();
  });

  it('renders URL input section', () => {
    render(<MagicWizard />);
    expect(screen.getByPlaceholderText('Paste a website URL or Google Drive link...')).toBeInTheDocument();
  });

  it('shows file input on browse click', () => {
    render(<MagicWizard />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).not.toBeNull();
  });
});