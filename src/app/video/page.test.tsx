import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import VideoLibrary from './page'

jest.mock('lucide-react', () => {
  const MockIcon = () => null;
  return {
    Trash2: MockIcon,
    FolderInput: MockIcon,
    Shield: MockIcon,
  };
});

describe('Video Page', () => {
  it('renders page title', () => {
    render(<VideoLibrary />)
    expect(screen.getByText('My Videos')).toBeInTheDocument()
  })

  it('renders upload button', () => {
    render(<VideoLibrary />)
    expect(screen.getByText('+ Upload Video')).toBeInTheDocument()
  })

  it('renders table headers', () => {
    render(<VideoLibrary />)
    expect(screen.getByText('Project Name')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('Created Date')).toBeInTheDocument()
  })

  it('renders mock video list', () => {
    render(<VideoLibrary />)
    expect(screen.getByText('Product Update Q1.mp4')).toBeInTheDocument()
    expect(screen.getByText('Onboarding Tutorial.mp4')).toBeInTheDocument()
  })
})
