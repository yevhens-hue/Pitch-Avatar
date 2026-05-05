"use client";

import React, { useState } from 'react';
import Dashboard from '@/components/Dashboard/Dashboard';
import AuthModal from '@/components/Auth/AuthModal';
import CreateProjectModal, { type ModalTabId } from '@/components/Wizard/CreateProjectModal';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useUIStore } from '@/lib/store';

const isDev = process.env.NODE_ENV === 'development';
const isLabMode = process.env.NEXT_PUBLIC_LAB_MODE === 'true';

// Map dashboard tab id → modal tab id
const WIZARD_TAB_MAP: Record<string, ModalTabId> = {
  quick:    'file',
  video:    'video',
  scratch:  'scratch',
  template: 'template',
  ai:       'ai',
}

export default function Home() {
  const { user, loading } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projectModalTab, setProjectModalTab] = useState<ModalTabId>('file');
  const { openGuide } = useUIStore();
  const router = useRouter();

  React.useEffect(() => {
    // In dev or lab mode the custom WelcomeGuide / OnboardingGuide handle onboarding
    if (isDev || isLabMode) return;

    // Auto-launch Stonly onboarding in production only
    let retryCount = 0;
    const maxRetries = 10;

    const triggerStonly = () => {
      // @ts-ignore
      if (window.openStonlyGuide) {
        // @ts-ignore
        window.openStonlyGuide('NGxoMErklJ');
      } else if (retryCount < maxRetries) {
        retryCount++;
        setTimeout(triggerStonly, 1000);
      }
    };

    const timer = setTimeout(triggerStonly, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleOpenPresentationModal = (tab?: string) => {
    if (tab === 'chat') {
      // Chat Avatar has its own dedicated wizard page
      router.push('/chat-avatar/create');
      return;
    }
    if (tab === 'onboarding') {
      if (isDev || isLabMode) {
        openGuide();
      } else {
        // @ts-ignore
        if (window.openStonlyGuide) window.openStonlyGuide('NGxoMErklJ');
      }
      return;
    }
    // All other tabs (quick/video/scratch/template/ai) → open the unified modal
    const modalTab: ModalTabId = (tab && WIZARD_TAB_MAP[tab]) ? WIZARD_TAB_MAP[tab] : 'file';
    setProjectModalTab(modalTab);
    setIsProjectModalOpen(true);
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
      <CreateProjectModal
        isOpen={isProjectModalOpen}
        initialTab={projectModalTab}
        onClose={() => setIsProjectModalOpen(false)}
      />
    </div>
  );
}
