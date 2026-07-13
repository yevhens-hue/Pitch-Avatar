'use client'

import React from 'react'
import { useSearchParams } from 'next/navigation'
import { NAV_GROUPS, APP_NAME } from '@/constants'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import * as Icons from 'lucide-react'

type NavItem = { label: string; href: string; icon: string; subItems?: { label: string; href: string; icon: string }[] }

const FloatingVariantSwitcher = ({ variant, onChange }: { variant: string; onChange: (v: string) => void }) => {
  const variants = [
    { id: 'sidebar', label: 'Sidebar', color: '#0076ff' },
    { id: 'topbar', label: 'Topbar', color: '#8b5cf6' },
    { id: 'mega', label: 'Mega Sidebar', color: '#f59e0b' },
    { id: 'dock', label: 'Floating Dock', color: '#10b981' },
  ]

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999,
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      backdropFilter: 'blur(12px)',
      borderRadius: '16px',
      padding: '8px',
      border: '1px solid rgba(255,255,255,0.15)',
      boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
      display: 'flex',
      gap: '4px',
    }}>
      {variants.map((v) => (
        <button
          key={v.id}
          onClick={() => onChange(v.id)}
          style={{
            padding: '10px 20px',
            borderRadius: '12px',
            border: 'none',
            cursor: 'pointer',
            backgroundColor: variant === v.id ? v.color : 'transparent',
            color: variant === v.id ? '#fff' : '#94a3b8',
            fontWeight: variant === v.id ? 700 : 500,
            fontSize: '13px',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          {variant === v.id && (
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#fff',
              display: 'inline-block',
            }} />
          )}
          {v.label}
        </button>
      ))}
    </div>
  )
}

const SidebarVariant = ({ navGroups }: { navGroups: typeof NAV_GROUPS }) => (
  <>
    <aside style={{
      width: '280px',
      height: '100vh',
      backgroundColor: '#ffffff',
      borderRight: '2px solid #e2e8f0',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 100,
      padding: '1.5rem 1rem 24px',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.5rem 0.75rem',
        marginBottom: '1.5rem',
        textDecoration: 'none',
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          background: '#0076ff',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 10px rgba(0,118,255,0.35)',
        }}>
          <Icons.Wand2 size={18} color="white" />
        </div>
        <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
          {APP_NAME}
        </span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', marginBottom: '2rem' }}>
        {navGroups.map((group, gi) => (
          <div key={gi} style={{ marginBottom: '1.25rem' }}>
            {group.title && (
              <div style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                color: '#94a3b8',
                marginBottom: '0.75rem',
                paddingLeft: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                {group.title}
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {group.items.map((item, ii) => {
                const Icon = Icons[item.icon as keyof typeof Icons] as React.ElementType
                return (
                  <a
                    key={ii}
                    href={item.href}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '10px',
                      textDecoration: 'none',
                      color: '#64748b',
                      fontSize: '0.95rem',
                      fontWeight: 500,
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f1f5f9'
                      e.currentTarget.style.color = '#0f172a'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                      e.currentTarget.style.color = '#64748b'
                    }}
                  >
                    {Icon && <span style={{ display: 'flex' }}><Icon size={18} /></span>}
                    <span>{item.label}</span>
                    {item.subItems && (
                      <span style={{ marginLeft: 'auto', display: 'flex' }}>
                        <Icons.ChevronDown size={14} />
                      </span>
                    )}
                  </a>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 'auto' }}>
        <div style={{
          padding: '1rem',
          background: '#f8fafc',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
        }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.75rem' }}>
            AI Avatar Minutes
          </div>
          <div style={{
            height: '6px',
            backgroundColor: '#e2e8f0',
            borderRadius: '3px',
            marginBottom: '0.5rem',
            overflow: 'hidden',
          }}>
            <div style={{ width: '65%', height: '100%', backgroundColor: '#0076ff', borderRadius: '3px' }} />
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            <span style={{ fontWeight: 700, color: '#0f172a' }}>340.50</span> min remaining
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.75rem',
          marginTop: '1rem',
          borderRadius: '12px',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f8fafc' }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: '#0076ff',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.85rem',
            fontWeight: 700,
          }}>
            JS
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>John Smith</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Enterprise plan</div>
          </div>
        </div>
      </div>
    </aside>
    <div style={{ marginLeft: '280px' }} />
  </>
)

const TopbarVariant = ({ navGroups }: { navGroups: typeof NAV_GROUPS }) => {
  const allItems = navGroups.flatMap(g => g.items)
  return (
    <>
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '64px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        padding: '0 larger',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', padding: '0 1.5rem' }}>
          <Link href="/" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            textDecoration: 'none',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: '#8b5cf6',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Icons.Wand2 size={18} color="white" />
            </div>
            <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
              {APP_NAME}
            </span>
          </Link>
          <nav style={{ display: 'flex', gap: '4px' }}>
            {allItems.slice(0, 6).map((item, i) => {
              const Icon = Icons[item.icon as keyof typeof Icons] as React.ElementType
              return (
                <a
                  key={i}
                  href={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    color: '#64748b',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f1f5f9'
                    e.currentTarget.style.color = '#0f172a'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.color = '#64748b'
                  }}
                >
                  {Icon && <Icon size={16} />}
                  {item.label}
                </a>
              )
            })}
          </nav>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingRight: '1.5rem' }}>
          <button style={{
            padding: '8px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            background: 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748b',
          }}>
            <Icons.Search size={18} />
          </button>
          <button style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            background: '#8b5cf6',
            color: '#fff',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            <Icons.Plus size={16} />
            New
          </button>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: '#8b5cf6',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer',
          }}>
            JS
          </div>
        </div>
      </header>
      <div style={{ height: '64px' }} />
    </>
  )
}

const MegaSidebarVariant = ({ navGroups }: { navGroups: typeof NAV_GROUPS }) => {
  const [collapsed, setCollapsed] = React.useState(false)

  return (
    <>
      <aside style={{
        width: collapsed ? '72px' : '240px',
        height: '100vh',
        backgroundColor: '#0f172a',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 100,
        transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        padding: collapsed ? '1rem 0.5rem' : '1.5rem 1rem',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: collapsed ? '0 0.25rem' : '0 0.5rem',
          marginBottom: '2rem',
          justifyContent: collapsed ? 'center' : 'flex-start',
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            background: '#f59e0b',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 4px 10px rgba(245, 158, 11, 0.3)',
          }}>
            <Icons.Wand2 size={18} color="white" />
          </div>
          {!collapsed && (
            <span style={{
              fontSize: '1.1rem',
              fontWeight: 800,
              color: '#fff',
              whiteSpace: 'nowrap',
            }}>
              {APP_NAME}
            </span>
          )}
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navGroups.map((group, gi) => (
            <div key={gi}>
              {!collapsed && group.title && (
                <div style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  color: '#64748b',
                  marginBottom: '0.5rem',
                  paddingLeft: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}>
                  {group.title}
                </div>
              )}
              {group.items.map((item, ii) => {
                const Icon = Icons[item.icon as keyof typeof Icons] as React.ElementType
                return (
                  <a
                    key={ii}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: collapsed ? '10px' : '10px 12px',
                      borderRadius: '10px',
                      textDecoration: 'none',
                      color: '#94a3b8',
                      fontSize: collapsed ? '0' : '0.9rem',
                      fontWeight: 500,
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'
                      e.currentTarget.style.color = '#f59e0b'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                      e.currentTarget.style.color = '#94a3b8'
                    }}
                  >
                    {Icon && <span style={{ display: 'flex', flexShrink: 0 }}><Icon size={20} /></span>}
                    {!collapsed && <span>{item.label}</span>}
                  </a>
                )
              })}
            </div>
          ))}
        </nav>

        <div style={{ marginTop: 'auto' }}>
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '8px',
              border: 'none',
              background: 'rgba(255,255,255,0.05)',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'flex-start',
              gap: '8px',
              fontSize: collapsed ? '0' : '0.8rem',
            }}
          >
            <Icons.PanelLeftClose size={18} />
            {!collapsed && 'Collapse'}
          </button>
        </div>
      </aside>
      <div style={{ marginLeft: collapsed ? '72px' : '240px', transition: 'margin 0.3s' }} />
    </>
  )
}

const DockVariant = ({ navGroups }: { navGroups: typeof NAV_GROUPS }) => {
  const [active, setActive] = React.useState('Home')
  const allItems = navGroups.flatMap(g => g.items)

  return (
    <>
      <nav style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 100,
        display: 'flex',
        gap: '4px',
        padding: '8px',
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        borderRadius: '20px',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
      }}>
        {allItems.map((item, i) => {
          const Icon = Icons[item.icon as keyof typeof Icons] as React.ElementType
          const isActive = active === item.label
          return (
            <div key={i} style={{ position: 'relative' }}>
              <a
                href={item.href}
                onClick={() => setActive(item.label)}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '2px',
                  backgroundColor: isActive ? '#10b981' : 'transparent',
                  color: isActive ? '#fff' : '#94a3b8',
                  transition: 'all 0.2s',
                  position: 'relative',
                  textDecoration: 'none',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'
                    e.currentTarget.style.color = '#e2e8f0'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.color = '#94a3b8'
                  }
                }}
              >
                {Icon && <Icon size={20} />}
                <span style={{ fontSize: '9px', fontWeight: 500 }}>{item.label}</span>
              </a>
            </div>
          )
        })}
      </nav>
    </>
  )
}

const HeaderBar = ({ variant, title }: { variant: string; title: string }) => {
  const bgColors: Record<string, string> = {
    sidebar: '#ffffff',
    topbar: '#ffffff',
    mega: '#ffffff',
    dock: '#f8fafc',
  }

  return (
    <div style={{
      height: '64px',
      backgroundColor: bgColors[variant] || '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2rem',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <h1 style={{
          fontSize: '1.25rem',
          fontWeight: 700,
          color: '#0f172a',
          margin: 0,
        }}>
          {title}
        </h1>
        <span style={{
          fontSize: '0.75rem',
          color: '#64748b',
          padding: '4px 10px',
          background: '#f1f5f9',
          borderRadius: '6px',
          fontWeight: 500,
        }}>
          {variant}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button style={{
          padding: '8px 16px',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          background: '#fff',
          color: '#475569',
          fontSize: '0.875rem',
          fontWeight: 500,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          <Icons.Search size={16} />
          Search
        </button>
        <button style={{
          padding: '8px 16px',
          borderRadius: '8px',
          border: 'none',
          background: '#0076ff',
          color: '#fff',
          fontSize: '0.875rem',
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          <Icons.Plus size={16} />
          New Project
        </button>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          backgroundColor: '#e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.75rem',
          fontWeight: 600,
          color: '#475569',
        }}>
          JS
        </div>
      </div>
    </div>
  )
}

const DemoContent = () => (
  <div style={{
    padding: '2rem',
    fontFamily: 'Inter, system-ui, sans-serif',
  }}>
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: '1.5rem',
    }}>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} style={{
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          overflow: 'hidden',
          transition: 'all 0.2s',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)'
          e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.08)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = 'none'
        }}
        >
          <div style={{
            height: '160px',
            background: `linear-gradient(135deg, hsl(${i * 50}, 70%, 50%), hsl(${i * 50 + 40}, 70%, 40%))`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '3rem',
            fontWeight: 800,
          }}>
            {i}
          </div>
          <div style={{ padding: '1.25rem' }}>
            <div style={{
              fontSize: '0.95rem',
              fontWeight: 600,
              color: '#0f172a',
              marginBottom: '0.5rem',
            }}>
              Project Title {i}
            </div>
            <div style={{
              fontSize: '0.8rem',
              color: '#64748b',
              marginBottom: '0.75rem',
            }}>
              Updated 2 hours ago
            </div>
            <div style={{
              display: 'flex',
              gap: '8px',
            }}>
              <span style={{
                padding: '4px 8px',
                borderRadius: '6px',
                background: '#f1f5f9',
                fontSize: '0.75rem',
                color: '#475569',
                fontWeight: 500,
              }}>
                Presentation
              </span>
              <span style={{
                padding: '4px 8px',
                borderRadius: '6px',
                background: '#dcfce7',
                fontSize: '0.75rem',
                color: '#166534',
                fontWeight: 500,
              }}>
                Published
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
)

function PrototypePageInner() {
  const searchParams = useSearchParams()
  const [variant, setVariant] = React.useState(searchParams.get('v') || 'sidebar')
  const pathname = usePathname()

  React.useEffect(() => {
    const v = searchParams.get('v')
    if (v && ['sidebar', 'topbar', 'mega', 'dock'].includes(v)) {
      setVariant(v)
    }
  }, [searchParams])

  const handleVariantChange = (newVariant: string) => {
    setVariant(newVariant)
    const url = new URL(window.location.href)
    url.searchParams.set('v', newVariant)
    window.history.replaceState({}, '', url.toString())
  }

  const titles: Record<string, string> = {
    sidebar: 'Dashboard',
    topbar: 'Projects',
    mega: 'My Workspace',
    dock: 'Library',
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: variant === 'dock' ? '#f8fafc' : '#fff' }}>
      {variant === 'sidebar' && <SidebarVariant navGroups={NAV_GROUPS} />}
      {variant === 'topbar' && <TopbarVariant navGroups={NAV_GROUPS} />}
      {variant === 'mega' && <MegaSidebarVariant navGroups={NAV_GROUPS} />}
      {variant === 'dock' && <DockVariant navGroups={NAV_GROUPS} />}

      <main style={{
        marginLeft: variant === 'sidebar' ? '280px' : variant === 'mega' ? '240px' : '0',
        transition: 'margin 0.3s',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <HeaderBar variant={variant} title={titles[variant] || 'Prototype'} />
        <DemoContent />
      </main>

      <FloatingVariantSwitcher variant={variant} onChange={handleVariantChange} />
    </div>
  )
}

export default function PrototypePage() {
  return (
    <React.Suspense fallback={<div style={{ padding: '2rem' }}>Loading...</div>}>
      <PrototypePageInner />
    </React.Suspense>
  )
}
