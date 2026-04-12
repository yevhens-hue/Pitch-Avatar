import { renderHook, act } from '@testing-library/react'
import { useFileUpload } from './useFileUpload'

describe('useFileUpload Hook', () => {
  it('starts with no file', () => {
    const { result } = renderHook(() => useFileUpload())
    expect(result.current.file).toBeNull()
  })

  it('starts with isHovering false', () => {
    const { result } = renderHook(() => useFileUpload())
    expect(result.current.isHovering).toBe(false)
  })

  it('sets file on handleFileChange', () => {
    const { result } = renderHook(() => useFileUpload())
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })

    act(() => {
      result.current.handleFileChange({
        target: { files: [file] },
      } as unknown as React.ChangeEvent<HTMLInputElement>)
    })

    expect(result.current.file).toBe(file)
  })

  it('calls onFile callback when file is selected', () => {
    const onFile = jest.fn()
    const { result } = renderHook(() => useFileUpload({ onFile }))
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })

    act(() => {
      result.current.handleFileChange({
        target: { files: [file] },
      } as unknown as React.ChangeEvent<HTMLInputElement>)
    })

    expect(onFile).toHaveBeenCalledWith(file)
  })

  it('handles file drop', () => {
    const { result } = renderHook(() => useFileUpload())
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })

    act(() => {
      result.current.handleDrop({
        preventDefault: jest.fn(),
        dataTransfer: { files: [file] },
      } as unknown as React.DragEvent)
    })

    expect(result.current.file).toBe(file)
    expect(result.current.isHovering).toBe(false)
  })

  it('handles drag over', () => {
    const { result } = renderHook(() => useFileUpload())

    act(() => {
      result.current.handleDragOver({
        preventDefault: jest.fn(),
      } as unknown as React.DragEvent)
    })

    expect(result.current.isHovering).toBe(true)
  })

  it('can set isHovering manually', () => {
    const { result } = renderHook(() => useFileUpload())

    act(() => {
      result.current.setIsHovering(true)
    })

    expect(result.current.isHovering).toBe(true)

    act(() => {
      result.current.setIsHovering(false)
    })

    expect(result.current.isHovering).toBe(false)
  })

  it('resets file to null', () => {
    const { result } = renderHook(() => useFileUpload())
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })

    act(() => {
      result.current.handleFileChange({
        target: { files: [file] },
      } as unknown as React.ChangeEvent<HTMLInputElement>)
    })

    expect(result.current.file).toBe(file)

    act(() => {
      result.current.reset()
    })

    expect(result.current.file).toBeNull()
  })

  it('does not set file when no files in change event', () => {
    const { result } = renderHook(() => useFileUpload())

    act(() => {
      result.current.handleFileChange({
        target: { files: null },
      } as unknown as React.ChangeEvent<HTMLInputElement>)
    })

    expect(result.current.file).toBeNull()
  })

  it('does not set file when no files in drop event', () => {
    const { result } = renderHook(() => useFileUpload())

    act(() => {
      result.current.handleDrop({
        preventDefault: jest.fn(),
        dataTransfer: { files: [] },
      } as unknown as React.DragEvent)
    })

    expect(result.current.file).toBeNull()
  })
})
