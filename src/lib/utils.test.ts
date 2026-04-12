import { cn, formatMinutes, formatDate, getFileExtension } from './utils'

describe('utils', () => {
  describe('cn', () => {
    it('joins class names', () => {
      expect(cn('a', 'b', 'c')).toBe('a b c')
    })

    it('filters out falsy values', () => {
      expect(cn('a', false, 'b', null, 'c', undefined)).toBe('a b c')
    })

    it('returns empty string for no arguments', () => {
      expect(cn()).toBe('')
    })

    it('handles single class', () => {
      expect(cn('single')).toBe('single')
    })

    it('handles all falsy', () => {
      expect(cn(false, null, undefined)).toBe('')
    })
  })

  describe('formatMinutes', () => {
    it('formats minutes to 2 decimal places', () => {
      expect(formatMinutes(50)).toBe('50.00')
    })

    it('rounds correctly', () => {
      expect(formatMinutes(45.567)).toBe('45.57')
    })

    it('handles zero', () => {
      expect(formatMinutes(0)).toBe('0.00')
    })

    it('handles fractional input', () => {
      expect(formatMinutes(3.333)).toBe('3.33')
    })
  })

  describe('formatDate', () => {
    it('formats date string to Russian locale', () => {
      const result = formatDate('2026-03-15')
      expect(result).toContain('2026')
      expect(result).toContain('март')
    })

    it('handles different dates', () => {
      const result = formatDate('2025-12-25')
      expect(result).toContain('2025')
    })
  })

  describe('getFileExtension', () => {
    it('extracts pdf extension', () => {
      expect(getFileExtension('document.pdf')).toBe('pdf')
    })

    it('extracts pptx extension', () => {
      expect(getFileExtension('presentation.pptx')).toBe('pptx')
    })

    it('handles uppercase extension', () => {
      expect(getFileExtension('FILE.PDF')).toBe('pdf')
    })

    it('handles multiple dots', () => {
      expect(getFileExtension('my.file.name.docx')).toBe('docx')
    })

    it('returns the filename itself for no extension', () => {
      expect(getFileExtension('noextension')).toBe('noextension')
    })

    it('handles dot at end', () => {
      expect(getFileExtension('file.')).toBe('')
    })
  })
})
