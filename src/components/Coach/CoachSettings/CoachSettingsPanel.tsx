import React, { useState, useEffect } from 'react';
import styles from './CoachSettingsPanel.module.css';
import { supabase } from '@/lib/supabase';
import { CoachSettings } from '@/types/coach';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';

interface CoachSettingsPanelProps {
  projectId: string;
}

const CoachSettingsPanel: React.FC<CoachSettingsPanelProps> = ({ projectId }) => {
  const router = useRouter();
  const [settings, setSettings] = useState<CoachSettings>({
    projectId: projectId,
    evaluationMode: 'strict',
    enableCustomScenarios: true,
    maxQuestions: 5,
    systemPrompt: '',
    questionDelivery: 'random',
    startFromSlideId: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('coach_settings')
        .select('*')
        .eq('project_id', projectId)
        .single();
        
      if (data) {
        setSettings({
          projectId: data.project_id,
          evaluationMode: data.evaluation_mode,
          enableCustomScenarios: data.enable_custom_scenarios,
          maxQuestions: data.max_questions,
          systemPrompt: data.system_prompt || '',
          questionDelivery: data.question_delivery || 'random',
          startFromSlideId: data.start_from_slide_id || ''
        });
      }
      setIsLoading(false);
    };
    fetchSettings();
  }, [projectId]);

  const handleSave = async () => {
    setIsSaving(true);
    const { error } = await supabase
      .from('coach_settings')
      .upsert({
        project_id: projectId,
        evaluation_mode: settings.evaluationMode,
        enable_custom_scenarios: settings.enableCustomScenarios,
        max_questions: settings.maxQuestions,
        system_prompt: settings.systemPrompt,
        question_delivery: settings.questionDelivery,
        start_from_slide_id: settings.startFromSlideId,
        updated_at: new Date().toISOString()
      }, { onConflict: 'project_id' });
      
    setIsSaving(false);
    if (error) {
      alert('Failed to save settings');
    } else {
      alert('Settings saved successfully');
    }
  };

  const handleOpenTrainMode = () => {
    router.push(`/coach/${projectId}/train`);
  };

  if (isLoading) return <div style={{ color: '#fff' }}>Loading settings...</div>;

  return (
    <div className={`card ${styles.customOverrides}`}>
      <div className={styles.header}>
        <div className={styles.title}>AI Coach Settings</div>
        <div className={styles.subtitle}>Configure how the AI evaluates and trains the sales team for this project.</div>
      </div>

      <div className={styles.row}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Evaluation Strictness</label>
          <div className={styles.helpText}>How strictly should the AI judge the answers?</div>
          <select 
            className={styles.select}
            value={settings.evaluationMode}
            onChange={e => setSettings({...settings, evaluationMode: e.target.value as any})}
          >
            <option value="forgiving">Forgiving (Focus on keywords)</option>
            <option value="strict">Strict (Requires exact presentation match)</option>
            <option value="llm">LLM Advanced (Semantic context & roleplay)</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Max Questions per Session</label>
          <div className={styles.helpText}>Limit the number of questions the buyer asks.</div>
          <input 
            type="number" 
            className={styles.input}
            min={1} max={20}
            value={settings.maxQuestions}
            onChange={e => setSettings({...settings, maxQuestions: parseInt(e.target.value) || 5})}
          />
         </div>
       </div>

       <div className={styles.row}>
         <div className={styles.formGroup}>
           <label className={styles.label}>Question Delivery</label>
          <div className={styles.helpText}>How should the AI ask questions?</div>
          <select 
            className={styles.select}
            value={settings.questionDelivery}
            onChange={e => setSettings({...settings, questionDelivery: e.target.value as any})}
          >
            <option value="random">Random (Any matching scenario)</option>
            <option value="sequential">Sequential (In defined order)</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Start From Slide ID</label>
          <div className={styles.helpText}>Optional: The slide to start the session from.</div>
          <input 
            type="text" 
            className={styles.input}
            placeholder="e.g. 1a2b3c..."
            value={settings.startFromSlideId || ''}
            onChange={e => setSettings({...settings, startFromSlideId: e.target.value})}
          />
        </div>
      </div>

      <div className={styles.switchContainer}>
        <label className="toggle-container" style={{ cursor: 'pointer' }}>
          <input 
            type="checkbox" 
            checked={settings.enableCustomScenarios}
            onChange={e => setSettings({...settings, enableCustomScenarios: e.target.checked})}
            className={styles.checkbox}
          />
          <div className={styles.switchLabel}>Enable Custom Scenarios (Train Mode)</div>
        </label>
        <div className={styles.helpText} style={{ marginLeft: '24px' }}>If disabled, the AI will only ask auto-generated questions.</div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Global Coach Instructions (System Prompt)</label>
        <div className={styles.helpText}>These instructions define the core behavior of the AI Buyer. You can generate these automatically via Train Mode.</div>
        <textarea 
          className={styles.textarea}
          value={settings.systemPrompt}
          onChange={e => setSettings({...settings, systemPrompt: e.target.value})}
          placeholder="e.g. You are a skeptical CTO. Ask tough technical questions..."
        />
      </div>

      <div className={styles.actions}>
        <Button variant="secondary" onClick={handleOpenTrainMode}>
          Open Train Mode Editor
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
};

export default CoachSettingsPanel;
