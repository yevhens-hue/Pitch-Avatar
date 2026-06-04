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
  const { data, error } = await supabase.rpc('get_tables_info'); // if we have an RPC
  // Actually we can't query information_schema easily via supabase JS client unless there is an RPC.
  // Instead let's just use REST API to hit an endpoint that doesn't exist to see if it's 404.
  // Wait, I can just use psql if I had the DB URL. Let's see if env has DB URL.
  console.log(Object.keys(env));
}
run();
