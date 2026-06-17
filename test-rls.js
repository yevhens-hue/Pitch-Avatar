import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const supabaseAnon = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
  const { data: dataService } = await supabase.from('enrollments').select('id');
  const { data: dataAnon } = await supabaseAnon.from('enrollments').select('id');
  console.log("Service key rows:", dataService?.length);
  console.log("Anon key rows:", dataAnon?.length);
}
check();
