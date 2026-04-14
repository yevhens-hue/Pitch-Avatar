'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Target, 
  Youtube, 
  GraduationCap, 
  Laptop, 
  ArrowRight, 
  Sparkles, 
  FileUp, 
  MessageSquare,
  UserCheck,
  Zap
} from 'lucide-react';
import styles from './OnboardingMaster.module.css';

export default function OnboardingMaster() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<string | null>(null);

  const roles = [
    { id: 'sales', title: 'Sales & Outreach', icon: <Target size={28} />, color: '#6366f1' },
    { id: 'marketing', title: 'Marketing', icon: <Youtube size={28} />, color: '#ec4899' },
    { id: 'hr', title: 'Training & L&D', icon: <GraduationCap size={28} />, color: '#10b981' },
    { id: 'saas', title: 'Product & Dev', icon: <Laptop size={28} />, color: '#f59e0b' },
  ];

  const paths = [
    { 
      id: 'template', 
      title: 'Choose a Template', 
      desc: 'Start with professionally designed layouts.',
      icon: <Sparkles size={24} />,
      href: '/onboarding/jtbd'
    },
    { 
      id: 'import', 
      title: 'Upload PDF / PPTX', 
      desc: 'Instantly convert your files to AI video.',
      icon: <FileUp size={24} />,
      href: '/create?type=video&step=3' 
    },
    { 
      id: 'magic', 
      title: 'Magic AI Generation', 
      desc: 'Describe your idea and let AI do the rest.',
      icon: <Zap size={24} />,
      href: '/onboarding/magic' 
    }
  ];

  return (
    <main className={styles.container}>
      <div className={styles.backgroundGlow} />
      
      <div className={styles.content}>
        {step === 1 && (
          <div className={styles.stepWrapper}>
            <div className={styles.header}>
              <div className={styles.badge}>
                <Sparkles size={14} /> Personalized for you
              </div>
              <h1 className={styles.title}>What's your primary goal?</h1>
              <p className={styles.subtitle}>We'll tailor the tools, avatars, and templates to your specific needs.</p>
            </div>

            <div className={styles.roleGrid}>
              {roles.map((r) => (
                <button 
                  key={r.id} 
                  className={styles.roleCard}
                  onClick={() => {
                    setRole(r.id);
                    setStep(2);
                  }}
                  style={{ '--accent-color': r.color } as React.CSSProperties}
                >
                  <div className={styles.iconBox}>{r.icon}</div>
                  <span className={styles.roleTitle}>{r.title}</span>
                  <div className={styles.roleGlow} />
                </button>
              ))}
            </div>

            <footer className={styles.footer}>
              <button 
                className={styles.skipLink}
                onClick={() => router.push('/dashboard')}
              >
                Skip to Dashboard
              </button>
            </footer>
          </div>
        )}

        {step === 2 && (
          <div className={styles.stepWrapper}>
            <div className={styles.header}>
              <h1 className={styles.title}>How would you like to start?</h1>
              <p className={styles.subtitle}>Select the fastest way to get your first AI-powered presentation ready.</p>
            </div>

            <div className={styles.pathList}>
              {paths.map((p) => (
                <button 
                  key={p.id} 
                  className={styles.pathCard}
                  onClick={() => {
                    if (role) {
                      router.push(`${p.href}${p.href.includes('?') ? '&' : '?'}role=${role}`);
                    } else {
                      router.push(p.href);
                    }
                  }}
                >
                  <div className={styles.pathIcon}>{p.icon}</div>
                  <div className={styles.pathText}>
                    <h3 className={styles.pathTitle}>{p.title}</h3>
                    <p className={styles.pathDesc}>{p.desc}</p>
                  </div>
                  <ArrowRight className={styles.pathArrow} size={20} />
                </button>
              ))}
            </div>

            <footer className={styles.footer}>
              <button 
                className={styles.backBtn}
                onClick={() => setStep(1)}
              >
                Back
              </button>
            </footer>
          </div>
        )}
      </div>

      {/* Social Proof / Trust Banner like top SaaS */}
      <div className={styles.trustBanner}>
        <div className={styles.trustItem}>
          <UserCheck size={16} />
          <span>Trusted by 50,000+ creators</span>
        </div>
        <div className={styles.trustItem}>
          <Zap size={16} />
          <span>3x faster than manual production</span>
        </div>
      </div>
    </main>
  );
}
