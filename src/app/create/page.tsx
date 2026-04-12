'use client'

import React, { useState } from 'react'
import UploadStep from '@/components/Studio/UploadStep/UploadStep'
import StudioEditor from '@/components/Studio/Editor/Editor'

export default function CreatePresentationPage() {
  const [step, setStep] = useState(1)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileUpload = (file: File) => {
    setSelectedFile(file)
    setIsProcessing(true)
    
    // Simulate processing
    setTimeout(() => {
        setIsProcessing(false)
        setStep(2)
    }, 2500)
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#fff', marginLeft: '-20px' }}>
      {step === 1 && !isProcessing && <UploadStep onNext={handleFileUpload} />}
      
      {isProcessing && (
        <div style={{ 
          height: '80vh', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          textAlign: 'center' 
        }}>
          <div style={{ 
            fontSize: '14px', 
            fontWeight: 600, 
            color: '#0070f3', 
            marginBottom: '16px',
            background: '#eff6ff',
            padding: '4px 12px',
            borderRadius: '20px'
          }}>
            ШАГ 2 ИЗ 3
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>
            Обработка вашей презентации...
          </h2>
          <p style={{ color: '#6b7280', maxWidth: '400px', marginBottom: '40px' }}>
             Мы готовим слайды {selectedFile?.name} для добавления ИИ-аватаров. Это займет всего пару секунд.
          </p>
          <div style={{ width: '300px', height: '6px', backgroundColor: '#f0f0f0', borderRadius: '3px', overflow: 'hidden' }}>
            <div className="progress-bar"></div>
          </div>
        </div>
      )}

      {step === 2 && <StudioEditor />}

      <style jsx>{`
        .progress-bar {
          width: 0%;
          height: 100%;
          background-color: #0070f3;
          animation: progress 2.5s ease-in-out forwards;
        }
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </main>
  )
}
