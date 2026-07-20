import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testTables() {
  const tables = [
    'folders',
    'projects',
    'listeners',
    'knowledge_documents',
    'coach_settings',
    'buyer_scenarios',
    'training_sessions'
  ];

  let hasErrors = false;

  for (const table of tables) {
    console.log('Testing table:', table);
    const { data, error } = await supabase.from(table).select('*').limit(1);
    
    if (error) {
      console.error('❌ Error querying', table, ':', error.message);
      hasErrors = true;
    } else {
      console.log('✅ Success querying', table, '. Found', data.length, 'rows.');
    }
  }

  if (hasErrors) {
    console.error("Some tables had errors.");
  } else {
    console.log("All tables are accessible!");
  }
}

testTables();
