const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const projectId = 'c5c7328a-d15f-49c6-b379-41708023b7aa';
  
  const realSlides = [
    { 
      id: 1, 
      title: 'Introduction', 
      image_url: 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=960&q=80' 
    },
    { 
      id: 2, 
      title: 'Pricing', 
      image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=960&q=80' 
    },
    { 
      id: 3, 
      title: 'Architecture', 
      image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=960&q=80' 
    }
  ];
  
  console.log('Updating project slides...');
  const { data, error } = await supabase
    .from('projects')
    .update({ slides: realSlides })
    .eq('id', projectId);
    
  if (error) {
    console.error('Error updating project:', error);
  } else {
    console.log('Successfully updated project with real slide images!');
  }
}

run();
