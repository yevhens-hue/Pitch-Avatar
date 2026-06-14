import React from 'react';
import { X, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface OverageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OverageModal({ isOpen, onClose }: OverageModalProps) {
  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)', width: '100%', maxWidth: '400px', overflow: 'hidden', position: 'relative' }}>
        <div style={{ backgroundColor: '#fef2f2', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', borderBottom: '1px solid #fee2e2' }}>
          <div style={{ backgroundColor: '#fee2e2', padding: '0.75rem', borderRadius: '9999px', marginBottom: '1rem' }}>
            <AlertCircle color="#dc2626" size={32} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', margin: '0 0 0.5rem 0' }}>Active Seats Limit Reached</h2>
          <p style={{ fontSize: '0.875rem', color: '#4b5563', margin: 0 }}>
            You have reached your limit of active Enrollment Seats. 
            To send new assignments, you need to either purchase additional seats or archive/delete older active enrollments.
          </p>
        </div>
        <div style={{ padding: '1.5rem', backgroundColor: '#f9fafb', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <Link 
            href="/settings"
            onClick={onClose}
            style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '0.625rem 1rem', backgroundColor: '#2563eb', color: '#fff', borderRadius: '6px', fontWeight: 500, textDecoration: 'none' }}
          >
            Upgrade Quota
          </Link>
          <button 
            onClick={onClose}
            style={{ width: '100%', padding: '0.625rem 1rem', backgroundColor: '#fff', border: '1px solid #d1d5db', color: '#374151', borderRadius: '6px', fontWeight: 500, cursor: 'pointer' }}
          >
            Cancel
          </button>
        </div>
        <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer' }}>
          <X size={20} />
        </button>
      </div>
    </div>
  );
}
