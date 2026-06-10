'use client'

import React, { useState, useEffect, useTransition } from 'react'
import { useToast } from '@/components/ui/ToastProvider'
import {
  getMailDomainSettings,
  addSubdomainAction,
  generateDnsRecordsAction,
  verifyDnsAction,
  saveEmailSenderSettingsAction,
  type MailDomainSettings,
  type DnsRecord,
} from '@/app/actions/domain-settings'

export default function EmailSendingDomainTab() {
  const { showToast } = useToast()
  const [isPending, startTransition] = useTransition()

  // ── Card 1: Add a custom domain ─────────────────────────────────────────────
  const [subdomain, setSubdomain] = useState('')

  // ── Card 2: Email sending domain (DNS verification) ─────────────────────────
  const [emailDomain, setEmailDomain] = useState('')
  const [region, setRegion] = useState('eu-west-1')
  const [dnsRecords, setDnsRecords] = useState<DnsRecord[] | null>(null)
  const [domainVerified, setDomainVerified] = useState(false)
  const [resendDomainId, setResendDomainId] = useState<string | undefined>()
  const [isVerifying, setIsVerifying] = useState(false)

  // ── Card 3: Email sender for Enrollments ─────────────────────────────────────
  const [senderName, setSenderName] = useState('')
  const [replyTo, setReplyTo] = useState('')
  const [inviteFrom, setInviteFrom] = useState('')
  const [reminderFrom, setReminderFrom] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // ── Load existing settings ────────────────────────────────────────────────────
  useEffect(() => {
    getMailDomainSettings().then((settings: MailDomainSettings | null) => {
      if (!settings) return
      setSubdomain(settings.subdomain || '')
      setEmailDomain(settings.domainName || '')
      setRegion(settings.region || 'eu-west-1')
      setDomainVerified(settings.isConfirmed)
      setResendDomainId(settings.resendDomainId)
      setDnsRecords(settings.dnsRecords?.length ? settings.dnsRecords : null)
      setSenderName(settings.senderName || '')
      setReplyTo(settings.replyToEmail || '')
      setInviteFrom(settings.inviteFromEmail || '')
      setReminderFrom(settings.reminderFromEmail || '')
    })
  }, [])

  // ── Handlers ──────────────────────────────────────────────────────────────────
  const handleAddDomain = () => {
    if (!subdomain.trim()) return
    startTransition(async () => {
      const result = await addSubdomainAction(subdomain.trim())
      if (result.success) {
        showToast('Custom domain saved successfully.', 'success')
      } else {
        showToast(result.error || 'Failed to save domain.', 'error')
      }
    })
  }

  const handleGenerateDns = () => {
    if (!emailDomain.trim()) return
    startTransition(async () => {
      const result = await generateDnsRecordsAction(emailDomain.trim(), region)
      if (result.success && result.records) {
        setDnsRecords(result.records)
        setResendDomainId(result.domainId)
        showToast('DNS records generated. Add them to your domain registrar, then click Verify DNS.', 'success')
      } else {
        showToast(result.error || 'Failed to generate DNS records.', 'error')
      }
    })
  }

  const handleVerifyDns = async () => {
    setIsVerifying(true)
    try {
      const result = await verifyDnsAction(resendDomainId)
      if (result.verified) {
        setDomainVerified(true)
        if (result.records) setDnsRecords(result.records)
        showToast('Domain verified! You can now send emails from this domain.', 'success')
      } else {
        showToast('DNS records not yet propagated. Try again in a few minutes.', 'error')
      }
    } finally {
      setIsVerifying(false)
    }
  }

  const handleSaveEmailSettings = async () => {
    if (!inviteFrom.trim()) {
      showToast('Invitation "From" email is required.', 'error')
      return
    }
    setIsSaving(true)
    try {
      const result = await saveEmailSenderSettingsAction({
        senderName,
        replyToEmail: replyTo,
        inviteFromEmail: inviteFrom,
        reminderFromEmail: reminderFrom,
      })
      if (result.success) {
        showToast('Email sender settings saved successfully.', 'success')
      } else {
        showToast(result.error || 'Failed to save settings.', 'error')
      }
    } finally {
      setIsSaving(false)
    }
  }

  // ── Styles ────────────────────────────────────────────────────────────────────
  const cardStyle: React.CSSProperties = {
    background: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: 12,
    padding: '1.75rem 2rem',
    marginBottom: '1.5rem',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: '0.8rem',
    fontWeight: 600,
    color: '#475569',
    marginBottom: '0.35rem',
    display: 'block',
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.55rem 0.85rem',
    borderRadius: 8,
    border: '1px solid #e2e8f0',
    fontSize: '0.9rem',
    color: '#0f172a',
    boxSizing: 'border-box',
    outline: 'none',
  }

  const hintStyle: React.CSSProperties = {
    fontSize: '0.75rem',
    color: '#94a3b8',
    marginTop: '0.35rem',
  }

  const primaryBtn = (disabled = false): React.CSSProperties => ({
    padding: '0.55rem 1.1rem',
    borderRadius: 8,
    background: disabled ? '#e2e8f0' : '#6366f1',
    color: disabled ? '#94a3b8' : 'white',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontWeight: 600,
    fontSize: '0.875rem',
    whiteSpace: 'nowrap',
  })

  return (
    <div>
      {/* ── Card 1: Add a custom domain ──────────────────────────────────────── */}
      <div style={cardStyle}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.4rem 0' }}>
          Add a custom domain
        </h3>
        <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 0.3rem 0' }}>
          You can add your own domain
        </p>
        <a href="#" style={{ fontSize: '0.85rem', color: '#3b82f6', textDecoration: 'none' }}>
          Do you need help with domain set up?
        </a>

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <input
              type="text"
              value={subdomain}
              onChange={(e) => setSubdomain(e.target.value)}
              placeholder="subdomain.site-name.com"
              style={inputStyle}
            />
          </div>
          <button
            type="button"
            onClick={handleAddDomain}
            disabled={!subdomain.trim() || isPending}
            style={primaryBtn(!subdomain.trim() || isPending)}
          >
            {isPending ? 'Saving...' : 'add domain'}
          </button>
        </div>
      </div>

      {/* ── Card 2: Email sending domain (DNS verification) ───────────────────── */}
      <div style={cardStyle}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.4rem 0' }}>
          Email sending domain (DNS verification)
        </h3>
        <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 1.25rem 0', lineHeight: 1.6 }}>
          To send invitations and reminders from your own domain (e.g.{' '}
          <code style={{ background: '#f1f5f9', padding: '1px 5px', borderRadius: 4 }}>
            noreply@yourdomain.com
          </code>
          ), the administrator of your email DNS zone must add the records below at your domain registrar
          (Cloudflare, GoDaddy, Route 53, etc.). After the records are added, click{' '}
          <strong>Verify DNS</strong>.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px auto', gap: '0.75rem', alignItems: 'flex-end' }}>
          <div>
            <label style={labelStyle}>Email sending domain</label>
            <input
              type="text"
              value={emailDomain}
              onChange={(e) => { setEmailDomain(e.target.value); setDomainVerified(false); setDnsRecords(null) }}
              placeholder="yourdomain.com"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Region</label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              style={{ ...inputStyle, cursor: 'pointer' }}
            >
              <option value="eu-west-1">EU (Ireland)</option>
              <option value="us-east-1">US East (N. Virginia)</option>
              <option value="us-west-2">US West (Oregon)</option>
              <option value="ap-southeast-1">AP (Singapore)</option>
            </select>
          </div>
          <button
            type="button"
            onClick={handleGenerateDns}
            disabled={!emailDomain.trim() || isPending}
            style={primaryBtn(!emailDomain.trim() || isPending)}
          >
            {isPending ? 'Generating...' : 'Generate DNS records'}
          </button>
        </div>

        {/* DNS records table */}
        {dnsRecords && dnsRecords.length > 0 && (
          <div style={{ marginTop: '1.25rem', border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['Type', 'Name', 'Value', 'Status'].map(h => (
                    <th key={h} style={{ padding: '0.5rem 0.75rem', textAlign: 'left', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dnsRecords.map((rec, i) => (
                  <tr key={i} style={{ borderBottom: i < dnsRecords.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                    <td style={{ padding: '0.65rem 0.75rem', fontWeight: 600 }}>{rec.type}</td>
                    <td style={{ padding: '0.65rem 0.75rem', fontFamily: 'monospace' }}>{rec.name}</td>
                    <td style={{ padding: '0.65rem 0.75rem', fontFamily: 'monospace', wordBreak: 'break-all', color: '#475569', maxWidth: 280 }}>{rec.value}</td>
                    <td style={{ padding: '0.65rem 0.75rem' }}>
                      {rec.status === 'verified'
                        ? <span style={{ color: '#16a34a', fontWeight: 600 }}>✓ Verified</span>
                        : <span style={{ color: '#d97706' }}>Pending</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Verify DNS banner */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.9rem 1rem',
              background: domainVerified ? '#f0fdf4' : '#fffbeb',
              borderTop: `1px solid ${domainVerified ? '#bbf7d0' : '#fef3c7'}`,
            }}>
              <div>
                <strong style={{ fontSize: '0.85rem', display: 'block', color: domainVerified ? '#166534' : '#b45309' }}>
                  {domainVerified ? '✓ Domain Verified' : 'Verification Pending'}
                </strong>
                <span style={{ fontSize: '0.75rem', color: domainVerified ? '#15803d' : '#d97706' }}>
                  {domainVerified
                    ? 'You can now send emails from this domain.'
                    : 'Add the DNS records above, then click Verify DNS.'}
                </span>
              </div>
              {!domainVerified && (
                <button
                  type="button"
                  onClick={handleVerifyDns}
                  disabled={isVerifying}
                  style={{ padding: '0.45rem 0.9rem', borderRadius: 6, border: 'none', background: '#f59e0b', color: 'white', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}
                >
                  {isVerifying ? 'Checking...' : 'Verify DNS'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Card 3: Email sender for Enrollments ──────────────────────────────── */}
      <div style={cardStyle}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.4rem 0' }}>
          Email sender for Enrollments
        </h3>
        <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 1.25rem 0' }}>
          Configure the email address used to send enrollment invitations and reminders to listeners.
        </p>

        {/* Row 1: Sender name + Reply-to */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={labelStyle}>Sender name</label>
            <input type="text" value={senderName} onChange={(e) => setSenderName(e.target.value)} placeholder="Your Company" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Reply-to email</label>
            <input type="email" value={replyTo} onChange={(e) => setReplyTo(e.target.value)} placeholder="support@yourdomain.com" style={inputStyle} />
          </div>
        </div>

        {/* Invitation "From" email */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Invitation "From" email</label>
          <input type="email" value={inviteFrom} onChange={(e) => setInviteFrom(e.target.value)} placeholder="invitations@yourdomain.com" style={inputStyle} />
          <p style={hintStyle}>Used as sender when invitations are sent for new enrollments.</p>
        </div>

        {/* Reminder "From" email */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={labelStyle}>Reminder "From" email</label>
          <input type="email" value={reminderFrom} onChange={(e) => setReminderFrom(e.target.value)} placeholder="reminders@yourdomain.com" style={inputStyle} />
          <p style={hintStyle}>
            Used as sender for enrollment reminder emails. Leave empty to use the invitation address.
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={handleSaveEmailSettings}
            disabled={isSaving}
            style={primaryBtn(isSaving)}
          >
            {isSaving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
