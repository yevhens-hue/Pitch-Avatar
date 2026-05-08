'use client'

import React, { useState } from 'react'
import styles from '../../components/Settings/Settings.module.css'
import BillingTab from '../../components/Settings/Tabs/BillingTab'

export default function Settings() {
  const [activeTab, setActiveTab] = useState('billing')

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Settings</h1>
      
      <div className={styles.tabsContainer}>
        <button 
          className={`${styles.tab} ${activeTab === 'general' ? styles.active : ''}`}
          onClick={() => setActiveTab('general')}
        >
          General
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'branding' ? styles.active : ''}`}
          onClick={() => setActiveTab('branding')}
        >
          Branding
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'domain' ? styles.active : ''}`}
          onClick={() => setActiveTab('domain')}
        >
          Custom Domain
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'billing' ? styles.active : ''}`}
          onClick={() => setActiveTab('billing')}
        >
          Billing
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
