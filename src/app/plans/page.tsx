'use client'

import React, { useState, useRef } from 'react'
import Link from 'next/link'
import { ArrowLeft, Users } from 'lucide-react'
import PricingTable from '@/components/Pricing/PricingTable'
import { useBillingData } from '@/hooks/useBillingData'
import { useSeatsQuota } from '@/hooks/useSeatsQuota'
import { useToast } from '@/components/ui/ToastProvider'
import PaymentFallbackModal from '@/components/Modals/PaymentFallbackModal'
import styles from './Plans.module.css'

export default function PlansPage() {
  const [isAnnual, setIsAnnual]   = useState(false)
  const [isFallbackOpen, setIsFallbackOpen] = useState(false)
  const [fallbackReason, setFallbackReason] = useState('Upgrade Plan')
  const { data }                  = useBillingData()
  const { activeCount, maxSeats, upgrade: upgradeQuota } = useSeatsQuota()
  const { showToast }             = useToast()
  const seatsInputRef             = useRef<HTMLInputElement>(null)
  const [seatsQty, setSeatsQty]   = useState(10)
  const [isCheckout, setIsCheckout] = useState(false)

  const handleSelectPlan = (planKey: string) => {
    setFallbackReason(`${planKey} Plan (${isAnnual ? 'Annual' : 'Monthly'})`)
    setIsFallbackOpen(true)
  }

  return (
    <div className={styles.page}>

      {/* Back link */}
      <Link href="/settings" className={styles.back}>
        <ArrowLeft size={16} /> Back to Settings
      </Link>

      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Plans &amp; Pricing</h1>
        <p className={styles.subtitle}>
          Choose the plan that fits your team. Upgrade or downgrade at any time.
        </p>

        {/* Monthly / Annual toggle */}
        <div className={styles.toggle}>
          <button
            className={`${styles.toggleBtn} ${!isAnnual ? styles.toggleActive : ''}`}
            onClick={() => setIsAnnual(false)}
          >
            Billed Monthly
          </button>
          <button
            className={`${styles.toggleBtn} ${isAnnual ? styles.toggleActive : ''}`}
            onClick={() => setIsAnnual(true)}
          >
            Billed Annually
            <span className={styles.savingsBadge}>Save ~17%</span>
          </button>
        </div>
      </div>

      {/* Pricing table (full width) */}
      <PricingTable
        isAnnual={isAnnual}
        currentPlan={data.currentPlan.name}
        onSelectPlan={handleSelectPlan}
      />

      {/* AI Avatar minutes add-ons */}
      <div className={styles.addonsSection} id="avatar-minutes-addons">
        <h2 className={styles.addonsTitle}>Need more AI Avatar minutes?</h2>
        <p className={styles.addonsDesc}>
          Top up anytime — minutes never expire within your billing period.
        </p>
        <div className={styles.addonsGrid}>
          {[
            { label: '10 minutes',  price: '$12.00',  priceNum: 12,  productId: null,     perMin: '$1.20' },
            { label: '25 minutes',  price: '$29.00',  priceNum: 29,  productId: null,     perMin: '$1.16' },
            { label: '50 minutes',  price: '$59.00',  priceNum: 59,  productId: null,     perMin: '$1.18' },
            { label: '100 minutes', price: '$109.00', priceNum: 109, productId: '106783', perMin: '$1.09 ✦ Best value' },
          ].map(({ label, price, productId, perMin }) => (
            <div key={label} className={styles.addonCard}>
              <div className={styles.addonMinutes}>{label}</div>
              <div className={styles.addonPrice}>{price}</div>
              <div className={styles.addonPerMin}>{perMin}</div>
              {productId ? (
                <button
                  onClick={() => {
                    setFallbackReason(`${label} Add-on`)
                    setIsFallbackOpen(true)
                  }}
                  className={styles.addonBtn}
                >
                  Buy Now
                </button>
              ) : (
                <button className={`${styles.addonBtn} ${styles.addonBtnDisabled}`} disabled>
                  Coming Soon
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Listener Seats add-on */}
      <div className={styles.addonsSection} style={{ marginTop: '2rem' }} id="listener-seats-addons">
        <h2 className={styles.addonsTitle}>Need more Listener Seats?</h2>
        <p className={styles.addonsDesc}>
          Increase your capacity to assign presentations to more listeners simultaneously.&nbsp;
          ($10/seat for up to 100 seats, $8/seat for more than 100 seats).
        </p>

        {/* Current usage readout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem', justifyContent: 'center' }}>
          <Users size={16} color="#64748b" />
          <span style={{ fontSize: '0.9rem', color: '#475569' }}>
            Currently using <strong>{activeCount}</strong> of <strong>{maxSeats}</strong> seats
          </span>
          {activeCount >= maxSeats && maxSeats > 0 && (
            <span style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fca5a5', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 600, padding: '2px 10px' }}>Limit reached</span>
          )}
        </div>

        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px', margin: '0 auto' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Quantity of seats to add</label>
            <input
              ref={seatsInputRef}
              type="number"
              min="1"
              value={seatsQty}
              onChange={e => setSeatsQty(Math.max(1, parseInt(e.target.value) || 1))}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
            <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Price:</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
              ${(seatsQty <= 100 ? seatsQty * 10 : 100 * 10 + (seatsQty - 100) * 8).toFixed(2)} / month
            </span>
          </div>
          <button
            onClick={async () => {
              setIsCheckout(true)
              try {
                await new Promise(r => setTimeout(r, 800))
                const newMax = await upgradeQuota(seatsQty, true)
                showToast(`✓ Added ${seatsQty} seats. New limit: ${newMax}`, 'success')
              } catch (err: any) {
                showToast(err?.message || 'Failed to update seats', 'error')
              } finally {
                setIsCheckout(false)
              }
            }}
            disabled={isCheckout || seatsQty < 1}
            className={styles.addonBtn}
            style={{ width: '100%', marginTop: '0.5rem', opacity: isCheckout ? 0.7 : 1 }}
          >
            {isCheckout ? 'Processing...' : `Buy ${seatsQty} Seats`}
          </button>
        </div>
      </div>

      {/* Payment System Maintenance Fallback Modal */}
      <PaymentFallbackModal
        isOpen={isFallbackOpen}
        onClose={() => setIsFallbackOpen(false)}
        initialReason={fallbackReason}
      />

    </div>
  )
}
