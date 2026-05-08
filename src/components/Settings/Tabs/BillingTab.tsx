import React, { useState } from 'react'
import { Users, Presentation, Coins, Link as LinkIcon, MessageSquare, ExternalLink, Download, CreditCard, FileText } from 'lucide-react'
import styles from '../Settings.module.css'
import PricingTable from '../../Pricing/PricingTable'

// Mock Data
const MOCK_NEXT_PAYMENT = {
  date: '27 Июня 2026',
  amount: '$29.00',
  plan: 'Professional'
}

const MOCK_HISTORY = [
  {
    id: 'INV-1001',
    date: '27 Мая 2026',
    description: 'Оплата тарифа Professional (Ежемесячно)',
    amount: '$29.00',
    status: 'Успешно',
    statusCode: 'success',
    invoiceUrl: '#'
  },
  {
    id: 'INV-1000',
    date: '27 Апреля 2026',
    description: 'Оплата тарифа Professional (Ежемесячно)',
    amount: '$29.00',
    status: 'Успешно',
    statusCode: 'success',
    invoiceUrl: '#'
  },
  {
    id: 'INV-0999',
    date: '27 Марта 2026',
    description: 'Оплата тарифа Professional (Ежемесячно)',
    amount: '$29.00',
    status: 'Возврат',
    statusCode: 'refund',
    invoiceUrl: null
  }
]

export default function BillingTab() {
  const [isAnnual, setIsAnnual] = useState(false)

  return (
    <div>
      {/* 1. Блок с информацией о следующем платеже и управлением картой */}
      <div className={styles.upcomingCard}>
        <div className={styles.upcomingInfo}>
          <div className={styles.upcomingTitle}>Следующий платеж: {MOCK_NEXT_PAYMENT.date}</div>
          <div className={styles.upcomingDetails}>
            Сумма к списанию: <span className={styles.upcomingPrice}>{MOCK_NEXT_PAYMENT.amount}</span> за тариф {MOCK_NEXT_PAYMENT.plan}
          </div>
        </div>
        <div className={styles.actionButtons}>
          <a href="#" className={`${styles.actionBtn} ${styles.btnPrimaryAlert}`}>
            <CreditCard size={18} /> Изменить карту
          </a>
          <a href="#" className={`${styles.actionBtn} ${styles.btnSecondaryAlert}`}>
            <FileText size={18} /> Реквизиты
          </a>
        </div>
      </div>

      {/* 2. Мой план Section */}
      <div className={styles.myPlanCard}>
        <div className={styles.planHeader}>
          <div className={styles.planName}>Developer plan</div>
          <button 
            className={styles.planBtn}
            onClick={() => {
              document.getElementById('account-plans')?.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            Тарифный план <ExternalLink size={16} />
          </button>
        </div>
        <div className={styles.planPrice}>$99999999.00</div>
        <div className={styles.planSubtitle}>Цена в месяц</div>

        <div className={styles.planFeatures}>
          <div className={styles.featureRow}>
            <div className={styles.featureLabel}>
              <Users size={18} color="#64748b" /> Места в команде
            </div>
            <div className={styles.featureValue}>1/9999999</div>
          </div>
          <div className={styles.featureRow}>
            <div className={styles.featureLabel}>
              <Presentation size={18} color="#64748b" /> Лимит презентаций
            </div>
            <div className={styles.featureValue}>26/9999999</div>
          </div>
          <div className={styles.featureRow}>
            <div className={styles.featureLabel}>
              <Coins size={18} color="#64748b" /> Генерация аватара
            </div>
            <div className={styles.featureValue}>99998 мин 0 сек. осталось</div>
          </div>
          <div className={styles.featureRow}>
            <div className={styles.featureLabel}>
              <LinkIcon size={18} color="#64748b" /> Ежемесячные ссылки
            </div>
            <div className={styles.featureValue}>5/9999999</div>
          </div>
          <div className={styles.featureRow}>
            <div className={styles.featureLabel}>
              <MessageSquare size={18} color="#64748b" /> Минуты чат-аватара
            </div>
            <div className={styles.featureValue}>99998/99999</div>
          </div>
        </div>
      </div>

      {/* 3. История платежей и инвойсы */}
      <h2 className={styles.sectionTitle}>История платежей</h2>
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
            {MOCK_HISTORY.map((item) => (
              <tr key={item.id}>
                <td>{item.date}</td>
                <td>{item.description}</td>
                <td style={{ fontWeight: 500 }}>{item.amount}</td>
                <td>
                  <span className={`${styles.statusBadge} ${
                    item.statusCode === 'success' ? styles.statusSuccess :
                    item.statusCode === 'refund' ? styles.statusRefund : styles.statusFailed
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td>
                  {item.invoiceUrl ? (
                    <a href={item.invoiceUrl} className={styles.downloadLink} title="Скачать PDF">
                      <Download size={16} /> PDF
                    </a>
                  ) : (
                    <span style={{ color: '#94a3b8' }}>—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 4. Планы аккаунта Section */}
      <div className={styles.pricingHeader} id="account-plans">
        <h2 className={styles.sectionTitle} style={{ marginBottom: 0 }}>Планы аккаунта</h2>
        <div className={styles.pricingToggle}>
          <button 
            className={`${styles.toggleBtn} ${!isAnnual ? styles.active : ''}`}
            onClick={() => setIsAnnual(false)}
          >
            Ежемесячная оплата
          </button>
          <button 
            className={`${styles.toggleBtn} ${isAnnual ? styles.active : ''}`}
            onClick={() => setIsAnnual(true)}
          >
            Ежегодная оплата
          </button>
        </div>
      </div>

      <PricingTable isAnnual={isAnnual} />

      {/* 5. Минуты AI аватара Section */}
      <h2 className={styles.sectionTitle} style={{ marginTop: '3rem' }}>Минуты AI аватара</h2>
      <div className={styles.addonsGrid}>
        <div className={styles.addonCard}>
          <div className={styles.addonTitle}>10 минуты</div>
          <div className={styles.addonPrice}>$12.00</div>
          <button className={`${styles.planColBtn} ${styles.btnPrimary}`}>Купить сейчас</button>
        </div>
        <div className={styles.addonCard}>
          <div className={styles.addonTitle}>25 минуты</div>
          <div className={styles.addonPrice}>$29.00</div>
          <button className={`${styles.planColBtn} ${styles.btnPrimary}`}>Купить сейчас</button>
        </div>
        <div className={styles.addonCard}>
          <div className={styles.addonTitle}>50 минуты</div>
          <div className={styles.addonPrice}>$59.00</div>
          <button className={`${styles.planColBtn} ${styles.btnPrimary}`}>Купить сейчас</button>
        </div>
        <div className={styles.addonCard}>
          <div className={styles.addonTitle}>100 минуты</div>
          <div className={styles.addonPrice}>$109.00</div>
          <a 
            href="https://store.payproglobal.com/checkout?products[1][id]=106783&billing-email=yevhen.shaforostov@roi4cio.com&billing-first-name=Yevhen&billing-last-name=" 
            className={`${styles.planColBtn} ${styles.btnPrimary}`}
            style={{ textDecoration: 'none', display: 'block' }}
          >
            Купить сейчас
          </a>
        </div>
      </div>
    </div>
  )
}
