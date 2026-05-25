import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import VideoLibrary from './page'

describe('Video Page', () => {
  it('renders page title', () => {
    render(<VideoLibrary />)
    expect(screen.getByText('Video')).toBeInTheDocument()
  })

  it('renders upload button', () => {
    render(<VideoLibrary />)
    expect(screen.getByText('+ Create Video')).toBeInTheDocument()
  })

  it('renders table headers', () => {
    render(<VideoLibrary />)
    expect(screen.getByText('PROJECT')).toBeInTheDocument()
    expect(screen.getByText('PREVIEW')).toBeInTheDocument()
    expect(screen.getByText('CREATED')).toBeInTheDocument()
  })

  it('renders mock video list', () => {
    render(<VideoLibrary />)
    expect(screen.getByText('Internal Training')).toBeInTheDocument()
  })
})
