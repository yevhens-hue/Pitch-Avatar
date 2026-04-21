import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import QuickWizard from './QuickWizard';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

describe('QuickWizard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders step 1 by default', () => {
    render(<QuickWizard />);
    expect(screen.getByText('Upload Your Slides')).toBeInTheDocument();
  });

  it('renders file dropzone', () => {
    render(<QuickWizard />);
    expect(screen.getByText('Drag & drop your file here')).toBeInTheDocument();
  });

  it('renders source import options', () => {
    render(<QuickWizard />);
    expect(screen.getByText('Canva')).toBeInTheDocument();
    expect(screen.getByText('Google Slides')).toBeInTheDocument();
  });

  it('renders step navigation', () => {
    render(<QuickWizard />);
    expect(screen.getByText('Step 1')).toBeInTheDocument();
    expect(screen.getByText('Step 2')).toBeInTheDocument();
  });

  it('navigates to step 2 when file is uploaded', async () => {
    render(<QuickWizard />);
    const dropzone = screen.getByText('Drag & drop your file here').closest('div') as HTMLElement;
    
    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    fireEvent.drop(dropzone, { dataTransfer: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('Choose Your AI Avatar')).toBeInTheDocument();
    });
  });

  it('shows avatar selection in step 2', async () => {
    render(<QuickWizard />);
    
    await waitFor(() => {
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    await waitFor(() => {
      expect(screen.getByText('Choose Your AI Avatar')).toBeInTheDocument();
    });
  });

  it('renders voice selection in step 3', async () => {
    render(<QuickWizard />);
    
    await waitFor(() => {
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    await waitFor(() => {
      const nextBtn = screen.getByText('Next →');
      fireEvent.click(nextBtn);
    });

    await waitFor(() => {
      const nextBtn = screen.getByText('Next →');
      fireEvent.click(nextBtn);
    });

    await waitFor(() => {
      expect(screen.getByText('Voice & Language')).toBeInTheDocument();
    });
  });

  it('shows summary in step 4', async () => {
    render(<QuickWizard />);
    
    await act(async () => {
      for (let i = 0; i < 3; i++) {
        await waitFor(() => {
          const nextBtn = screen.getByText('Next →');
          fireEvent.click(nextBtn);
        });
      }
    });

    await waitFor(() => {
      expect(screen.getByText('Ready to Generate')).toBeInTheDocument();
    });
  });

  it('renders generate button', async () => {
    render(<QuickWizard />);
    
    await act(async () => {
      for (let i = 0; i < 3; i++) {
        await waitFor(() => {
          const nextBtn = screen.getByText('Next →');
          fireEvent.click(nextBtn);
        });
      }
    });

    await waitFor(() => {
      expect(screen.getByText('Generate Presentation')).toBeInTheDocument();
    });
  });
});