'use client'

import React, { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import {
  CreditCard, FileText, ExternalLink, Download,
  Users, Presentation, Coins, Link as LinkIcon,
  MessageSquare, ChevronDown, Calendar, AlertCircle,
  FileDown, ShoppingCart, Clock, Receipt, Minus, Plus, CheckCircle2
} from 'lucide-react'
import styles from '../Settings.module.css'
import { useBillingData, PAYPRO_CHANGE_CARD_URL, PAYPRO_BILLING_INFO_URL } from '@/hooks/useBillingData'
import type { UsageStat, ActiveCard } from '@/hooks/useBillingData'
import { useUIStore } from '@/lib/store'
import { useSeatsQuota } from '@/hooks/useSeatsQuota'
import PaymentFallbackModal from '@/components/Modals/PaymentFallbackModal'
import { useToast } from '@/components/ui/ToastProvider'

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
  const [isFallbackOpen, setIsFallbackOpen] = useState(false)
  const [fallbackReason, setFallbackReason] = useState('Update Card Details')
  
  const { showToast } = useToast()
  
  // Enrollment Seats Quota — live from Supabase via shared hook
  const { activeCount: seatsUsed, maxSeats: seatsMax, refresh: refreshQuota, upgrade: upgradeQuota } = useSeatsQuota()
  
  // Enrollments Quota Upgrade States
  const [quotaToBuy, setQuotaToBuy] = useState(10)
  const [isCheckoutMock, setIsCheckoutMock] = useState(false)

  // Price calculation: $10 for first 100, $8 for seats beyond 100 in this purchase.
  const quotaPrice = quotaToBuy <= 100 ? quotaToBuy * 10 : (100 * 10) + ((quotaToBuy - 100) * 8)

  const isBillingTrial                = useUIStore((state) => state.isBillingTrial)
  const isFutureVersion               = useUIStore((state) => state.isFutureVersion)
  const { data, isLoading }           = useBillingData(isBillingTrial)
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
          <button
            type="button"
            className={styles.heroBtnPrimary}
            onClick={() => {
              setFallbackReason('Update Card Details')
              setIsFallbackOpen(true)
            }}
          >
            <CreditCard size={18} />
            Update Card
          </button>
          {isTrial ? (
            <Link href="/plans" className={styles.heroBtnSecondary}>
              <ExternalLink size={18} />
              View Plans
            </Link>
          ) : (
            <button
              type="button"
              className={styles.heroBtnSecondary}
              onClick={() => {
                setFallbackReason('Update Card Details')
                setIsFallbackOpen(true)
              }}
            >
              <FileText size={18} />
              Billing Details
            </button>
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
            { Icon: Users,         label: 'Listeners with Enrollments', stat: { used: seatsUsed, limit: seatsMax }, addonHref: '/plans#listener-seats-addons' },
            { Icon: Presentation,  label: 'Presentations',       stat: usage.presentations, addonHref: undefined       },
            { Icon: Coins,         label: 'AI Avatar Minutes',   stat: usage.avatarMinutes, addonHref: avatarAddonHref },
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

      {/* ── 2.5 Upgrade Enrollments Quota ── */}
      {isFutureVersion && (
        <div className={styles.myPlanCard} style={{ marginTop: '24px' }}>
          <div className={styles.planHeader} style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '16px' }}>
          <div>
            <div className={styles.planName}>Buy More Enrollments Quota</div>
            <div className={styles.planSubtitle}>Purchase additional capacity for Listeners with Enrollments.</div>
          </div>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '14px', color: '#475569', fontWeight: 500 }}>
              How many extra seats do you need?
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button 
                onClick={() => setQuotaToBuy(Math.max(10, quotaToBuy - 10))}
                style={{ padding: '6px', borderRadius: '6px', background: '#f1f5f9', color: '#475569' }}
              >
                <Minus size={16} />
              </button>
              <input 
                type="number"
                value={quotaToBuy}
                onChange={e => setQuotaToBuy(Math.max(1, parseInt(e.target.value) || 0))}
                style={{ width: '80px', textAlign: 'center', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
              />
              <button 
                onClick={() => setQuotaToBuy(quotaToBuy + 10)}
                style={{ padding: '6px', borderRadius: '6px', background: '#f1f5f9', color: '#475569' }}
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#64748b', fontSize: '14px' }}>Price per seat</span>
              <span style={{ fontWeight: 500, color: '#0f172a' }}>
                ${quotaToBuy <= 100 ? '10.00' : '8.00'} / mo
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px dashed #cbd5e1' }}>
              <span style={{ fontWeight: 600, color: '#0f172a' }}>Total billed monthly</span>
              <span style={{ fontWeight: 700, color: '#2563eb', fontSize: '18px' }}>${quotaPrice.toFixed(2)}</span>
            </div>
            {quotaToBuy <= 100 && (
              <div style={{ fontSize: '12px', color: '#10b981', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={12} /> Add {101 - quotaToBuy} more to unlock volume discount ($8/seat)
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button
              onClick={async () => {
                setIsCheckoutMock(true)
                try {
                  // Wait 1s to simulate checkout
                  await new Promise(r => setTimeout(r, 1000))
                  
                  // Update real DB and refresh shared quota store
                  const newMax = await upgradeQuota(quotaToBuy, true)
                  
                  showToast(`Success! Charged $${quotaPrice} for ${quotaToBuy} seats. New limit: ${newMax}.`, 'success')
                } catch (err: any) {
                  showToast(err.message || 'Failed to update seats', 'error')
                } finally {
                  setIsCheckoutMock(false)
                }
              }}
              disabled={isCheckoutMock || quotaToBuy < 1}
              style={{
                background: '#2563eb', color: 'white', padding: '10px 20px', borderRadius: '6px', 
                fontWeight: 500, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px',
                opacity: (isCheckoutMock || quotaToBuy < 1) ? 0.7 : 1
              }}
            >
              {isCheckoutMock ? 'Processing...' : 'Proceed to Checkout'}
            </button>
          </div>
        </div>
      </div>

      )}
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

      {/* Payment System Maintenance Fallback Modal */}
      <PaymentFallbackModal
        isOpen={isFallbackOpen}
        onClose={() => setIsFallbackOpen(false)}
        initialReason={fallbackReason}
      />

    </div>
  )
}
