import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import ChatAvatarList from './page'

describe('Chat Avatar Page', () => {
  it('renders page title', () => {
    render(<ChatAvatarList />)
    expect(screen.getByText('AI Chat-avatars')).toBeInTheDocument()
  })

  it('renders create button', () => {
    render(<ChatAvatarList />)
    expect(screen.getByText('+ Create Chat-avatar')).toBeInTheDocument()
  })

  it('renders table headers', () => {
    render(<ChatAvatarList />)
    expect(screen.getByText('PROJECT')).toBeInTheDocument()
    expect(screen.getByText('PREVIEW')).toBeInTheDocument()
    expect(screen.getByText('CREATED')).toBeInTheDocument()
  })

  it('renders avatar rows', () => {
    render(<ChatAvatarList />)
    expect(screen.getByText('Customer Support Bot')).toBeInTheDocument()
  })
})