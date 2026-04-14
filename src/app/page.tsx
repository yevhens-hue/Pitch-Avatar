"use client";

import React, { useState, useMemo } from 'react';
import Dashboard from '@/components/Dashboard/Dashboard';
import AuthModal from '@/components/Auth/AuthModal';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { user, loading } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const router = useRouter();

  const showAuth = useMemo(() => !loading && !user, [loading, user]);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleOpenPresentationModal = (tab?: string) => {
    if (tab === 'scratch') {
      // Create from scratch bypasses the wizard and goes directly to the Editor
      router.push('/editor');
    } else if (tab === 'onboarding') {
      router.push('/onboarding');
    } else {
      // Other options like Quick Presentation open the Wizard
      router.push(`/create?type=${tab || 'quick'}`);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '2rem', height: '100%', overflowY: 'auto' }}>
      {user ? (
        <Dashboard onOpenPresentationModal={handleOpenPresentationModal} />
      ) : (
        <div style={{ textAlign: 'center', marginTop: '10vh' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 700, marginBottom: '1rem', background: 'linear-gradient(to right, #a8edea, #fed6e3)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Pitch Avatar</h1>
          <p style={{ opacity: 0.8, marginBottom: '2rem', fontSize: '1.2rem' }}>Automate your sales with interactive AI-driven presentations</p>
          <button 
             onClick={() => setIsAuthOpen(true)}
             style={{ padding: '0.8rem 2rem', fontSize: '1.1rem', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
          >
            Sign In / Sign Up
          </button>
        </div>
      )}
      
      <AuthModal isOpen={isAuthOpen || showAuth} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}
