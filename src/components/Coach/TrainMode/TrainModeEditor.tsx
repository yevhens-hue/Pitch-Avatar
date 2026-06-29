import React, { useState, useEffect } from 'react';
import styles from './TrainModeEditor.module.css';
import { BuyerScenario, RoleTemplate, ROLE_TEMPLATES, QuestionType } from '@/types/coach';
import { Plus, Wand2, Database, BookOpen, ChevronLeft, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface TrainModeEditorProps {
  projectId: string;
}

const TrainModeEditor: React.FC<TrainModeEditorProps> = ({ projectId }) => {
  const router = useRouter();
  const [role, setRole] = useState<RoleTemplate>('buyer');
  const [scenarios, setScenarios] = useState<BuyerScenario[]>([]);
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSavingRag, setIsSavingRag] = useState(false);
  const [isSavingInst, setIsSavingInst] = useState(false);

  // Initialize with empty array or fetch existing
  useEffect(() => {
    // Simulated fetch
    setScenarios([
      {
        id: 'mock-1',
        projectId,
        questionText: 'What is the price of your product?',
        expectedAnswer: 'We have a flexible pricing system.',
        roleTemplate: 'buyer',
        questionType: 'price',
        createdAt: new Date().toISOString()
      }
    ]);
  }, [projectId]);

  const activeScenario = scenarios.find(s => s.id === activeScenarioId);

  const handleAddScenario = () => {
    const newScen: BuyerScenario = {
      id: `scen-${Date.now()}`,
      projectId,
      questionText: 'New question...',
      expectedAnswer: '',
      roleTemplate: role,
      createdAt: new Date().toISOString()
    };
    setScenarios([newScen, ...scenarios]);
    setActiveScenarioId(newScen.id);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/coach/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, maxQuestions: 3, roleTemplate: role })
      });
      const data = await res.json();
      if (data.success && data.questions) {
        setScenarios(prev => [...data.questions, ...prev]);
        if (!activeScenarioId) setActiveScenarioId(data.questions[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateActive = (field: keyof BuyerScenario, value: any) => {
    if (!activeScenarioId) return;
    setScenarios(prev => prev.map(s => s.id === activeScenarioId ? { ...s, [field]: value } : s));
  };

  const handleSaveToRag = async () => {
    if (!activeScenario) return;
    setIsSavingRag(true);
    try {
      await fetch('/api/coach/save-to-rag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          questionText: activeScenario.questionText,
          expectedAnswer: activeScenario.expectedAnswer,
          expectedSlideId: activeScenario.expectedSlideId,
          saveTarget: 'rag'
        })
      });
      alert('Saved to RAG successfully!');
    } catch (e) {
      console.error(e);
      alert('Failed to save to RAG');
    } finally {
      setIsSavingRag(false);
    }
  };

  const handleSaveInstructions = async () => {
    setIsSavingInst(true);
    try {
      // Build a system prompt out of all current scenarios
      const prompt = `Role: ${ROLE_TEMPLATES.find(r => r.role === role)?.description || role}\n\nBasic instructions (Train Mode):\n` +
        scenarios.map(s => `Q: ${s.questionText}\nA: ${s.expectedAnswer}`).join('\n\n');
      
      await fetch('/api/coach/instructions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, systemPrompt: prompt })
      });
      alert('Saved as Project Instructions successfully!');
    } catch (e) {
      console.error(e);
      alert('Failed to save instructions');
    } finally {
      setIsSavingInst(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.sidebarTitle}>
            <button style={{background:'transparent', border:'none', color:'#fff', cursor:'pointer'}} onClick={() => router.push(`/coach/${projectId}`)}>
              <ChevronLeft size={20} />
            </button>
            Train Mode
          </div>
          <div className={styles.roleSelector}>
            <label className={styles.label}>Avatar Role</label>
            <select 
              className={styles.select}
              value={role}
              onChange={(e) => setRole(e.target.value as RoleTemplate)}
            >
              {ROLE_TEMPLATES.map(t => (
                <option key={t.role} value={t.role}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>

        <button className={styles.addBtn} onClick={handleAddScenario}>
          <Plus size={16} /> Add Question
        </button>

        <div className={styles.scenarioList}>
          {scenarios.filter(s => s.roleTemplate === role || !s.roleTemplate).map(s => (
            <div 
              key={s.id} 
              className={`${styles.scenarioItem} ${activeScenarioId === s.id ? styles.active : ''}`}
              onClick={() => setActiveScenarioId(s.id)}
            >
              <div className={styles.scenarioQ}>{s.questionText}</div>
              <div className={styles.scenarioA}>{s.expectedAnswer || 'No answer yet...'}</div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.mainArea}>
        <div className={styles.topBar}>
          <div style={{fontWeight: 600}}>Scenario Editor</div>
          <div className={styles.topActions}>
            <button className={styles.btnSecondary} onClick={handleGenerate} disabled={isGenerating}>
              <Wand2 size={16} /> {isGenerating ? 'Generating...' : 'AI Auto-Generate'}
            </button>
            <button className={styles.btnSecondary} onClick={handleSaveInstructions} disabled={isSavingInst}>
              <BookOpen size={16} /> {isSavingInst ? 'Saving...' : 'Save as Instructions'}
            </button>
          </div>
        </div>

        {activeScenario ? (
          <div className={styles.editorContent}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Avatar&apos;s Question (Buyer asks)</label>
              <input 
                type="text" 
                className={styles.input} 
                value={activeScenario.questionText}
                onChange={e => handleUpdateActive('questionText', e.target.value)}
              />
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>Expected Answer (Seller should say)</label>
              <textarea 
                className={styles.textarea}
                value={activeScenario.expectedAnswer}
                onChange={e => handleUpdateActive('expectedAnswer', e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Expected Slide (Optional)</label>
              <input 
                type="text" 
                className={styles.input}
                placeholder="e.g. 'Prices' or slide ID"
                value={activeScenario.expectedSlideId || ''}
                onChange={e => handleUpdateActive('expectedSlideId', e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Question Type</label>
              <select 
                className={styles.select}
                value={activeScenario.questionType || 'product'}
                onChange={e => handleUpdateActive('questionType', e.target.value)}
              >
                <option value="product">Product</option>
                <option value="price">Price</option>
                <option value="competitors">Competitors</option>
                <option value="roi">ROI</option>
                <option value="objection">Objection</option>
                <option value="use_case">Use Case</option>
                <option value="technical">Technical</option>
              </select>
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
              <button className={styles.btnPrimary} onClick={handleSaveToRag} disabled={isSavingRag}>
                <Database size={16} /> Save specific QA to RAG
              </button>
              <button className={styles.btnSecondary}>
                <Save size={16} /> Update Scenario Only
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.emptyState}>
            <Wand2 size={48} opacity={0.5} />
            <p>Select a scenario from the left or generate new ones to train the avatar.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainModeEditor;
