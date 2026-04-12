'use client'

import React from 'react'
import styles from '@/components/Library/Library.module.css'
import pageStyles from '@/components/ui/Pages.module.css'
import { MOCK_FAQ } from '@/services/mock-data'

export default function Help() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Помощь и поддержка</h1>
        <div className={styles.headerActions}>
          <button className={pageStyles.contactBtn}>Связаться с агентом</button>
        </div>
      </div>

      <div className={pageStyles.helpLayout}>
        <div className={pageStyles.helpMain}>
          <h2 className={pageStyles.helpFaqTitle}>Часто задаваемые вопросы</h2>
          <div className={pageStyles.faqList}>
            {MOCK_FAQ.map((faq, idx) => (
              <div key={idx} className={pageStyles.faqCard}>
                <h3 className={pageStyles.faqQuery}>{faq.query}</h3>
                <p className={pageStyles.faqAnswer}>{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
        <div className={pageStyles.helpSidebar}>
          <div className={pageStyles.docsCard}>
            <h2 className={pageStyles.docsTitle}>Документация и Руководства</h2>
            <p className={pageStyles.docsDescription}>
              Изучите наши подробные гайды по интеграции лид-форм, созданию умных ролей для ИИ-аватаров и работе с презентациями.
            </p>
            <a href="#" className={pageStyles.docsLink}>Читать документацию →</a>
          </div>
        </div>
      </div>
    </div>
  )
}
