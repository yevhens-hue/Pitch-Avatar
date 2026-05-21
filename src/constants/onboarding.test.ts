import { ONBOARDING_CHECKLISTS, ONBOARDING_STEPS } from '@/constants/onboarding';

describe('ONBOARDING_STEPS', () => {
  it('has 5 video onboarding steps', () => {
    expect(ONBOARDING_STEPS).toHaveLength(5);
  });

  it('each step has required properties', () => {
    ONBOARDING_STEPS.forEach(step => {
      expect(step).toHaveProperty('id');
      expect(step).toHaveProperty('title');
      expect(step).toHaveProperty('desc');
      expect(step).toHaveProperty('path');
      expect(step).toHaveProperty('target');
      expect(step).toHaveProperty('position');
      expect(step).toHaveProperty('video');
      expect(step).toHaveProperty('trigger');
    });
  });

  it('has unique ids', () => {
    const ids = ONBOARDING_STEPS.map(s => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('positions are valid', () => {
    const validPositions = ['bottom', 'top', 'left', 'right'];
    ONBOARDING_STEPS.forEach(step => {
      expect(validPositions).toContain(step.position);
    });
  });

  it('each step has a valid trigger function', () => {
    ONBOARDING_STEPS.forEach(step => {
      expect(typeof step.trigger).toBe('function');
    });
  });
});

describe('ONBOARDING_CHECKLISTS', () => {
  it('has all checklist categories', () => {
    const categories = Object.keys(ONBOARDING_CHECKLISTS);
    expect(categories).toContain('video');
    expect(categories).toContain('chat');
    expect(categories).toContain('slides');
    expect(categories).toContain('localization');
    expect(categories).toContain('fallback');
  });

  it('each checklist has required properties on all steps', () => {
    Object.entries(ONBOARDING_CHECKLISTS).forEach(([, steps]) => {
      steps.forEach(step => {
        expect(step).toHaveProperty('id');
        expect(step).toHaveProperty('title');
        expect(step).toHaveProperty('desc');
        expect(step).toHaveProperty('path');
        expect(step).toHaveProperty('target');
        expect(step).toHaveProperty('position');
        expect(step).toHaveProperty('trigger');
      });
    });
  });

  it('each step has valid trigger function across all checklists', () => {
    Object.entries(ONBOARDING_CHECKLISTS).forEach(([, steps]) => {
      steps.forEach(step => {
        expect(typeof step.trigger).toBe('function');
      });
    });
  });
});