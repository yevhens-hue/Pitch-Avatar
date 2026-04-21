import { render, screen, waitFor } from '@testing-library/react'
import Sidebar from './Sidebar'
import { UserProvider } from '@/context'

const renderSidebar = () =>
  render(
    <UserProvider>
      <Sidebar />
    </UserProvider>,
  )

describe('Sidebar Component', () => {
  it('renders all main navigation items', () => {
    renderSidebar()

    expect(screen.getByText('Home')).toBeTruthy()
    expect(screen.getByText('Projects')).toBeTruthy()
    expect(screen.getByText('Library')).toBeTruthy()
    expect(screen.getByText('Voices')).toBeTruthy()
    expect(screen.getByText('Avatar roles')).toBeTruthy()
    expect(screen.getByText('Analytics')).toBeTruthy()
  })

  it('renders user info widget after loading', async () => {
    renderSidebar()

    await waitFor(() => {
      expect(screen.getByText('1cpafarm@gmail.com')).toBeTruthy()
    })
  })
})
