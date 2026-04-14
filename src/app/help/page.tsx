'use client'

import React from 'react'
import styles from '@/components/Library/Library.module.css'
import pageStyles from '@/components/ui/Pages.module.css'
import { MOCK_FAQ } from '@/services/mock-data'

export default function Help() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Help & Support</h1>
        <div className={styles.headerActions}>
          <button className={pageStyles.contactBtn}>Contact Support</button>
        </div>
      </div>

      <div className={pageStyles.helpLayout}>
        <div className={pageStyles.helpMain}>
          <h2 className={pageStyles.helpFaqTitle}>Frequently Asked Questions</h2>
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
            <h2 className={pageStyles.docsTitle}>Documentation & Guides</h2>
            <p className={pageStyles.docsDescription}>
              Explore our detailed guides on lead form integration, creating smart roles for AI avatars, and working with presentations.
            </p>
            <a href="#" className={pageStyles.docsLink}>Read Documentation →</a>
          </div>
        </div>
      </div>
    </div>
  )
}
