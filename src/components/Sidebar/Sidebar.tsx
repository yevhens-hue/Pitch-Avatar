'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import styles from './Sidebar.module.css'
import { NAV_GROUPS, APP_NAME, type NavItem } from '@/constants'
import { useUser } from '@/context'
import { formatMinutes } from '@/lib/utils'
import * as Icons from 'lucide-react'

import { useUIStore } from '@/lib/store'
import { useToast } from '@/components/ui/ToastProvider'
import { getFolders, createFolder, deleteFolder, updateFolder } from '@/app/actions/projects'

const isDev = process.env.NODE_ENV === 'development'

const MenuItem = ({ label, href, icon, subItems, extraContent }: NavItem & { subItems?: NavItem[]; extraContent?: React.ReactNode }) => {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { openGuide } = useUIStore()
  
  const hasFolderFilter = searchParams.has('filter[folder]') || searchParams.has('folderId')
  const isDirectActive = pathname === href && !(href === '/projects' && hasFolderFilter);
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
            // @ts-ignore
            if (window.openStonlyGuide) window.openStonlyGuide("GciflOn74c");
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
        {isOpen && extraContent}
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

interface Folder {
  id: string
  name: string
  created_at: string
}

function SidebarContent() {
  const { user, subscription } = useUser()
  const { isBuilderModeActive, toggleBuilderMode, openGuide } = useUIStore()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { showToast } = useToast()
  
  const folderParam = searchParams.get('filter[folder]') || searchParams.get('folderId')
  
  const remainingMinutes = subscription
    ? subscription.aiMinutesTotal - subscription.aiMinutesUsed
    : 0

  const [folders, setFolders] = React.useState<Folder[]>([])
  const [isCreateFolderOpen, setIsCreateFolderOpen] = React.useState(false)
  const [isFolderSettingsOpen, setIsFolderSettingsOpen] = React.useState(false)
  const [folderName, setFolderName] = React.useState('')
  const [activeFolderId, setActiveFolderId] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    async function loadFolders() {
      try {
        const data = await getFolders()
        setFolders(data || [])
      } catch (err) {
        console.error('Failed to load folders', err)
      } finally {
        setIsLoading(false)
      }
    }
    loadFolders()
  }, [])

  const handleCreateFolder = async () => {
    if (!folderName.trim()) return
    try {
      const newFolder = await createFolder(folderName)
      if (newFolder) {
        setFolders([newFolder, ...folders])
        showToast("Folder created!", "success")
        setIsCreateFolderOpen(false)
        setFolderName('')
      }
    } catch (err: any) {
      showToast(err.message || "Failed to create folder", "error")
    }
  }

  const handleDeleteFolder = async () => {
    if (!activeFolderId) return
    try {
      await deleteFolder(activeFolderId)
      setFolders(folders.filter(f => f.id !== activeFolderId))
      showToast("Folder deleted!", "success")
      setIsFolderSettingsOpen(false)
    } catch (err: any) {
      showToast(err.message || "Failed to delete folder", "error")
    }
  }

  const handleUpdateFolder = async () => {
    if (!activeFolderId || !folderName.trim()) return
    try {
      const updated = await updateFolder(activeFolderId, folderName)
      if (updated) {
        setFolders(folders.map(f => f.id === activeFolderId ? updated : f))
        showToast("Folder updated!", "success")
        setIsFolderSettingsOpen(false)
      }
    } catch (err: any) {
      showToast(err.message || "Failed to update folder", "error")
    }
  }

  return (
    <>
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
                  <MenuItem
                    key={item.href}
                    {...item}
                    extraContent={item.href === '/projects' ? (
                      <div className={styles.foldersInAccordion}>
                        <div className={styles.foldersAccordionHeader}>
                          <span className={styles.foldersAccordionTitle}>Folders</span>
                          <button
                            className={styles.addFolderBtn}
                            aria-label="Add folder"
                            onClick={() => {
                              setFolderName('')
                              setIsCreateFolderOpen(true)
                            }}
                          >
                            <Icons.FolderPlus size={14} />
                          </button>
                        </div>
                        {isLoading ? (
                          <div className={styles.foldersEmpty}>Loading...</div>
                        ) : folders.length === 0 ? (
                          <div className={styles.foldersEmpty}>No folders yet</div>
                        ) : (
                          folders.map(folder => (
                            <div
                              key={folder.id}
                              className={`${styles.folderItem} ${folderParam === folder.id ? styles.folderItemActive : ''}`}
                            >
                              <Link
                                href={`/projects?filter[folder]=${folder.id}`}
                                className={styles.folderItemLink}
                              >
                                <Icons.Folder size={14} />
                                <span className={styles.folderItemName}>{folder.name}</span>
                              </Link>
                              <button
                                className={styles.folderSettingsBtn}
                                onClick={(e) => {
                                  e.preventDefault()
                                  setFolderName(folder.name)
                                  setActiveFolderId(folder.id)
                                  setIsFolderSettingsOpen(true)
                                }}
                                aria-label={`Folder settings for ${folder.name}`}
                              >
                                <Icons.MoreHorizontal size={14} />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    ) : undefined}
                  />
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
            onClick={() => {
              if (isDev) {
                openGuide()
              } else {
                // @ts-ignore
                if (window.openStonlyGuide) window.openStonlyGuide("GciflOn74c");
              }
            }}>
            <div className={styles.guideIcon}>
              <Icons.Sparkles size={16} />
            </div>
            <div className={styles.guideInfo}>
              <span className={styles.guideTitle}>Get Started</span>
              <span className={styles.guideDesc}>Complete guide</span>
            </div>
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

      {/* Create Folder Modal */}
      {isCreateFolderOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsCreateFolderOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Create new folder</h2>
              <button className={styles.modalClose} onClick={() => setIsCreateFolderOpen(false)}>
                <Icons.X size={20} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.inputGroup}>
                <input 
                  type="text" 
                  className={styles.inputField} 
                  placeholder="Folder name" 
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
            <div className={styles.modalFooter} style={{ justifyContent: 'flex-end' }}>
              <button 
                className={`${styles.modalBtn} ${styles.modalBtnPrimary}`} 
                onClick={handleCreateFolder}
                disabled={!folderName.trim()}
              >
                Create folder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Folder Settings Modal */}
      {isFolderSettingsOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsFolderSettingsOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h2 className={styles.modalTitle}>{folderName || 'Folder Settings'}</h2>
                <div className={styles.modalSubtitle}>Project folder options</div>
              </div>
              <button className={styles.modalClose} onClick={() => setIsFolderSettingsOpen(false)}>
                <Icons.X size={20} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>
                  Folder name <Icons.Info size={14} style={{ display: 'inline', marginLeft: '4px', color: '#94a3b8' }} />
                </label>
                <input 
                  type="text" 
                  className={styles.inputField} 
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                />
              </div>
            </div>
            <div className={styles.modalFooter} style={{ justifyContent: 'space-between' }}>
              <button className={`${styles.modalBtn} ${styles.modalBtnOutline}`} onClick={handleDeleteFolder}>
                Delete folder
              </button>
              <button 
                className={`${styles.modalBtn} ${styles.modalBtnPrimary}`} 
                onClick={handleUpdateFolder}
                disabled={!folderName.trim()}
              >
                Update settings
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default function Sidebar() {
  return (
    <React.Suspense fallback={<aside className={styles.sidebar}></aside>}>
      <SidebarContent />
    </React.Suspense>
  )
}
