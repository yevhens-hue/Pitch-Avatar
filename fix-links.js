const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://pitch-avatar-lab.vercel.app';

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixLinks() {
  console.log('Fetching old links...');
  const { data: links, error } = await supabase
    .from('enrollment_links')
    .select('*')
    .like('unique_url', 'pitch-avatar.com%');

  if (error) {
    console.error(error);
    return;
  }

  console.log(`Found ${links.length} old links to fix.`);

  for (const link of links) {
    const newUrl = link.unique_url.replace('pitch-avatar.com', appUrl);
    console.log(`Updating ${link.unique_url} -> ${newUrl}`);
    const { error: updateError } = await supabase
      .from('enrollment_links')
      .update({ unique_url: newUrl })
      .eq('id', link.id);
      
    if (updateError) console.error("Failed to update:", link.id, updateError);
  }
  
  // Also check if any start with https://pitch-avatar.com
  const { data: links2 } = await supabase
    .from('enrollment_links')
    .select('*')
    .like('unique_url', 'https://pitch-avatar.com%');
    
  if (links2 && links2.length > 0) {
      console.log(`Found ${links2.length} old https links to fix.`);
      for (const link of links2) {
        const newUrl = link.unique_url.replace('https://pitch-avatar.com', appUrl);
        console.log(`Updating ${link.unique_url} -> ${newUrl}`);
        await supabase.from('enrollment_links').update({ unique_url: newUrl }).eq('id', link.id);
      }
  }

  console.log('Done!');
}

fixLinks();
