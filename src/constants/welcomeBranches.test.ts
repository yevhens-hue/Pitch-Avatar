import { WELCOME_BRANCHES, FALLBACK_BRANCH, getBranchByMainGoal, trackGuideEvent } from '@/constants/welcomeBranches';

describe('welcomeBranches', () => {
  describe('WELCOME_BRANCHES', () => {
    it('exports array of branches', () => {
      expect(Array.isArray(WELCOME_BRANCHES)).toBe(true);
      expect(WELCOME_BRANCHES.length).toBeGreaterThan(0);
    });

    it('each branch has required properties', () => {
      WELCOME_BRANCHES.forEach(branch => {
        expect(branch).toHaveProperty('id');
        expect(branch).toHaveProperty('mainGoals');
        expect(branch).toHaveProperty('headline');
        expect(branch).toHaveProperty('steps');
        expect(branch).toHaveProperty('ctaLabel');
        expect(branch).toHaveProperty('activationRoute');
      });
    });

    it('each branch has at least one mainGoal', () => {
      WELCOME_BRANCHES.forEach(branch => {
        expect(Array.isArray(branch.mainGoals)).toBe(true);
        expect(branch.mainGoals.length).toBeGreaterThan(0);
      });
    });
  });

  describe('FALLBACK_BRANCH', () => {
    it('has id exploring', () => {
      expect(FALLBACK_BRANCH.id).toBe('exploring');
    });

    it('includes i_am_just_playing_around and other in mainGoals', () => {
      expect(FALLBACK_BRANCH.mainGoals).toContain('i_am_just_playing_around');
      expect(FALLBACK_BRANCH.mainGoals).toContain('other');
      expect(FALLBACK_BRANCH.mainGoals).toContain(null);
    });
  });

  describe('getBranchByMainGoal', () => {
    it('returns correct branch for known goal', () => {
      const branch = getBranchByMainGoal('create_ai_avatar_for_corporate_learning_and_communications');
      expect(branch).toBeDefined();
      expect(branch.id).toBe('create_ai_avatar_for_corporate_learning_and_communications');
    });

    it('returns fallback for null goal', () => {
      const branch = getBranchByMainGoal(null);
      expect(branch).toBe(FALLBACK_BRANCH);
    });

    it('returns fallback for undefined goal', () => {
      const branch = getBranchByMainGoal(undefined);
      expect(branch).toBe(FALLBACK_BRANCH);
    });

    it('returns fallback for unknown goal', () => {
      const branch = getBranchByMainGoal('unknown_goal');
      expect(branch).toBe(FALLBACK_BRANCH);
    });
  });

  describe('trackGuideEvent', () => {
    it('is a function', () => {
      expect(typeof trackGuideEvent).toBe('function');
    });

    it('does not throw when called', () => {
      expect(() => trackGuideEvent('test_event', {})).not.toThrow();
    });

    it('logs to console in dev', () => {
      const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
      trackGuideEvent('test', { foo: 'bar' });
      expect(spy).toHaveBeenCalledWith('[WelcomeGuide] test', { foo: 'bar' });
      spy.mockRestore();
    });
  });
});