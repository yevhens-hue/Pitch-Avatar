import React, { useState } from 'react'
import { Check, X, ChevronDown, ChevronUp } from 'lucide-react'
import styles from './Pricing.module.css'
import EnterpriseRequestModal from '../Settings/Tabs/EnterpriseRequestModal'

const CATEGORIES = [
  {
    name: 'Key Metrics',
    rows: [
      { label: 'Number of account users', values: ['1', '5', 'Custom'] },
      { label: 'Number of uploaded presentations', values: ['10', '100', 'Unlimited'] },
      { label: 'Number of subtitled or dubbed videos', values: ['20 (up to 10 mins each)', '50 (up to 30 mins each)', 'Unlimited (up to 60 mins each)'] },
      { label: 'Number of AI Chat avatars', values: ['5', '20', 'Unlimited'] },
      { label: 'AI Avatar Minutes', values: ['20 minutes', '50 minutes', 'Custom'] },
    ]
  },
  {
    name: 'General Features',
    rows: [
      { label: 'AI script generation and translation assistant', values: [true, true, true] },
      { label: 'Download presentations or videos per month', values: ['50', '500', 'Unlimited'] },
      { label: 'Basic Support', values: [true, true, 'Personal Manager'] },
      { label: 'AI Voice Library in 100+ languages', values: [true, true, true] },
      { label: 'Voice cloning', values: ['1', '5', 'Custom'] },
      { label: 'AI Avatar Library 20+', values: [true, true, true] },
      { label: 'Custom AI Avatar from photo', values: [true, true, true] },
      { label: 'Links created per month', values: ['200', '2000', 'Custom'] },
    ]
  },
  {
    name: 'CHAT AVATAR',
    rows: [
      { label: 'Number of Chat avatars per month', values: ['5', '20', 'Unlimited'] },
      { label: 'Smart voice recognition in chat', values: [true, true, true] },
      { label: 'Multilingual sessions', values: [true, true, true] },
      { label: 'Custom instructions for chat avatar', values: [true, true, true] },
      { label: 'Chat Avatar session analytics', values: [true, true, true] },
      { label: 'Built-in roles and behavior', values: [true, true, true] },
      { label: 'Custom role creation', values: ['DIY', 'DIY', 'We configure everything for you'] },
      { label: 'Avatar self-learning (Coming Soon)', values: [true, true, true] },
    ]
  },
  {
    name: 'Integration',
    rows: [
      { label: 'Salesforce Integration', values: [false, true, true] },
      { label: 'Hubspot Integration', values: [false, true, true] },
      { label: 'Slack Integration', values: [true, true, true] },
      { label: 'Microsoft PowerPoint Integration', values: [true, true, true] },
    ]
  }
]

const PLANS = [
  {
    key: 'Professional',
    price: { monthly: '29',  annual: '290' },
    subtitle: 'Marketing and sales',
  },
  {
    key: 'Business',
    price: { monthly: '79',  annual: '790' },
    subtitle: 'Teams up to 5 users',
  },
  {
    key: 'Enterprise',
    price: null,
    subtitle: 'Custom plan',
  },
] as const

const PLAN_ORDER = ['Professional', 'Business', 'Enterprise']

function PlanButton({
  planKey,
  currentPlan,
  styles,
  onEnterprise,
}: {
  planKey: string
  currentPlan?: string
  styles: Record<string, string>
  onEnterprise: () => void
}) {
  if (planKey === 'Enterprise') {
    return (
      <button className={`${styles.planColBtn} ${styles.btnDark}`} onClick={onEnterprise}>
        Contact Sales
      </button>
    )
  }
  if (planKey === currentPlan) {
    return (
      <button className={`${styles.planColBtn} ${styles.btnCurrent}`} disabled>
        ✓ Current Plan
      </button>
    )
  }
  const currentIdx = PLAN_ORDER.indexOf(currentPlan ?? '')
  const planIdx    = PLAN_ORDER.indexOf(planKey)
  const isUpgrade  = currentIdx < planIdx
  return (
    <button className={`${styles.planColBtn} ${isUpgrade ? styles.btnPrimary : styles.btnOutline}`}>
      {isUpgrade ? `Upgrade to ${planKey} →` : `Downgrade to ${planKey}`}
    </button>
  )
}

export default function PricingTable({
  isAnnual,
  currentPlan = 'Professional',
}: {
  isAnnual: boolean
  currentPlan?: string
}) {
  const [showAll, setShowAll] = useState(false)
  const [isEnterpriseModalOpen, setIsEnterpriseModalOpen] = useState(false)

  return (
    <>
    <div className={styles.tableContainer}>
      <div className={styles.tableHeader}>
        <div className={styles.headerCol}></div>
        {PLANS.map(plan => (
          <div key={plan.key} className={`${styles.headerCol} ${plan.key === currentPlan ? styles.headerColActive : ''}`}>
            {plan.key === currentPlan && <div className={styles.currentBadge}>Current Plan</div>}
            <div className={styles.planName}>{plan.key}</div>
            <div className={styles.planPrice}>
              {plan.price
                ? `$${isAnnual ? plan.price.annual : plan.price.monthly}/mo`
                : <span style={{ color: '#0066ff', fontSize: '0.9rem' }}>Custom</span>}
            </div>
            <div className={styles.planSubtitle}>{plan.subtitle}</div>
            <PlanButton
              planKey={plan.key}
              currentPlan={currentPlan}
              styles={styles}
              onEnterprise={() => setIsEnterpriseModalOpen(true)}
            />
          </div>
        ))}
      </div>

      {(showAll ? CATEGORIES : CATEGORIES.slice(0, 1)).map((cat, idx) => (
        <div key={idx} className={styles.category}>
          <div className={styles.categoryName}>{cat.name}</div>
          {cat.rows.map((row, rIdx) => (
            <div key={rIdx} className={styles.tableRow}>
              <div className={styles.rowLabel}>{row.label}</div>
              {row.values.map((val, vIdx) => (
                <div key={vIdx} className={styles.rowValue}>
                  {typeof val === 'boolean' ? (
                    val ? <Check size={20} color="#2563eb" /> : <X size={20} color="#94a3b8" />
                  ) : val}
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}

      <button className={styles.showMoreBtn} onClick={() => setShowAll(!showAll)}>
        {showAll ? (
          <>Show less <ChevronUp size={18} /></>
        ) : (
          <>Show all features <ChevronDown size={18} /></>
        )}
      </button>
    </div>
    
    <EnterpriseRequestModal 
      isOpen={isEnterpriseModalOpen} 
      onClose={() => setIsEnterpriseModalOpen(false)} 
    />
    </>
  )
}
