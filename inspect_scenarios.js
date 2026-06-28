const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  const { data, error } = await supabase
    .from('buyer_scenarios')
    .insert({
      project_id: '5cfb35e3-aa02-4cc9-8778-c0e93fd350d8',
      question_text: "test",
      expected_answer: "test",
      expected_slide_id: null,
      is_generated: false,
      custom_actions: { test: "data" }
    })
    .select();

  if (error) console.error("Error:", error);
  else console.log(JSON.stringify(data, null, 2));
}

main();
