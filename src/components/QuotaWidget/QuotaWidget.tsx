'use client'

import React from 'react'
import Link from 'next/link'
import { useSeatsQuota } from '@/hooks/useSeatsQuota'

import { Info } from 'lucide-react'

export default function QuotaWidget() {
  const { activeCount, maxSeats, usageRatio, isWarning, isLoaded } = useSeatsQuota()

  if (!isLoaded) {
    return (
      <div style={{ padding: '0.5rem', background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', minWidth: '220px' }}>
        <div style={{ height: '16px', background: '#f1f5f9', borderRadius: '4px', marginBottom: '6px' }} />
        <div style={{ height: '4px', background: '#f1f5f9', borderRadius: '4px' }} />
      </div>
    )
  }

  const barColor = isWarning ? '#ef4444' : '#0061d6'
  const remaining = Math.max(0, maxSeats - activeCount)

  return (
    <Link href="/plans" style={{ textDecoration: 'none', display: 'block', width: '100%', minWidth: '220px' }}>
      <div
        style={{ padding: '0.5rem', background: isWarning ? '#fef2f2' : 'white', borderRadius: '8px', border: '1px solid', borderColor: isWarning ? '#fca5a5' : '#e2e8f0', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)', transition: 'border-color 0.2s', cursor: 'pointer' }}
        onMouseEnter={e => e.currentTarget.style.borderColor = isWarning ? '#ef4444' : '#cbd5e1'}
        onMouseLeave={e => e.currentTarget.style.borderColor = isWarning ? '#fca5a5' : '#e2e8f0'}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: isWarning ? '#991b1b' : '#64748b', marginBottom: '6px', fontWeight: 600 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>{remaining} Seats remaining</span>
            <span title="Sending multiple assignments to the same listener only consumes 1 seat" style={{ cursor: 'help', display: 'flex', color: '#94a3b8' }}>
              <Info size={12} />
            </span>
          </div>
          <span style={{ color: isWarning ? '#ef4444' : '#0f172a' }}>{activeCount} / {maxSeats}</span>
        </div>
        
        {/* Progress Bar with ARIA attributes */}
        <div 
          role="progressbar" 
          aria-valuenow={activeCount} 
          aria-valuemin={0} 
          aria-valuemax={maxSeats}
          style={{ width: '100%', height: isWarning ? '6px' : '4px', backgroundColor: isWarning ? '#fee2e2' : '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}
        >
          <div style={{
            height: '100%',
            backgroundColor: barColor,
            width: `${Math.min(100, Math.max(0, usageRatio * 100))}%`,
            transition: 'width 0.3s ease, background-color 0.3s ease'
          }} />
        </div>
        
        {isWarning && (
          <div style={{ fontSize: '11px', color: '#b45309', marginTop: '8px', textAlign: 'center', backgroundColor: '#fef3c7', padding: '4px 8px', borderRadius: '4px' }}>
            Approaching Limit: Only {remaining} seats left! <span style={{ color: '#d97706', fontWeight: 600, textDecoration: 'underline' }}>Get More Seats</span>
          </div>
        )}
      </div>
    </Link>
  )
}
