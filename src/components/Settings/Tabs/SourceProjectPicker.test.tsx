import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import SourceProjectPicker from './SourceProjectPicker'
import { Project } from '@/types'

describe('SourceProjectPicker Component', () => {
  const mockProjects: Project[] = [
    {
      id: 'p1',
      title: "Let's talk",
      type: 'presentation',
      status: 'ready',
      createdAt: '2026-07-27',
      updatedAt: '2026-07-27',
    },
    {
      id: 'p2',
      title: 'Scrum и Kanban выжимаем максимум',
      type: 'chat-avatar',
      status: 'ready',
      createdAt: '2026-07-24',
      updatedAt: '2026-07-24',
    },
  ]

  const mockSelect = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders source project header and columns including Project Type column', () => {
    render(
      <SourceProjectPicker
        projects={mockProjects}
        selectedProjectId="p1"
        onSelectProject={mockSelect}
      />
    )

    expect(screen.getByText('Исходный проект')).toBeInTheDocument()
    expect(screen.getByText('Настройте шаблон и выберите проект, который будет дублироваться.')).toBeInTheDocument()

    // Header columns
    expect(screen.getByText('Проект')).toBeInTheDocument()
    expect(screen.getByText('Тип проекта')).toBeInTheDocument()
    expect(screen.getAllByText('Язык').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Статус').length).toBeGreaterThan(0)
    expect(screen.getByText('Дата создания')).toBeInTheDocument()
  })

  it('renders project type badges (Presentation and Presentation + Avatar)', () => {
    render(
      <SourceProjectPicker
        projects={mockProjects}
        selectedProjectId="p1"
        onSelectProject={mockSelect}
      />
    )

    expect(screen.getByText("Let's talk")).toBeInTheDocument()
    expect(screen.getByText('Scrum и Kanban выжимаем максимум')).toBeInTheDocument()

    expect(screen.getAllByText('Presentation').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Presentation + Avatar').length).toBeGreaterThan(0)
  })


  it('filters table by Project Type dropdown', () => {
    render(
      <SourceProjectPicker
        projects={mockProjects}
        selectedProjectId="p1"
        onSelectProject={mockSelect}
      />
    )

    // Select "Presentation + Avatar" in type filter dropdown
    const typeSelect = screen.getByRole('combobox', { name: 'Фильтр по типу проекта' })
    fireEvent.change(typeSelect, { target: { value: 'Presentation + Avatar' } })

    expect(screen.queryByText("Let's talk")).not.toBeInTheDocument()
    expect(screen.getByText('Scrum и Kanban выжимаем максимум')).toBeInTheDocument()
  })

  it('invokes onSelectProject when a row is clicked', () => {
    render(
      <SourceProjectPicker
        projects={mockProjects}
        selectedProjectId="p1"
        onSelectProject={mockSelect}
      />
    )

    const row = screen.getByText('Scrum и Kanban выжимаем максимум')
    fireEvent.click(row)

    expect(mockSelect).toHaveBeenCalledWith('p2')
  })
})
