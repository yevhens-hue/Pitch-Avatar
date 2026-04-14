'use client';

import React, { useState } from 'react';
import { useWizardLogic } from '@/hooks/useWizardLogic';
import styles from './MagicWizard.module.css';
import Wizard from '../Wizard';
import { Upload, Link as LinkIcon, Sparkles } from 'lucide-react';

const MagicWizard: React.FC = () => {
  const { 
    handleFileUpload, 
    uploading: logicUploading, 
    fileUrl, 
    fileInputRef,
    setStep 
  } = useWizardLogic();
  
  const [internalProcessing, setInternalProcessing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState('');
  const [showWizard, setShowWizard] = useState(false);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = await handleFileUpload(e);
    if (url) {
      setInternalProcessing(true);
      
      const steps = [
        'Extracting key topics...',
        'Analyzing brand tone...',
        'Matching best avatar profile...',
        'Generating voice preview...'
      ];

      for (let i = 0; i < steps.length; i++) {
        setAnalysisStep(steps[i]);
        await new Promise(r => setTimeout(r, 800));
      }

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
        <h1>Transform Content <br/> into AI Video</h1>
        <p className={styles.uploadSub}>Upload your PDF, PPTX or paste a link to start instantly.</p>
      </div>

      <div 
        className={`${styles.dropzone} ${(logicUploading || internalProcessing) ? styles.dropzoneActive : ''}`}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className={styles.iconBox}>
          <Upload size={40} />
        </div>
        <h3 className={styles.uploadTitle}>Drop your file here</h3>
        <p className={styles.uploadSub}>PDF, PPTX (max 50MB)</p>
        
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          onChange={onFileChange}
          accept=".pdf,.pptx"
        />

        {(logicUploading || internalProcessing) && (
          <div className={styles.processing}>
            <div className={styles.spinner}></div>
            <p style={{ fontWeight: 600, fontSize: '1.2rem', marginBottom: '0.5rem' }}>
              {logicUploading ? 'Uploading file...' : analysisStep}
            </p>
            <p className={styles.uploadSub}>
              {internalProcessing ? 'Our AI is tailoring the experience for your content' : 'Almost there...'}
            </p>
          </div>
        )}
      </div>

      <div className={styles.urlBox}>
        <input type="text" className={styles.urlInput} placeholder="https://your-website.com or Google Slides link" />
        <button className={styles.urlBtn} onClick={() => alert('Link analysis coming soon!')}>
          <Sparkles size={18} style={{ marginRight: '8px', display: 'inline' }} />
          Magic Start
        </button>
      </div>
    </div>
  );
};

export default MagicWizard;
