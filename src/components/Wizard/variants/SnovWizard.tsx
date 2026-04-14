'use client';

import React, { useState } from 'react';
import { useWizardLogic } from '@/hooks/useWizardLogic';
import styles from './SnovWizard.module.css';
import { 
  Building2, 
  Users, 
  Target, 
  Rocket, 
  Check, 
  ChevronRight, 
  Briefcase, 
  GraduationCap, 
  Globe, 
  Mail 
} from 'lucide-react';

const SnovWizard: React.FC = () => {
  const { setProjectName } = useWizardLogic();
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    industry: '',
    role: '',
    goals: [] as string[],
    teamSize: ''
  });

  const STEPS = [
    { id: 1, title: 'Industry' },
    { id: 2, title: 'Your Role' },
    { id: 3, title: 'Goals' },
    { id: 4, title: 'Company' }
  ];

  const [isCompleted, setIsCompleted] = useState(false);

  const handleNext = () => {
    if (step === 4) {
      setIsCompleted(true);
    } else {
      setStep(s => s + 1);
    }
  };
  const handleBack = () => setStep(s => Math.max(s - 1, 1));

  const industries = [
    { label: 'Technology', icon: <Rocket size={20} /> },
    { label: 'Agency', icon: <Building2 size={20} /> },
    { label: 'E-commerce', icon: <Globe size={20} /> },
    { label: 'Education', icon: <GraduationCap size={20} /> }
  ];

  const roles = [
    { label: 'Sales Manager', icon: <Target size={20} /> },
    { label: 'Marketing Lead', icon: <Briefcase size={20} /> },
    { label: 'Founder / CEO', icon: <Users size={20} /> },
    { label: 'HR / Recruiter', icon: <Users size={20} /> }
  ];

  const goals = [
    'Generate B2B Leads',
    'Automate Outreach',
    'Customer Onboarding',
    'Scale Personal Brand',
    'Internal Training',
    'Product Marketing'
  ];

  if (isCompleted) {
    return (
      <div className={styles.container} style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div className={styles.panel} style={{ textAlign: 'center' }}>
          <div className={styles.iconBox} style={{ width: '80px', height: '80px', margin: '0 auto 2rem', background: '#eef2ff', color: '#6366f1' }}>
            <Check size={40} />
          </div>
          <h1 className={styles.title}>You're all set!</h1>
          <p className={styles.desc}>We've customized PitchAvatar for {data.industry} and your role as {data.role}. Your first project is being prepared.</p>
          <button className={styles.btnNext} style={{ marginTop: '2rem' }} onClick={() => window.location.href = '/'}>
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <div className={styles.logo}>
          <div style={{ background: '#6366f1', padding: '6px', borderRadius: '8px' }}>
            <Rocket size={20} color="white" />
          </div>
          <span>PitchAvatar</span>
        </div>

        <div className={styles.stepList}>
          {STEPS.map((s) => (
            <div 
              key={s.id} 
              className={`${styles.stepItem} ${step === s.id ? styles.stepActive : ''} ${step > s.id ? styles.stepCompleted : ''}`}
            >
              <div className={styles.stepNumber}>
                {step > s.id ? <Check size={14} /> : s.id}
              </div>
              <span>{s.title}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.panel}>
          {step === 1 && (
            <div className="animate-fade-in">
              <div className={styles.header}>
                <h1 className={styles.title}>Which industry do you work in?</h1>
                <p className={styles.desc}>This helps us tailor the AI voice and avatar templates for your specific field.</p>
              </div>
              <div className={styles.optionsGrid}>
                {industries.map(item => (
                  <div 
                    key={item.label}
                    className={`${styles.optionCard} ${data.industry === item.label ? styles.optionSelected : ''}`}
                    onClick={() => setData({ ...data, industry: item.label })}
                  >
                    <div className={styles.iconBox}>{item.icon}</div>
                    <span className={styles.optionLabel}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade-in">
              <div className={styles.header}>
                <h1 className={styles.title}>What is your primary role?</h1>
                <p className={styles.desc}>We'll suggest the most effective presentation structures for your position.</p>
              </div>
              <div className={styles.optionsGrid}>
                {roles.map(item => (
                  <div 
                    key={item.label}
                    className={`${styles.optionCard} ${data.role === item.label ? styles.optionSelected : ''}`}
                    onClick={() => setData({ ...data, role: item.label })}
                  >
                    <div className={styles.iconBox}>{item.icon}</div>
                    <span className={styles.optionLabel}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-fade-in">
              <div className={styles.header}>
                <h1 className={styles.title}>What do you want to achieve?</h1>
                <p className={styles.desc}>Select all that apply. We'll pre-configure your AI goals.</p>
              </div>
              <div className={styles.optionsGrid}>
                {goals.map(goal => (
                  <div 
                    key={goal}
                    className={`${styles.optionCard} ${data.goals.includes(goal) ? styles.optionSelected : ''}`}
                    onClick={() => {
                      const newGoals = data.goals.includes(goal) 
                        ? data.goals.filter(g => g !== goal)
                        : [...data.goals, goal];
                      setData({ ...data, goals: newGoals });
                    }}
                  >
                    <span className={styles.optionLabel}>{goal}</span>
                    {data.goals.includes(goal) && <Check size={16} color="#6366f1" />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="animate-fade-in">
              <div className={styles.header}>
                <h1 className={styles.title}>Final touches</h1>
                <p className={styles.desc}>Tell us a bit about your company to finish the setup.</p>
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Company Name</label>
                <input className={styles.input} placeholder="e.g. Acme Corp" />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label}>How many people in your team?</label>
                <select className={styles.input}>
                  <option>1-10</option>
                  <option>11-50</option>
                  <option>51-200</option>
                  <option>200+</option>
                </select>
              </div>
            </div>
          )}

          <div className={styles.footer}>
            {step > 1 && (
              <button className={styles.btnBack} onClick={handleBack}>Back</button>
            )}
            <button className={styles.btnNext} onClick={handleNext}>
              {step === 4 ? 'Complete Setup' : 'Continue'} 
              <ChevronRight size={18} style={{ marginLeft: '4px' }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SnovWizard;
