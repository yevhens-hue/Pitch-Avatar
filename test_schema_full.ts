import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

async function main() {
  const { data, error } = await supabase.from('knowledge_documents').select('*').limit(1)
  console.log("knowledge_documents select:", { data, error })
  
  if (data && data.length === 0) {
    const { data: d2, error: e2 } = await supabase.from('knowledge_documents').insert({ id: crypto.randomUUID() }).select()
    console.log("knowledge_documents insert error:", e2)
  }
}
main()
