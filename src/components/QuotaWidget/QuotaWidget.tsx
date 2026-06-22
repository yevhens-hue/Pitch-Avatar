'use client'

import React, { useState } from 'react'
import { useSeatsQuota } from '@/hooks/useSeatsQuota'

import { Info } from 'lucide-react'

export default function QuotaWidget() {
  const { activeCount, maxSeats, usageRatio, isWarning, isLoaded } = useSeatsQuota()
  const [showModal, setShowModal] = useState(false)

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
    <>
      <div
        onClick={() => setShowModal(true)}
        className={isWarning ? "warning-box" : ""}
        style={{ 
          width: '100%', minWidth: '220px', padding: '0.5rem', cursor: 'pointer',
          ...(isWarning ? {} : { background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' })
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: isWarning ? '#ec7600' : '#64748b', marginBottom: '6px', fontWeight: 600 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>{remaining} Seats remaining</span>
            <span title="Sending multiple assignments to the same listener only consumes 1 seat" style={{ cursor: 'help', display: 'flex', color: '#94a3b8' }}>
              <Info size={12} />
            </span>
          </div>
          <span style={{ color: isWarning ? '#f70000' : '#0f172a' }}>{activeCount} / {maxSeats}</span>
        </div>
        
        {/* Progress Bar with ARIA attributes */}
        <div 
          role="progressbar" 
          aria-valuenow={activeCount} 
          aria-valuemin={0} 
          aria-valuemax={maxSeats}
          style={{ width: '100%', height: isWarning ? '6px' : '4px', backgroundColor: isWarning ? 'var(--yellow-stroke-shadow)' : '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}
        >
          <div style={{
            height: '100%',
            backgroundColor: isWarning ? 'var(--status-warning)' : barColor,
            width: `${Math.min(100, Math.max(0, usageRatio * 100))}%`,
            transition: 'width 0.3s ease, background-color 0.3s ease'
          }} />
        </div>
        
        {isWarning && (
          <div style={{ fontSize: '11px', color: '#ec7600', marginTop: '8px', textAlign: 'center', fontWeight: 500 }}>
            Approaching Limit: Only {remaining} seats left! <span style={{ color: '#d11b81', fontWeight: 600, textDecoration: 'underline' }}>Get More Seats</span>
          </div>
        )}
      </div>

      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: 'white', borderRadius: '12px', padding: '24px', maxWidth: '420px', width: '100%',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)'
          }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '1.25rem', color: '#1e293b', fontWeight: 600 }}>Payment system is temporarily unavailable</h2>
            <p style={{ margin: '0 0 12px 0', fontSize: '1rem', color: '#1e293b', lineHeight: '1.5' }}>
              We are sorry, the payment system is temporary unavailable due to technical issues.
            </p>
            <p style={{ margin: '0 0 24px 0', fontSize: '1rem', color: '#1e293b', lineHeight: '1.5' }}>
              Please contact us in chat or by email: <a href="mailto:support@pitchavatar.com" style={{ color: '#0061d6', textDecoration: 'underline' }}>support@pitchavatar.com</a>
            </p>
            <button
              onClick={() => setShowModal(false)}
              style={{
                backgroundColor: '#333333', color: 'white', border: 'none', padding: '8px 24px',
                borderRadius: '6px', fontSize: '1rem', fontWeight: 500, cursor: 'pointer',
              }}
            >
              Ok
            </button>
          </div>
        </div>
      )}
    </>
  )
}
