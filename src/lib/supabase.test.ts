import { supabase } from '@/lib/supabase';

describe('supabase', () => {
  it('is initialized with url', () => {
    expect(supabase).toBeDefined();
    expect(supabase).toHaveProperty('storage');
  });

  it('has storage client', () => {
    expect(supabase.storage).toBeDefined();
    expect(supabase.storage).toHaveProperty('from');
  });
});