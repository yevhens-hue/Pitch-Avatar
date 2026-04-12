import React, { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Upload, Settings, User, FileUp, Eye, Share2, ChevronRight, Check } from 'lucide-react';
import styles from './Wizard.module.css';

type Step = 1 | 2 | 3 | 4 | 5;

const STEPS = [
  { id: 1, name: 'General Settings', icon: <Settings size={18} /> },
  { id: 2, name: 'Avatar', icon: <User size={18} /> },
  { id: 3, name: 'Import', icon: <FileUp size={18} /> },
  { id: 4, name: 'Preview', icon: <Eye size={18} /> },
  { id: 5, name: 'Share / Assign', icon: <Share2 size={18} /> },
];

const Wizard: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get('type') || 'quick'; // video, chat, course, quick

  const [step, setStep] = useState<Step>(1);
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

  return (
    <div className={styles.wizardContainer}>
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h3>New Project</h3>
        </div>
        <div className={styles.stepsList}>
          {STEPS.map((s) => (
            <div 
              key={s.id} 
              className={`${styles.stepItem} ${step === s.id ? styles.stepActive : ''} ${step > s.id ? styles.stepCompleted : ''}`}
              onClick={() => setStep(s.id as Step)}
            >
              <div className={styles.stepIcon}>{step > s.id ? <Check size={14} /> : s.icon}</div>
              <span className={styles.stepName}>{s.id}. {s.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.panel}>
          {step === 1 && (
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

          {step === 2 && (
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

          {step === 3 && (
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

          {step === 4 && (
            <div className={styles.stepContent}>
              <h2 className={styles.stepTitle}>Preview</h2>
              <p className={styles.stepDesc}>Review your AI project setup before finalization.</p>
              <div className={styles.previewBox}>
                {fileUrl ? <p className={styles.successText}>File logic loaded.</p> : <p>No file uploaded yet.</p>}
                <p>Avatar: <strong>Professional View</strong></p>
                <p>Language: <strong>English</strong></p>
              </div>
            </div>
          )}

          {step === 5 && (
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
              onClick={() => step > 1 && setStep((s) => (s - 1) as Step)}
              disabled={step === 1}
            >
              Back
            </button>
            <button 
              className={styles.primaryBtn} 
              onClick={() => step < 5 && setStep((s) => (s + 1) as Step)}
              disabled={step === 5}
            >
              Next Step {step < 5 && <ChevronRight size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wizard;
