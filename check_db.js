const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function run() {
  const { data, error } = await supabase.from('buyer_scenarios').select('*').eq('project_id', 'c5c7328a-d15f-49c6-b379-41708023b7aa');
  console.log('Scenarios:', data);
}
run();
