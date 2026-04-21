import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import ChatAvatarList from './page'

jest.mock('next/link', () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  )
  MockLink.displayName = 'MockLink'
  return MockLink
})

describe('Chat Avatar Page', () => {
  it('renders page title', () => {
    render(<ChatAvatarList />)
    expect(screen.getByText('My AI Chat Avatars')).toBeInTheDocument()
  })

  it('renders create button as link', () => {
    render(<ChatAvatarList />)
    const createLink = screen.getByText('+ Create AI Assistant')
    expect(createLink).toBeInTheDocument()
    expect(createLink.closest('a')).toHaveAttribute('href', '/chat-avatar/create')
  })

  it('renders table headers', () => {
    render(<ChatAvatarList />)
    expect(screen.getByText('Avatar Name')).toBeInTheDocument()
    expect(screen.getByText('Language')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('Actions')).toBeInTheDocument()
  })

  it('renders avatar rows', () => {
    render(<ChatAvatarList />)
    expect(screen.getByText('John Doe - Sales Rep')).toBeInTheDocument()
    expect(screen.getByText('Maria - Tech Support')).toBeInTheDocument()
  })

  it('renders avatar languages', () => {
    render(<ChatAvatarList />)
    expect(screen.getByText('English')).toBeInTheDocument()
    expect(screen.getByText('Spanish')).toBeInTheDocument()
  })

  it('renders avatar statuses', () => {
    render(<ChatAvatarList />)
    expect(screen.getByText('Active')).toBeInTheDocument()
    expect(screen.getByText('Draft')).toBeInTheDocument()
  })

  it('renders settings buttons', () => {
    render(<ChatAvatarList />)
    const settingsBtns = screen.getAllByTitle('Settings')
    expect(settingsBtns.length).toBe(2)
  })
})