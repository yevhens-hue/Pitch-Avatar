'use client'

import { useEffect, useRef, useState } from 'react'

// Extended window type for SpeechRecognition
interface IWindow extends Window {
  SpeechRecognition?: any
  webkitSpeechRecognition?: any
}

export function useSaraVoiceInterruption() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const win = window as IWindow
      const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = 'en-US' // Can be configured later based on user settings

        recognition.onstart = () => {
          setIsListening(true)
          setError(null)
        }

        recognition.onresult = (event: any) => {
          let currentTranscript = ''
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            currentTranscript += event.results[i][0].transcript
          }
          setTranscript(currentTranscript)
        }

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error', event.error)
          setError(event.error)
          setIsListening(false)
        }

        recognition.onend = () => {
          setIsListening(false)
        }

        recognitionRef.current = recognition
      } else {
        setError('Speech recognition not supported in this browser.')
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript('')
      try {
        recognitionRef.current.start()
      } catch (e) {
        console.error('Could not start speech recognition', e)
      }
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop()
      } catch (e) {
        console.error('Could not stop speech recognition', e)
      }
    }
  }

  // Mute SpeechSynthesis if it's currently speaking when user starts talking
  useEffect(() => {
    if (isListening && transcript.trim().length > 0) {
      if (typeof window !== 'undefined' && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel()
      }
    }
  }, [transcript, isListening])

  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    setTranscript
  }
}
