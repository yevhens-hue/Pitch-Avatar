'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './Sidebar.module.css'
import { NAV_GROUPS, APP_NAME, type NavItem } from '@/constants'
import { useUser } from '@/context'
import { formatMinutes } from '@/lib/utils'
import * as Icons from 'lucide-react'

import { useUIStore } from '@/lib/store'

const MenuItem = ({ label, href, icon }: NavItem) => {
  const pathname = usePathname()
  const { openOnboarding } = useUIStore()
  const active = pathname === href
  const IconComponent = Icons[icon as keyof typeof Icons] as React.ElementType

  if (href === '/onboarding') {
    return (
      <button 
        onClick={(e) => {
          e.preventDefault()
          openOnboarding()
        }}
        className={`${styles.menuItem} ${active ? styles.menuItemActive : ''}`}
        style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
      >
        <span className={styles.menuIcon}>{IconComponent ? <IconComponent size={18} /> : null}</span>
        <span className={styles.menuLabel}>{label}</span>
      </button>
    )
  }

  return (
    <Link href={href} className={`${styles.menuItem} ${active ? styles.menuItemActive : ''}`}>
      <span className={styles.menuIcon}>{IconComponent ? <IconComponent size={18} /> : null}</span>
      <span className={styles.menuLabel}>{label}</span>
      {active && <div className={styles.activeIndicator} />}
    </Link>
  )
}

export default function Sidebar() {
  const { user, subscription } = useUser()
  const remainingMinutes = subscription
    ? subscription.aiMinutesTotal - subscription.aiMinutesUsed
    : 0

  return (
    <aside className={styles.sidebar}>
      <Link href="/" className={styles.logo}>
        <div className={styles.logoIcon}>
          <Icons.Wand2 size={24} color="white" />
        </div>
        <span className={styles.logoText}>{APP_NAME}</span>
      </Link>

      <div className={styles.navContainer}>
        {NAV_GROUPS.map((group) => (
          <div key={group.title} className={styles.navGroup}>
            <div className={styles.navGroupTitle}>{group.title}</div>
            <nav className={styles.navGroupItems}>
              {group.items.map((item) => (
                <MenuItem key={item.href} {...item} />
              ))}
            </nav>
          </div>
        ))}
      </div>

      <div className={styles.sidebarFooter}>
        <div className={styles.quota}>
          <div className={styles.quotaHeader}>
            <span className={styles.quotaTitle}>AI Avatar</span>
            <span className={styles.quotaValue}>{formatMinutes(remainingMinutes)} left</span>
          </div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{
                width: subscription
                  ? `${(subscription.aiMinutesUsed / subscription.aiMinutesTotal) * 100}%`
                  : '10%',
              }}
            ></div>
          </div>
        </div>

        <Link href="/profile" className={styles.userProfile}>
          <div className={styles.avatar}>{user?.email?.[0].toUpperCase() ?? 'U'}</div>
          <div className={styles.userInfo}>
            <div className={styles.userName}>{user?.email?.split('@')[0] ?? 'User'}</div>
            <div className={styles.userPlan}>{subscription?.plan ? `${subscription.plan} plan` : 'Enterprise plan'}</div>
          </div>
          <Icons.MoreVertical size={16} className={styles.userAction} />
        </Link>
      </div>
    </aside>
  )
}
