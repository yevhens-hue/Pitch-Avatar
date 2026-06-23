import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kapkqziyceefxluxlvqc.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_juNeZXupS_SXWtvvK1MdLw_gVRnqhsE';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seed() {
  const projectsToCreate = [
    {
      title: 'Website Assistant (Widget)',
      type: 'widget',
      status: 'published',
      user_id: '00000000-0000-0000-0000-000000000000'
    }
  ];

  for (const p of projectsToCreate) {
    const { data, error } = await supabase
      .from('projects')
      .insert([p])
      .select();

    if (error) {
      console.error('Error creating project:', error);
    } else {
      console.log(`Created [${p.type}] project. URL: http://localhost:3000/editor?projectId=${data[0].id}`);
    }
  }
}

seed();
