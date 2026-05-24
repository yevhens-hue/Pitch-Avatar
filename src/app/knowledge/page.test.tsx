import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import KnowledgeBase from './page';

jest.mock('lucide-react', () => {
  const MockIcon = () => null;
  return {
    FileText: MockIcon,
    Globe: MockIcon,
    Trash2: MockIcon,
    Upload: MockIcon,
    Plus: MockIcon,
    CheckCircle2: MockIcon,
    Clock: MockIcon,
    AlertCircle: MockIcon,
    Settings: MockIcon,
    Database: MockIcon,
    Zap: MockIcon,
    Lock: MockIcon,
    Bot: MockIcon,
    RefreshCw: MockIcon,
    X: MockIcon,
    Shield: MockIcon,
    History: MockIcon,
    User: MockIcon,
    CreditCard: MockIcon,
  };
});

describe('Knowledge Page', () => {
  it('renders page title and description', () => {
    render(<KnowledgeBase />);
    expect(screen.getByText('Knowledge Base')).toBeInTheDocument();
    expect(screen.getByText(/Teach your AI assistants to answer questions/)).toBeInTheDocument();
  });

  it('renders add document button', () => {
    render(<KnowledgeBase />);
    expect(screen.getByText('Add Document')).toBeInTheDocument();
  });

  it('renders table headers', () => {
    render(<KnowledgeBase />);
    expect(screen.getByText('Document')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Size')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Added')).toBeInTheDocument();
  });

  it('renders mock knowledge items', () => {
    render(<KnowledgeBase />);
    expect(screen.getByText('Product Specifications 2026.pdf')).toBeInTheDocument();
    expect(screen.getByText('Company FAQ')).toBeInTheDocument();
  });

  it('renders document metadata and badge status', () => {
    render(<KnowledgeBase />);
    expect(screen.getByText('PDF')).toBeInTheDocument();
    expect(screen.getByText('Text / Web')).toBeInTheDocument();
    expect(screen.getByText('2.4 MB')).toBeInTheDocument();
    expect(screen.getByText('12 KB')).toBeInTheDocument();
    expect(screen.getAllByText('Indexed').length).toBe(2);
  });

  it('renders delete buttons with aria-label', () => {
    render(<KnowledgeBase />);
    const deleteBtns = screen.getAllByLabelText('Delete document');
    expect(deleteBtns.length).toBe(2);
  });
});