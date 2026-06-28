const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function main() {
  const { data, error } = await supabase
    .from('projects')
    .select('id, title, slides')
    .eq('id', '5cfb35e3-aa02-4cc9-8778-c0e93fd350d8')
    .single();

  if (error) console.error(error);
  else console.log(JSON.stringify(data.slides, null, 2));
}

main();
