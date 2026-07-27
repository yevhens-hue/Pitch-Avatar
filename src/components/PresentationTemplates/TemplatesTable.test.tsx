import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import TemplatesTable from './TemplatesTable'
import { PresentationTemplate } from '@/data/presentation-templates'

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}))

jest.mock('@/app/actions/projects', () => ({
  getProjectById: jest.fn(() => Promise.resolve(null)),
}))

describe('TemplatesTable', () => {
  const mockTemplates: PresentationTemplate[] = [
    {
      id: 't1',
      name: 'Standard Presentation Template',
      description: 'Standard slides presentation',
      projectType: 'Presentation',
      productTypes: ['General'],
      tags: ['General'],
      slideCount: 5,
      accessType: 'system',
      createdAt: '2026-07-01',
      templateType: 'copy',
    },
    {
      id: 't2',
      name: 'AI Avatar Presentation Template',
      description: 'Presentation with avatar and voice',
      projectType: 'Presentation + Avatar',
      productTypes: ['HR'],
      tags: ['HR', 'Training'],
      slideCount: 8,
      accessType: 'system',
      createdAt: '2026-07-02',
      templateType: 'generate',
      avatarName: 'Sara (HR Coach)',
      avatarImage: 'https://example.com/avatar.jpg',
      voiceName: 'Jenny (US English)',
      voiceLanguage: 'English (US)',
    },
  ]

  it('renders project type labels (Presentation and Presentation + Avatar)', () => {
    render(<TemplatesTable templates={mockTemplates} />)

    expect(screen.getByText('Standard Presentation Template')).toBeInTheDocument()
    expect(screen.getByText('AI Avatar Presentation Template')).toBeInTheDocument()

    expect(screen.getAllByText('Presentation').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Presentation + Avatar').length).toBeGreaterThan(0)
  })


  it('displays avatar and voice details in preview modal for Presentation + Avatar template', () => {
    render(<TemplatesTable templates={mockTemplates} />)

    // Open Preview slides for template t2
    const previewButtons = screen.getAllByRole('button', { name: /Preview slides/i })
    fireEvent.click(previewButtons[1])

    // Verify avatar and voice details are shown in modal
    expect(screen.getByText(/Sara \(HR Coach\)/i)).toBeInTheDocument()
    expect(screen.getByText(/Jenny \(US English\)/i)).toBeInTheDocument()
  })

  it('invokes onUseTemplate callback when Use template button is clicked', () => {
    const mockOnUseTemplate = jest.fn()
    render(<TemplatesTable templates={mockTemplates} onUseTemplate={mockOnUseTemplate} />)

    const useButtons = screen.getAllByRole('button', { name: /Use template/i })
    fireEvent.click(useButtons[0])

    expect(mockOnUseTemplate).toHaveBeenCalledWith(mockTemplates[0])
  })
})
