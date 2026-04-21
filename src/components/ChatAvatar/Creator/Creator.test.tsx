import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import Creator from './Creator'

describe('ChatAvatar Creator Component', () => {
  it('renders creator title', () => {
    render(<Creator />)
    expect(screen.getByText('Creating your AI Chat Avatar')).toBeInTheDocument()
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
    expect(screen.getByText('Add Your Own')).toBeInTheDocument()
  })

  it('navigates to step 2', () => {
    render(<Creator />)
    fireEvent.click(screen.getByText('Next'))

    expect(screen.getByText('Upload PDF or PPTX')).toBeInTheDocument()
  })

  it('navigates to step 3', () => {
    render(<Creator />)
    fireEvent.click(screen.getByText('Next'))
    fireEvent.click(screen.getByText('Next'))

    expect(screen.getByPlaceholderText('Example: You are a friendly sales manager...')).toBeInTheDocument()
  })

  it('navigates to step 4 and shows knowledge base content', () => {
    render(<Creator />)
    fireEvent.click(screen.getByText('Next'))
    fireEvent.click(screen.getByText('Next'))
    fireEvent.click(screen.getByText('Next'))

    expect(screen.getByText('Click to add files')).toBeInTheDocument()
  })

  it('shows "Create" button on step 4', () => {
    render(<Creator />)
    fireEvent.click(screen.getByText('Next'))
    fireEvent.click(screen.getByText('Next'))
    fireEvent.click(screen.getByText('Next'))

    expect(screen.getByText('Create')).toBeInTheDocument()
  })

  it('renders exit button', () => {
    render(<Creator />)
    expect(screen.getByText('Exit')).toBeInTheDocument()
  })

  it('renders back arrow', () => {
    render(<Creator />)
    expect(screen.getByText('←')).toBeInTheDocument()
  })

  it('renders add language button', () => {
    render(<Creator />)
    expect(screen.getByText('+ Add Language')).toBeInTheDocument()
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
    fireEvent.click(screen.getByText('Next'))
    const titles = screen.getAllByText('Presentation Content')
    expect(titles.length).toBeGreaterThanOrEqual(1)
  })

  it('shows step 3 section title after navigation', () => {
    render(<Creator />)
    fireEvent.click(screen.getByText('Next'))
    fireEvent.click(screen.getByText('Next'))
    const titles = screen.getAllByText('Avatar Instructions')
    expect(titles.length).toBeGreaterThanOrEqual(1)
  })
})