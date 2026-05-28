'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, X, ArrowRight } from 'lucide-react'
import { getSeatsQuota } from '@/app/actions/enrollments'

export default function SeatsQuotaBanner() {
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [info, setInfo] = useState<{ active: number; max: number } | null>(null)

  useEffect(() => {
    // Only show once per session
    const alreadyDismissed = sessionStorage.getItem('seats-banner-dismissed')
    if (alreadyDismissed) return

    getSeatsQuota()
      .then((q) => {
        if (q && q.activeCount >= q.maxSeats && q.maxSeats > 0) {
          setInfo({ active: q.activeCount, max: q.maxSeats })
          setVisible(true)
        }
      })
      .catch(() => {/* silently ignore */})
  }, [])

  const handleDismiss = () => {
    setDismissed(true)
    sessionStorage.setItem('seats-banner-dismissed', '1')
  }

  if (!visible || dismissed) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        backgroundColor: '#fffbeb',
        borderBottom: '1px solid #fcd34d',
        padding: '0.55rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        fontSize: '0.875rem',
        fontWeight: 500,
        color: '#92400e',
        boxShadow: '0 2px 8px rgba(234,179,8,0.12)',
      }}
      role="alert"
    >
      <AlertTriangle size={16} style={{ flexShrink: 0, color: '#d97706' }} />
      <span>
        <strong>Listener Seats limit reached</strong> — {info?.active}/{info?.max} active seats used.
        New enrollments are blocked until you upgrade.
      </span>
      <Link
        href="/profile#billing-seats"
        style={{
          marginLeft: '0.25rem',
          color: '#b45309',
          fontWeight: 700,
          textDecoration: 'underline',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem',
          whiteSpace: 'nowrap',
        }}
        onClick={handleDismiss}
      >
        Upgrade Seats <ArrowRight size={13} />
      </Link>
      <button
        onClick={handleDismiss}
        style={{
          marginLeft: 'auto',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#92400e',
          padding: '0.25rem',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          opacity: 0.7,
          transition: 'opacity 0.2s',
        }}
        aria-label="Dismiss seats limit warning"
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
      >
        <X size={16} />
      </button>
    </div>
  )
}
