'use client';

import React, { useState } from 'react';
import styles from './Walkthrough.module.css';
import { Rocket, Plus, BookOpen, UserCircle, BarChart } from 'lucide-react';

import { useUIStore } from '@/lib/store';

const Walkthrough: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const { closeOnboarding } = useUIStore();

  const steps = [
    {
      title: 'Welcome to PitchAvatar',
      desc: 'Let\'s take a 30-second tour to show you how to create your first AI avatar.',
      target: { top: '20%', left: '30%', width: '40%', height: '20%' }, // Center welcome
      position: 'bottom'
    },
    {
      title: '1. Create New Project',
      desc: 'Start here! You can upload a PDF or start from scratch. This is the first step to your AI avatar.',
      target: { top: '70px', left: '260px', width: '300px', height: '160px' }, // Mocking "Quick Presentation" card
      position: 'right'
    },
    {
      title: '2. Select AI Avatar',
      desc: 'Once you upload content, you\'ll choose your AI persona. Go to "Avatar roles" to see your library.',
      target: { top: '260px', left: '20px', width: '220px', height: '40px' }, // Mocking sidebar "Avatar roles"
      position: 'right'
    },
    {
      title: '3. Train with Knowledge',
      desc: 'Upload extra PDFs here. This is how you make your avatar smart enough to answer viewer questions.',
      target: { top: '210px', left: '20px', width: '220px', height: '40px' }, // Mocking sidebar "Knowledge base"
      position: 'right'
    },
    {
      title: '4. Analyze Results',
      desc: 'After sharing your link, come here to see who watched your presentation and how they interacted.',
      target: { top: '480px', left: '20px', width: '220px', height: '40px' }, // Mocking sidebar "Analytics"
      position: 'right'
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setIsActive(false);
      closeOnboarding();
    }
  };

  if (!isActive) return null;

  const current = steps[currentStep];

  return (
    <div className={styles.overlay}>
      {/* Mock Dashboard Background - Light Theme */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: '#f8fafc', zIndex: -1 }}>
        <div style={{ width: '240px', height: '100%', borderRight: '1px solid #e2e8f0', padding: '2rem', background: '#fff' }}>
          <div style={{ marginBottom: '3rem', fontWeight: 900, color: '#6366f1', fontSize: '1.2rem', letterSpacing: '-0.02em' }}>PITCH AVATAR</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', opacity: 0.4 }}>
            <div style={{ display: 'flex', gap: '12px', fontWeight: 700, color: '#1e293b' }}><Plus size={18}/> New Project</div>
            <div style={{ display: 'flex', gap: '12px', fontWeight: 700, color: '#1e293b' }}><BookOpen size={18}/> Knowledge base</div>
            <div style={{ display: 'flex', gap: '12px', fontWeight: 700, color: '#1e293b' }}><UserCircle size={18}/> Avatar roles</div>
            <div style={{ display: 'flex', gap: '12px', fontWeight: 700, color: '#1e293b' }}><BarChart size={18}/> Analytics</div>
          </div>
        </div>
        <div style={{ position: 'absolute', top: '80px', left: '280px', display: 'flex', gap: '20px', opacity: 0.4 }}>
          <div style={{ width: '280px', height: '180px', background: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }} />
          <div style={{ width: '280px', height: '180px', background: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }} />
        </div>
      </div>

      <div 
        className={styles.highlight} 
        style={{ 
          top: current.target.top, 
          left: current.target.left, 
          width: current.target.width, 
          height: current.target.height 
        }} 
      />

      <div 
        className={styles.popover}
        style={{
          top: `calc(${current.target.top} + ${current.position === 'bottom' ? current.target.height : '0px'} + 20px)`,
          left: `calc(${current.target.left} + ${current.position === 'right' ? current.target.width : '0px'} + 20px)`
        }}
      >
        <div className={styles.title}>
          <Rocket size={18} color="#6366f1" />
          {current.title}
        </div>
        <p className={styles.desc}>{current.desc}</p>
        <div className={styles.footer}>
          <span className={styles.steps}>Step {currentStep + 1} of {steps.length}</span>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className={styles.btnSkip} onClick={() => setIsActive(false)}>Skip</button>
            <button className={styles.btnNext} onClick={handleNext}>
              {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Walkthrough;
