const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function run() {
  const projectId = 'c5c7328a-d15f-49c6-b379-41708023b7aa';
  const mockSlides = [
    { slide_number: 1, title: 'Introduction', content: 'Welcome to our product.', image_url: 'https://placehold.co/800x450?text=Slide+1' },
    { slide_number: 2, title: 'Pricing', content: 'Our product costs $99/mo.', image_url: 'https://placehold.co/800x450?text=Slide+2' },
    { slide_number: 3, title: 'Architecture', content: 'We use AI and RAG.', image_url: 'https://placehold.co/800x450?text=Slide+3' }
  ];
  const { data, error } = await supabase.from('projects').update({ slides: mockSlides }).eq('id', projectId);
  console.log('Update result:', data, 'Error:', error);
}
run();
