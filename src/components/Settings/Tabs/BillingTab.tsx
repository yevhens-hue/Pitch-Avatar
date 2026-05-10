'use client'

import React, { useState, useCallback } from 'react'
import {
  CreditCard, FileText, ExternalLink, Download,
  Users, Presentation, Coins, Link as LinkIcon,
  MessageSquare, ChevronDown, Calendar, AlertCircle,
  FileDown, ShoppingCart,
} from 'lucide-react'
import styles from '../Settings.module.css'
import PricingTable from '../../Pricing/PricingTable'
import { useBillingData, PAYPRO_CHANGE_CARD_URL, PAYPRO_BILLING_INFO_URL } from '@/hooks/useBillingData'
import type { UsageStat, ActiveCard } from '@/hooks/useBillingData'

const PAGE_SIZE = 4

// ── Card brand logo ───────────────────────────────────────────────────────────
function CardBrandIcon({ brand }: { brand: ActiveCard['brand'] }) {
  const colors: Record<string, string> = {
    Visa: '#1a1f71', Mastercard: '#eb001b', Amex: '#007bc1', Unknown: '#64748b',
  }
  return (
    <span className={styles.cardBrandIcon} style={{ color: colors[brand] ?? '#64748b' }}>
      {brand === 'Visa'       && 'VISA'}
      {brand === 'Mastercard' && 'MC'}
      {brand === 'Amex'       && 'AMEX'}
      {brand === 'Unknown'    && '💳'}
    </span>
  )
}

// ── Usage progress bar ────────────────────────────────────────────────────────
function UsageBar({
  stat,
  addonHref,
}: {
  stat: UsageStat
  addonHref?: string
}) {
  if (stat.limit === -1) return <span className={styles.usageUnlimited}>Unlimited</span>
  const pct = Math.min((stat.used / stat.limit) * 100, 100)
  const isWarning = pct >= 70
  return (
    <div className={styles.usageWrap}>
      <span className={`${styles.usageLabel} ${isWarning ? styles.usageLabelWarn : ''}`}>
        {stat.used} / {stat.limit}
      </span>
      <div className={styles.usageTrack}>
        <div
          className={`${styles.usageFill} ${isWarning ? styles.usageFillWarn : ''}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {isWarning && addonHref && (
        <a href={addonHref} className={styles.buyMoreLink} title="Buy additional quota">
          <ShoppingCart size={11} /> Buy more
        </a>
      )}
    </div>
  )
}

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status, label }: { status: string; label: string }) {
  const cls =
    status === 'success' ? styles.statusSuccess :
    status === 'refund'  ? styles.statusRefund  :
    status === 'pending' ? styles.statusPending :
    styles.statusFailed
  return <span className={`${styles.statusBadge} ${cls}`}>{label}</span>
}

// ── CSV export ────────────────────────────────────────────────────────────────
function exportCsv(history: ReturnType<typeof useBillingData>['data']['history']) {
  const header = ['Invoice ID', 'Date', 'Description', 'Amount', 'Status']
  const rows   = history.map(r => [r.id, r.date, r.description, r.amount, r.statusLabel])
  const csv    = [header, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n')
  const blob   = new Blob([csv], { type: 'text/csv' })
  const url    = URL.createObjectURL(blob)
  const a      = document.createElement('a')
  a.href       = url
  a.download   = 'payment-history.csv'
  a.click()
  URL.revokeObjectURL(url)
}

// ── Main component ────────────────────────────────────────────────────────────
export default function BillingTab() {
  const [isAnnual, setIsAnnual]       = useState(false)
  const [historyPage, setHistoryPage] = useState(1)
  const { data, isLoading }           = useBillingData()
  const handleExportCsv               = useCallback(() => exportCsv(data.history), [data.history])

  if (isLoading) {
    return <div className={styles.loadingState}>Loading billing data…</div>
  }

  const { nextPayment, activeCard, currentPlan, usage, history } = data
  const visibleHistory = history.slice(0, historyPage * PAGE_SIZE)
  const hasMore        = visibleHistory.length < history.length

  // Addon section anchor
  const avatarAddonHref  = '#avatar-minutes-addons'
  const chatAddonHref    = '#avatar-minutes-addons' // same section for now

  return (
    <div>

      {/* ── 1. HERO ── */}
      <div className={styles.heroCard}>
        <div className={styles.heroLeft}>
          <div className={styles.heroHeadline}>Payment Management</div>

          {/* Next charge */}
          <div className={styles.heroMeta}>
            <Calendar size={14} />
            Next payment:&nbsp;<strong>{nextPayment.date}</strong>
            &nbsp;·&nbsp;
            <span className={styles.heroAmount}>{nextPayment.amount}</span>
            &nbsp;·&nbsp;{nextPayment.plan}
          </div>

          {/* Active card mask */}
          {activeCard && (
            <div className={styles.cardChip}>
              <CardBrandIcon brand={activeCard.brand} />
              <span className={styles.cardMask}>•••• •••• •••• {activeCard.last4}</span>
              <span className={styles.cardExp}>
                {String(activeCard.expMonth).padStart(2, '0')}/{String(activeCard.expYear).slice(-2)}
              </span>
            </div>
          )}
        </div>

        <div className={styles.heroButtons}>
          <a
            href={PAYPRO_CHANGE_CARD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.heroBtnPrimary}
          >
            <CreditCard size={18} />
            Update Card
          </a>
          <a
            href={PAYPRO_BILLING_INFO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.heroBtnSecondary}
          >
            <FileText size={18} />
            Billing Details
          </a>
        </div>
      </div>

      {/* ── 2. Current plan + usage ── */}
      <div className={styles.myPlanCard}>
        <div className={styles.planHeader}>
          <div>
            <div className={styles.planName}>{currentPlan.name}</div>
            <div className={styles.planPrice}>{currentPlan.price}</div>
            <div className={styles.planSubtitle}>
              per month · {currentPlan.billingCycle === 'annual' ? 'billed annually' : 'billed monthly'}
            </div>
          </div>
          <button
            className={styles.planBtn}
            onClick={() => document.getElementById('account-plans')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Change Plan <ExternalLink size={15} />
          </button>
        </div>

        <div className={styles.planFeatures}>
          {[
            { Icon: Users,         label: 'Team Seats',          stat: usage.seats,         addonHref: undefined       },
            { Icon: Presentation,  label: 'Presentations',       stat: usage.presentations, addonHref: undefined       },
            { Icon: Coins,         label: 'AI Avatar Minutes',   stat: usage.avatarMinutes, addonHref: avatarAddonHref },
            { Icon: LinkIcon,      label: 'Monthly Links',       stat: usage.monthlyLinks,  addonHref: undefined       },
            { Icon: MessageSquare, label: 'Chat Avatar Minutes', stat: usage.chatMinutes,   addonHref: chatAddonHref   },
          ].map(({ Icon, label, stat, addonHref }) => (
            <div key={label} className={styles.featureRow}>
              <div className={styles.featureLabel}>
                <Icon size={16} color="#64748b" /> {label}
              </div>
              <UsageBar stat={stat} addonHref={addonHref} />
            </div>
          ))}
        </div>
      </div>

      {/* ── 3. Payment history ── */}
      <div className={styles.historyHeader}>
        <h2 className={styles.sectionTitle} style={{ marginBottom: 0 }}>
          Payment History &amp; Invoices
        </h2>
        {history.length > 0 && (
          <button className={styles.exportCsvBtn} onClick={handleExportCsv}>
            <FileDown size={15} /> Export CSV
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className={styles.emptyState}>
          <AlertCircle size={32} color="#94a3b8" />
          <p>Payment history is empty</p>
        </div>
      ) : (
        <>
          <div className={styles.historyTableWrapper}>
            <table className={styles.historyTable}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Invoice</th>
                </tr>
              </thead>
              <tbody>
                {visibleHistory.map(item => (
                  <tr key={item.id}>
                    <td className={styles.historyDateCell}>{item.date}</td>
                    <td>{item.description}</td>
                    <td className={styles.historyAmountCell}>{item.amount}</td>
                    <td><StatusBadge status={item.status} label={item.statusLabel} /></td>
                    <td>
                      {item.invoiceUrl ? (
                        <a
                          href={item.invoiceUrl}
                          className={styles.downloadLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Download PDF invoice"
                        >
                          <Download size={15} /> PDF
                        </a>
                      ) : (
                        <span className={styles.noInvoice}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {hasMore && (
            <button className={styles.loadMoreBtn} onClick={() => setHistoryPage(p => p + 1)}>
              <ChevronDown size={16} /> Load More ({history.length - visibleHistory.length})
            </button>
          )}
        </>
      )}

      {/* ── 4. Pricing plans ── */}
      <div className={styles.pricingHeader} id="account-plans" style={{ marginTop: '3rem' }}>
        <h2 className={styles.sectionTitle} style={{ marginBottom: 0 }}>Account Plans</h2>
        <div className={styles.pricingToggle}>
          <button className={`${styles.toggleBtn} ${!isAnnual ? styles.active : ''}`} onClick={() => setIsAnnual(false)}>
            Billed Monthly
          </button>
          <button className={`${styles.toggleBtn} ${isAnnual ? styles.active : ''}`} onClick={() => setIsAnnual(true)}>
            Billed Annually
          </button>
        </div>
      </div>
      <PricingTable isAnnual={isAnnual} currentPlan={currentPlan.name} />

      {/* ── 5. AI avatar minutes add-ons ── */}
      <h2 className={styles.sectionTitle} style={{ marginTop: '3rem' }} id="avatar-minutes-addons">
        AI Avatar Minutes
      </h2>
      <div className={styles.addonsGrid}>
        {[
          { label: '10 minutes',  price: '$12.00',  productId: null },
          { label: '25 minutes',  price: '$29.00',  productId: null },
          { label: '50 minutes',  price: '$59.00',  productId: null },
          { label: '100 minutes', price: '$109.00', productId: '106783' },
        ].map(({ label, price, productId }) => (
          <div key={label} className={styles.addonCard}>
            <div className={styles.addonTitle}>{label}</div>
            <div className={styles.addonPrice}>{price}</div>
            {productId ? (
              <a
                href={`https://store.payproglobal.com/checkout?products[1][id]=${productId}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.planColBtn} ${styles.btnPrimary}`}
                style={{ textDecoration: 'none', display: 'block', textAlign: 'center' }}
              >
                Buy Now
              </a>
            ) : (
              <button className={`${styles.planColBtn} ${styles.btnPrimary}`} disabled>
                Coming Soon
              </button>
            )}
          </div>
        ))}
      </div>

    </div>
  )
}
