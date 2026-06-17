import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { data, error } = await supabase.from('enrollments').select('*').limit(1);
  if (error) { console.error('fetch error', error); return; }
  console.log('existing row:', data[0]);
  const existing = data[0];
  const { id: _id, created_at: _createdAt, updated_at: _updatedAt, link: _link, progress: _p, time_spent: _ts, score: _s, ...duplicateData } = existing;
  
  const payload = {
      ...duplicateData,
      title: `${existing.title || 'Enrollment'} (Copy)`,
      status: 'Pending',
      link: null,
      progress: 0,
      time_spent: 0,
      score: 0
  };
  console.log('payload to insert:', payload);
  const { data: res, error: err } = await supabase.from('enrollments').insert([payload]).select();
  console.log('insert error:', err);
  console.log('insert result:', res);
}
run();
