'use client';

import React, { useState } from 'react';
import { useWizardLogic } from '@/hooks/useWizardLogic';
import styles from './MagicWizard.module.css';
import Wizard from '../Wizard';
import { Upload, Link as LinkIcon, Sparkles, FileText, Globe, Youtube as YoutubeIcon, CheckCircle2, Search } from 'lucide-react';

const MagicWizard: React.FC = () => {
  const { 
    handleFileUpload, 
    uploading: logicUploading, 
    fileInputRef,
    setStep 
  } = useWizardLogic();
  
  const [internalProcessing, setInternalProcessing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState('');
  const [showWizard, setShowWizard] = useState(false);
  const [foundKeywords, setFoundKeywords] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  const sources = [
    { id: 'file', icon: <FileText size={20} />, label: 'Upload File', active: true },
    { id: 'web', icon: <Globe size={20} />, label: 'Import from URL', active: false },
    { id: 'youtube', icon: <YoutubeIcon size={20} />, label: 'YouTube Video', active: false },
    { id: 'docs', icon: <Search size={20} />, label: 'Google Docs', active: false },
  ];

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = await handleFileUpload(e);
    if (url) {
      setInternalProcessing(true);
      
      const steps = [
        { msg: 'Extracting key topics...', keywords: ['Sales Pitch', 'Enterprise Solution'] },
        { msg: 'Analyzing brand tone...', keywords: ['Professional', 'Trustworthy'] },
        { msg: 'Matching best avatar profile...', keywords: ['Business Exec', 'Neutral Background'] },
        { msg: 'Generating voice preview...', keywords: ['Clear Accent', 'Natural Pace'] }
      ];

      for (let i = 0; i < steps.length; i++) {
        setAnalysisStep(steps[i].msg);
        setProgress((i + 1) * 25);
        await new Promise(r => setTimeout(r, 800));
        setFoundKeywords(prev => [...prev, ...steps[i].keywords]);
      }

      await new Promise(r => setTimeout(r, 500));
      setInternalProcessing(false);
      setStep(4); // Jump to Preview in Wizard
      setShowWizard(true);
    }
  };

  if (showWizard) {
    return <Wizard />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <div className={styles.magicBadge}><Sparkles size={16} /> Fast-Track Creation</div>
        <h1>Magic Content <br/> Importer</h1>
        <p className={styles.uploadSub}>Our AI will analyze your content and automatically pick the best avatar, voice, and structure for your presentation.</p>
      </div>

      <div className={styles.sourceTabs}>
        {sources.map(s => (
          <div key={s.id} className={`${styles.sourceTab} ${s.active ? styles.sourceTabActive : styles.sourceTabDisabled}`}>
            {s.icon}
            <span>{s.label}</span>
          </div>
        ))}
      </div>

      <div 
        className={`${styles.dropzone} ${(logicUploading || internalProcessing) ? styles.dropzoneActive : ''}`}
        onClick={() => !internalProcessing && fileInputRef.current?.click()}
      >
        <div className={styles.dropzoneGlow} />
        
        {!internalProcessing && !logicUploading && (
          <>
            <div className={styles.iconBox}>
              <Upload size={40} />
            </div>
            <h3 className={styles.uploadTitle}>Drag & Drop to Start</h3>
            <p className={styles.uploadSub}>Supports PDF, PPTX (max 50MB)</p>
            <button className={styles.browseBtn}>Browse Local Files</button>
          </>
        )}
        
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          onChange={onFileChange}
          accept=".pdf,.pptx"
        />

        {(logicUploading || internalProcessing) && (
          <div className={styles.processing}>
            <div className={styles.progressRing}>
              <svg width="120" height="120">
                <circle cx="60" cy="60" r="54" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="transparent" />
                <circle cx="60" cy="60" r="54" stroke="#6366f1" strokeWidth="8" fill="transparent" 
                        strokeDasharray={339.292} strokeDashoffset={339.292 - (339.292 * progress) / 100}
                        style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }} />
              </svg>
              <div className={styles.progressText}>{progress}%</div>
            </div>
            
            <p className={styles.analysisMsg}>{logicUploading ? 'Uploading file...' : analysisStep}</p>
            
            <div className={styles.keywordContainer}>
              {foundKeywords.map((kw, idx) => (
                <div key={idx} className={styles.keywordBadge} style={{ animationDelay: `${idx * 0.1}s` }}>
                  <CheckCircle2 size={12} /> {kw}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {!internalProcessing && (
        <div className={styles.urlSection}>
          <div className={styles.urlInputWrapper}>
            <Globe size={18} className={styles.urlIcon} />
            <input type="text" className={styles.urlInput} placeholder="Paste a website URL or Google Drive link..." />
            <button className={styles.magicBtn}>
              <Sparkles size={16} />
              Import
            </button>
          </div>
          <p className={styles.urlHint}>We'll automatically extract key information from any link.</p>
        </div>
      )}
    </div>
  );
};

export default MagicWizard;
