'use client'

import React, { useState } from 'react'
import {
  CreditCard, FileText, ExternalLink, Download,
  Users, Presentation, Coins, Link as LinkIcon,
  MessageSquare, ChevronDown, Calendar, AlertCircle,
} from 'lucide-react'
import styles from '../Settings.module.css'
import PricingTable from '../../Pricing/PricingTable'
import { useBillingData, PAYPRO_CHANGE_CARD_URL, PAYPRO_BILLING_INFO_URL } from '@/hooks/useBillingData'
import type { UsageStat } from '@/hooks/useBillingData'

const PAGE_SIZE = 4

// ── Usage progress bar ────────────────────────────────────────────────────────
function UsageBar({ stat }: { stat: UsageStat }) {
  if (stat.limit === -1) return <span className={styles.usageUnlimited}>Безлимитный</span>
  const pct = Math.min((stat.used / stat.limit) * 100, 100)
  const isWarning = pct >= 80
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

// ── Main component ────────────────────────────────────────────────────────────
export default function BillingTab() {
  const [isAnnual, setIsAnnual]       = useState(false)
  const [historyPage, setHistoryPage] = useState(1)
  const { data, isLoading }           = useBillingData()

  if (isLoading) {
    return <div className={styles.loadingState}>Загрузка данных биллинга…</div>
  }

  const { nextPayment, currentPlan, usage, history } = data
  const visibleHistory = history.slice(0, historyPage * PAGE_SIZE)
  const hasMore        = visibleHistory.length < history.length

  return (
    <div>

      {/* ── 1. HERO: PayPro action buttons ─── PRIMARY FOCUS ── */}
      <div className={styles.heroCard}>
        <div className={styles.heroLeft}>
          <div className={styles.heroHeadline}>Управление оплатой</div>
          <div className={styles.heroMeta}>
            <Calendar size={14} />
            Следующий платёж:&nbsp;<strong>{nextPayment.date}</strong>
            &nbsp;·&nbsp;
            <span className={styles.heroAmount}>{nextPayment.amount}</span>
            &nbsp;·&nbsp;{nextPayment.plan}
          </div>
        </div>

        <div className={styles.heroButtons}>
          <a
            href={PAYPRO_CHANGE_CARD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.heroBtnPrimary}
          >
            <CreditCard size={18} />
            Изменить карту
          </a>
          <a
            href={PAYPRO_BILLING_INFO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.heroBtnSecondary}
          >
            <FileText size={18} />
            Billing данные
          </a>
        </div>
      </div>

      {/* ── 2. Current plan + usage ──────────────────────────────────────── */}
      <div className={styles.myPlanCard}>
        <div className={styles.planHeader}>
          <div>
            <div className={styles.planName}>{currentPlan.name}</div>
            <div className={styles.planPrice}>{currentPlan.price}</div>
            <div className={styles.planSubtitle}>в месяц · {currentPlan.billingCycle === 'annual' ? 'годовая оплата' : 'ежемесячная оплата'}</div>
          </div>
          <button
            className={styles.planBtn}
            onClick={() => document.getElementById('account-plans')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Сменить тариф <ExternalLink size={15} />
          </button>
        </div>

        <div className={styles.planFeatures}>
          {[
            { Icon: Users,         label: 'Места в команде',      stat: usage.seats          },
            { Icon: Presentation,  label: 'Презентации',           stat: usage.presentations  },
            { Icon: Coins,         label: 'Минуты AI аватара',     stat: usage.avatarMinutes  },
            { Icon: LinkIcon,      label: 'Ежемесячные ссылки',    stat: usage.monthlyLinks   },
            { Icon: MessageSquare, label: 'Минуты чат-аватара',    stat: usage.chatMinutes    },
          ].map(({ Icon, label, stat }) => (
            <div key={label} className={styles.featureRow}>
              <div className={styles.featureLabel}>
                <Icon size={16} color="#64748b" /> {label}
              </div>
              <UsageBar stat={stat} />
            </div>
          ))}
        </div>
      </div>

      {/* ── 3. Payment history ───────────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>История платежей и инвойсы</h2>

      {history.length === 0 ? (
        <div className={styles.emptyState}>
          <AlertCircle size={32} color="#94a3b8" />
          <p>История платежей пуста</p>
        </div>
      ) : (
        <>
          <div className={styles.historyTableWrapper}>
            <table className={styles.historyTable}>
              <thead>
                <tr>
                  <th>Дата</th>
                  <th>Описание</th>
                  <th>Сумма</th>
                  <th>Статус</th>
                  <th>Инвойс</th>
                </tr>
              </thead>
              <tbody>
                {visibleHistory.map(item => (
                  <tr key={item.id}>
                    <td className={styles.historyDateCell}>{item.date}</td>
                    <td>{item.description}</td>
                    <td className={styles.historyAmountCell}>{item.amount}</td>
                    <td>
                      <StatusBadge status={item.status} label={item.statusLabel} />
                    </td>
                    <td>
                      {item.invoiceUrl ? (
                        <a
                          href={item.invoiceUrl}
                          className={styles.downloadLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Скачать PDF инвойс"
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
            <button
              className={styles.loadMoreBtn}
              onClick={() => setHistoryPage(p => p + 1)}
            >
              <ChevronDown size={16} /> Показать ещё ({history.length - visibleHistory.length})
            </button>
          )}
        </>
      )}

      {/* ── 4. Pricing plans ─────────────────────────────────────────────── */}
      <div className={styles.pricingHeader} id="account-plans" style={{ marginTop: '3rem' }}>
        <h2 className={styles.sectionTitle} style={{ marginBottom: 0 }}>Планы аккаунта</h2>
        <div className={styles.pricingToggle}>
          <button className={`${styles.toggleBtn} ${!isAnnual ? styles.active : ''}`} onClick={() => setIsAnnual(false)}>
            Ежемесячная оплата
          </button>
          <button className={`${styles.toggleBtn} ${isAnnual ? styles.active : ''}`} onClick={() => setIsAnnual(true)}>
            Ежегодная оплата
          </button>
        </div>
      </div>
      <PricingTable isAnnual={isAnnual} />

      {/* ── 5. AI avatar minutes add-ons ─────────────────────────────────── */}
      <h2 className={styles.sectionTitle} style={{ marginTop: '3rem' }}>Минуты AI аватара</h2>
      <div className={styles.addonsGrid}>
        {[
          { label: '10 минут',  price: '$12.00',  productId: null },
          { label: '25 минут',  price: '$29.00',  productId: null },
          { label: '50 минут',  price: '$59.00',  productId: null },
          { label: '100 минут', price: '$109.00', productId: '106783' },
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
                Купить сейчас
              </a>
            ) : (
              <button className={`${styles.planColBtn} ${styles.btnPrimary}`} disabled>
                Скоро
              </button>
            )}
          </div>
        ))}
      </div>

    </div>
  )
}
