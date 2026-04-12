import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import Creator from './Creator'

describe('ChatAvatar Creator Component', () => {
  it('renders creator title', () => {
    render(<Creator />)
    expect(screen.getByText('Создаем вашего AI Чат-аватара')).toBeInTheDocument()
  })

  it('renders step labels in sidebar', () => {
    render(<Creator />)
    const stepLabels = document.querySelectorAll('[class*="stepLabel"]')
    expect(stepLabels.length).toBe(4)
  })

  it('renders step 1 content by default', () => {
    render(<Creator />)
    expect(screen.getByText('Название проекта')).toBeInTheDocument()
    expect(screen.getByText('Имя аватара')).toBeInTheDocument()
    expect(screen.getByText('Язык по умолчанию')).toBeInTheDocument()
    expect(screen.getByText('Голос')).toBeInTheDocument()
  })

  it('renders avatar grid on step 1', () => {
    render(<Creator />)
    expect(screen.getByText('Фото')).toBeInTheDocument()
    expect(screen.getByText('Добавить собственное')).toBeInTheDocument()
  })

  it('navigates to step 2', () => {
    render(<Creator />)
    fireEvent.click(screen.getByText('Далее'))

    expect(screen.getByText('Загрузить PDF или PPTX')).toBeInTheDocument()
  })

  it('navigates to step 3', () => {
    render(<Creator />)
    fireEvent.click(screen.getByText('Далее'))
    fireEvent.click(screen.getByText('Далее'))

    expect(screen.getByPlaceholderText('Например: Ты дружелюбный менеджер по продажам...')).toBeInTheDocument()
  })

  it('navigates to step 4 and shows knowledge base content', () => {
    render(<Creator />)
    fireEvent.click(screen.getByText('Далее'))
    fireEvent.click(screen.getByText('Далее'))
    fireEvent.click(screen.getByText('Далее'))

    expect(screen.getByText('📄 Кликните, чтобы добавить файлы')).toBeInTheDocument()
  })

  it('shows "Создать" button on step 4', () => {
    render(<Creator />)
    fireEvent.click(screen.getByText('Далее'))
    fireEvent.click(screen.getByText('Далее'))
    fireEvent.click(screen.getByText('Далее'))

    expect(screen.getByText('Создать')).toBeInTheDocument()
  })

  it('renders exit button', () => {
    render(<Creator />)
    expect(screen.getByText('Выход')).toBeInTheDocument()
  })

  it('renders back arrow', () => {
    render(<Creator />)
    expect(screen.getByText('←')).toBeInTheDocument()
  })

  it('renders add language button', () => {
    render(<Creator />)
    expect(screen.getByText('+ Добавить язык')).toBeInTheDocument()
  })

  it('renders language select', () => {
    render(<Creator />)
    expect(screen.getByText('English')).toBeInTheDocument()
    expect(screen.getByText('Russian')).toBeInTheDocument()
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
    const titles = screen.getAllByText('Создать аватара')
    expect(titles.length).toBeGreaterThanOrEqual(1)
  })

  it('shows step 2 section title after navigation', () => {
    render(<Creator />)
    fireEvent.click(screen.getByText('Далее'))
    const titles = screen.getAllByText('Контент для презентации')
    expect(titles.length).toBeGreaterThanOrEqual(1)
  })

  it('shows step 3 section title after navigation', () => {
    render(<Creator />)
    fireEvent.click(screen.getByText('Далее'))
    fireEvent.click(screen.getByText('Далее'))
    const titles = screen.getAllByText('Инструкции для аватара')
    expect(titles.length).toBeGreaterThanOrEqual(1)
  })
})
