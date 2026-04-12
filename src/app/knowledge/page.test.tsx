import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import KnowledgeBase from './page'

describe('Knowledge Page', () => {
  it('renders page title', () => {
    render(<KnowledgeBase />)
    expect(screen.getByText('База знаний (Knowledge Base)')).toBeInTheDocument()
  })

  it('renders create buttons', () => {
    render(<KnowledgeBase />)
    expect(screen.getByText('+ Текст / Сайт')).toBeInTheDocument()
    expect(screen.getByText('+ Загрузить файл')).toBeInTheDocument()
  })

  it('renders description', () => {
    render(<KnowledgeBase />)
    expect(screen.getByText(/База знаний позволяет вашим ИИ-ассистентам/)).toBeInTheDocument()
  })

  it('renders table headers', () => {
    render(<KnowledgeBase />)
    expect(screen.getByText('Название документа')).toBeInTheDocument()
    expect(screen.getByText('Тип')).toBeInTheDocument()
    expect(screen.getByText('Размер')).toBeInTheDocument()
    expect(screen.getByText('Загружено')).toBeInTheDocument()
    expect(screen.getByText('Действия')).toBeInTheDocument()
  })

  it('renders knowledge items', () => {
    render(<KnowledgeBase />)
    expect(screen.getByText('Product Specifications 2026.pdf')).toBeInTheDocument()
    expect(screen.getByText('Company FAQ')).toBeInTheDocument()
  })

  it('renders document types', () => {
    render(<KnowledgeBase />)
    expect(screen.getByText('PDF')).toBeInTheDocument()
    expect(screen.getByText('Text / Web')).toBeInTheDocument()
  })

  it('renders document sizes', () => {
    render(<KnowledgeBase />)
    expect(screen.getByText('2.4 MB')).toBeInTheDocument()
    expect(screen.getByText('12 КБ')).toBeInTheDocument()
  })

  it('renders delete buttons with aria-label', () => {
    render(<KnowledgeBase />)
    const deleteBtns = screen.getAllByLabelText('Удалить документ')
    expect(deleteBtns.length).toBe(2)
  })
})
