'use client'

import React, { useState, useCallback } from 'react'
import Link from 'next/link'
import {
  CreditCard, FileText, ExternalLink, Download,
  Users, Presentation, Coins, Link as LinkIcon,
  MessageSquare, ChevronDown, Calendar, AlertCircle,
  FileDown, ShoppingCart, Clock, Receipt,
} from 'lucide-react'
import styles from '../Settings.module.css'
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
  const [historyPage, setHistoryPage] = useState(1)
  const { data, isLoading }           = useBillingData()
  const handleExportCsv               = useCallback(() => exportCsv(data.history), [data.history])

  if (isLoading) {
    return <div className={styles.loadingState}>Loading billing data…</div>
  }

  const { isTrial, trialEndsAt, trialConvertsTo, nextPayment, activeCard, currentPlan, usage, history } = data
  const visibleHistory = history.slice(0, historyPage * PAGE_SIZE)
  const hasMore        = visibleHistory.length < history.length

  // Format trial end date nicely, e.g. "27 Jun 2026"
  const trialEndLabel = trialEndsAt
    ? new Date(trialEndsAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : null

  // "Buy more" links go to the dedicated /plans page
  const avatarAddonHref = '/plans#avatar-minutes-addons'
  const chatAddonHref   = '/plans#avatar-minutes-addons'

  return (
    <div>

      {/* ── 1. HERO ── */}
      <div className={`${styles.heroCard} ${isTrial ? styles.heroCardTrial : ''}`}>
        <div className={styles.heroLeft}>
          <div className={styles.heroHeadline}>
            {isTrial ? 'Free Trial Active' : 'Payment Management'}
          </div>

          {isTrial ? (
            <div className={styles.heroMeta}>
              <Clock size={14} />
              Trial ends:&nbsp;<strong>{trialEndLabel}</strong>
              {trialConvertsTo && (
                <>&nbsp;·&nbsp;converts to&nbsp;<span className={styles.heroAmount}>{trialConvertsTo}</span></>
              )}
            </div>
          ) : (
            <div className={styles.heroMeta}>
              <Calendar size={14} />
              Next payment:&nbsp;<strong>{nextPayment.date}</strong>
              &nbsp;·&nbsp;
              <span className={styles.heroAmount}>{nextPayment.amount}</span>
              &nbsp;·&nbsp;{nextPayment.plan}
            </div>
          )}

          {/* Active card mask — shown in both states to reassure user their card is saved */}
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
          {isTrial ? (
            <Link href="/plans" className={styles.heroBtnSecondary}>
              <ExternalLink size={18} />
              View Plans
            </Link>
          ) : (
            <a
              href={PAYPRO_BILLING_INFO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.heroBtnSecondary}
            >
              <FileText size={18} />
              Billing Details
            </a>
          )}
        </div>
      </div>

      {/* ── 2. Current plan + usage ── */}
      <div className={styles.myPlanCard}>
        <div className={styles.planHeader}>
          <div>
            <div className={styles.planName}>
              {currentPlan.name}
              {isTrial && <span className={styles.trialBadge}>TRIAL</span>}
            </div>
            <div className={styles.planPrice}>{isTrial ? 'Free' : currentPlan.price}</div>
            <div className={styles.planSubtitle}>
              {isTrial
                ? `Trial plan · ends ${trialEndLabel}`
                : `per month · ${currentPlan.billingCycle === 'annual' ? 'billed annually' : 'billed monthly'}`}
            </div>
          </div>
          <Link href="/plans" className={`${styles.planBtn} ${isTrial ? styles.planBtnUpgrade : ''}`}>
            {isTrial ? <>Upgrade Now <ExternalLink size={15} /></> : <>Change Plan <ExternalLink size={15} /></>}
          </Link>
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
          {isTrial ? (
            <>
              <Receipt size={36} color="#94a3b8" />
              <p style={{ fontWeight: 600, marginBottom: 4 }}>No invoices yet</p>
              <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: 0 }}>
                Your first invoice will appear here after your trial ends
                {trialEndLabel ? ` on ${trialEndLabel}` : ''}.
              </p>
            </>
          ) : (
            <>
              <AlertCircle size={32} color="#94a3b8" />
              <p>Payment history is empty</p>
            </>
          )}
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

    </div>
  )
}
