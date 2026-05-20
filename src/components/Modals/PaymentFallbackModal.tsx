import React, { useState, useEffect } from 'react'
import { X, CheckCircle, Mail, AlertTriangle, ShieldCheck, CreditCard, Landmark } from 'lucide-react'
import styles from './PaymentFallbackModal.module.css'

interface Props {
  isOpen: boolean
  onClose: () => void
  initialReason?: string
}

export default function PaymentFallbackModal({ isOpen, onClose, initialReason }: Props) {
  const [reason, setReason] = useState('Upgrade Plan')
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Update reason when initialReason changes
  useEffect(() => {
    if (initialReason) {
      setReason(initialReason)
    }
  }, [initialReason])

  if (!isOpen) return null

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulated submission success
    setIsSubmitted(true)
  }

  const handleReset = () => {
    setIsSubmitted(false)
    setName('')
    setCompany('')
    setEmail('')
    setMessage('')
    onClose()
  }

  // Pre-filled mailto parameters
  const mailtoSubject = encodeURIComponent(`Pitch Avatar Billing Request - ${reason}`)
  const mailtoBody = encodeURIComponent(
    `Hello Pitch Avatar Team,\n\nI would like to request support for: ${reason}.\n\nMy Details:\nName: ${name || '[Your Name]'}\nCompany: ${company || '[Your Company]'}\nEmail: ${email || '[Your Email]'}\n\nAdditional Details:\n${message || 'No additional details provided.'}\n\nPlease send me the bank transfer details or a secure PayPal payment link.\n\nBest regards,`
  )
  const mailtoUrl = `mailto:support@pitchavatar.com?subject=${mailtoSubject}&body=${mailtoBody}`

  return (
    <div className={styles.overlay} onClick={handleReset}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        
        {/* Close Button */}
        <button className={styles.closeBtn} onClick={handleReset} aria-label="Close modal">
          <X size={20} />
        </button>

        {!isSubmitted ? (
          <>
            {/* Header with warning badge */}
            <div className={styles.header}>
              <div className={styles.alertBadge}>
                <AlertTriangle size={18} />
                <span>System Update</span>
              </div>
              <h2 className={styles.title}>Direct Billing Support</h2>
              <p className={styles.subtitle}>
                Our payment processor is undergoing scheduled maintenance. Our finance team is actively processing all subscription upgrades and payments manually to avoid any service interruption.
              </p>
            </div>

            {/* Supported Payment Channels */}
            <div className={styles.channels}>
              <div className={styles.channelCard}>
                <div className={styles.channelHeader}>
                  <Landmark size={20} className={styles.channelIcon} />
                  <strong>Bank Transfer (Invoice)</strong>
                </div>
                <p>We issue direct professional invoices (IBAN/SEPA) ideal for standard monthly or annual subscriptions.</p>
              </div>

              <div className={styles.channelCard}>
                <div className={styles.channelHeader}>
                  <CreditCard size={20} className={styles.channelIcon} />
                  <strong>PayPal Secure Billing</strong>
                </div>
                <p>Perfect for immediate card payments. We send a secure link directly to your email, playable via any major card.</p>
              </div>
            </div>

            {/* Form */}
            <form className={styles.form} onSubmit={handleFormSubmit}>
              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="John Doe"
                    className={styles.input}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Company Name</label>
                  <input
                    type="text"
                    value={company}
                    onChange={e => setCompany(e.target.value)}
                    placeholder="Acme Corp"
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    className={styles.input}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Billing Request *</label>
                  <select
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    className={styles.select}
                  >
                    <option value="Professional Plan (Monthly)">Professional Plan — Monthly</option>
                    <option value="Professional Plan (Annual)">Professional Plan — Annual</option>
                    <option value="Business Plan (Monthly)">Business Plan — Monthly</option>
                    <option value="Business Plan (Annual)">Business Plan — Annual</option>
                    <option value="10 Minutes Add-on">10 Minutes Add-on ($12.00)</option>
                    <option value="25 Minutes Add-on">25 Minutes Add-on ($29.00)</option>
                    <option value="50 Minutes Add-on">50 Minutes Add-on ($59.00)</option>
                    <option value="100 Minutes Add-on">100 Minutes Add-on ($109.00)</option>
                    <option value="Update Card Details">Update Payment Card Details</option>
                    <option value="Enterprise / Custom Billing">Enterprise / Custom Billing</option>
                  </select>
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Additional Details / Notes</label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="e.g. Please send a PayPal invoice or list custom onboarding seat counts."
                  rows={3}
                  className={styles.textarea}
                />
              </div>

              {/* Actions */}
              <div className={styles.actions}>
                <a href={mailtoUrl} className={styles.mailToBtn} title="Open in your local email client">
                  <Mail size={16} /> Send Direct Email
                </a>
                <button type="submit" className={styles.submitBtn}>
                  Submit Payment Request
                </button>
              </div>
            </form>
          </>
        ) : (
          /* Success Screen */
          <div className={styles.successScreen}>
            <CheckCircle size={64} className={styles.successIcon} />
            <h2 className={styles.successTitle}>Request Submitted Successfully!</h2>
            <p className={styles.successDesc}>
              Thank you, <strong>{name || 'valued client'}</strong>. Our billing operations department has received your request regarding <strong>{reason}</strong>.
            </p>
            
            <div className={styles.successBox}>
              <ShieldCheck size={18} className={styles.shieldIcon} />
              <span>
                <strong>Next Steps:</strong> An email containing a secure PayPal card-payment link or bank invoice details will be sent to <strong>{email}</strong> within 15 minutes.
              </span>
            </div>

            <p className={styles.successFooter}>
              For any urgent adjustments, feel free to contact us at <a href="mailto:support@pitchavatar.com">support@pitchavatar.com</a>.
            </p>

            <button className={styles.doneBtn} onClick={handleReset}>
              Return to Platform
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
