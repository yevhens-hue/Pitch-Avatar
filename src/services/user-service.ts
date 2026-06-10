import type { User, Subscription } from '@/types'
import { supabase } from '@/lib/supabase'

const MOCK_SUBSCRIPTION: Subscription = {
  plan: 'trial',
  trialDaysLeft: 7,
  aiMinutesTotal: 50,
  aiMinutesUsed: 45,
}

const MOCK_USER: User = {
  id: '1',
  name: 'Yevhen',
  email: '1cpafarm@gmail.com',
  avatarInitial: 'Y',
  company: 'pseudo_Yevhen_Sh_52718',
}

export async function fetchCurrentUser() {
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

  if (authError || !authUser) {
    return { user: MOCK_USER, subscription: MOCK_SUBSCRIPTION }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authUser.id)
    .single()

  const name = profile?.name || authUser.user_metadata?.full_name || MOCK_USER.name
  const email = authUser.email || MOCK_USER.email

  const user: User = {
    id: authUser.id,
    name,
    email,
    avatarInitial: name.charAt(0).toUpperCase(),
    company: profile?.company || '',
    country: profile?.country || '',
    phone: profile?.phone || '',
    role: profile?.role || '',
    photoUrl: profile?.photoUrl || authUser.user_metadata?.avatar_url,
  }

  return { user, subscription: MOCK_SUBSCRIPTION }
}

export function fetchCurrentUserSync() {
  return { user: MOCK_USER, subscription: MOCK_SUBSCRIPTION }
}

export async function updateUserProfile(
  data: Partial<Pick<User, 'name' | 'phone' | 'company' | 'country' | 'role'>>,
) {
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) {
    // Fallback if not logged in properly during local testing
    return { ...MOCK_USER, ...data }
  }

  const { error } = await supabase
    .from('profiles')
    .upsert({ 
      id: authUser.id, 
      ...data,
      updated_at: new Date().toISOString()
    })

  if (error) throw error

  return data
}

export async function uploadAvatar(file: File) {
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) throw new Error('Not authenticated')

  const fileExt = file.name.split('.').pop()
  const fileName = `${authUser.id}-${Math.random()}.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(fileName, file)

  if (uploadError) throw uploadError

  const { data } = supabase.storage.from('avatars').getPublicUrl(fileName)

  await supabase
    .from('profiles')
    .upsert({ id: authUser.id, photoUrl: data.publicUrl, updated_at: new Date().toISOString() })

  return data.publicUrl
}
