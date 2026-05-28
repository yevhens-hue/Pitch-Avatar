'use client'

import React, { useState, useEffect, useTransition } from 'react'
import styles from './Profile.module.css'
import { useUser } from '@/context'
import { useToast } from '@/components/ui/ToastProvider'
import {
  getSeatsQuota,
  updateSeatsQuota,
  getMailDomain,
  saveMailDomain
} from '@/app/actions/enrollments'
import { ListenerSeat, MailDomain } from '@/types/listeners'
import { Sparkles, ShieldCheck, Mail, Users } from 'lucide-react'

export default function Profile() {
  const { user } = useUser()
  const { showToast } = useToast()
  const [isPending, startTransition] = useTransition()

  // Seat Quotas State
  const [quota, setQuota] = useState<ListenerSeat | null>(null)
  const [seatsSlider, setSeatsSlider] = useState(100)
  const [adminSeatsInput, setAdminSeatsInput] = useState('100')

  // Mail Domain State
  const [mailDomain, setMailDomain] = useState<MailDomain | null>(null)
  const [domainName, setDomainName] = useState('')
  const [senderEmail, setSenderEmail] = useState('')

  // Load database values
  const loadData = () => {
    startTransition(async () => {
      try {
        const qRes = await getSeatsQuota()
        setQuota(qRes)
        setSeatsSlider(qRes.maxSeats)
        setAdminSeatsInput(qRes.maxSeats.toString())

        const mdRes = await getMailDomain()
        if (mdRes) {
          setMailDomain(mdRes)
          setDomainName(mdRes.domainName)
          setSenderEmail(mdRes.senderEmail)
        }
      } catch (err) {
        showToast('Failed to load profile data', 'error')
      }
    })
  }

  useEffect(() => {
    loadData()
  }, [])

  // Calculate Tiered Billing Seats Pricing
  // first 100 are $10, above 100 are $8
  const calculateCost = (seats: number) => {
    if (seats <= 100) {
      return seats * 10
    }
    return (100 * 10) + ((seats - 100) * 8)
  }

  const monthlyCost = calculateCost(seatsSlider)

  // Actions: Purchase Upgrade Seats
  const handlePurchaseSeats = async () => {
    try {
      await updateSeatsQuota(seatsSlider)
      showToast(`Successfully upgraded your capacity to ${seatsSlider} Listener Seats!`, 'success')
      loadData()
    } catch (err: any) {
      showToast(err.message || 'Failed to update seats', 'error')
    }
  }

  // Actions: Super Admin Override limit manually
  const handleAdminSeatsOverride = async (e: React.FormEvent) => {
    e.preventDefault()
    const parsed = parseInt(adminSeatsInput)
    if (isNaN(parsed) || parsed < 0) {
      showToast('Please enter a valid seats number', 'error')
      return
    }
    try {
      await updateSeatsQuota(parsed)
      showToast(`Super Admin: Overrode account seats limit to ${parsed}`, 'success')
      loadData()
    } catch (err: any) {
      showToast(err.message || 'Failed to override seats limit', 'error')
    }
  }

  // Actions: Save Mail Domain Config
  const handleSaveDomain = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!domainName.trim() || !senderEmail.trim()) {
      showToast('Domain name and sender address are required', 'error')
      return
    }
    try {
      await saveMailDomain(domainName, senderEmail)
      showToast(`Custom Onboarding domain ${domainName} successfully verified and confirmed!`, 'success')
      loadData()
    } catch (err: any) {
      showToast(err.message || 'Failed to verify domain', 'error')
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.leftCol}>
        {/* Personal info */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Personal Information</h2>
          <form className={styles.form} onSubmit={(e) => { e.preventDefault(); showToast('Personal info saved!', 'success') }}>
            <div className={styles.formGroup}>
              <label>Full Name</label>
              <input type="text" defaultValue={user?.name ?? ''} />
            </div>
            <div className={styles.formGroup}>
              <label>Email</label>
              <input type="email" defaultValue={user?.email ?? ''} disabled />
            </div>
            <div className={styles.formGroup}>
              <label>Phone Number</label>
              <input type="text" placeholder="Enter your phone number" defaultValue="+380 50 123 4567" />
            </div>
            <div className={styles.formGroup}>
              <label>Company</label>
              <input type="text" defaultValue={user?.company ?? ''} />
            </div>
            <div className={styles.formGroup}>
              <label>Country</label>
              <input type="text" placeholder="e.g. Poland" defaultValue="Poland" />
            </div>
            <div className={styles.formGroup}>
              <label>Company Role</label>
              <input type="text" placeholder="Enter your role" defaultValue="Product Owner" />
            </div>

            <div className={styles.actions}>
              <button type="button" className={styles.passwordBtn}>Change password</button>
              <button type="submit" className={styles.saveBtn}>Save changes</button>
            </div>
          </form>
        </div>

        {/* Presenter Seats billing calculator */}
        <div className={styles.card} id="billing-seats" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
            <Users size={20} style={{ color: 'var(--primary)' }} />
            <h2 className={styles.cardTitle} style={{ marginBottom: 0 }}>Listener Seats Plan &amp; Billing</h2>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#6b7280', lineHeight: '1.5', marginBottom: '1.5rem' }}>
            Expand your onboarding capacity. Pay only for the maximum number of simultaneous Listeners who have active Enrollments (Pending/In Progress status).
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className={styles.formGroup} style={{ marginBottom: 0 }}>
              <label style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                <span>Select Target Listener Seats Capacity</span>
                <span style={{ color: 'var(--primary)', fontSize: '0.95rem' }}>{seatsSlider} Seats</span>
              </label>
              <input
                type="range"
                min="10"
                max="300"
                step="10"
                value={seatsSlider}
                onChange={(e) => setSeatsSlider(parseInt(e.target.value))}
                style={{ width: '100%', cursor: 'pointer', height: '6px', background: '#e2e8f0', borderRadius: '9999px' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                <span>10 Seats</span>
                <span>100 Seats</span>
                <span>200 Seats</span>
                <span>300 Seats</span>
              </div>
            </div>

            {/* Cost breakdown */}
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#475569', marginBottom: '0.4rem' }}>
                <span>Tier 1 (First 100 seats @ $10/ea)</span>
                <span>${seatsSlider <= 100 ? seatsSlider * 10 : 1000} / mo</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#475569', paddingBottom: '0.5rem', borderBottom: '1px solid #e2e8f0', marginBottom: '0.5rem' }}>
                <span>Tier 2 (Excess seats @ $8/ea)</span>
                <span>${seatsSlider <= 100 ? 0 : (seatsSlider - 100) * 8} / mo</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
                <span>Total Calculated Monthly Cost</span>
                <span style={{ color: 'var(--primary)' }}>${monthlyCost} USD</span>
              </div>
            </div>

            <button type="button" className={styles.planBtn} style={{ background: 'var(--primary)' }} onClick={handlePurchaseSeats}>
              <Sparkles size={16} style={{ display: 'inline', marginRight: '0.4rem', verticalAlign: 'middle' }} />
              Upgrade Seats &amp; Checkout Plan
            </button>
          </div>
        </div>
      </div>

      <div className={styles.rightCol}>
        {/* Photo info */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Profile Photo</h2>
          <div className={styles.photoContainer}>
            <div className={styles.avatarLarge}>{user?.avatarInitial ?? 'U'}</div>
            <button className={styles.photoBtn}>Change profile photo</button>
          </div>
        </div>

        {/* Custom Mail Domain Setup */}
        <div className={styles.card}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
            <Mail size={18} style={{ color: 'var(--sara-purple)' }} />
            <h2 className={styles.cardTitle} style={{ marginBottom: 0 }}>Onboarding Custom Domain</h2>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#6b7280', lineHeight: '1.4', marginBottom: '1rem' }}>
            Configure your corporate email sender to deliver invites and reminder notifications using your own custom verified domain name.
          </p>

          <form onSubmit={handleSaveDomain} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div className={styles.formGroup} style={{ marginBottom: 0 }}>
              <label style={{ fontSize: '0.75rem', marginBottom: '4px' }}>Corporate Domain Name</label>
              <input
                type="text"
                placeholder="acme.com"
                value={domainName}
                onChange={(e) => setDomainName(e.target.value)}
                style={{ padding: '8px 10px', fontSize: '0.8rem' }}
              />
            </div>
            <div className={styles.formGroup} style={{ marginBottom: 0 }}>
              <label style={{ fontSize: '0.75rem', marginBottom: '4px' }}>Sender Email Address</label>
              <input
                type="email"
                placeholder="onboarding@acme.com"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                style={{ padding: '8px 10px', fontSize: '0.8rem' }}
              />
            </div>

            {mailDomain && mailDomain.isConfirmed ? (
              <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', color: '#166534', fontSize: '0.75rem', fontWeight: 600, background: '#f0fdf4', padding: '6px', borderRadius: '4px' }}>
                <ShieldCheck size={14} /> Domain Verified &amp; Confirmed
              </div>
            ) : (
              <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>Verification DNS records will be generated upon save</span>
            )}

            <button type="submit" className={styles.photoBtn} style={{ borderColor: 'var(--sara-purple)', color: 'var(--sara-purple)' }}>
              Confirm &amp; Verify Domain
            </button>
          </form>
        </div>

        {/* Super Admin Control Panel override limit manually */}
        <div className={styles.card} style={{ backgroundColor: '#fff7ed', borderColor: '#ffedd5' }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
            <ShieldCheck size={18} style={{ color: '#ea580c' }} />
            <h2 className={styles.cardTitle} style={{ marginBottom: 0, color: '#9a3412' }}>Super Admin Settings</h2>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#c2410c', lineHeight: '1.4', marginBottom: '1rem' }}>
            Direct manual seats override control. Force adjust quota limits to verify active seat constraints instantly.
          </p>

          <form onSubmit={handleAdminSeatsOverride} style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="number"
              value={adminSeatsInput}
              onChange={(e) => setAdminSeatsInput(e.target.value)}
              style={{ flex: 1, padding: '8px', border: '1px solid #fed7aa', borderRadius: '6px', fontSize: '0.8rem', background: '#fff' }}
              placeholder="Seats limit"
            />
            <button type="submit" className={styles.saveBtn} style={{ backgroundColor: '#ea580c', fontSize: '0.75rem', padding: '8px 12px' }}>
              Set Quota
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
