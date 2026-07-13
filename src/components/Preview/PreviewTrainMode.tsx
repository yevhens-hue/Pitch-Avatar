'use client'

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styles from './PreviewTrainMode.module.css';
import { ChevronLeft, Send, Loader2 } from 'lucide-react';
import { ProjectType } from '@/types';

interface Slide {
  id: number;
  text: string;
  title?: string;
  thumbnailUrl?: string;
}

interface PreviewTrainModeProps {
  projectId: string;
  projectTitle: string;
  slides: Slide[];
}

interface QARecord {
  id: string;
  question: string;
  answer: string;
  category: string;
  difficulty: string;
  source: 'manual' | 'train_mode_ai';
}

const CATEGORIES = ['Pricing', 'Product', 'Competitors', 'ROI', 'Objection', 'Use Case', 'Technical'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

const PreviewTrainMode: React.FC<PreviewTrainModeProps> = ({ projectId, projectTitle, slides }) => {
  const router = useRouter();
  
  const [mode, setMode] = useState<'ai' | 'manual'>('manual');
  const [qaList, setQaList] = useState<QARecord[]>([
    { id: 'Q8', question: 'Can I get a 60-day payment deferral for a startup?', answer: 'Yes, the Startup Plan is available for verified startups.', category: 'Pricing', difficulty: 'Medium', source: 'manual' },
    { id: 'Q7', question: 'How much does an additional seat cost?', answer: 'Depends on the tier, usually $20/mo.', category: 'Pricing', difficulty: 'Easy', source: 'manual' },
    { id: 'Q6', question: 'What is included in the Enterprise tier?', answer: 'Enterprise adds SAML SSO, SOC 2 Type II, custom SLA.', category: 'Product', difficulty: 'Medium', source: 'train_mode_ai' },
  ]);

  // Manual Form State
  const [manualQuestion, setManualQuestion] = useState('');
  const [manualAnswer, setManualAnswer] = useState('');
  const [manualCategory, setManualCategory] = useState('Pricing');
  const [manualDifficulty, setManualDifficulty] = useState('Medium');
  const [isSaving, setIsSaving] = useState(false);

  // AI Card State
  const [currentCard, setCurrentCard] = useState<{ questionText: string, expectedAnswer: string, questionType: string, difficulty: string } | null>(null);
  const [isEditingCard, setIsEditingCard] = useState(false);
  const [editedAnswer, setEditedAnswer] = useState('');
  const [chatState, setChatState] = useState<'idle' | 'generating' | 'waiting' | 'saving'>('idle');
  const [savedFeedback, setSavedFeedback] = useState<any>(null);

  const activeSlide = slides.length > 0 ? slides[0] : { id: 1, text: '', title: 'Start building this slide' };

  const handleManualSubmit = async () => {
    if (!manualQuestion || !manualAnswer) return;
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      const newQa: QARecord = {
        id: `Q${qaList.length + 6}`,
        question: manualQuestion,
        answer: manualAnswer,
        category: manualCategory,
        difficulty: manualDifficulty,
        source: 'manual'
      };
      setQaList([newQa, ...qaList]);
      setManualQuestion('');
      setManualAnswer('');
      setIsSaving(false);
    }, 500);
  };

  const fetchNextQuestion = async (existing: string[] = []) => {
    setChatState('generating');
    setCurrentCard(null);
    setIsEditingCard(false);
    try {
      const res = await fetch('/api/coach/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          slideId: activeSlide?.id,
          existingQuestions: existing
        })
      });
      const data = await res.json();
      if (data.question) {
        setCurrentCard({
          questionText: data.question.questionText,
          expectedAnswer: data.question.expectedAnswer || 'Yes, this is included.',
          questionType: data.question.questionType || 'Product',
          difficulty: data.question.difficulty || 'Medium'
        });
        setEditedAnswer(data.question.expectedAnswer || 'Yes, this is included.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setChatState('waiting');
    }
  };

  useEffect(() => {
    if (mode === 'ai' && !currentCard && chatState === 'idle') {
      fetchNextQuestion();
    }
  }, [mode, currentCard, chatState]);

  const handleReject = () => {
    const existingQs = qaList.map(qa => qa.question);
    if (currentCard) existingQs.push(currentCard.questionText);
    fetchNextQuestion(existingQs);
  };

  const handleApprove = async () => {
    if (!currentCard) return;
    setChatState('saving');
    
    const questionText = currentCard.questionText;
    const userText = isEditingCard ? editedAnswer : currentCard.expectedAnswer;
    const category = currentCard.questionType;
    const difficulty = currentCard.difficulty;

    try {
      const res = await fetch('/api/coach/save-to-rag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          questionText,
          expectedAnswer: userText,
          expectedSlideId: activeSlide?.id || 'none',
          saveTarget: 'rag',
          category,
          difficulty,
          source: 'train_mode_ai'
        })
      });
      const data = await res.json();
      
      if (data.success) {
        setSavedFeedback({
          id: `Q${qaList.length + 1}`,
          category,
          difficulty,
          source: 'Train Mode AI'
        });
        
        setQaList(prev => [{
          id: `Q${prev.length + 1}`,
          question: questionText,
          answer: userText,
          category,
          difficulty,
          source: 'train_mode_ai'
        }, ...prev]);

        setTimeout(() => setSavedFeedback(null), 3000);

        const existingQs = qaList.map(qa => qa.question);
        existingQs.push(questionText);
        fetchNextQuestion(existingQs);
      } else {
        setChatState('waiting');
      }
    } catch (err) {
      console.error(err);
      setChatState('waiting');
    }
  };

  return (
    <div className={styles.container}>
      {/* Top Navigation */}
      <header className={styles.topNav}>
        <div className={styles.navLeft}>
          <div className={styles.logo}>P</div>
          <button className={styles.backBtn} onClick={() => router.push(`/editor/${projectId}`)}>
            <ChevronLeft size={16} /> Editor
          </button>
          <div className={styles.navTitle}>Preview mode · {projectTitle}</div>
        </div>
        <div className={styles.navRight}>
          <select className={styles.langSelect} defaultValue="Russian">
            <option value="Russian">Russian</option>
            <option value="English">English</option>
            <option value="Ukrainian">Ukrainian</option>
          </select>
        </div>
      </header>

      {/* Train Mode Banner */}
      <div className={styles.banner}>
        <div className={styles.bannerLeft}>
          <div className={styles.bannerTitle}>
            <label className={styles.trainModeLabel}>
              <input type="checkbox" checked={true} readOnly className={styles.trainModeCheckbox} />
              Train Mode
            </label>
            <span className={styles.newBadge}>NEW</span>
          </div>
          <div className={styles.bannerSubtitle}>
            {mode === 'manual' 
              ? 'Enter your own question and correct answer — both go to the Test Set' 
              : 'Avatar asks typical questions — you answer correctly — this is recorded in the Test Set'}
          </div>
        </div>
        <div className={styles.bannerRight}>
          <div className={styles.toggleGroup}>
            <button 
              className={`${styles.toggleBtn} ${mode === 'ai' ? styles.active : ''}`}
              onClick={() => setMode('ai')}
            >
              🤖 AI asks
            </button>
            <button 
              className={`${styles.toggleBtn} ${mode === 'manual' ? styles.active : ''}`}
              onClick={() => setMode('manual')}
            >
              ✍️ Manual
            </button>
          </div>
          <div className={styles.qaCount}>{qaList.length} / 12 Q&A</div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className={styles.mainContent}>
        
        {/* Left: Slide Preview */}
        <div className={styles.slidePreview}>
          <div className={styles.slideStage}>
            <h2>{activeSlide.title || 'Slide Title'}</h2>
            <p>{activeSlide.text.split('\n')[0] || 'Slide content goes here...'}</p>
          </div>
          <div className={styles.slideFooter}>
            <span>{activeSlide.id} / {slides.length || 1}</span>
            <span>03:22 / 09:57</span>
          </div>
        </div>

        {/* Right: Manual Form OR AI Chat */}
        <div className={styles.rightPanel}>
          {mode === 'manual' ? (
            <>
              <div className={styles.panelHeader}>Add Q&A Manually</div>
              <div className={styles.formBody}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Question</label>
                  <textarea 
                    className={styles.textarea} 
                    placeholder="Can I get a 60-day payment deferral for a startup?"
                    value={manualQuestion}
                    onChange={(e) => setManualQuestion(e.target.value)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Correct Answer</label>
                  <textarea 
                    className={styles.textarea} 
                    placeholder="Yes, for verified startups..."
                    value={manualAnswer}
                    onChange={(e) => setManualAnswer(e.target.value)}
                  />
                </div>
                <div className={styles.row}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Category</label>
                    <select className={styles.select} value={manualCategory} onChange={(e) => setManualCategory(e.target.value)}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Difficulty</label>
                    <select className={styles.select} value={manualDifficulty} onChange={(e) => setManualDifficulty(e.target.value)}>
                      {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
                <div className={styles.actionsRow}>
                  <button className={styles.addBtn} onClick={handleManualSubmit} disabled={isSaving || !manualQuestion || !manualAnswer}>
                    {isSaving ? 'Saving...' : `+ Add to Test Set (Q${qaList.length + 1})`}
                  </button>
                  <button className={styles.clearBtn} onClick={() => {setManualQuestion(''); setManualAnswer('');}}>Clear</button>
                </div>

                <div className={styles.recentlyAdded}>
                  <div className={styles.recentlyAddedTitle}>Recently Added</div>
                  <div className={styles.recentList}>
                    {qaList.map(qa => (
                      <div key={qa.id} className={styles.recentItem}>
                        <div className={styles.qBadge}>{qa.id}</div>
                        <div>{qa.question}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* AI Tinder Mode */}
              <div className={styles.tinderBody}>
                {chatState === 'generating' && (
                  <div className={styles.loadingCard}>
                    <Loader2 size={32} className={styles.spin} style={{ color: '#0076ff', marginBottom: '1rem' }} /> 
                    <div style={{ fontWeight: 600 }}>Analyzing slide context...</div>
                    <div style={{ color: '#666', fontSize: '0.9rem' }}>Generating question and golden answer</div>
                  </div>
                )}
                
                {chatState !== 'generating' && currentCard && (
                  <div className={styles.tinderCard}>
                    <div className={styles.cardHeader}>
                      <div className={styles.cardTitle}>Avatar Asks</div>
                      <div className={styles.cardTags}>
                        <span className={styles.cardTag}>{currentCard.questionType}</span>
                        <span className={styles.cardTag}>{currentCard.difficulty}</span>
                      </div>
                    </div>
                    <div className={styles.cardQuestion}>
                      {currentCard.questionText}
                    </div>
                    
                    <div className={styles.cardAnswerSection}>
                      <div className={styles.cardAnswerTitle}>Recommended Answer</div>
                      {isEditingCard ? (
                        <textarea 
                          className={styles.textarea} 
                          value={editedAnswer} 
                          onChange={(e) => setEditedAnswer(e.target.value)} 
                          autoFocus
                          rows={4}
                        />
                      ) : (
                        <div className={styles.cardAnswerText}>
                          {currentCard.expectedAnswer}
                        </div>
                      )}
                    </div>
                    
                    <div className={styles.cardActions}>
                      <button 
                        className={styles.rejectBtn} 
                        onClick={handleReject}
                        disabled={chatState === 'saving'}
                      >
                        ❌ Reject
                      </button>
                      
                      {!isEditingCard && (
                        <button 
                          className={styles.editBtn} 
                          onClick={() => setIsEditingCard(true)}
                          disabled={chatState === 'saving'}
                        >
                          ✏️ Edit
                        </button>
                      )}
                      
                      <button 
                        className={styles.approveBtn} 
                        onClick={handleApprove}
                        disabled={chatState === 'saving'}
                      >
                        {chatState === 'saving' ? <Loader2 size={18} className={styles.spin} /> : '✅ Approve (Save)'}
                      </button>
                    </div>
                  </div>
                )}

                {savedFeedback && (
                  <div className={styles.savedFeedback}>
                    <div className={styles.savedHeader}>
                      <span className={styles.savedIcon}>✓ SAVED</span>
                      <span>{savedFeedback.id} saved to Test Set</span>
                    </div>
                    <div className={styles.savedMeta}>
                      Category: {savedFeedback.category} · Difficulty: {savedFeedback.difficulty}
                    </div>
                  </div>
                )}
                
                <div className={styles.recentlyAdded} style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #eaeaea', width: '100%' }}>
                  <div className={styles.recentlyAddedTitle}>Recently Added ({qaList.length})</div>
                  <div className={styles.recentList} style={{ maxHeight: '150px', overflowY: 'auto' }}>
                    {qaList.map(qa => (
                      <div key={qa.id} className={styles.recentItem}>
                        <div className={styles.qBadge}>{qa.id}</div>
                        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{qa.question}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default PreviewTrainMode;
