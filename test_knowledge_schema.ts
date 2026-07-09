import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

async function main() {
  const { data, error } = await supabase.from('knowledge_documents').select('*').limit(1)
  if (data && data.length > 0) {
    console.log(Object.keys(data[0]))
  } else {
    // try to get columns via a dummy insert or just by error message
    const { error: e } = await supabase.from('knowledge_documents').insert({ fake_col: 1 })
    console.log(e)
  }
}
main()
