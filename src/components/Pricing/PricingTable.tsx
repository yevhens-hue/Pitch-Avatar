import React, { useState } from 'react'
import { Check, X, ChevronDown, ChevronUp } from 'lucide-react'
import styles from './Pricing.module.css'
import EnterpriseRequestModal from '../Settings/Tabs/EnterpriseRequestModal'

const CATEGORIES = [
  {
    name: 'Основные показатели',
    rows: [
      { label: 'Количество пользователей в аккаунте', values: ['1', '5', 'Персонализированный'] },
      { label: 'Количество загруженных презентаций', values: ['10', '100', 'Безлимитный'] },
      { label: 'Количество видео с субтитрами или дубляжом', values: ['20 (до 10 минут каждое)', '50 (до 30 минут каждое)', 'Безлимитный (до 60 минут каждое)'] },
      { label: 'Количество AI Chat-аватаров', values: ['5', '20', 'Безлимитный'] },
      { label: 'Минуты AI Avatar', values: ['20 минут', '50 минут', 'Персонализированный'] },
    ]
  },
  {
    name: 'Общие функции РР',
    rows: [
      { label: 'Помощник по генерации и переводу скриптов для ИИ', values: [true, true, true] },
      { label: 'Скачивайте презентации или видео в месяц', values: ['50', '500', 'Безлимитный'] },
      { label: 'Основная поддержка', values: [true, true, 'Персональный менеджер'] },
      { label: 'Библиотека голосов ИИ на 100+ языках', values: [true, true, true] },
      { label: 'Клонирование голоса', values: ['1', '5', 'Персонализированный'] },
      { label: 'Библиотека ИИ аватаров 20+', values: [true, true, true] },
      { label: 'ИИ аватар по пользовательской фотографии', values: [true, true, true] },
      { label: 'Ссылки, созданные в месяц', values: ['200', '2000', 'Персонализированный'] },
    ]
  },
  {
    name: 'CHAT AVATAR',
    rows: [
      { label: 'Количество чат-аватаров в месяц', values: ['5', '20', 'Безлимитный'] },
      { label: 'Умное распознавание голоса в чате', values: [true, true, true] },
      { label: 'Многоязычные сессии', values: [true, true, true] },
      { label: 'Пользовательские инструкции для чат-аватара', values: [true, true, true] },
      { label: 'Аналитика сессий Chat Avatar', values: [true, true, true] },
      { label: 'Встроенные роли и поведение', values: [true, true, true] },
      { label: 'Создание настраиваемой роли', values: ['DIY', 'DIY', 'Мы делаем все настройки за вас'] },
      { label: 'Самообучение аватара (Скоро)', values: [true, true, true] },
    ]
  },
  {
    name: 'Интеграция',
    rows: [
      { label: 'Интеграция с Salesforce', values: [false, true, true] },
      { label: 'Интеграция с Hubspot', values: [false, true, true] },
      { label: 'Интеграция со Slack', values: [true, true, true] },
      { label: 'Интеграция с Microsoft PowerPoint', values: [true, true, true] },
    ]
  }
]

const PLANS = [
  {
    key: 'Professional',
    price: { monthly: '29',  annual: '290' },
    subtitle: 'Маркетинг и продажи',
  },
  {
    key: 'Business',
    price: { monthly: '79',  annual: '790' },
    subtitle: 'Команды до 5 человек',
  },
  {
    key: 'Enterprise',
    price: null,
    subtitle: 'Индивидуальный тариф',
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
        Отправить запрос
      </button>
    )
  }
  if (planKey === currentPlan) {
    return (
      <button className={`${styles.planColBtn} ${styles.btnCurrent}`} disabled>
        ✓ Ваш тариф
      </button>
    )
  }
  const currentIdx = PLAN_ORDER.indexOf(currentPlan ?? '')
  const planIdx    = PLAN_ORDER.indexOf(planKey)
  const isUpgrade  = currentIdx < planIdx
  return (
    <button className={`${styles.planColBtn} ${isUpgrade ? styles.btnPrimary : styles.btnOutline}`}>
      {isUpgrade ? `Перейти на ${planKey} →` : `Снизить до ${planKey}`}
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
            {plan.key === currentPlan && <div className={styles.currentBadge}>Ваш тариф</div>}
            <div className={styles.planName}>{plan.key}</div>
            <div className={styles.planPrice}>
              {plan.price
                ? `$${isAnnual ? plan.price.annual : plan.price.monthly}/мес`
                : <span style={{ color: '#0066ff', fontSize: '0.9rem' }}>Индивидуально</span>}
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
          <>Свернуть <ChevronUp size={18} /></>
        ) : (
          <>Показать все функции <ChevronDown size={18} /></>
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
