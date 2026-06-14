'use client'

import React from 'react'
import Link from 'next/link'
import { useSeatsQuota } from '@/hooks/useSeatsQuota'

export default function QuotaWidget() {
  const { activeCount, maxSeats, usageRatio, isWarning, isLoaded } = useSeatsQuota()

  if (!isLoaded) {
    return (
      <div style={{ padding: '0.5rem', background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', minWidth: '220px' }}>
        <div style={{ height: '20px', background: '#f1f5f9', borderRadius: '4px', marginBottom: '6px' }} />
        <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px' }} />
      </div>
    )
  }

  const barColor = isWarning ? '#ef4444' : '#0061d6'

  return (
    <Link href="/plans" style={{ textDecoration: 'none', display: 'block', width: '100%', minWidth: '220px' }}>
      <div
        style={{ padding: '0.5rem', background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)', transition: 'border-color 0.2s', cursor: 'pointer' }}
        onMouseEnter={e => e.currentTarget.style.borderColor = '#cbd5e1'}
        onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b', marginBottom: '6px', fontWeight: 600 }}>
          <span>Enrollment Seats</span>
          <span style={{ color: isWarning ? '#ef4444' : '#0f172a' }}>{activeCount} / {maxSeats}</span>
        </div>
        <div style={{ width: '100%', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            backgroundColor: barColor,
            width: `${Math.min(100, Math.max(0, usageRatio * 100))}%`,
            transition: 'width 0.3s ease, background-color 0.3s ease'
          }} />
        </div>
        {isWarning && (
          <div style={{ fontSize: '11px', color: '#b45309', marginTop: '8px', textAlign: 'center', backgroundColor: '#fef3c7', padding: '4px 8px', borderRadius: '4px' }}>
            Approaching limit! <span style={{ color: '#d97706', fontWeight: 600, textDecoration: 'underline' }}>Upgrade</span>
          </div>
        )}
      </div>
    </Link>
  )
}
