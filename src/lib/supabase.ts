import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kapkqziyceefxluxlvqc.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_juNeZXupS_SXWtvvK1MdLw_gVRnqhsE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
