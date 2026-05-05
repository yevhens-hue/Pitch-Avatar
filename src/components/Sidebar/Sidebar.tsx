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

const isDev = process.env.NODE_ENV === 'development'

const MenuItem = ({ label, href, icon }: NavItem) => {
  const pathname = usePathname()
  const { openGuide } = useUIStore()
  const active = pathname === href
  const IconComponent = Icons[icon as keyof typeof Icons] as React.ElementType

  if (href === '/onboarding') {
    return (
      <button
        onClick={(e) => {
          e.preventDefault()
          if (isDev) {
            openGuide()
          } else {
            // @ts-ignore
            if (window.openStonlyGuide) window.openStonlyGuide('GciflOn74c');
          }
        }}
        className={`${styles.menuItem} ${active ? styles.menuItemActive : ''}`}
        style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
        id={`stonly-sidebar-${href.replace(/^\//, '').replace(/[^a-zA-Z0-9]/g, '-') || 'home'}`}
      >
        <span className={styles.menuIcon}>{IconComponent ? <IconComponent size={18} /> : null}</span>
        <span className={styles.menuLabel}>{label}</span>
      </button>
    )
  }

  return (
    <Link 
      href={href} 
      className={`${styles.menuItem} ${active ? styles.menuItemActive : ''}`}
      id={`stonly-sidebar-${href.replace(/^\//, '').replace(/[^a-zA-Z0-9]/g, '-') || 'home'}`}
    >
      <span className={styles.menuIcon}>{IconComponent ? <IconComponent size={18} /> : null}</span>
      <span className={styles.menuLabel}>{label}</span>
      {active && <div className={styles.activeIndicator} />}
    </Link>
  )
}

export default function Sidebar() {
  const { user, subscription } = useUser()
  const { isBuilderModeActive, toggleBuilderMode, openGuide } = useUIStore()
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
        {NAV_GROUPS.map((group, index) => (
          <div key={group.title || index} className={styles.navGroup}>
            {group.title && <div className={styles.navGroupTitle}>{group.title}</div>}
            <nav className={styles.navGroupItems}>
              {group.items.map((item) => (
                <MenuItem key={item.href} {...item} />
              ))}
            </nav>
          </div>
        ))}
      </div>

      <div className={styles.sidebarFooter}>
        {/* Tour Builder Toggle */}
        <div 
          className={styles.guideHighlight} 
          onClick={() => toggleBuilderMode()}
          style={{ 
            marginTop: '8px', 
            background: isBuilderModeActive ? '#6366f1' : 'transparent',
            color: isBuilderModeActive ? 'white' : 'inherit'
          }}
        >
          <div className={styles.guideIcon} style={{ background: isBuilderModeActive ? 'rgba(255,255,255,0.2)' : undefined }}>
            <Icons.MousePointer2 size={16} color={isBuilderModeActive ? 'white' : undefined} />
          </div>
          <div className={styles.guideInfo}>
            <span className={styles.guideTitle}>{isBuilderModeActive ? 'Builder Active' : 'Tour Builder'}</span>
          </div>
          {isBuilderModeActive && <div style={{ fontSize: '10px', background: 'rgba(255,255,255,0.2)', padding: '2px 4px', borderRadius: '4px' }}>ON</div>}
        </div>

        <div className={styles.quota}>
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
          <div className={styles.quotaText}>
            <span className={styles.quotaValue}>{remainingMinutes.toFixed(2)}</span> осталось минут<br/>
            ИИ-аватара
          </div>
          <div className={styles.quotaAction}>
            <a href="#" className={styles.quotaLink}>
              Запланировать демо
            </a>
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
