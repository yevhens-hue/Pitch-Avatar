import { useState, useCallback } from 'react'

interface UseFileUploadOptions {
  onFile?: (file: File) => void
  accept?: string
}

export function useFileUpload(options?: UseFileUploadOptions) {
  const [file, setFile] = useState<File | null>(null)
  const [isHovering, setIsHovering] = useState(false)

  const handleFile = useCallback(
    (f: File) => {
      setFile(f)
      options?.onFile?.(f)
    },
    [options],
  )

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.[0]) {
        handleFile(e.target.files[0])
      }
    },
    [handleFile],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsHovering(false)
      if (e.dataTransfer.files?.[0]) {
        handleFile(e.dataTransfer.files[0])
      }
    },
    [handleFile],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsHovering(true)
  }, [])

  const reset = useCallback(() => setFile(null), [])

  return { file, isHovering, handleFileChange, handleDrop, handleDragOver, setIsHovering, reset }
}
