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
  const sql = `
    ALTER TABLE presenters ADD COLUMN IF NOT EXISTS default_link_expiration_days INT DEFAULT 14;
    ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS expiration_days INT;
    ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
  `;
  const { data, error } = await supabase.rpc('execute_sql', { sql_query: sql });
  console.log("Execute SQL:", data, error);
}
run();
