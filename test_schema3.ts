import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

async function main() {
  const { data, error } = await supabase.from('knowledge_documents').insert({ project_id: '745da564-037b-48ac-8a12-f2ef5af0db11', content: 'test', metadata: { name: 'test.pdf', type: 'file' } }).select()
  console.log(data, error)
  if (data && data.length > 0) {
    await supabase.from('knowledge_documents').delete().eq('id', data[0].id)
  }
}
main()
