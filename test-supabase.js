require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function run() {
  const { data, error } = await supabase.from('enrollments').select('*').limit(1);
  console.log("Enrollments:", error || "Success");
  const { data: a, error: e } = await supabase.from('assignments').select('*').limit(1);
  console.log("Assignments:", e || "Success");
}
run();
