"use client";

import React, { useState } from 'react';
import Dashboard from '@/components/Dashboard/Dashboard';
import AuthModal from '@/components/Auth/AuthModal';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useUIStore } from '@/lib/store';

const isDev = process.env.NODE_ENV === 'development';

export default function Home() {
  const { user, loading } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const { openGuide } = useUIStore();
  const router = useRouter();

  React.useEffect(() => {
    if (isDev) return; // OnboardingGuide handles this in dev mode

    // Auto-launch Stonly onboarding in production
    let retryCount = 0;
    const maxRetries = 10;

    const triggerStonly = () => {
      // @ts-ignore
      if (window.openStonlyGuide) {
        // @ts-ignore
        window.openStonlyGuide('GciflOn74c');
      } else if (retryCount < maxRetries) {
        retryCount++;
        setTimeout(triggerStonly, 1000);
      }
    };

    const timer = setTimeout(triggerStonly, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleOpenPresentationModal = (tab?: string) => {
    if (tab === 'quick') {
      router.push('/create/quick');
    } else if (tab === 'video') {
      router.push('/create/video');
    } else if (tab === 'scratch') {
      router.push('/create/scratch');
    } else if (tab === 'chat') {
      router.push('/chat-avatar/create');
    } else if (tab === 'onboarding') {
      if (isDev) {
        openGuide();
      } else {
        // @ts-ignore
        if (window.openStonlyGuide) window.openStonlyGuide('GciflOn74c');
      }
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        color: '#64748b',
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
