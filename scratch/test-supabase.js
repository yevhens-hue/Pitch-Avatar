const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://kapkqziyceefxluxlvqc.supabase.co'
const supabaseKey = 'sb_publishable_juNeZXupS_SXWtvvK1MdLw_gVRnqhsE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  console.log('Testing Supabase connection...')
  try {
    const { data, error } = await supabase.from('projects').select('*').limit(1)
    if (error) {
        console.error('Connection Error:', error.message)
    } else {
        console.log('Successfully connected to Supabase!')
    }
  } catch (e) {
    console.error('System error:', e.message)
  }
}

testConnection()
