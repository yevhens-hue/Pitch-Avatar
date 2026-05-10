'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import PricingTable from '@/components/Pricing/PricingTable'
import { useBillingData } from '@/hooks/useBillingData'
import styles from './Plans.module.css'

export default function PlansPage() {
  const [isAnnual, setIsAnnual]   = useState(false)
  const { data }                  = useBillingData()

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
      <PricingTable isAnnual={isAnnual} currentPlan={data.currentPlan.name} />

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
                <a
                  href={`https://store.payproglobal.com/checkout?products[1][id]=${productId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.addonBtn}
                >
                  Buy Now
                </a>
              ) : (
                <button className={`${styles.addonBtn} ${styles.addonBtnDisabled}`} disabled>
                  Coming Soon
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
