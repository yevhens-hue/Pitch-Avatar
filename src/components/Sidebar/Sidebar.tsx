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

const MenuItem = ({ label, href, icon, subItems }: NavItem & { subItems?: NavItem[] }) => {
  const pathname = usePathname()
  const { openGuide } = useUIStore()
  
  const isDirectActive = pathname === href;
  const isSubActive = subItems?.some(sub => pathname === sub.href) || false;
  const active = isDirectActive || isSubActive;
  
  const IconComponent = Icons[icon as keyof typeof Icons] as React.ElementType
  const [isOpen, setIsOpen] = React.useState(active);
  
  React.useEffect(() => {
    if (active) setIsOpen(true)
  }, [active])

  if (href === '/onboarding') {
    return (
      <button
        onClick={(e) => {
          e.preventDefault()
          if (isDev) {
            openGuide()
          } else {
            // @ts-expect-error Stonly guide injected by script
            if (window.openStonlyGuide) window.openStonlyGuide('NGxoMErklJ');
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

  if (subItems && subItems.length > 0) {
    return (
      <div className={styles.menuItemWrapper}>
        <div 
          className={`${styles.menuItem} ${active ? styles.menuItemActive : ''}`}
          style={{ padding: 0, gap: 0 }}
        >
          <Link 
            href={href}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem', 
              flex: 1, 
              padding: '0.55rem 0.75rem', 
              textDecoration: 'none', 
              color: 'inherit' 
            }}
          >
            <span className={styles.menuIcon}>{IconComponent ? <IconComponent size={18} /> : null}</span>
            <span className={styles.menuLabel}>{label}</span>
          </Link>
          <button 
            onClick={(e) => {
              e.preventDefault();
              setIsOpen(!isOpen);
            }}
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer', 
              padding: '0.55rem 0.75rem', 
              display: 'flex', 
              alignItems: 'center', 
              color: 'inherit' 
            }}
            aria-label="Toggle submenu"
          >
            <span className={styles.menuToggleIcon} style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', display: 'flex' }}>
              <Icons.ChevronDown size={16} />
            </span>
          </button>
        </div>
        {isOpen && (
          <div className={styles.subMenu}>
            {subItems.map((sub, idx) => {
              const SubIconComponent = Icons[sub.icon as keyof typeof Icons] as React.ElementType;
              const subActive = pathname === sub.href;
              return (
                <Link 
                  key={idx}
                  href={sub.href} 
                  className={`${styles.subMenuItem} ${subActive ? styles.subMenuItemActive : ''}`}
                >
                  {SubIconComponent && <span className={styles.menuIcon} style={{transform: 'scale(0.8)'}}><SubIconComponent size={18} /></span>}
                  <span className={styles.menuLabel}>{sub.label}</span>
                </Link>
              )
            })}
          </div>
        )}
      </div>
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
  const pathname = usePathname()
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
          <React.Fragment key={group.title || index}>
            <div className={styles.navGroup}>
              {group.title && <div className={styles.navGroupTitle}>{group.title}</div>}
              <nav className={styles.navGroupItems}>
                {group.items.map((item) => (
                  <MenuItem key={item.href} {...item} />
                ))}
              </nav>
            </div>
            
            {/* Inject Folders after the first group (index === 0) */}
            {index === 0 && (
              <div className={styles.navGroup}>
                <div className={styles.navGroupTitle} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Folders</span>
                  <button className={styles.addFolderBtn} aria-label="Add folder">
                    <Icons.FolderPlus size={16} />
                  </button>
                </div>
                <nav className={styles.navGroupItems}>
                  {/* Mock Folder: "ava" */}
                  <div 
                    className={`${styles.menuItem} ${pathname.includes('folder=162') || pathname.includes('folder=ava') ? styles.menuItemActive : ''}`}
                    style={{ padding: 0, gap: 0 }}
                  >
                    <Link 
                      href="/projects?filter[folder]=162" 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.75rem', 
                        flex: 1, 
                        padding: '0.55rem 0.75rem', 
                        textDecoration: 'none', 
                        color: 'inherit' 
                      }}
                    >
                      <span className={styles.menuIcon}><Icons.Folder size={18} /></span>
                      <span className={styles.menuLabel}>ava</span>
                    </Link>
                    <button 
                      className={styles.folderSettingsBtn} 
                      onClick={(e) => { e.preventDefault(); /* open settings */ }}
                      aria-label="Folder settings"
                      style={{ marginRight: '0.25rem' }}
                    >
                      <Icons.Settings size={16} />
                    </button>
                  </div>
                </nav>
              </div>
            )}
          </React.Fragment>
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
            <span className={styles.quotaValue}>{remainingMinutes.toFixed(2)}</span> AI Avatar minutes<br/>
            remaining
          </div>
          <div className={styles.quotaAction}>
            <a href="#" className={styles.quotaLink}>
              Schedule a demo
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
