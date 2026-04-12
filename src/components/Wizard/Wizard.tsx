import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { Upload } from 'lucide-react';
import styles from './Wizard.module.css';

type Step = 1 | 2 | 3 | 4;

const Wizard: React.FC = () => {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [uploading, setUploading] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `presentations/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;
      console.log('Upload success:', uploadData);

      const { data: { publicUrl } } = supabase.storage
        .from('assets')
        .getPublicUrl(filePath);

      setFileUrl(publicUrl);
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('An unexpected error occurred during upload');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleNext = () => {
    if (step < 4) setStep((prev) => (prev + 1) as Step);
  };

  const handleBack = () => {
    if (step > 1) setStep((prev) => (prev - 1) as Step);
  };

  return (
    <div className={styles.container}>
      <div className={styles.stepHeader}>
        <h2 className={styles.title}>
          {step === 1 && 'Upload Presentation'}
          {step === 2 && 'Choose Avatar'}
          {step === 3 && 'Setup Knowledge Base (RAG)'}
          {step === 4 && 'Configure AI Assistant'}
        </h2>
        <span style={{opacity: 0.5}}>Step {step} of 4</span>
      </div>

      <div className={styles.content}>
        {step === 1 && (
          <div style={{textAlign: 'center'}} className="animate-fade-in">
            <div style={{marginBottom: '1.5rem', background: 'rgba(255,255,255,0.05)', padding: '2rem', borderRadius: '50%', width: 'fit-content', margin: '0 auto 1.5rem'}}>
              <Upload size={48} color="#a8edea" />
            </div>
            <p style={{fontSize: '1.1rem', marginBottom: '1.5rem'}}>
              {fileUrl ? 'Presentation uploaded successfully!' : 'Drag & drop your PDF or PPTX file here'}
            </p>
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{display: 'none'}} 
              onChange={handleFileUpload} 
              accept=".pdf,.pptx"
            />
            <button 
              className={`${styles.btn} ${styles.btnSecondary}`} 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : (fileUrl ? 'Change File' : 'Browse Files')}
            </button>
            {fileUrl && <div style={{marginTop: '1rem', fontSize: '0.8rem', opacity: 0.6}}>File ready for processing</div>}
          </div>
        )}
        {step === 2 && (
          <div style={{textAlign: 'center'}} className="animate-fade-in">
            <div style={{marginBottom: '1.5rem', background: 'rgba(255,255,255,0.05)', padding: '2rem', borderRadius: '50%', width: 'fit-content', margin: '0 auto 1.5rem'}}>
              <UserIcon size={48} color="#fed6e3" />
            </div>
            <p>Select your interactive presentation avatar.</p>
            <div style={{display: 'flex', gap: '1.5rem', marginTop: '1.5rem', justifyContent: 'center'}}>
               <div style={{width: 80, height: 80, borderRadius: '50%', background: '#444', border: '2px solid transparent', cursor: 'pointer', transition: 'all 0.2s'}}></div>
               <div style={{width: 80, height: 80, borderRadius: '50%', border: '2px solid #667eea', background: '#555', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 0 15px rgba(102, 126, 234, 0.4)'}}></div>
            </div>
          </div>
        )}
        {step === 3 && (
          <div style={{textAlign: 'center'}} className="animate-fade-in">
            <div style={{marginBottom: '1.5rem', background: 'rgba(255,255,255,0.05)', padding: '2rem', borderRadius: '50%', width: 'fit-content', margin: '0 auto 1.5rem'}}>
              <BookOpen size={48} color="#a8edea" />
            </div>
            <p>Upload documents to guide your AI assistant (Knowledge Base).</p>
            <input 
              type="file" 
              style={{display: 'none'}} 
              id="kb-upload"
              accept=".pdf"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setUploading(true);
                const fd = new FormData();
                fd.append('file', file);
                try {
                  const res = await fetch('/api/ingest', { method: 'POST', body: fd });
                  const data = await res.json();
                  alert(`Processed Knowledge Base: ${data.charCount} characters found.`);
                } catch (err) {
                  alert("Ingest failed");
                } finally {
                  setUploading(false);
                }
              }}
            />
            <button 
              className={`${styles.btn} ${styles.btnSecondary}`} 
              style={{marginTop: '1.5rem'}}
              onClick={() => document.getElementById('kb-upload')?.click()}
              disabled={uploading}
            >
              {uploading ? 'Processing Docs...' : 'Add Docs (PDF)'}
            </button>
          </div>
        )}
        {step === 4 && (
          <div style={{textAlign: 'center'}} className="animate-fade-in">
            <div style={{marginBottom: '1.5rem', background: 'rgba(255,255,255,0.05)', padding: '2rem', borderRadius: '50%', width: 'fit-content', margin: '0 auto 1.5rem'}}>
              <Brain size={48} color="#fed6e3" />
            </div>
            <p>Set a custom prompt: &quot;You are an HR Assistant...&quot;</p>
            <textarea 
              style={{width: '100%', height: 120, background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12, padding: '1.5rem', marginTop: '1.5rem', fontFamily: 'inherit', resize: 'none'}}
              defaultValue="You are a helpful sales assistant. Answer questions based on the provided presentation and knowledge base."
            />
          </div>
        )}
      </div>

      <div className={styles.buttonContainer}>
        {step > 1 && (
          <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={handleBack} style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
            <ChevronLeft size={18} /> Back
          </button>
        )}
        {step < 4 ? (
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleNext} style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
            Next <ChevronRight size={18} />
          </button>
        ) : (
          <button 
            className={`${styles.btn} ${styles.btnPrimary}`} 
            onClick={async () => {
              // GSD: Mock saving project metadata to Supabase 'projects' table
              if (fileUrl) {
                console.log("Saving project with file:", fileUrl);
              }
              router.push('/editor');
            }} 
            style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}
          >
            Complete Setup <Check size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

export default Wizard;
