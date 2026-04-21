import '@testing-library/jest-dom';
import { renderHook, act } from '@testing-library/react';
import { useWizardLogic } from './useWizardLogic';
import * as NextNavigation from 'next/navigation';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  useSearchParams: () => ({ get: () => null }),
}));

jest.mock('@/lib/supabase', () => ({
  supabase: {
    storage: {
      from: () => ({
        upload: jest.fn().mockResolvedValue({ error: null }),
        getPublicUrl: () => ({ data: { publicUrl: 'https://example.com/file.pdf' } }),
      }),
    },
  },
}));

describe('useWizardLogic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with default step', () => {
    const { result } = renderHook(() => useWizardLogic());
    
    expect(result.current.step).toBe(1);
  });

  it('increments step with nextStep', () => {
    const { result } = renderHook(() => useWizardLogic());
    
    act(() => {
      result.current.nextStep();
    });
    
    expect(result.current.step).toBe(2);
  });

  it('decrements step with prevStep', () => {
    const { result } = renderHook(() => useWizardLogic());
    
    act(() => {
      result.current.nextStep();
      result.current.nextStep();
      result.current.prevStep();
    });
    
    expect(result.current.step).toBe(2);
  });

  it('does not go below step 1', () => {
    const { result } = renderHook(() => useWizardLogic());
    
    act(() => {
      result.current.prevStep();
    });
    
    expect(result.current.step).toBe(1);
  });

  it('sets project name', () => {
    const { result } = renderHook(() => useWizardLogic());
    
    act(() => {
      result.current.setProjectName('My Project');
    });
    
    expect(result.current.projectName).toBe('My Project');
  });

  it('has file input ref', () => {
    const { result } = renderHook(() => useWizardLogic());
    
    expect(result.current.fileInputRef).toBeDefined();
  });
});