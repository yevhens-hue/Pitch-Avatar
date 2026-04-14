'use client';

import React from 'react';
import Link from 'next/link';
import { Briefcase, Sparkles, MessageSquare, ArrowRight, Target, PlayCircle, HelpCircle } from 'lucide-react';

export default function OnboardingSelector() {
  const variants = [
    {
      title: 'JTBD (Role-based)',
      desc: 'Focused on specific business goals and templates.',
      href: '/onboarding/jtbd',
      icon: <Briefcase size={24} />,
      color: '#6366f1'
    },
    {
      title: 'Magic Start (Fast-track)',
      desc: 'Maximum speed, content-first approach.',
      href: '/onboarding/magic',
      icon: <Sparkles size={24} />,
      color: '#10b981'
    },
    {
      title: 'Conversational',
      desc: 'Interactive chat-based guided setup.',
      href: '/onboarding/conversational',
      icon: <MessageSquare size={24} />,
      color: '#ec4899'
    },
    {
      title: 'Snov.io Style',
      desc: 'Structured B2B wizard with deep personalization.',
      href: '/onboarding/snov',
      icon: <Target size={24} />,
      color: '#4f46e5'
    },
    {
      title: 'Interactive Video',
      desc: 'Video onboarding with interactive clickable hotspots.',
      href: '/onboarding/video',
      icon: <PlayCircle size={24} />,
      color: '#ef4444'
    },
    {
      title: 'Guided Walkthrough',
      desc: 'Step-by-step tour explaining how to create your first avatar.',
      href: '/onboarding/walkthrough',
      icon: <HelpCircle size={24} />,
      color: '#f59e0b'
    }
  ];

  return (
    <main style={{ minHeight: '100vh', padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto', background: '#f8fafc', color: '#0f172a' }}>
      <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.04em', color: '#0f172a' }}>Onboarding Lab</h1>
        <p style={{ opacity: 0.6, fontSize: '1.25rem', color: '#64748b' }}>Test and compare different onboarding strategies for PitchAvatar.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
        {variants.map((v) => (
          <Link key={v.href} href={v.href} style={{ textDecoration: 'none' }}>
            <div style={{ 
              background: '#fff', 
              border: '1px solid #e2e8f0', 
              borderRadius: '28px', 
              padding: '2.5rem', 
              height: '100%',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)'
            }}>
              <div style={{ 
                width: '64px', 
                height: '64px', 
                background: `${v.color}15`, 
                color: v.color, 
                borderRadius: '18px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginBottom: '1.5rem'
              }}>
                {v.icon}
              </div>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.75rem', color: '#1e293b' }}>{v.title}</h3>
              <p style={{ color: '#64748b', marginBottom: '2.5rem', flex: 1, lineHeight: 1.6 }}>{v.desc}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: v.color, fontWeight: 700 }}>
                Try this variant <ArrowRight size={20} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
