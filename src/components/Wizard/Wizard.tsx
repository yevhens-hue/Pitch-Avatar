import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Upload, Settings, User, FileUp, Eye, Share2, ChevronRight, Check, Key, FileText, BookOpen } from 'lucide-react';
import styles from './Wizard.module.css';

const Wizard: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get('type') || 'quick';

  // Dynamic steps based on flow
  const STEPS = useMemo(() => {
    if (type === 'chat') {
      return [
        { id: 1, name: 'General Settings', icon: <Settings size={18} /> },
        { id: 2, name: 'Avatar', icon: <User size={18} /> },
        { id: 3, name: 'Role', icon: <Key size={18} /> },
        { id: 4, name: 'Instructions', icon: <FileText size={18} /> },
        { id: 5, name: 'Knowledge Base', icon: <BookOpen size={18} /> },
        { id: 6, name: 'Preview', icon: <Eye size={18} /> },
        { id: 7, name: 'Share / Assign', icon: <Share2 size={18} /> },
      ];
    }
    return [
      { id: 1, name: 'General Settings', icon: <Settings size={18} /> },
      { id: 2, name: 'Avatar', icon: <User size={18} /> },
      { id: 3, name: 'Import', icon: <FileUp size={18} /> },
      { id: 4, name: 'Preview', icon: <Eye size={18} /> },
      { id: 5, name: 'Share / Assign', icon: <Share2 size={18} /> },
    ];
  }, [type]);

  const totalSteps = STEPS.length;
  const [step, setStep] = useState<number>(1);
  const [uploading, setUploading] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [projectName, setProjectName] = useState('Untitled Project');
  const [aiMode, setAiMode] = useState<'video' | 'voice'>(type === 'video' ? 'video' : 'voice');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (type === 'video') setAiMode('video');
    else if (type === 'chat') setProjectName('New AI Chatbot');
    else if (type === 'course') setProjectName('Interactive Course');
  }, [type]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `presentations/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('assets')
        .upload(filePath, file);

      if (uploadError) throw new Error(uploadError.message);
      
      const { data } = supabase.storage.from('assets').getPublicUrl(filePath);
      setFileUrl(data.publicUrl);
    } catch (err: unknown) {
       console.error("Upload failed", err);
       alert("Error uploading file.");
    } finally {
      setUploading(false);
      setStep(4);
    }
  };

  const currentStepName = STEPS[step - 1]?.name;

  return (
    <div className={styles.wizardContainer}>
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h3>{type === 'chat' ? 'AI Chatbot Setup' : 'New Project'}</h3>
        </div>
        <div className={styles.stepsList}>
          {STEPS.map((s, index) => {
            const stepNumber = index + 1;
            return (
              <div 
                key={s.id} 
                className={`${styles.stepItem} ${step === stepNumber ? styles.stepActive : ''} ${step > stepNumber ? styles.stepCompleted : ''}`}
                onClick={() => setStep(stepNumber)}
              >
                <div className={styles.stepIcon}>{step > stepNumber ? <Check size={14} /> : s.icon}</div>
                <span className={styles.stepName}>{stepNumber}. {s.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.panel}>
          
          {currentStepName === 'General Settings' && (
            <div className={styles.stepContent}>
              <h2 className={styles.stepTitle}>General Settings</h2>
              <div className={styles.formGroup}>
                <label>Project Name</label>
                <input 
                  type="text" 
                  className={styles.input} 
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Untitled Project" 
                />
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Default Language</label>
                  <select className={styles.input}>
                    <option>English</option>
                    <option>Spanish</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Author</label>
                  <input type="text" className={styles.input} defaultValue="User" />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Access Type</label>
                <select className={styles.input}>
                  <option>Only Me</option>
                  <option>Workspace</option>
                  <option>Public</option>
                </select>
              </div>
            </div>
          )}

          {currentStepName === 'Avatar' && (
            <div className={styles.stepContent}>
              <h2 className={styles.stepTitle}>Select Avatar</h2>
              <div className={styles.avatarGrid}>
                <div className={styles.avatarCard}></div>
                <div className={`${styles.avatarCard} ${styles.avatarCardSelected}`}></div>
                <div className={styles.avatarCard}></div>
                <div className={styles.avatarCard}></div>
              </div>
              <div className={styles.formGroup} style={{ marginTop: '2rem' }}>
                <label>AI Mode</label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <label>
                    <input 
                      type="radio" 
                      name="mode" 
                      checked={aiMode === 'video'} 
                      onChange={() => setAiMode('video')} 
                    /> Video Avatar
                  </label>
                  <label>
                    <input 
                      type="radio" 
                      name="mode" 
                      checked={aiMode === 'voice'} 
                      onChange={() => setAiMode('voice')} 
                    /> Voice Only
                  </label>
                </div>
              </div>
            </div>
          )}

          {currentStepName === 'Import' && (
            <div className={styles.stepContent}>
              <h2 className={styles.stepTitle}>Import Data</h2>
              <p className={styles.stepDesc}>Upload a PDF or PPTX to generate your slides and AI knowledge base.</p>
              
              <div className={styles.uploadArea}>
                <Upload size={48} color="rgba(255,255,255,0.2)" />
                <p>{uploading ? 'Processing...' : 'Drag & drop a file here'}</p>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  style={{display: 'none'}} 
                  onChange={handleFileUpload} 
                  accept=".pdf,.pptx"
                />
                <button 
                  className={styles.uploadBtn} 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  Browse Files
                </button>
              </div>
            </div>
          )}

          {currentStepName === 'Role' && (
            <div className={styles.stepContent}>
              <h2 className={styles.stepTitle}>Avatar Role</h2>
              <p className={styles.stepDesc}>Select the AI persona and context.</p>
              <div className={styles.formGroup}>
                <label>Role</label>
                <select className={styles.input}>
                  <option>Sales Representative</option>
                  <option>Customer Support</option>
                  <option>Coach / Teacher</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Role Description</label>
                <textarea className={styles.input} style={{ height: '100px' }} defaultValue="You are a polite and professional assistant." />
              </div>
            </div>
          )}

          {currentStepName === 'Instructions' && (
            <div className={styles.stepContent}>
              <h2 className={styles.stepTitle}>Instructions</h2>
              <p className={styles.stepDesc}>Define strict instructions for your AI behavior.</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1rem 0' }}>
                <li style={{ padding: '0.8rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '0.5rem' }}>1. Never guess answers. Limit responses to KB.</li>
                <li style={{ padding: '0.8rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '0.5rem' }}>2. Maintain a friendly tone.</li>
              </ul>
              <button className={styles.secondaryBtn}>+ Add Instruction</button>
            </div>
          )}

          {currentStepName === 'Knowledge Base' && (
            <div className={styles.stepContent}>
              <h2 className={styles.stepTitle}>Knowledge Base</h2>
              <p className={styles.stepDesc}>Upload specific PDFs or TXT files to act as data sources for the Chatbot.</p>
              <button className={styles.uploadBtn}>+ Add Knowledge Source</button>
              <p style={{ marginTop: '2rem', opacity: 0.5, fontStyle: 'italic', textAlign: 'center' }}>No sources added yet.</p>
            </div>
          )}

          {currentStepName === 'Preview' && (
            <div className={styles.stepContent}>
              <h2 className={styles.stepTitle}>Preview</h2>
              <p className={styles.stepDesc}>Review your AI project setup before finalization.</p>
              <div className={styles.previewBox}>
                {fileUrl ? <p className={styles.successText}>File logic loaded.</p> : <p>Flow configuration valid.</p>}
                <p>Avatar: <strong>Professional View</strong></p>
                <p>Language: <strong>English</strong></p>
              </div>
            </div>
          )}

          {currentStepName === 'Share / Assign' && (
            <div className={styles.stepContent}>
              <h2 className={styles.stepTitle}>Share & Finalize</h2>
              <p className={styles.stepDesc}>Your project is ready to be moved to the editor or shared.</p>
              <button 
                className={styles.primaryBtn} 
                onClick={() => router.push('/editor')} 
              >
                Go to Advanced Editor <ChevronRight size={18} />
              </button>
            </div>
          )}

          <div className={styles.footerNav}>
            <button 
              className={styles.secondaryBtn} 
              onClick={() => step > 1 && setStep((s) => s - 1)}
              disabled={step === 1}
            >
              Back
            </button>
            <button 
              className={styles.primaryBtn} 
              onClick={() => step < totalSteps && setStep((s) => s + 1)}
              disabled={step === totalSteps}
            >
              Next Step {step < totalSteps && <ChevronRight size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wizard;
