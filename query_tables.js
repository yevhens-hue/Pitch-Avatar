const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
  const { data: e, error: ee } = await supabase.from('enrollments').select('*').limit(1);
  console.log('enrollments:', e, ee);
  
  const { data: p, error: pe } = await supabase.from('presenters').select('*').limit(1);
  console.log('presenters:', p, pe);
}
run();
