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
  const { data, error } = await supabase.from('projects').select('*').limit(1);
  console.log("Projects error:", error ? error.message : "Success");
  const { data: p, error: pe } = await supabase.from('listeners').select('*').limit(1);
  console.log("Listeners error:", pe ? pe.message : "Success");
}
run();
