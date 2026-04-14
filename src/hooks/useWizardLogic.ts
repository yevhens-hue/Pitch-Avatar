import { useState, useRef, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export const useWizardLogic = (initialType: string = 'quick') => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get('type') || initialType;

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
      return data.publicUrl;
    } catch (err: unknown) {
       console.error("Upload failed", err);
       alert("Error uploading file.");
       return null;
    } finally {
      setUploading(false);
    }
  };

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => Math.max(1, s - 1));

  return {
    type,
    step,
    setStep,
    nextStep,
    prevStep,
    uploading,
    fileUrl,
    setFileUrl,
    projectName,
    setProjectName,
    aiMode,
    setAiMode,
    fileInputRef,
    handleFileUpload,
    router
  };
};
