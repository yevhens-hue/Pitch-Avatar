const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  const { data, error } = await supabase
    .from('buyer_scenarios')
    .delete()
    .eq('question_text', 'test');

  if (error) console.error("Error:", error);
  else console.log("Deleted test scenario");
}

main();
