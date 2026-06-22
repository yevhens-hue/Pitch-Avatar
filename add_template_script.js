const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('Fetching projects...');
  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('*')
    .limit(50);
  
  if (projectsError) {
    console.error('Error fetching projects:', projectsError);
    return;
  }
  
  if (!projects || projects.length === 0) {
    console.log('No projects found in Supabase.');
    return;
  }
  
  let realProject = projects.find(p => p.slides && p.slides.length > 0 && p.slides[0].image_url);
  if (!realProject) {
    console.log('No project found with slides containing image_url. Falling back to any project with slides.');
    realProject = projects.find(p => p.slides && p.slides.length > 0);
  }
  if (!realProject) {
    console.log('No project found with slides. Just grabbing the first one and WE WILL MOCK SOME SLIDES FOR IT.');
    realProject = projects[0];
    
    // add some mock slides to this project in the DB
    const mockSlides = [
      { id: 1, title: 'Real Pitch Slide 1', image_url: 'https://placehold.co/960x540/10b981/ffffff?text=Real+Presentation+1' },
      { id: 2, title: 'Real Pitch Slide 2', image_url: 'https://placehold.co/960x540/10b981/ffffff?text=Real+Presentation+2' },
      { id: 3, title: 'Real Pitch Slide 3', image_url: 'https://placehold.co/960x540/10b981/ffffff?text=Real+Presentation+3' }
    ];
    await supabase.from('projects').update({ slides: mockSlides, slides_count: 3 }).eq('id', realProject.id);
    realProject.slides = mockSlides;
  }
  
  console.log('Selected Project:', realProject.id, realProject.title || 'Unknown', 'Slide count:', realProject.slides?.length);
  
  const newTemplate = {
    id: crypto.randomUUID(),
    name: `Real Presentation: ${realProject.title || 'Demo'}`,
    description: 'This is a demo template automatically added from a real presentation.',
    productTypes: ['Presentation + AI Avatar'],
    projectType: 'Investor Pitch',
    slideCount: realProject.slides?.length || 0,
    tags: ['real', 'demo'],
    badge: 'NEW',
    accessType: 'active',
    selectedProjectId: realProject.id,
    order: 1,
    createdAt: new Date().toISOString()
  };
  
  console.log('Inserting template:', newTemplate);
  const { data, error } = await supabase
    .from('presentation_templates')
    .insert([newTemplate]);
    
  if (error) {
    console.error('Error inserting template:', error);
  } else {
    console.log('Successfully inserted template!');
  }
}

run();
