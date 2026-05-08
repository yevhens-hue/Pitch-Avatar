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

export default function PricingTable({ isAnnual }: { isAnnual: boolean }) {
  const [showAll, setShowAll] = useState(false)
  const [isEnterpriseModalOpen, setIsEnterpriseModalOpen] = useState(false)

  return (
    <>
    <div className={styles.tableContainer}>
      <div className={styles.tableHeader}>
        <div className={styles.headerCol}></div>
        <div className={styles.headerCol}>
          <div className={styles.planName}>Professional</div>
          <div className={styles.planPrice}>${isAnnual ? '290' : '29'}/мес</div>
          <div className={styles.planSubtitle}>для профессионалов маркетинга и продаж</div>
          <button className={`${styles.planColBtn} ${styles.btnDisabled}`}>Снизить до Professional</button>
        </div>
        <div className={styles.headerCol}>
          <div className={styles.planName}>Business</div>
          <div className={styles.planPrice}>${isAnnual ? '790' : '79'}/мес</div>
          <div className={styles.planSubtitle}>чтобы ваша команда играла в высшей лиге</div>
          <button className={`${styles.planColBtn} ${styles.btnDisabled}`}>Снизить до Business</button>
        </div>
        <div className={styles.headerCol}>
          <div className={styles.planName}>Enterprise</div>
          <div className={styles.planPrice} style={{ color: '#0066ff' }}>Персонализированный</div>
          <div className={styles.planSubtitle}>для больших команд, чтобы получить максимум</div>
          <button 
            className={`${styles.planColBtn} ${styles.btnDark}`}
            onClick={() => setIsEnterpriseModalOpen(true)}
          >
            Отправить запрос
          </button>
        </div>
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
