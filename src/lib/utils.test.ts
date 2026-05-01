import * as utils from '@/lib/utils';

describe('utils', () => {
  describe('cn', () => {
    it('merges class names', () => {
      const result = utils.cn('class1', 'class2');
      expect(result).toBe('class1 class2');
    });

    it('filters out falsy values', () => {
      const result = utils.cn('class1', false, null, undefined, 'class2');
      expect(result).toBe('class1 class2');
    });

    it('handles conditional classes object', () => {
      const result = utils.cn({ 'class-a': true, 'class-b': false, 'class-c': true });
      expect(result).toBe('class-a class-c');
    });

    it('handles mixed strings and objects', () => {
      const result = utils.cn('base', { 'variant-primary': true, 'variant-secondary': false });
      expect(result).toBe('base variant-primary');
    });
  });

  describe('formatMinutes', () => {
    it('formats minutes to 2 decimal places', () => {
      const result = utils.formatMinutes(1.23456);
      expect(result).toBe('1.23');
    });

    it('handles integer minutes', () => {
      const result = utils.formatMinutes(5);
      expect(result).toBe('5.00');
    });
  });

  describe('formatDate', () => {
    it('formats date string to Russian locale', () => {
      const result = utils.formatDate('2024-01-15');
      expect(result).toBe('15 января 2024');
    });

    it('handles Date object', () => {
      const date = new Date('2024-06-20');
      const result = utils.formatDate(date);
      expect(result).toBe('20 июня 2024');
    });
  });

  describe('getFileExtension', () => {
    it('extracts file extension', () => {
      expect(utils.getFileExtension('file.pdf')).toBe('pdf');
      expect(utils.getFileExtension('presentation.PPTX')).toBe('pptx');
    });

    it('returns the whole string when no dot present', () => {
      expect(utils.getFileExtension('noextension')).toBe('noextension');
    });

    it('handles multiple dots', () => {
      expect(utils.getFileExtension('my.file.name.pdf')).toBe('pdf');
    });
  });
});