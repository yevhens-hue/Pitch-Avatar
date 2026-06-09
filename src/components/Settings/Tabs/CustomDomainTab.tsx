'use client'

import React, { useState } from 'react'

export default function EmailSendingDomainTab() {
  // Card 1: Add a custom domain
  const [subdomain, setSubdomain] = useState('')

  // Card 2: Email sending domain (DNS verification)
  const [emailDomain, setEmailDomain] = useState('')
  const [region, setRegion] = useState('eu-west-1')
  const [dnsRecords, setDnsRecords] = useState<{ type: string; name: string; value: string }[] | null>(null)
  const [domainVerified, setDomainVerified] = useState(false)

  // Card 3: Email sender for Assignments
  const [senderName, setSenderName] = useState('')
  const [replyTo, setReplyTo] = useState('')
  const [inviteFrom, setInviteFrom] = useState('')
  const [reminderFrom, setReminderFrom] = useState('')

  const handleGenerateDns = () => {
    if (!emailDomain.trim()) return
    setDnsRecords([
      { type: 'TXT', name: 'resend._domainkey', value: 'p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC3...' },
      { type: 'MX', name: '@', value: `feedback-smtp.${region}.amazonses.com` },
    ])
  }

  const handleVerifyDns = () => {
    if (!emailDomain.trim()) return
    // Simulate verification
    setTimeout(() => setDomainVerified(true), 800)
  }

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

  return (
    <div>
      {/* ── Card 1: Add a custom domain ───────────────────────────────────── */}
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
            style={{
              padding: '0.55rem 1.1rem',
              borderRadius: 8,
              background: subdomain.trim() ? '#6366f1' : '#e2e8f0',
              color: subdomain.trim() ? 'white' : '#94a3b8',
              border: 'none',
              cursor: subdomain.trim() ? 'pointer' : 'not-allowed',
              fontWeight: 600,
              fontSize: '0.875rem',
              whiteSpace: 'nowrap',
            }}
            disabled={!subdomain.trim()}
          >
            add domain
          </button>
        </div>
      </div>

      {/* ── Card 2: Email sending domain (DNS verification) ───────────────── */}
      <div style={cardStyle}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.4rem 0' }}>
          Email sending domain (DNS verification)
        </h3>
        <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 1.25rem 0', lineHeight: 1.6 }}>
          To send invitations and reminders from your own domain (e.g.{' '}
          <code style={{ background: '#f1f5f9', padding: '1px 5px', borderRadius: 4 }}>
            noreply@yourdomain.com
          </code>
          ), the administrator of your email DNS zone must add the records below at your domain registrar (Cloudflare,
          GoDaddy, Route 53, etc.). After the records are added, click{' '}
          <strong>Verify DNS</strong>.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px auto', gap: '0.75rem', alignItems: 'flex-end' }}>
          <div>
            <label style={labelStyle}>Email sending domain</label>
            <input
              type="text"
              value={emailDomain}
              onChange={(e) => setEmailDomain(e.target.value)}
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
            style={{
              padding: '0.55rem 1.1rem',
              borderRadius: 8,
              background: emailDomain.trim() ? '#6366f1' : '#e2e8f0',
              color: emailDomain.trim() ? 'white' : '#94a3b8',
              border: 'none',
              cursor: emailDomain.trim() ? 'pointer' : 'not-allowed',
              fontWeight: 600,
              fontSize: '0.875rem',
              whiteSpace: 'nowrap',
            }}
            disabled={!emailDomain.trim()}
          >
            Generate DNS records
          </button>
        </div>

        {/* DNS records table */}
        {dnsRecords && (
          <div style={{ marginTop: '1.25rem', border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontWeight: 600 }}>Type</th>
                  <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontWeight: 600 }}>Name</th>
                  <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontWeight: 600 }}>Value</th>
                </tr>
              </thead>
              <tbody>
                {dnsRecords.map((rec, i) => (
                  <tr key={i} style={{ borderBottom: i < dnsRecords.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                    <td style={{ padding: '0.65rem 0.75rem', fontWeight: 600 }}>{rec.type}</td>
                    <td style={{ padding: '0.65rem 0.75rem', fontFamily: 'monospace' }}>{rec.name}</td>
                    <td style={{ padding: '0.65rem 0.75rem', fontFamily: 'monospace', wordBreak: 'break-all', color: '#475569' }}>{rec.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Verify DNS banner */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.9rem 1rem',
                background: domainVerified ? '#f0fdf4' : '#fffbeb',
                borderTop: `1px solid ${domainVerified ? '#bbf7d0' : '#fef3c7'}`,
              }}
            >
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
                  style={{
                    padding: '0.45rem 0.9rem',
                    borderRadius: 6,
                    border: 'none',
                    background: '#f59e0b',
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                  }}
                >
                  Verify DNS
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Card 3: Email sender for Assignments ──────────────────────────── */}
      <div style={cardStyle}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.4rem 0' }}>
          Email sender for Assignments
        </h3>
        <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 1.25rem 0' }}>
          Configure the email address used to send assignment invitations and reminders to listeners.
        </p>

        {/* Row 1: Sender name + Reply-to */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={labelStyle}>Sender name</label>
            <input
              type="text"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="Your Company"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Reply-to email</label>
            <input
              type="email"
              value={replyTo}
              onChange={(e) => setReplyTo(e.target.value)}
              placeholder="support@yourdomain.com"
              style={inputStyle}
            />
          </div>
        </div>

        {/* Invitation "From" email */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Invitation "From" email</label>
          <input
            type="email"
            value={inviteFrom}
            onChange={(e) => setInviteFrom(e.target.value)}
            placeholder="invitations@yourdomain.com"
            style={inputStyle}
          />
          <p style={hintStyle}>Used as sender when invitations are sent for new assignments.</p>
        </div>

        {/* Reminder "From" email */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={labelStyle}>Reminder "From" email</label>
          <input
            type="email"
            value={reminderFrom}
            onChange={(e) => setReminderFrom(e.target.value)}
            placeholder="reminders@yourdomain.com"
            style={inputStyle}
          />
          <p style={hintStyle}>
            Used as sender for assignment reminder emails. Leave empty to use the invitation address.
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: 8,
              background: '#6366f1',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.875rem',
            }}
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  )
}
