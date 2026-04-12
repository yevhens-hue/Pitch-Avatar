'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './Sidebar.module.css'
import { MAIN_NAV, SECONDARY_NAV, APP_NAME, type NavItem } from '@/constants'
import { useUser } from '@/context'
import { formatMinutes } from '@/lib/utils'

const MenuItem = ({ label, href, icon }: NavItem) => {
  const pathname = usePathname()
  const active = pathname === href

  return (
    <Link href={href} className={`${styles.menuItem} ${active ? styles.menuItemActive : ''}`}>
      <span className={styles.menuIcon}>{icon}</span>
      <span className={styles.menuLabel}>{label}</span>
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
        <div className={styles.logoP}>{APP_NAME[0]}</div>
        <span className={styles.logoText}>{APP_NAME}</span>
      </Link>

      <Link href="/profile" className={styles.userSection}>
        <div className={styles.avatar}>{user?.avatarInitial ?? 'U'}</div>
        <div className={styles.userInfo}>
          <div className={styles.userName}>{user?.name ?? '...'}</div>
          <div className={styles.userEmail}>{user?.email ?? ''}</div>
          <div className={styles.planBadge}>{subscription?.plan ? `${subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)} plan` : 'Trial plan'}</div>
        </div>
        <div className={styles.userArrows}>↕</div>
      </Link>

      <nav className={styles.nav}>
        {MAIN_NAV.map((item) => (
          <MenuItem key={item.href} {...item} />
        ))}

        <div className={styles.navSectionTitle}>Папки</div>

        {SECONDARY_NAV.map((item) => (
          <MenuItem key={item.href} {...item} />
        ))}
      </nav>

      <div className={styles.trialStatus}>
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
        <div className={styles.trialText}>
          <strong>{formatMinutes(remainingMinutes)}</strong> осталось минут ИИ-аватара
        </div>
        <button className={styles.upgradeLink}>Обновить План →</button>
      </div>
    </aside>
  )
}
