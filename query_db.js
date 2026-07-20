const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data, error } = await supabase.from('buyer_scenarios').select('id, question_text, expected_slide_id').eq('project_id', 'fab749a9-bae7-43b2-9acd-7376914aa27e');
  console.log('buyer_scenarios:', data);
  
  const { data: pData } = await supabase.from('projects').select('metadata').eq('id', 'fab749a9-bae7-43b2-9acd-7376914aa27e').single();
  console.log('metadata.coachScenarios.length:', pData?.metadata?.coachScenarios?.length);
  // console.log('metadata.coachScenarios:', pData?.metadata?.coachScenarios);
}
run();
