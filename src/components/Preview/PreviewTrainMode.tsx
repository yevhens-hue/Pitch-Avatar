'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './PreviewTrainMode.module.css';
import { ChevronLeft, Send } from 'lucide-react';
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

  // AI Chat State
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<any[]>([
    { id: 1, sender: 'ai', text: 'What exactly is included in the Enterprise tier — which features are missing in Pro?', time: '09:16:14' }
  ]);
  const [savedFeedback, setSavedFeedback] = useState<any>(null);

  const activeSlide = slides.length > 0 ? slides[0] : { id: 1, text: '', title: 'Start building this slide' };

  const handleManualSubmit = async () => {
    if (!manualQuestion || !manualAnswer) return;
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      const newQa: QARecord = {
        id: `Q${5 + qaList.length + 1}`,
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

  const mockQuestions = [
    'How does the onboarding process look for new customers?',
    'Can I integrate Pitch Avatar with Salesforce?',
    'What happens if we exceed our monthly bandwidth limit?'
  ];

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsg = { id: Date.now(), sender: 'user', text: chatInput, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) };
    
    // Use functional state update to ensure we have the latest state
    setChatMessages(prev => [...prev, newMsg]);
    setChatInput('');

    // Simulate AI saving feedback and asking next question
    setTimeout(() => {
      setSavedFeedback({
        id: `Q${5 + qaList.length + 1}`,
        category: 'Product',
        difficulty: 'Medium',
        source: 'Train Mode'
      });
      
      setQaList(prev => [{
        id: `Q${5 + prev.length + 1}`,
        // Find the last AI question for the Q&A record
        question: chatMessages.slice().reverse().find(m => m.sender === 'ai')?.text || 'Unknown question',
        answer: newMsg.text,
        category: 'Product',
        difficulty: 'Medium',
        source: 'train_mode_ai'
      }, ...prev]);

      // AI asks next question 1.5 seconds later
      setTimeout(() => {
        setSavedFeedback(null); // clear the saved badge
        const nextQ = mockQuestions[chatMessages.filter(m => m.sender === 'ai').length % mockQuestions.length];
        setChatMessages(prev => [...prev, {
          id: Date.now() + 1,
          sender: 'ai',
          text: nextQ,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        }]);
      }, 1500);

    }, 1000);
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
            ✓ Train Mode <span className={styles.newBadge}>NEW</span>
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
          <div className={styles.qaCount}>{5 + qaList.length} / 12 Q&A</div>
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
                    {isSaving ? 'Saving...' : `+ Add to Test Set (Q${5 + qaList.length + 1})`}
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
              {/* AI Chat Mode */}
              <div className={styles.chatBody}>
                <div className={styles.messagesArea}>
                  {chatMessages.map(msg => (
                    <div key={msg.id} className={`${styles.message} ${msg.sender === 'ai' ? styles.msgAi : styles.msgUser}`}>
                      <div className={styles.msgSender}>{msg.sender === 'ai' ? `Avatar (CIO) · ${msg.time}` : `You (Trainer) · ${msg.time}`}</div>
                      <div className={styles.msgBubble}>{msg.text}</div>
                    </div>
                  ))}
                  {savedFeedback && (
                    <div className={styles.savedFeedback}>
                      <div className={styles.savedHeader}>
                        <span className={styles.savedIcon}>✓ SAVED</span>
                        <span>{savedFeedback.id} saved to Test Set</span>
                      </div>
                      <div className={styles.savedMeta}>
                        Category: {savedFeedback.category} · Difficulty: {savedFeedback.difficulty} · Source: {savedFeedback.source}
                      </div>
                    </div>
                  )}
                </div>
                <form className={styles.chatInputArea} onSubmit={handleChatSubmit}>
                  <input 
                    type="text" 
                    className={styles.chatInput} 
                    placeholder="Waiting for the next question from the avatar..." 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                  />
                  <button type="submit" className={styles.sendBtn} disabled={!chatInput.trim()}>
                    <Send size={18} />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default PreviewTrainMode;
