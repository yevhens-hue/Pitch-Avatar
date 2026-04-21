import {
  MOCK_PROJECTS,
  MOCK_PRESENTATIONS,
  MOCK_VIDEOS,
  MOCK_LINKS,
  MOCK_VOICES,
  MOCK_ROLES,
  MOCK_KNOWLEDGE,
  MOCK_CHAT_AVATARS,
  MOCK_FAQ,
  MOCK_ANALYTICS,
} from './mock-data'

describe('mock-data', () => {
  describe('MOCK_PROJECTS', () => {
    it('has correct length', () => {
      expect(MOCK_PROJECTS.length).toBe(3)
    })

    it('has required fields', () => {
      MOCK_PROJECTS.forEach((p) => {
        expect(p).toHaveProperty('id')
        expect(p).toHaveProperty('title')
        expect(p).toHaveProperty('type')
        expect(p).toHaveProperty('status')
        expect(p).toHaveProperty('createdAt')
        expect(p).toHaveProperty('updatedAt')
      })
    })

    it('has valid status values', () => {
      const validStatuses = ['draft', 'processing', 'ready', 'published']
      MOCK_PROJECTS.forEach((p) => {
        expect(validStatuses).toContain(p.status)
      })
    })

    it('has valid type values', () => {
      const validTypes = ['chat-avatar', 'slides', 'video', 'from-scratch']
      MOCK_PROJECTS.forEach((p) => {
        expect(validTypes).toContain(p.type)
      })
    })
  })

  describe('MOCK_PRESENTATIONS', () => {
    it('has correct length', () => {
      expect(MOCK_PRESENTATIONS.length).toBe(3)
    })

    it('has required fields', () => {
      MOCK_PRESENTATIONS.forEach((p) => {
        expect(p).toHaveProperty('id')
        expect(p).toHaveProperty('name')
        expect(p).toHaveProperty('updated')
        expect(p).toHaveProperty('slides')
        expect(p).toHaveProperty('views')
      })
    })

    it('has positive slide counts', () => {
      MOCK_PRESENTATIONS.forEach((p) => {
        expect(p.slides).toBeGreaterThan(0)
      })
    })
  })

  describe('MOCK_VIDEOS', () => {
    it('has correct length', () => {
      expect(MOCK_VIDEOS.length).toBe(2)
    })

    it('has required fields', () => {
      MOCK_VIDEOS.forEach((v) => {
        expect(v).toHaveProperty('id')
        expect(v).toHaveProperty('name')
        expect(v).toHaveProperty('duration')
        expect(v).toHaveProperty('translatedTo')
      })
    })
  })

  describe('MOCK_LINKS', () => {
    it('has correct length', () => {
      expect(MOCK_LINKS.length).toBe(2)
    })

    it('has required fields', () => {
      MOCK_LINKS.forEach((l) => {
        expect(l).toHaveProperty('id')
        expect(l).toHaveProperty('presentation')
        expect(l).toHaveProperty('url')
        expect(l).toHaveProperty('clicks')
        expect(l).toHaveProperty('leads')
        expect(l).toHaveProperty('created')
      })
    })

    it('has non-negative click counts', () => {
      MOCK_LINKS.forEach((l) => {
        expect(l.clicks).toBeGreaterThanOrEqual(0)
      })
    })
  })

  describe('MOCK_VOICES', () => {
    it('has correct length', () => {
      expect(MOCK_VOICES.length).toBe(3)
    })

    it('has required fields', () => {
      MOCK_VOICES.forEach((v) => {
        expect(v).toHaveProperty('id')
        expect(v).toHaveProperty('name')
        expect(v).toHaveProperty('type')
        expect(v).toHaveProperty('language')
        expect(v).toHaveProperty('date')
      })
    })

    it('has valid voice types', () => {
      const validTypes = ['Cloned Voice', 'AI Library']
      MOCK_VOICES.forEach((v) => {
        expect(validTypes).toContain(v.type)
      })
    })
  })

  describe('MOCK_ROLES', () => {
    it('has correct length', () => {
      expect(MOCK_ROLES.length).toBe(3)
    })

    it('has required fields', () => {
      MOCK_ROLES.forEach((r) => {
        expect(r).toHaveProperty('id')
        expect(r).toHaveProperty('name')
        expect(r).toHaveProperty('description')
        expect(r).toHaveProperty('date')
      })
    })
  })

  describe('MOCK_KNOWLEDGE', () => {
    it('has correct length', () => {
      expect(MOCK_KNOWLEDGE.length).toBe(2)
    })

    it('has required fields', () => {
      MOCK_KNOWLEDGE.forEach((k) => {
        expect(k).toHaveProperty('id')
        expect(k).toHaveProperty('name')
        expect(k).toHaveProperty('type')
        expect(k).toHaveProperty('size')
        expect(k).toHaveProperty('date')
      })
    })
  })

  describe('MOCK_CHAT_AVATARS', () => {
    it('has correct length', () => {
      expect(MOCK_CHAT_AVATARS.length).toBe(2)
    })

    it('has required fields', () => {
      MOCK_CHAT_AVATARS.forEach((a) => {
        expect(a).toHaveProperty('id')
        expect(a).toHaveProperty('name')
        expect(a).toHaveProperty('language')
        expect(a).toHaveProperty('status')
      })
    })

    it('has valid statuses', () => {
      const validStatuses = ['Active', 'Draft']
      MOCK_CHAT_AVATARS.forEach((a) => {
        expect(validStatuses).toContain(a.status)
      })
    })
  })

  describe('MOCK_FAQ', () => {
    it('has correct length', () => {
      expect(MOCK_FAQ.length).toBe(3)
    })

    it('has required fields', () => {
      MOCK_FAQ.forEach((f) => {
        expect(f).toHaveProperty('query')
        expect(f).toHaveProperty('answer')
      })
    })

    it('has non-empty queries and answers', () => {
      MOCK_FAQ.forEach((f) => {
        expect(f.query.length).toBeGreaterThan(0)
        expect(f.answer.length).toBeGreaterThan(0)
      })
    })
  })

  describe('MOCK_ANALYTICS', () => {
    it('has required fields', () => {
      expect(MOCK_ANALYTICS).toHaveProperty('totalViews')
      expect(MOCK_ANALYTICS).toHaveProperty('leads')
      expect(MOCK_ANALYTICS).toHaveProperty('avgViewTime')
    })

    it('has numeric values', () => {
      expect(typeof MOCK_ANALYTICS.totalViews).toBe('number')
      expect(typeof MOCK_ANALYTICS.leads).toBe('number')
      expect(typeof MOCK_ANALYTICS.avgViewTime).toBe('string')
    })

    it('has positive values', () => {
      expect(MOCK_ANALYTICS.totalViews).toBeGreaterThan(0)
      expect(MOCK_ANALYTICS.leads).toBeGreaterThan(0)
    })
  })
})
