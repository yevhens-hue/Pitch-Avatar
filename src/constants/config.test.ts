import {
  APP_NAME,
  SIDEBAR_WIDTH,
  SUPPORTED_FILE_TYPES,
  ACCEPTED_UPLOAD_EXTENSIONS,
  GOALS,
} from '@/constants/config';

describe('config constants', () => {
  it('exports APP_NAME', () => {
    expect(APP_NAME).toBe('Pitch Avatar');
  });

  it('exports SIDEBAR_WIDTH', () => {
    expect(SIDEBAR_WIDTH).toBe(280);
  });

  it('exports SUPPORTED_FILE_TYPES', () => {
    expect(SUPPORTED_FILE_TYPES).toBeDefined();
    expect(SUPPORTED_FILE_TYPES.pdf).toBe('application/pdf');
    expect(SUPPORTED_FILE_TYPES.pptx).toBe('application/vnd.openxmlformats-officedocument.presentationml.presentation');
  });

  it('exports ACCEPTED_UPLOAD_EXTENSIONS', () => {
    expect(ACCEPTED_UPLOAD_EXTENSIONS).toBe('.pdf,.pptx');
  });

  it('exports GOALS array', () => {
    expect(Array.isArray(GOALS)).toBe(true);
    expect(GOALS.length).toBeGreaterThan(0);
  });
});