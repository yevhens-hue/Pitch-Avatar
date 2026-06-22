const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function addSaraTemplate() {
  const newId = crypto.randomUUID();
  const { data, error } = await supabase
    .from('presentation_templates')
    .insert([
      {
        id: newId,
        name: 'Sara Widget Specs',
        badge: 'New',
        description: 'Detailed product requirements, hypotheses, and UI specs for the Sara AI Widget.',
        projectType: 'Presentation + AI Avatar',
        productTypes: ['Product'],
        tags: ['Product', 'Specs'],
        slideCount: 10,
        accessType: 'system',
        templateType: 'copy',
        isOnHomepage: true,
        order: 0,
      }
    ])
    .select();

  if (error) {
    console.error('Error inserting template:', error);
  } else {
    console.log('Successfully added template with ID:', newId);
  }
}

addSaraTemplate();
