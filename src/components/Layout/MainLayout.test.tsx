import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import MainLayout from './MainLayout'
import { UserProvider } from '@/context'
import * as navigationModule from 'next/navigation'

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/'),
}))

const renderLayout = (children: React.ReactNode = <div>Test Content</div>) =>
  render(
    <UserProvider>
      <MainLayout>{children}</MainLayout>
    </UserProvider>,
  )

describe('MainLayout Component', () => {
  it('renders children', () => {
    renderLayout(<div>Page Content</div>)
    expect(screen.getByText('Page Content')).toBeInTheDocument()
  })

  it('renders sidebar on non-creation pages', () => {
    renderLayout()
    expect(screen.getByText('Pitch Avatar')).toBeInTheDocument()
  })

  it('hides sidebar on /create page', () => {
    const mockUsePathname = navigationModule.usePathname as jest.Mock
    mockUsePathname.mockReturnValue('/create')

    renderLayout()
    expect(screen.queryByText('Pitch Avatar')).not.toBeInTheDocument()
  })

  it('hides sidebar on /chat-avatar/create page', () => {
    const mockUsePathname = navigationModule.usePathname as jest.Mock
    mockUsePathname.mockReturnValue('/chat-avatar/create')

    renderLayout()
    expect(screen.queryByText('Pitch Avatar')).not.toBeInTheDocument()
  })
})
