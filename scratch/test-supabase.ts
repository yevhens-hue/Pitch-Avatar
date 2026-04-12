import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kapkqziyceefxluxlvqc.supabase.co'
const supabaseKey = 'sb_publishable_juNeZXupS_SXWtvvK1MdLw_gVRnqhsE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  console.log('Testing Supabase connection...')
  const { data, error } = await supabase.from('projects').select('*').limit(1)
  
  if (error) {
    console.error('Connection Error:', error.message)
    if (error.message.includes('API key')) {
        console.log('--- SUGGESTION: The key starting with sb_ might be wrong. Look for a JWT key starting with eyJ in Supabase Dashboard. ---')
    }
  } else {
    console.log('Successfully connected to Supabase!')
  }
}

testConnection()
