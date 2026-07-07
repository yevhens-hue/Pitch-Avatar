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
    { id: 'Q8', question: 'А чи можна отримати відстрочку платежу на 60 днів для стартапу?', answer: 'Так, для верифікованих стартапів доступний Startup Plan.', category: 'Pricing', difficulty: 'Medium', source: 'manual' },
    { id: 'Q7', question: 'Скільки коштує додаткове робоче місце?', answer: 'Залежить від тарифу, зазвичай $20/міс.', category: 'Pricing', difficulty: 'Easy', source: 'manual' },
    { id: 'Q6', question: 'Що входить у Enterprise tier?', answer: 'Enterprise додає SAML SSO, SOC 2 Type II, custom SLA.', category: 'Product', difficulty: 'Medium', source: 'train_mode_ai' },
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
    { id: 1, sender: 'ai', text: 'Що конкретно входить у Enterprise tier — які features відсутні у Pro?', time: '09:16:14' }
  ]);
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

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsg = { id: Date.now(), sender: 'user', text: chatInput, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) };
    setChatMessages([...chatMessages, newMsg]);
    setChatInput('');

    // Simulate AI saving feedback
    setTimeout(() => {
      setSavedFeedback({
        id: `Q${qaList.length + 6}`,
        category: 'Product',
        difficulty: 'Medium',
        source: 'Train Mode'
      });
      setQaList([{
        id: `Q${qaList.length + 6}`,
        question: chatMessages[chatMessages.length - 1].text,
        answer: newMsg.text,
        category: 'Product',
        difficulty: 'Medium',
        source: 'train_mode_ai'
      }, ...qaList]);
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
              ? 'Введи власне питання і правильну відповідь — обидва йдуть у Test Set' 
              : 'Аватар ставить типові питання — ти правильно відповідаєш — це пишеться у Test Set'}
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
              <div className={styles.panelHeader}>Додати Q&A вручну</div>
              <div className={styles.formBody}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Питання</label>
                  <textarea 
                    className={styles.textarea} 
                    placeholder="А чи можна отримати відстрочку платежу на 60 днів для стартапу?"
                    value={manualQuestion}
                    onChange={(e) => setManualQuestion(e.target.value)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Правильна відповідь</label>
                  <textarea 
                    className={styles.textarea} 
                    placeholder="Так, для верифікованих стартапів..."
                    value={manualAnswer}
                    onChange={(e) => setManualAnswer(e.target.value)}
                  />
                </div>
                <div className={styles.row}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Категорія</label>
                    <select className={styles.select} value={manualCategory} onChange={(e) => setManualCategory(e.target.value)}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Складність</label>
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
                  <div className={styles.recentlyAddedTitle}>Недавно додано</div>
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
                      <div className={styles.msgSender}>{msg.sender === 'ai' ? `Аватар (СІО) · ${msg.time}` : `Ви (Тренер) · ${msg.time}`}</div>
                      <div className={styles.msgBubble}>{msg.text}</div>
                    </div>
                  ))}
                  {savedFeedback && (
                    <div className={styles.savedFeedback}>
                      <div className={styles.savedHeader}>
                        <span className={styles.savedIcon}>✓ SAVED</span>
                        <span>{savedFeedback.id} записано у Test Set</span>
                      </div>
                      <div className={styles.savedMeta}>
                        Категорія: {savedFeedback.category} · Складність: {savedFeedback.difficulty} · Джерело: {savedFeedback.source}
                      </div>
                    </div>
                  )}
                </div>
                <form className={styles.chatInputArea} onSubmit={handleChatSubmit}>
                  <input 
                    type="text" 
                    className={styles.chatInput} 
                    placeholder="Чекаю наступне питання від аватара..." 
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
