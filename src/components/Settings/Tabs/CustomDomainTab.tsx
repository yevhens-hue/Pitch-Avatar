import React, { useState } from 'react'

export default function EmailSendingDomainTab() {
  const [senderName, setSenderName] = useState('John Doe (Pitch Avatar)')
  const [replyTo, setReplyTo] = useState('john@example.com')
  const [inviteFrom, setInviteFrom] = useState('invites@pitch-avatar.com')
  const [reminderFrom, setReminderFrom] = useState('reminders@pitch-avatar.com')
  const [domainVerified, setDomainVerified] = useState(false)
  const [customDomain, setCustomDomain] = useState('')
  const [region, setRegion] = useState('us-east-1')

  const handleVerify = () => {
    if (!customDomain) {
      alert('Please enter a custom domain first.')
      return
    }
    alert('Checking DNS records via API...')
    setTimeout(() => {
      setDomainVerified(true)
    }, 1000)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.25rem 0' }}>Email Sending Domain</h2>
          <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>Configure sender addresses and verify your domain to send emails on behalf of your company.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Left Column: Email Configuration */}
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, margin: '0 0 1rem 0' }}>Default Email Settings</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Sender Name</label>
              <input type="text" value={senderName} onChange={(e) => setSenderName(e.target.value)}
                style={{ padding: '0.6rem 0.85rem', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.9rem' }} />
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>E.g. John Doe (Pitch Avatar)</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Reply-to Address</label>
              <input type="email" value={replyTo} onChange={(e) => setReplyTo(e.target.value)}
                style={{ padding: '0.6rem 0.85rem', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.9rem' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Send Invitation From</label>
              <input type="email" value={inviteFrom} onChange={(e) => setInviteFrom(e.target.value)}
                style={{ padding: '0.6rem 0.85rem', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.9rem' }} />
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Must be on a verified domain to use custom addresses.</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Send Reminders From</label>
              <input type="email" value={reminderFrom} onChange={(e) => setReminderFrom(e.target.value)}
                style={{ padding: '0.6rem 0.85rem', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.9rem' }} />
            </div>

            <button type="button" style={{ alignSelf: 'flex-start', padding: '0.6rem 1.1rem', borderRadius: 8, background: '#6366f1', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600, marginTop: '0.5rem' }}>
              Save Email Settings
            </button>
          </div>
        </div>

        {/* Right Column: DNS Verification */}
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, margin: '0 0 1rem 0' }}>Domain Verification (DNS)</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
              To send emails from your own domain (e.g. <code>you@yourcompany.com</code>), you must add the following DNS records to your domain provider (Route53, Cloudflare, GoDaddy, etc).
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Your Custom Domain</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input type="text" value={customDomain} onChange={(e) => setCustomDomain(e.target.value)} placeholder="e.g. yourcompany.com"
                  style={{ flex: 1, padding: '0.6rem 0.85rem', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.9rem' }} />
                <select 
                  value={region} 
                  onChange={(e) => setRegion(e.target.value)}
                  style={{ padding: '0.6rem 0.85rem', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.9rem', width: '120px' }}
                >
                  <option value="us-east-1">us-east-1</option>
                  <option value="eu-west-1">eu-west-1</option>
                </select>
                <button type="button" onClick={() => { if(customDomain) alert(`Generated DNS records for ${region}.`) }} style={{ padding: '0.6rem 1rem', borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontWeight: 500 }}>
                  Generate
                </button>
              </div>
            </div>

            {customDomain && (
              <div style={{ marginTop: '1rem', border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Type</th>
                      <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Name</th>
                      <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.75rem' }}>TXT</td>
                      <td style={{ padding: '0.75rem' }}>resend._domainkey</td>
                      <td style={{ padding: '0.75rem', fontFamily: 'monospace', wordBreak: 'break-all' }}>p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC3...</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '0.75rem' }}>MX</td>
                      <td style={{ padding: '0.75rem' }}>@</td>
                      <td style={{ padding: '0.75rem', fontFamily: 'monospace' }}>feedback-smtp.us-east-1.amazonses.com</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem', padding: '1rem', background: domainVerified ? '#f0fdf4' : '#fffbeb', borderRadius: 8, border: `1px solid ${domainVerified ? '#bbf7d0' : '#fef3c7'}` }}>
              <div>
                <strong style={{ fontSize: '0.85rem', display: 'block', color: domainVerified ? '#166534' : '#b45309' }}>
                  {domainVerified ? 'Domain Verified' : 'Verification Pending'}
                </strong>
                <span style={{ fontSize: '0.75rem', color: domainVerified ? '#15803d' : '#d97706' }}>
                  {domainVerified ? 'You can now send emails from this domain.' : 'Add the records above and verify.'}
                </span>
              </div>
              <button type="button" onClick={handleVerify} style={{ padding: '0.4rem 0.8rem', borderRadius: 6, border: 'none', background: domainVerified ? '#22c55e' : '#f59e0b', color: 'white', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}>
                Verify DNS
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
