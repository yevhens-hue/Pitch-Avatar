import { supabase } from '@/lib/supabase';

describe('supabase module', () => {
  it('exports supabase client', () => {
    expect(supabase).toBeDefined();
  });

  it('supabase has storage property', () => {
    expect(supabase.storage).toBeDefined();
  });

  it('supabase.auth exists', () => {
    expect(supabase.auth).toBeDefined();
  });
});