'use client';

import React from 'react';
import Link from 'next/link';
import { Briefcase, Sparkles, MessageSquare, ArrowRight, Target } from 'lucide-react';

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
      color: '#6366f1'
    }
  ];

  return (
    <main style={{ minHeight: '100vh', padding: '4rem 2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem' }}>Onboarding Lab</h1>
        <p style={{ opacity: 0.6, fontSize: '1.2rem' }}>Test and compare different onboarding strategies for PitchAvatar.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {variants.map((v) => (
          <Link key={v.href} href={v.href} style={{ textDecoration: 'none' }}>
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.03)', 
              border: '1px solid rgba(255, 255, 255, 0.1)', 
              borderRadius: '24px', 
              padding: '2.5rem', 
              height: '100%',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{ 
                width: '56px', 
                height: '56px', 
                background: `${v.color}20`, 
                color: v.color, 
                borderRadius: '14px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginBottom: '1.5rem'
              }}>
                {v.icon}
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.75rem', color: '#fff' }}>{v.title}</h3>
              <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '2rem', flex: 1 }}>{v.desc}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: v.color, fontWeight: 600 }}>
                Try this variant <ArrowRight size={18} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
