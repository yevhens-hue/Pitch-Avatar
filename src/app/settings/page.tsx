'use client'

import React, { useState } from 'react'
import styles from '../../components/Settings/Settings.module.css'
import BillingTab from '../../components/Settings/Tabs/BillingTab'

export default function Settings() {
  const [activeTab, setActiveTab] = useState('billing')

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Настройки</h1>
      
      <div className={styles.tabsContainer}>
        <button 
          className={`${styles.tab} ${activeTab === 'general' ? styles.active : ''}`}
          onClick={() => setActiveTab('general')}
        >
          Общее
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'branding' ? styles.active : ''}`}
          onClick={() => setActiveTab('branding')}
        >
          Брендинг
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'domain' ? styles.active : ''}`}
          onClick={() => setActiveTab('domain')}
        >
          Пользовательский домен
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'billing' ? styles.active : ''}`}
          onClick={() => setActiveTab('billing')}
        >
          Биллинг
        </button>
      </div>

      <div className={styles.tabContent}>
        {activeTab === 'general' && <div>General settings content...</div>}
        {activeTab === 'branding' && <div>Branding settings content...</div>}
        {activeTab === 'domain' && <div>Custom domain settings content...</div>}
        {activeTab === 'billing' && <BillingTab />}
      </div>
    </div>
  )
}
