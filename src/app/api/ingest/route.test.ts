import { POST } from './route';
import pdf from 'pdf-parse';

jest.mock('pdf-parse', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue({ text: 'Sample PDF content' }),
}));

describe('POST /api/ingest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('accepts webhook payload and processes PDF', async () => {
    const mockFile = {
      name: 'test.pdf',
      arrayBuffer: () => Promise.resolve(Buffer.from('fake pdf content')),
    };

    const mockFormData = {
      get: (name: string) => (name === 'file' ? mockFile : null),
    };

    const mockRequest = {
      headers: {
        get: () => 'Bearer valid-token',
      },
      formData: () => Promise.resolve(mockFormData as any),
    };

    const response = await POST(mockRequest as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toContain('Successfully processed test.pdf');
    expect(data.charCount).toBe(18); // 'Sample PDF content'.length
    expect(data.preview).toContain('Sample PDF content');
  });
});