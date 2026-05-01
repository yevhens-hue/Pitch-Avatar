import '@testing-library/jest-dom'

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000'

// Polyfill Web API Request/Response for next/server
class MockHeaders {
  private map: Record<string, string> = {};
  constructor(init?: HeadersInit) {
    if (init) {
      if (init instanceof Headers) {
        for (const [key, value] of init.entries()) {
          this.map[key] = value;
        }
      } else if (Array.isArray(init)) {
        for (const [key, value] of init) {
          this.map[key] = value;
        }
      } else {
        Object.assign(this.map, init);
      }
    }
  }
  get(name: string) { return this.map[name] || null; }
  has(name: string) { return this.map.hasOwnProperty(name); }
  set(name: string, value: string) { this.map[name] = value; }
  append(name: string, value: string) { (this.map[name] ? this.map[name] += `, ${value}` : this.map[name] = value); }
  delete(name: string) { delete this.map[name]; }
  forEach(_callback: (value: string, key: string, parent: Headers) => void) { Object.keys(this.map).forEach(key => _callback(this.map[key], key, this as any)); }
  entries() { return Object.entries(this.map)[Symbol.iterator](); }
  keys() { return Object.keys(this.map)[Symbol.iterator](); }
  values() { return Object.values(this.map)[Symbol.iterator](); }
  [Symbol.iterator]() { return this.entries(); }
}

global.Headers = Headers as any;

class MockRequest {
  headers: Headers;
  constructor(input: RequestInfo | string, init?: RequestInit) {
    this.headers = init?.headers ? new MockHeaders(init.headers) : new MockHeaders();
  }
  json() { return Promise.resolve({}); }
  text() { return Promise.resolve(''); }
  // ... minimal
}

class MockResponse {
  status: number = 200;
  headers: Headers;
  constructor(body?: BodyInit, init?: ResponseInit) {
    this.status = init?.status || 200;
    this.headers = init?.headers ? new MockHeaders(init.headers) : new MockHeaders();
  }
  json() { return Promise.resolve({}); }
  static json(data: any, init?: ResponseInit) {
    return new MockResponse(JSON.stringify(data), { ...init, status: init?.status || 200, headers: { 'Content-Type': 'application/json', ...init?.headers } });
  }
}

global.Request = MockRequest as any;
global.Response = MockResponse as any;

const mockSupabaseClient = {
  auth: {
    getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
    onAuthStateChange: jest.fn().mockReturnValue({
      subscription: { unsubscribe: jest.fn() }
    }),
    signInWithPassword: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
    signUp: jest.fn().mockResolvedValue({ data: { user: { id: 'test' } }, error: null }),
    signOut: jest.fn().mockResolvedValue({ error: null }),
    getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'test', email: 'test@test.com' } }, error: null }),
  },
  storage: {
    from: jest.fn().mockReturnValue({
      upload: jest.fn().mockResolvedValue({ data: { path: 'test/path' }, error: null }),
      getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: 'https://test.com/file.pdf' } }),
    }),
  },
  from: jest.fn().mockReturnValue({
    insert: jest.fn().mockResolvedValue({ error: null }),
    select: jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
        then: jest.fn().mockResolvedValue({ data: [], error: null }),
      }),
      then: jest.fn().mockResolvedValue({ data: [], error: null }),
    }),
    update: jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({ error: null }),
    }),
    delete: jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({ error: null }),
    }),
  }),
}

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
  useSelectedLayoutSegments: () => [],
  useSelectedLayoutSegment: () => null,
}))

// Mock next/server to provide NextResponse with instance checks
class NextResponseMock {
  status: number;
  headers: any;
  private _body: any;

  constructor(body: any, init?: any) {
    this._body = body;
    this.status = init?.status ?? 200;
    this.headers = new MockHeaders(init?.headers);
  }

  static json(data: any, init?: any) {
    return new NextResponseMock(data, init);
  }

  async json() {
    if (typeof this._body === 'string') {
      return JSON.parse(this._body);
    }
    return this._body;
  }
}

jest.mock('next/server', () => ({
  NextResponse: NextResponseMock,
  requireAuth: jest.fn().mockResolvedValue(null),
  getAuthenticatedUser: jest.fn().mockReturnValue(null),
}));

jest.mock('@supabase/supabase-js', () => ({
  createClient: () => mockSupabaseClient,
}))

jest.mock('lucide-react', () => {
  const MockIcon = (props: any) => null;
  return new Proxy({}, {
    get: () => MockIcon,
  });
});