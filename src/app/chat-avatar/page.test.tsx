import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import ChatAvatarList from './page'

jest.mock('lucide-react', () => {
  const MockIcon = () => null;
  return {
    Trash2: MockIcon,
    FolderInput: MockIcon,
    Shield: MockIcon,
  };
});

describe('Chat Avatar Page', () => {
  it('renders page title', () => {
    render(<ChatAvatarList />)
    expect(screen.getByText('My AI Chat-avatars')).toBeInTheDocument()
  })

  it('renders create button', () => {
    render(<ChatAvatarList />)
    expect(screen.getByText('+ Create Chat-avatar')).toBeInTheDocument()
  })

  it('renders table headers', () => {
    render(<ChatAvatarList />)
    expect(screen.getByText('Project Name')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('Created Date')).toBeInTheDocument()
  })

  it('renders avatar rows', () => {
    render(<ChatAvatarList />)
    expect(screen.getByText('John Doe - Sales Rep')).toBeInTheDocument()
    expect(screen.getByText('Maria - Tech Support')).toBeInTheDocument()
  })

  it('renders avatar statuses in lowercase', () => {
    render(<ChatAvatarList />)
    expect(screen.getByText('active')).toBeInTheDocument()
    expect(screen.getByText('draft')).toBeInTheDocument()
  })
})