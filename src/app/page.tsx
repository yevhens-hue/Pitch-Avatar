"use client";

import React, { useState, Suspense } from 'react';
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
  const [projectModalTemplateId, setProjectModalTemplateId] = useState<string | null>(null);
  const { openGuide } = useUIStore();
  const router = useRouter();

  const handleOpenPresentationModal = (tab?: string, templateId?: string) => {
    if (tab === 'chat') {
      // Chat Avatar has its own dedicated wizard page
      router.push('/chat-avatar/create');
      return;
    }
    if (tab === 'onboarding') {
      if (isDev) {
        openGuide();
      } else {
        // @ts-expect-error StonlyGuide is injected by <script>
        if (window.openStonlyGuide) window.openStonlyGuide("GciflOn74c");
      }
      return;
    }
    // All other tabs (quick/video/scratch/template/ai) → open the unified modal
    const modalTab: ModalTabId = (tab && WIZARD_TAB_MAP[tab]) ? WIZARD_TAB_MAP[tab] : 'file';
    setProjectModalTab(modalTab);
    setProjectModalTemplateId(templateId || null);
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
      {isProjectModalOpen && (
        <Suspense fallback={<div>Loading...</div>}>
          <CreateProjectModal
            isOpen={isProjectModalOpen}
            initialTab={projectModalTab}
            initialTemplateId={projectModalTemplateId || undefined}
            onClose={() => setIsProjectModalOpen(false)}
          />
        </Suspense>
      )}
    </div>
  );
}