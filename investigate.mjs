import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = Object.fromEntries(
  envFile.split('\n').filter(line => line && !line.startsWith('#')).map(line => {
    let [k, ...v] = line.split('=');
    return [k, v.join('=').replace(/^["'](.*)["']$/, '$1')];
  })
);

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
  const { data: e } = await supabase.from('enrollments').select('*').limit(1);
  console.log('enrollments:', e);
  
  const { data: p } = await supabase.from('presenters').select('*').limit(1);
  console.log('presenters:', p);
}
run();
