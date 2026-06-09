'use server'

import { supabase } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000000'
const RESEND_API = 'https://api.resend.com'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MailDomainSettings {
  id?: string
  domainName: string
  subdomain?: string
  region: string
  senderName: string
  replyToEmail: string
  inviteFromEmail: string
  reminderFromEmail: string
  isConfirmed: boolean
  resendDomainId?: string
  dnsRecords?: DnsRecord[]
}

export interface DnsRecord {
  type: string
  name: string
  value: string
  status?: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Encode extra fields into sender_email JSON payload (fallback for old schema) */
function encodeSettings(s: Partial<MailDomainSettings>): string {
  return JSON.stringify({
    senderName: s.senderName,
    replyToEmail: s.replyToEmail,
    inviteFromEmail: s.inviteFromEmail,
    reminderFromEmail: s.reminderFromEmail,
    resendDomainId: s.resendDomainId,
    dnsRecords: s.dnsRecords,
    region: s.region,
    subdomain: s.subdomain,
  })
}

function decodeSettings(raw: any): MailDomainSettings {
  // Try to decode JSON from sender_email field (if it's a JSON string we stored)
  let extra: any = {}
  try {
    const parsed = JSON.parse(raw.sender_email || '{}')
    if (typeof parsed === 'object') extra = parsed
  } catch {
    // It's a plain email string — legacy row
    extra.inviteFromEmail = raw.sender_email
    extra.reminderFromEmail = raw.sender_email
    extra.replyToEmail = raw.sender_email
  }

  // Prefer columns on new schema (if they exist on the object)
  return {
    id: raw.id,
    domainName: raw.domain_name || '',
    subdomain: raw.subdomain ?? extra.subdomain ?? '',
    region: raw.region ?? extra.region ?? 'eu-west-1',
    senderName: raw.sender_name ?? extra.senderName ?? '',
    replyToEmail: raw.reply_to_email ?? extra.replyToEmail ?? '',
    inviteFromEmail: raw.invite_from_email ?? extra.inviteFromEmail ?? '',
    reminderFromEmail: raw.reminder_from_email ?? extra.reminderFromEmail ?? '',
    isConfirmed: raw.is_confirmed ?? false,
    resendDomainId: raw.resend_domain_id ?? extra.resendDomainId ?? undefined,
    dnsRecords: raw.dns_records ?? extra.dnsRecords ?? [],
  }
}

// ─── Getters ──────────────────────────────────────────────────────────────────

export async function getMailDomainSettings(
  userId: string = DEFAULT_USER_ID
): Promise<MailDomainSettings | null> {
  const { data, error } = await supabase
    .from('mail_domains')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    console.error('getMailDomainSettings error:', error.message)
    return null
  }
  if (!data) return null
  return decodeSettings(data)
}

// ─── Card 1: Add subdomain ────────────────────────────────────────────────────

export async function addSubdomainAction(
  subdomain: string,
  userId: string = DEFAULT_USER_ID
): Promise<{ success: boolean; error?: string }> {
  try {
    const existing = await getMailDomainSettings(userId)
    const payload: any = {
      user_id: userId,
      domain_name: subdomain,
      sender_email: encodeSettings({ ...(existing ?? {}), subdomain }),
      is_confirmed: false,
    }

    if (existing?.id) {
      const { error } = await supabase
        .from('mail_domains')
        .update({ ...payload, domain_name: subdomain })
        .eq('id', existing.id)
      if (error) throw error
    } else {
      const { error } = await supabase.from('mail_domains').insert([payload])
      if (error) throw error
    }

    revalidatePath('/settings')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || String(err) }
  }
}

// ─── Card 2: Generate DNS records via Resend ──────────────────────────────────

export async function generateDnsRecordsAction(
  domainName: string,
  region: string,
  userId: string = DEFAULT_USER_ID
): Promise<{ success: boolean; records?: DnsRecord[]; domainId?: string; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY

  try {
    let records: DnsRecord[] = []
    let domainId: string | undefined

    if (!apiKey || apiKey === 're_mock') {
      // Mock DNS records when no real Resend key
      records = [
        { type: 'TXT', name: 'resend._domainkey', value: 'p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQ...', status: 'not_started' },
        { type: 'MX', name: '@', value: `feedback-smtp.${region}.amazonses.com`, status: 'not_started' },
        { type: 'TXT', name: '@', value: 'v=spf1 include:amazonses.com ~all', status: 'not_started' },
      ]
    } else {
      // Call real Resend Domains API
      const resp = await fetch(`${RESEND_API}/domains`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: domainName, region }),
      })

      const json = await resp.json()

      if (!resp.ok) {
        // Domain might already exist — try to fetch it
        if (json.statusCode === 422 || json.name === 'validation_error') {
          // List domains and find matching
          const listResp = await fetch(`${RESEND_API}/domains`, {
            headers: { Authorization: `Bearer ${apiKey}` },
          })
          const listJson = await listResp.json()
          const match = listJson.data?.find((d: any) => d.name === domainName)
          if (match) {
            domainId = match.id
            records = match.records || []
          } else {
            throw new Error(json.message || 'Failed to create domain')
          }
        } else {
          throw new Error(json.message || 'Resend API error')
        }
      } else {
        domainId = json.id
        records = json.records || []
      }
    }

    // Persist to DB
    await upsertMailDomain(userId, {
      domainName,
      region,
      resendDomainId: domainId,
      dnsRecords: records,
      isConfirmed: false,
    })

    revalidatePath('/settings')
    return { success: true, records, domainId }
  } catch (err: any) {
    console.error('generateDnsRecordsAction error:', err)
    return { success: false, error: err.message || String(err) }
  }
}

// ─── Card 2: Verify DNS ───────────────────────────────────────────────────────

export async function verifyDnsAction(
  domainId: string | undefined,
  userId: string = DEFAULT_USER_ID
): Promise<{ success: boolean; verified: boolean; records?: DnsRecord[]; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY

  try {
    let verified = false
    let records: DnsRecord[] | undefined

    if (!apiKey || apiKey === 're_mock' || !domainId) {
      // Mock: always succeed
      verified = true
    } else {
      // POST /domains/{id}/verify
      const resp = await fetch(`${RESEND_API}/domains/${domainId}/verify`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}` },
      })
      const json = await resp.json()

      // Then GET the domain to see updated record statuses
      const getResp = await fetch(`${RESEND_API}/domains/${domainId}`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      })
      const getJson = await getResp.json()
      records = getJson.records || []
      verified = getJson.status === 'verified'
    }

    // Update DB
    const existing = await getMailDomainSettings(userId)
    if (existing?.id) {
      const encoded = encodeSettings({ ...existing, isConfirmed: verified, dnsRecords: records ?? existing.dnsRecords })
      await supabase
        .from('mail_domains')
        .update({ sender_email: encoded, is_confirmed: verified })
        .eq('id', existing.id)
    }

    revalidatePath('/settings')
    return { success: true, verified, records }
  } catch (err: any) {
    console.error('verifyDnsAction error:', err)
    return { success: false, verified: false, error: err.message || String(err) }
  }
}

// ─── Card 3: Save email sender settings ──────────────────────────────────────

export async function saveEmailSenderSettingsAction(
  settings: {
    senderName: string
    replyToEmail: string
    inviteFromEmail: string
    reminderFromEmail: string
  },
  userId: string = DEFAULT_USER_ID
): Promise<{ success: boolean; error?: string }> {
  try {
    const existing = await getMailDomainSettings(userId)
    const merged: MailDomainSettings = {
      domainName: existing?.domainName || '',
      region: existing?.region || 'eu-west-1',
      isConfirmed: existing?.isConfirmed ?? false,
      resendDomainId: existing?.resendDomainId,
      dnsRecords: existing?.dnsRecords,
      subdomain: existing?.subdomain,
      ...settings,
    }

    const encoded = encodeSettings(merged)

    if (existing?.id) {
      const { error } = await supabase
        .from('mail_domains')
        .update({ sender_email: encoded })
        .eq('id', existing.id)
      if (error) throw error
    } else {
      const { error } = await supabase.from('mail_domains').insert([{
        domain_name: settings.inviteFromEmail.split('@')[1] || 'default',
        sender_email: encoded,
        is_confirmed: false,
        user_id: userId,
      }])
      if (error) throw error
    }

    revalidatePath('/settings')
    return { success: true }
  } catch (err: any) {
    console.error('saveEmailSenderSettingsAction error:', err)
    return { success: false, error: err.message || String(err) }
  }
}

// ─── Internal helper ──────────────────────────────────────────────────────────

async function upsertMailDomain(
  userId: string,
  patch: Partial<MailDomainSettings>
) {
  const existing = await getMailDomainSettings(userId)
  const merged = { ...(existing ?? {}), ...patch } as MailDomainSettings
  const encoded = encodeSettings(merged)

  if (existing?.id) {
    await supabase
      .from('mail_domains')
      .update({
        domain_name: merged.domainName || existing.domainName,
        sender_email: encoded,
        is_confirmed: merged.isConfirmed,
      })
      .eq('id', existing.id)
  } else {
    await supabase.from('mail_domains').insert([{
      domain_name: merged.domainName || 'pending',
      sender_email: encoded,
      is_confirmed: false,
      user_id: userId,
    }])
  }
}
