'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { getSeatsQuota } from '@/app/actions/enrollments'
import { ListenerSeat } from '@/types/listeners'

interface QuotaWidgetProps {
  quota?: ListenerSeat | null;
}

export default function QuotaWidget({ quota: initialQuota }: QuotaWidgetProps) {
  const [quota, setQuota] = useState<ListenerSeat | null>(initialQuota || null)

  useEffect(() => {
    if (!initialQuota) {
      getSeatsQuota().then(res => {
        if (res) setQuota(res)
      }).catch(err => console.error("Failed to fetch quota:", err))
    } else {
      setQuota(initialQuota)
    }
  }, [initialQuota])

  if (!quota) {
    return null;
  }

  const usageRatio = quota.maxSeats > 0 ? quota.activeCount / quota.maxSeats : 0;
  const isWarning = usageRatio >= 0.9;
  
  let barColor = '#7c3aed';
  if (isWarning) {
    barColor = '#ef4444';
  }

  return (
    <Link href="/settings" style={{ textDecoration: 'none', display: 'block', width: '100%', minWidth: '220px' }}>
      <div style={{ padding: '0.5rem', background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', transition: 'border-color 0.2s', cursor: 'pointer' }}
           onMouseEnter={(e) => e.currentTarget.style.borderColor = '#cbd5e1'}
           onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b', marginBottom: '6px', fontWeight: 600 }}>
          <span>Enrollments In Use</span>
          <span style={{ color: isWarning ? '#ef4444' : '#0f172a' }}>{quota.activeCount} / {quota.maxSeats}</span>
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
