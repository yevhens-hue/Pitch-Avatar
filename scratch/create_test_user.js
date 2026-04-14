const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createTestUser() {
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'test@example.com',
    password: 'password123',
    email_confirm: true
  })

  if (error) {
    if (error.message.includes('already registered')) {
      console.log('Test user already exists: test@example.com / password123')
    } else {
      console.error('Error creating test user:', error)
    }
  } else {
    console.log('Successfully created test user: test@example.com / password123')
  }
}

createTestUser()
