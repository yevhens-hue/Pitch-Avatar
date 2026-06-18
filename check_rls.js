const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// We need the service_role key to bypass RLS and read policies or we can just try inserting a row and see the error.
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  // Let's insert a row as anonymous and see what happens
  const anonSupabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  
  const { data, error } = await anonSupabase.from('buyer_scenarios').insert({
    project_id: 'c5c7328a-d15f-49c6-b379-41708023b7aa',
    question_text: 'Test',
    expected_answer: 'Test'
  }).select();
  
  console.log("Anon insert error:", error);
}
run();
