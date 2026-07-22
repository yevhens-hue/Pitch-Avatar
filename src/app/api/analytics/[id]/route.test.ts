import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Next.js and Supabase
vi.mock('next/server', () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      body,
    }),
  },
}))

const mockSingle = vi.fn()
const mockIn = vi.fn()
const mockEq = vi.fn()
const mockSelect = vi.fn()
const mockFrom = vi.fn()

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: mockFrom,
  }),
}))

// Must import AFTER mocks
const { GET } = await import('./route')

function makeParams(id: string): Promise<{ id: string }> {
  return Promise.resolve({ id })
}

describe('GET /api/analytics/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key'

    // Default chain: projects.select.eq.single → returns project
    const projectChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { id: 'proj-1', title: 'Test Project', created_at: '2026-07-01T10:00:00Z', type: 'presentation' },
        error: null,
      }),
    }

    const enrollmentLinksChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: [], error: null }),
    }

    const enrollmentsChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: [], error: null }),
    }

    const listenersChain = {
      select: vi.fn().mockReturnThis(),
      in: vi.fn().mockResolvedValue({ data: [], error: null }),
    }

    mockFrom.mockImplementation((table: string) => {
      if (table === 'projects') return projectChain
      if (table === 'enrollment_links') return enrollmentLinksChain
      if (table === 'enrollments') return enrollmentsChain
      if (table === 'listeners') return listenersChain
      return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockResolvedValue({ data: [], error: null }) }
    })
  })

  it('should await params (Promise) and return project data', async () => {
    const request = new Request('http://localhost/api/analytics/proj-1')
    const result = await GET(request, { params: makeParams('proj-1') })

    expect(result.status).toBe(200)
    expect((result.body as any).id).toBe('proj-1')
    expect((result.body as any).title).toBe('Test Project')
  })

  it('should return 404 when project not found', async () => {
    mockFrom.mockImplementationOnce(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
    }))

    const request = new Request('http://localhost/api/analytics/nonexistent')
    const result = await GET(request, { params: makeParams('nonexistent') })

    expect(result.status).toBe(404)
    expect((result.body as any).error).toBe('Project not found')
  })

  it('should calculate completedBy percentage correctly', async () => {
    const enrollmentsChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({
        data: [
          { id: 'e1', listener_id: null, status: 'Completed', time_spent: 120, progress: 100, score: 100, created_at: '2026-07-01T10:00:00Z', title: 'E1' },
          { id: 'e2', listener_id: null, status: 'Pending',   time_spent: 60,  progress: 50,  score: 0,   created_at: '2026-07-01T11:00:00Z', title: 'E2' },
        ],
        error: null,
      }),
    }

    mockFrom.mockImplementation((table: string) => {
      if (table === 'projects') return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 'proj-1', title: 'Test', created_at: '2026-07-01T00:00:00Z', type: 'presentation' },
          error: null,
        }),
      }
      if (table === 'enrollments') return enrollmentsChain
      return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockResolvedValue({ data: [], error: null }) }
    })

    const request = new Request('http://localhost/api/analytics/proj-1')
    const result = await GET(request, { params: makeParams('proj-1') })

    expect(result.status).toBe(200)
    // 1 of 2 completed = 50%
    expect((result.body as any).performance.completedBy).toBe(50)
  })

  it('should return slideDropoff array of length 11', async () => {
    const request = new Request('http://localhost/api/analytics/proj-1')
    const result = await GET(request, { params: makeParams('proj-1') })

    expect(result.status).toBe(200)
    expect((result.body as any).slideDropoff).toHaveLength(11)
  })
})
