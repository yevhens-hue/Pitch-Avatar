import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = Object.fromEntries(
  envFile.split('\n').filter(line => line && !line.startsWith('#')).map(line => {
    let [k, ...v] = line.split('=');
    return [k, v.join('=').replace(/^["'](.*)["']$/, '$1')];
  })
);

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function run() {
  const { data, error } = await supabase.from('enrollments').select('*').limit(1);
  console.log("Enrollments error:", error ? error.message : "Success");
  const { data: a, error: e } = await supabase.from('assignments').select('*').limit(1);
  console.log("Assignments error:", e ? e.message : "Success");
  const { data: g, error: ge } = await supabase.from('groups').select('*').limit(1);
  console.log("Groups error:", ge ? ge.message : "Success");
}
run();
