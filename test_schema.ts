import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

async function main() {
  const { data, error } = await supabase.rpc('get_tables_info')
  if (error) {
    console.log("RPC fail, try generic query")
    const { data: d2, error: e2 } = await supabase.from('knowledge_documents').select('*').limit(1)
    console.log("knowledge_documents:", e2 || "Exists!")
    const { data: d3, error: e3 } = await supabase.from('projects').select('*').limit(1)
    console.log("projects:", e3 || "Exists!")
  } else {
    console.log(data)
  }
}
main()
