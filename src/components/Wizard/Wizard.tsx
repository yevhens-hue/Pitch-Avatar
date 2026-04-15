import React, { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Settings, 
  User, 
  Eye, 
  Share2, 
  ChevronRight, 
  ChevronLeft,
  Check, 
  Key, 
  FileText, 
  BookOpen,
  Sparkles,
  ArrowLeft,
  FileUp,
  Gift,
  ArrowRight
} from 'lucide-react';
import { useUIStore } from '@/lib/store';
import styles from './Wizard.module.css';

const STEPS = [
  { id: 1, name: 'General Settings', icon: <Settings size={16} /> },
  { id: 2, name: 'Avatar', icon: <User size={16} /> },
  { id: 3, name: 'Role', icon: <Key size={16} /> },
  { id: 4, name: 'Instructions', icon: <FileText size={16} /> },
  { id: 5, name: 'Knowledge Base', icon: <BookOpen size={16} /> },
  { id: 6, name: 'Preview', icon: <Eye size={16} /> },
  { id: 7, name: 'Share / Assign', icon: <Share2 size={16} /> },
];

const Wizard: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { 
    closeOnboarding, 
    endTour, 
    toggleChecklist, 
    setCurrentChecklistStep,
    setOnboardingCompleted 
  } = useUIStore();
  const type = searchParams.get('type') || 'quick';
  const urlStep = parseInt(searchParams.get('step') || '1');

  const [step, setStep] = useState<number>(urlStep);

  useEffect(() => {
    if (urlStep && urlStep !== step) {
      setStep(urlStep);
    }
  }, [urlStep, step]);

  // Sync checklist progress when reaching the end
  useEffect(() => {
    if (step === 7) {
      setCurrentChecklistStep(4); // Last step index
    }
  }, [step, setCurrentChecklistStep]);

  const handleFinish = () => {
    // Clear all onboarding states to avoid "blur" or darkening
    endTour();
    closeOnboarding();
    toggleChecklist(false);
    setOnboardingCompleted(true);
    router.push('/');
  };

  // Sync step changes back to URL for consistency
  const handleSetStep = (newStep: number) => {
    setStep(newStep);
    const params = new URLSearchParams(searchParams.toString());
    params.set('step', newStep.toString());
    router.replace(`/create?${params.toString()}`);
  };
  const [projectName, setProjectName] = useState(
    type === 'chat' ? 'AI Sales Assistant' : 
    type === 'course' ? 'New Training Course' : 'New Project'
  );
  const [aiMode, setAiMode] = useState<'video' | 'voice'>('video');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async () => {
    // Mock upload for now
    setTimeout(() => {
      alert("Knowledge source added successfully!");
    }, 1500);
  };



  return (
    <div className={styles.wizardContainer}>
      {/* 1. Steps Sidebar (Left) */}
      <aside className={styles.sidebar}>
        <button onClick={() => router.push('/')} className={styles.backLink}>
          <ArrowLeft size={18} /> Back to projects
        </button>
        
        <div className={styles.sidebarHeader}>
          <h3>Creation Steps</h3>
        </div>

        <nav className={styles.stepsList}>
          {STEPS.map((s) => (
            <div 
              key={s.id} 
              className={`
                ${styles.stepItem} 
                ${step === s.id ? styles.stepActive : ''} 
                ${step > s.id ? styles.stepCompleted : ''}
              `}
              onClick={() => handleSetStep(s.id)}
            >
              <div className={styles.stepIcon}>
                {step > s.id ? <Check size={14} /> : s.icon}
              </div>
              <span>{s.id}. {s.name}</span>
            </div>
          ))}
        </nav>
      </aside>

      {/* 2. Main content area (Center) */}
      <main className={styles.content}>
        <div className={styles.panel}>
          
          {step === 1 && (
            <div className={styles.stepContent}>
              <h2 className={styles.stepTitle}>General Settings</h2>
              <p className={styles.stepDesc}>Setup the base configuration for your project.</p>
              
              <div className={styles.formGroup}>
                <label>Project Name</label>
                <input 
                  type="text" 
                  className={styles.input} 
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Default Language</label>
                  <select className={styles.input}>
                    <option>English</option>
                    <option>Spanish</option>
                    <option>Russian</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Creation Mode</label>
                  <select className={styles.input}>
                    <option>Step-by-step</option>
                    <option>AI-Generated</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className={styles.stepContent} data-tour="avatar-select">
              <h2 className={styles.stepTitle}>AI Avatar</h2>
              <p className={styles.stepDesc}>Choose the physical appearance and mode of your AI.</p>
              
              <div className={styles.avatarGrid}>
                {[1,2,3,4].map(i => (
                  <div 
                    key={i} 
                    className={`${styles.avatarCard} ${i === 1 ? styles.avatarCardSelected : ''}`}
                  />
                ))}
              </div>

              <div className={styles.formGroup} style={{ marginTop: '2rem' }}>
                <label>Processing Mode</label>
                <div style={{ display: 'flex', gap: '2rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="radio" name="mode" checked={aiMode === 'video'} onChange={() => setAiMode('video')} /> Video
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="radio" name="mode" checked={aiMode === 'voice'} onChange={() => setAiMode('voice')} /> Voice
                  </label>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className={styles.stepContent}>
              <h2 className={styles.stepTitle}>Avatar Role</h2>
              <p className={styles.stepDesc}>Define who the AI is representing and their tone.</p>
              
              <div className={styles.formGroup}>
                <label>Job Title / Persona</label>
                <input type="text" className={styles.input} placeholder="e.g. Sales Executive" />
              </div>

              <div className={styles.formGroup}>
                <label>Role Context</label>
                <textarea 
                  className={styles.input} 
                  style={{ height: '120px' }} 
                  placeholder="Describe what the AI does and why it's communicating..."
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className={styles.stepContent}>
              <h2 className={styles.stepTitle}>Behavior Instructions</h2>
              <p className={styles.stepDesc}>Give explicit rules for the AI to follow during interactions.</p>
              
              <div className={styles.formGroup}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ padding: '1rem', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                    1. Focus on product value, not features.
                  </div>
                  <div style={{ padding: '1rem', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                    2. Be friendly and helpful.
                  </div>
                </div>
              </div>
              <button className={styles.secondaryBtn}>+ Add Instruction</button>
            </div>
          )}

          {step === 5 && (
            <div className={styles.stepContent}>
              <h2 className={styles.stepTitle}>Knowledge Base</h2>
              <p className={styles.stepDesc}>Upload files to serve as a reliable source of truth for the AI.</p>
              
              <div className={styles.uploadArea} data-tour="upload-zone">
                <div style={{ width: '64px', height: '64px', background: '#f8fafc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}>
                  <FileUp size={32} style={{margin: '0 auto'}} />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontWeight: 600, color: '#0f172a' }}>Click to upload or drag and drop</p>
                  <p style={{ fontSize: '0.85rem', color: '#64748b' }}>PDF, DOCX, TXT or PPTX (max. 10MB)</p>
                </div>
                <button className={styles.primaryBtn} onClick={() => fileInputRef.current?.click()}>
                  Browse Files
                </button>
                <input type="file" ref={fileInputRef} hidden onChange={handleFileUpload} />
              </div>
            </div>
          )}

          {step === 6 && (
            <div className={styles.stepContent}>
              <h2 className={styles.stepTitle}>Preview</h2>
              <p className={styles.stepDesc}>Check how your settings look before finalizing.</p>
              <div style={{ padding: '2rem', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '24px', textAlign: 'center' }}>
                <Eye size={48} color="#6366f1" style={{ marginBottom: '1rem' }} />
                <h3>Ready for generation</h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Project name: {projectName}</p>
              </div>
            </div>
          )}

          {step === 7 && (
            <div className={styles.stepContent} style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <div className={styles.rewardIconWrapper}>
                <Gift size={64} color="#fff" />
              </div>
              <h2 className={styles.stepTitle} style={{ fontSize: '2rem', marginTop: '1.5rem' }}>Congratulations!</h2>
              <p className={styles.stepDesc} style={{ fontSize: '1.1rem', marginBottom: '2rem' }}>
                You&apos;ve successfully configured your first project and earned <b>+5 extra AI minutes</b> as a welcome bonus!
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '320px', margin: '0 auto' }}>
                <button 
                  className={styles.primaryBtn} 
                  style={{ width: '100%', padding: '1.25rem' }}
                  onClick={handleFinish}
                >
                  Go to My Projects <ArrowRight size={20} />
                </button>
                <button 
                  className={styles.secondaryBtn} 
                  style={{ width: '100%' }}
                  onClick={() => {
                    endTour();
                    closeOnboarding();
                    router.push('/editor');
                  }}
                >
                  Open Advanced Editor
                </button>
              </div>
            </div>
          )}

          <div className={styles.footerNav}>
            <button 
              className={styles.secondaryBtn} 
              onClick={() => handleSetStep(step - 1)}
              disabled={step === 1}
            >
              <ChevronLeft size={18} /> Prev
            </button>
            <button 
              className={styles.primaryBtn} 
              onClick={() => step < 7 && handleSetStep(step + 1)}
              disabled={step === 7}
              data-tour={step === 6 ? 'generate-btn' : undefined}
            >
              {step === 7 ? 'Finish' : 'Next'} <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </main>

      {/* 3. AI Sidebar (Right) */}
      <aside className={styles.aiSidebar}>
        <div className={styles.aiHeader}>
          <div className={styles.aiIcon}><Sparkles size={18} /></div>
          <span className={styles.aiTitle}>AI Assistant</span>
        </div>
        
          <div className={styles.aiChat}>
          <div className={styles.aiMsg}>
            Hi there! I&apos;m here to help you configure your AI avatar.
          </div>
          {step === 1 && (
            <div className={styles.aiMsg}>
              Tip: Choose a descriptive project name to help your team find it later.
            </div>
          )}
          {step === 3 && (
            <div className={styles.aiMsg}>
              For a Sales role, use a &quot;Confident&quot; and &quot;Persuasive&quot; tone in the description.
            </div>
          )}
          {step === 5 && (
            <div className={styles.aiMsg}>
              Uploading a Product FAQ will significantly improve the accuracy of the AI.
            </div>
          )}
        </div>

        <input 
          type="text" 
          className={styles.aiInput} 
          placeholder="Ask AI anything..." 
        />
      </aside>
    </div>
  );
};

export default Wizard;

