import { ROUTES } from '@/constants/routes';

describe('routes constant', () => {
  it('exports ROUTES object', () => {
    expect(ROUTES).toBeDefined();
    expect(typeof ROUTES).toBe('object');
  });

  it('has all required route properties', () => {
    const requiredRoutes = [
      'home', 'projects', 'templates', 'knowledge',
      'roles', 'voices', 'listeners', 'assignments',
      'marketplace', 'analytics', 'review', 'profile',
      'create', 'editor', 'onboarding'
    ];
    requiredRoutes.forEach(route => {
      expect(ROUTES).toHaveProperty(route);
    });
  });

  it('route values start with forward slash', () => {
    Object.values(ROUTES).forEach(value => {
      expect(value).toMatch(/^\//);
    });
  });

  it('exports NAV_GROUPS', () => {
    const { NAV_GROUPS } = require('@/constants/routes');
    expect(Array.isArray(NAV_GROUPS)).toBe(true);
    expect(NAV_GROUPS.length).toBeGreaterThan(0);
  });
});