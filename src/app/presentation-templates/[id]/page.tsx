'use client'

import React from 'react'
import { useParams } from 'next/navigation'
import TemplateEditor from '@/components/PresentationTemplates/Editor/TemplateEditor'

export default function PresentationTemplateEditorPage() {
  const params = useParams()
  const id = params?.id as string

  return (
    <div style={{ height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <TemplateEditor templateId={id} />
    </div>
  )
}
