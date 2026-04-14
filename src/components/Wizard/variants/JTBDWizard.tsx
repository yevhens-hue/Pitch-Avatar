'use client';

import React, { useState } from 'react';
import { useWizardLogic } from '@/hooks/useWizardLogic';
import styles from './JTBDWizard.module.css';
import Wizard from '../Wizard';
import { Briefcase, Users, User, ArrowLeft, ArrowRight, Sparkles, Youtube, Target, GraduationCap, Laptop } from 'lucide-react';

const JTBDWizard: React.FC = () => {
  const { setStep, setProjectName, setAiMode } = useWizardLogic();
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);

  const goals = [
    {
      id: 'sales',
      title: 'Sales & Outreach',
      desc: 'Close deals faster with personalized video pitches.',
      icon: <Target size={32} />,
      projectName: 'Sales Outreach',
      mode: 'video',
      color: '#6366f1',
      subOptions: [
        { id: 'cold', label: 'Cold Outreach', desc: 'First contact for prospects' },
        { id: 'demo', label: 'Product Demo', desc: 'Showcase features clearly' },
        { id: 'followup', label: 'Follow-up', desc: 'Keep the momentum going' }
      ]
    },
    {
      id: 'marketing',
      title: 'Social & Ads',
      desc: 'Engaging content for TikTok, YouTube & Reels.',
      icon: <Youtube size={32} />,
      projectName: 'Marketing Clip',
      mode: 'video',
      color: '#ec4899',
      subOptions: [
        { id: 'ad', label: 'Video Ad', desc: 'High-conversion paid ads' },
        { id: 'viral', label: 'Social Content', desc: 'Organic growth videos' },
        { id: 'explainer', label: 'Explainer', desc: 'Complex ideas made simple' }
      ]
    },
    {
      id: 'hr',
      title: 'Training & L&D',
      desc: 'Onboard and upskill your team effectively.',
      icon: <GraduationCap size={32} />,
      projectName: 'Training Module',
      mode: 'video',
      color: '#10b981',
      subOptions: [
        { id: 'onboard', label: 'Employee Onboarding', desc: 'Welcome new team members' },
        { id: 'compliance', label: 'Compliance', desc: 'Mandatory safety & rules' },
        { id: 'product', label: 'Internal Update', desc: 'Company-wide news' }
      ]
    },
    {
      id: 'saas',
      title: 'Product & Dev',
      desc: 'Communicate updates and documentation.',
      icon: <Laptop size={32} />,
      projectName: 'Product Update',
      mode: 'voice',
      color: '#f59e0b',
      subOptions: [
        { id: 'release', label: 'Release Notes', desc: 'What\'s new in the app' },
        { id: 'doc', label: 'Documentation', desc: 'Interactive help guides' },
        { id: 'feedback', label: 'User Feedback', desc: 'Replying to feature requests' }
      ]
    }
  ];

  const [selectedSub, setSelectedSub] = useState<string | null>(null);

  const handleSelectGoal = (goal: any) => {
    setSelectedGoal(goal.id);
    setProjectName(goal.projectName);
    setAiMode(goal.mode as any);
    setSelectedSub(null);
  };

  if (!selectedGoal) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.badge}><Sparkles size={14} /> AI Optimized Templates</div>
          <h1 className={styles.title}>What's your primary goal?</h1>
          <p className={styles.subtitle}>Choose a category to unlock pre-configured AI personalities and structures.</p>
        </div>
        
        <div className={styles.grid}>
          {goals.map((goal) => (
            <div 
              key={goal.id} 
              className={styles.card}
              onClick={() => handleSelectGoal(goal)}
              style={{ '--brand-color': goal.color } as React.CSSProperties}
            >
              <div className={styles.cardGlow} />
              <div className={styles.iconWrapper}>{goal.icon}</div>
              <h3 className={styles.cardTitle}>{goal.title}</h3>
              <p className={styles.cardDesc}>{goal.desc}</p>
              <div className={styles.cardFooter}>
                <span>3 Templates</span>
                <ArrowRight size={16} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (selectedGoal && !selectedSub) {
    const currentGoal = goals.find(g => g.id === selectedGoal);
    return (
      <div className={styles.container}>
        <button onClick={() => setSelectedGoal(null)} className={styles.backBtn}>
          <ArrowLeft size={16} /> Back to categories
        </button>
        <div className={styles.header}>
          <h1 className={styles.title}>Select a use case</h1>
          <p className={styles.subtitle}>This will help us optimize the AI avatar's tone and body language.</p>
        </div>
        <div className={styles.subGrid}>
          {currentGoal?.subOptions.map((opt) => (
            <div 
              key={opt.id} 
              className={styles.subCard}
              onClick={() => {
                setSelectedSub(opt.id);
                setProjectName(`${currentGoal.projectName}: ${opt.label}`);
              }}
            >
              <div className={styles.subCardContent}>
                <h4 className={styles.subTitle}>{opt.label}</h4>
                <p className={styles.subDesc}>{opt.desc}</p>
              </div>
              <div className={styles.subAction}>
                <ArrowRight size={20} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wizardWrapper}>
      <button 
        onClick={() => setSelectedSub(null)}
        className={styles.backBtn}
      >
        <ArrowLeft size={16} /> Change use case
      </button>
      <Wizard />
    </div>
  );
};

export default JTBDWizard;
