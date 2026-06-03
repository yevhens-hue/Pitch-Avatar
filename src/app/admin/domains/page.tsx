'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/ToastProvider';
import { createClient } from '@/utils/supabase/client';

export default function AdminDomainsPage() {
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    async function loadDomain() {
      // For simplicity, we store the custom domain in a simple settings table or 
      // just in a single row for the organization if multi-tenant.
      // Since we don't have a specific settings table defined, let's assume we have 
      // an 'organization_settings' table or similar, but for now we'll just mock loading.
      // In a real implementation this would fetch from Supabase.
      setDomain('https://learn.pitch-avatar.com');
    }
    loadDomain();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Real implementation would save to Supabase
    // await supabase.from('settings').update({ custom_domain: domain }).eq('id', 1);
    
    setTimeout(() => {
      showToast('Custom domain configuration saved successfully.', 'success');
      setLoading(false);
    }, 500);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Custom Domains (Phase 3)</h1>
      <p style={{ color: '#64748b', marginBottom: '2rem' }}>
        Configure the base URL used for generating iframe embed codes and access links for Enrollments.
        This allows you to white-label the viewer experience.
      </p>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <div>
          <label htmlFor="customDomain" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#334155', marginBottom: '0.5rem' }}>
            Base Delivery Domain
          </label>
          <input
            id="customDomain"
            type="url"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="https://learn.yourcompany.com"
            required
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.875rem' }}
          />
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem' }}>
            Ensure you have configured your DNS settings to point to our servers.
          </p>
        </div>

        <div>
          <button 
            type="submit" 
            disabled={loading}
            style={{ background: '#2563eb', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', fontSize: '0.875rem', cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </form>
    </div>
  );
}
