import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import Help from './page'

describe('Help Page', () => {
  it('renders page title', () => {
    render(<Help />)
    expect(screen.getByText('Помощь и поддержка')).toBeInTheDocument()
  })

  it('renders contact agent button', () => {
    render(<Help />)
    expect(screen.getByText('Связаться с агентом')).toBeInTheDocument()
  })

  it('renders FAQ section', () => {
    render(<Help />)
    expect(screen.getByText('Часто задаваемые вопросы')).toBeInTheDocument()
  })

  it('renders all FAQ items', () => {
    render(<Help />)
    expect(screen.getByText('Как загрузить видео более 500 МБ?')).toBeInTheDocument()
    expect(screen.getByText('Сколько длится генерация ИИ-Скрипта?')).toBeInTheDocument()
    expect(screen.getByText('Могу ли я встроить презентацию на свой сайт?')).toBeInTheDocument()
  })

  it('renders FAQ answers', () => {
    render(<Help />)
    expect(screen.getByText(/Свяжитесь с нашей поддержкой/)).toBeInTheDocument()
    expect(screen.getByText(/Обычно формирование скрипта/)).toBeInTheDocument()
    expect(screen.getByText(/Да, настройте ссылку/)).toBeInTheDocument()
  })

  it('renders documentation section', () => {
    render(<Help />)
    expect(screen.getByText('Документация и Руководства')).toBeInTheDocument()
  })

  it('renders documentation link', () => {
    render(<Help />)
    expect(screen.getByText('Читать документацию →')).toBeInTheDocument()
  })
})
