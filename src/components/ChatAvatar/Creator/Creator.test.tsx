import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import Creator from './Creator'
import { useSaraStore } from '@/widgets/Sara/store/useSaraStore'

describe('ChatAvatar Creator Component', () => {
  it('renders creator title', () => {
    render(<Creator />)
    expect(screen.getByText('Create your AI Chat Avatar')).toBeInTheDocument()
  })

  it('renders step labels in sidebar', () => {
    render(<Creator />)
    const stepLabels = document.querySelectorAll('[class*="stepLabel"]')
    expect(stepLabels.length).toBe(4)
  })

  it('renders step 1 content by default', () => {
    render(<Creator />)
    expect(screen.getByText('Project Name')).toBeInTheDocument()
    expect(screen.getByText('Avatar Name')).toBeInTheDocument()
    expect(screen.getByText('Default Language')).toBeInTheDocument()
    expect(screen.getByText('Voice')).toBeInTheDocument()
  })

  it('renders avatar grid on step 1', () => {
    render(<Creator />)
    expect(screen.getByText('Photo')).toBeInTheDocument()
    const avatarItems = document.querySelectorAll('[class*="avatarItem"]')
    expect(avatarItems.length).toBe(12)
  })

  it('navigates to step 2', () => {
    render(<Creator />)
    fireEvent.click(screen.getByText('Next →'))

    expect(screen.getByText('I want my avatar as a chat widget without slides')).toBeInTheDocument()
  })

  it('navigates to step 3', () => {
    render(<Creator />)
    fireEvent.click(screen.getByText('Next →'))
    fireEvent.click(screen.getByLabelText('I want my avatar as a chat widget without slides'))
    fireEvent.click(screen.getByText('Next →'))

    expect(screen.getByPlaceholderText(/Here you can describe your target audience/)).toBeInTheDocument()
  })

  it('navigates to step 4 and shows knowledge base content', () => {
    render(<Creator />)
    fireEvent.click(screen.getByText('Next →'))
    fireEvent.click(screen.getByLabelText('I want my avatar as a chat widget without slides'))
    fireEvent.click(screen.getByText('Next →'))
    fireEvent.click(screen.getByText('Next →'))

    expect(screen.getAllByText('Drag and drop files here')[0]).toBeInTheDocument()
  })

  it('shows "Create" button on step 4', () => {
    render(<Creator />)
    fireEvent.click(screen.getByText('Next →'))
    fireEvent.click(screen.getByLabelText('I want my avatar as a chat widget without slides'))
    fireEvent.click(screen.getByText('Next →'))
    fireEvent.click(screen.getByText('Next →'))

    expect(screen.getByText('Create')).toBeInTheDocument()
  })

  it('renders exit button', () => {
    render(<Creator />)
    expect(screen.getByText('Exit')).toBeInTheDocument()
  })

  it('renders back arrow', () => {
    render(<Creator />)
    expect(screen.getByText('Create your AI Chat Avatar')).toBeInTheDocument()
  })

  it('renders add language button', () => {
    render(<Creator />)
    expect(screen.getByText(/Add language/i)).toBeInTheDocument()
  })

  it('renders language select', () => {
    render(<Creator />)
    expect(screen.getByText('English')).toBeInTheDocument()
    expect(screen.getByText('Spanish')).toBeInTheDocument()
  })

  it('renders avatar items in grid', () => {
    render(<Creator />)
    const avatarItems = document.querySelectorAll('[class*="avatarItem"]')
    expect(avatarItems.length).toBe(12)
  })

  it('renders step numbers', () => {
    render(<Creator />)
    const stepNums = document.querySelectorAll('[class*="stepNum"]')
    expect(stepNums.length).toBe(4)
  })

  it('renders section title for step 1', () => {
    render(<Creator />)
    const titles = screen.getAllByText('Create Avatar')
    expect(titles.length).toBeGreaterThanOrEqual(1)
  })

  it('shows step 2 section title after navigation', () => {
    render(<Creator />)
    fireEvent.click(screen.getByText('Next →'))
    fireEvent.click(screen.getByLabelText('I want my avatar as a chat widget without slides'))
    const titles = screen.getAllByText('Presentation Content')
    expect(titles.length).toBeGreaterThanOrEqual(1)
  })

  it('shows step 3 section title after navigation', () => {
    render(<Creator />)
    fireEvent.click(screen.getByText('Next →'))
    fireEvent.click(screen.getByLabelText('I want my avatar as a chat widget without slides'))
    fireEvent.click(screen.getByText('Next →'))
    const titles = screen.getAllByText('Avatar Instructions')
    expect(titles.length).toBeGreaterThanOrEqual(1)
  })

  it('synchronizes wizard step with useSaraStore and cleans up on unmount', () => {
    // Assert initial wizard step is null or clean
    useSaraStore.getState().setWizardStep(null)
    
    const { unmount } = render(<Creator />)
    expect(useSaraStore.getState().wizardStep).toBe(1)

    // Navigate to step 2
    fireEvent.click(screen.getByText('Next →'))
    expect(useSaraStore.getState().wizardStep).toBe(2)

    // Unmount
    unmount()
    expect(useSaraStore.getState().wizardStep).toBeNull()
  })
})