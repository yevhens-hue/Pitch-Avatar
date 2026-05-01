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
} from './mock-data';

describe('mock-data', () => {
  describe('MOCK_PROJECTS', () => {
    it('exports array of projects', () => {
      expect(Array.isArray(MOCK_PROJECTS)).toBe(true);
      expect(MOCK_PROJECTS.length).toBeGreaterThan(0);
    });

    it('each project has required fields', () => {
      MOCK_PROJECTS.forEach(project => {
        expect(project).toHaveProperty('id');
        expect(project).toHaveProperty('title');
        expect(project).toHaveProperty('type');
        expect(project).toHaveProperty('status');
        expect(project).toHaveProperty('createdAt');
        expect(project).toHaveProperty('updatedAt');
      });
    });
  });

  describe('MOCK_PRESENTATIONS', () => {
    it('exports array', () => {
      expect(Array.isArray(MOCK_PRESENTATIONS)).toBe(true);
    });

    it('has required fields', () => {
      MOCK_PRESENTATIONS.forEach(item => {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('name');
        expect(item).toHaveProperty('slides');
        expect(item).toHaveProperty('views');
      });
    });
  });

  describe('MOCK_VIDEOS', () => {
    it('exports array', () => {
      expect(Array.isArray(MOCK_VIDEOS)).toBe(true);
    });
  });

  describe('MOCK_LINKS', () => {
    it('exports array', () => {
      expect(Array.isArray(MOCK_LINKS)).toBe(true);
    });
  });

  describe('MOCK_VOICES', () => {
    it('exports array', () => {
      expect(Array.isArray(MOCK_VOICES)).toBe(true);
    });
  });

  describe('MOCK_ROLES', () => {
    it('exports array', () => {
      expect(Array.isArray(MOCK_ROLES)).toBe(true);
    });
  });

  describe('MOCK_KNOWLEDGE', () => {
    it('exports array', () => {
      expect(Array.isArray(MOCK_KNOWLEDGE)).toBe(true);
    });
  });

  describe('MOCK_CHAT_AVATARS', () => {
    it('exports array', () => {
      expect(Array.isArray(MOCK_CHAT_AVATARS)).toBe(true);
    });
  });

  describe('MOCK_FAQ', () => {
    it('exports array', () => {
      expect(Array.isArray(MOCK_FAQ)).toBe(true);
    });

    it('each faq has query and answer', () => {
      MOCK_FAQ.forEach(item => {
        expect(item).toHaveProperty('query');
        expect(item).toHaveProperty('answer');
      });
    });
  });

  describe('MOCK_ANALYTICS', () => {
    it('has totalViews', () => {
      expect(MOCK_ANALYTICS).toHaveProperty('totalViews');
    });

    it('has leads', () => {
      expect(MOCK_ANALYTICS).toHaveProperty('leads');
    });

    it('has avgViewTime', () => {
      expect(MOCK_ANALYTICS).toHaveProperty('avgViewTime');
    });
  });
});