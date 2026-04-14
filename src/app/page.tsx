"use client";

import React, { useState } from 'react';
import Dashboard from '@/components/Dashboard/Dashboard';
import AuthModal from '@/components/Auth/AuthModal';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useUIStore } from '@/lib/store';

export default function Home() {
  const { user, loading } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const { openOnboarding } = useUIStore();
  const router = useRouter();

  const handleOpenPresentationModal = (tab?: string) => {
    // If not logged in, show AuthModal instead of navigating
    if (!user) {
      setIsAuthOpen(true);
      return;
    }

    if (tab === 'scratch') {
      router.push('/editor');
    } else if (tab === 'onboarding') {
      openOnboarding();
    } else {
      router.push(`/create?type=${tab || 'quick'}`);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        color: '#64748b'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto' }}>
      <Dashboard onOpenPresentationModal={handleOpenPresentationModal} />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}

