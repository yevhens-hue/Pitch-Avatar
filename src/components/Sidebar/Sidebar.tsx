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
          openGuide()
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
        {/* Native Onboarding Highlight */}
        <div 
          className={styles.guideHighlight} 
          id="stonly-sidebar-starting-guide"
          onClick={() => openGuide()}>
          <div className={styles.guideIcon}>
            <Icons.Sparkles size={16} />
          </div>
          <div className={styles.guideInfo}>
            <span className={styles.guideTitle}>Starting Guide</span>
            <div className={styles.guideProgress}>
              <div className={styles.guideBar} style={{ width: '25%' }} />
            </div>
          </div>
          <Icons.ChevronRight size={14} className={styles.guideArrow} />
        </div>

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
