const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function run() {
  const { data, error } = await supabase.from('projects').select('id, title, slides').not('slides', 'eq', '[]');
  console.log('Projects with slides:', data?.length);
  if (data?.length > 0) {
    console.log('Example project ID:', data[0].id, 'Title:', data[0].title);
  }
}
run();
