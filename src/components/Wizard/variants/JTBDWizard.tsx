'use client';

import React, { useState } from 'react';
import { useWizardLogic } from '@/hooks/useWizardLogic';
import styles from './JTBDWizard.module.css';
import Wizard from '../Wizard';
import { Briefcase, Users, User, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';

const JTBDWizard: React.FC = () => {
  const { setStep, setProjectName, setAiMode } = useWizardLogic();
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);

  const goals = [
    {
      id: 'sales',
      title: 'Sales & Outreach',
      desc: 'Create personalized video pitches and demos that convert.',
      icon: <Briefcase size={32} />,
      projectName: 'Sales Campaign',
      mode: 'video',
      subOptions: ['Cold Outreach', 'Product Demo', 'Follow-up']
    },
    {
      id: 'marketing',
      title: 'Marketing & Social',
      desc: 'Engaging content for YouTube, TikTok, and Instagram.',
      icon: <Sparkles size={32} />,
      projectName: 'Marketing Clip',
      mode: 'video',
      subOptions: ['Social Media', 'Ad Campaign', 'Explainer Video']
    },
    {
      id: 'hr',
      title: 'L&D / Corporate',
      desc: 'Onboarding, training, and internal communications.',
      icon: <Users size={32} />,
      projectName: 'Employee Training',
      mode: 'video',
      subOptions: ['Onboarding', 'Compliance', 'Skills Training']
    },
    {
      id: 'brand',
      title: 'Personal Brand',
      desc: 'Your AI twin for thought leadership and newsletters.',
      icon: <User size={32} />,
      projectName: 'Personal Update',
      mode: 'voice',
      subOptions: ['LinkedIn Update', 'Podcast', 'Newsletter']
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
          <h1 className={styles.title}>What describes you best?</h1>
          <p className={styles.subtitle}>We'll personalize your experience based on your goals.</p>
        </div>
        
        <div className={styles.grid}>
          {goals.map((goal) => (
            <div 
              key={goal.id} 
              className={styles.card}
              onClick={() => handleSelectGoal(goal)}
            >
              <div className={styles.iconWrapper}>{goal.icon}</div>
              <h3 className={styles.cardTitle}>{goal.title}</h3>
              <p className={styles.cardDesc}>{goal.desc}</p>
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
          <ArrowLeft size={16} /> Back
        </button>
        <div className={styles.header}>
          <h1 className={styles.title}>Where will you use this?</h1>
          <p className={styles.subtitle}>Select a specific use case for {currentGoal?.title}.</p>
        </div>
        <div className={styles.grid}>
          {currentGoal?.subOptions.map((opt) => (
            <div 
              key={opt} 
              className={styles.subCard}
              onClick={() => setSelectedSub(opt)}
            >
              <span>{opt}</span>
              <ArrowRight size={18} />
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
