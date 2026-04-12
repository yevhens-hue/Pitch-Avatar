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

    expect(screen.getByText('Презентации')).toBeTruthy()
    expect(screen.getByText('AI Чат-аватар')).toBeTruthy()
    expect(screen.getByText('Видео')).toBeTruthy()
    expect(screen.getByText('Аналитика')).toBeTruthy()
    expect(screen.getByText('Роли аватара')).toBeTruthy()
    expect(screen.getByText('Голоса')).toBeTruthy()
  })

  it('renders user info widget after loading', async () => {
    renderSidebar()

    await waitFor(() => {
      expect(screen.getByText('1cpafarm@gmail.com')).toBeTruthy()
      expect(screen.getByText('Trial plan')).toBeTruthy()
    })
  })
})
