import React, { useState, useEffect } from 'react';
import styles from './CoachPlayer.module.css';
import EvaluationCard from '../EvaluationResult/EvaluationCard';
import { BuyerScenario, CoachEvaluation, DialogMode } from '@/types/coach';
import { Send, User, ChevronLeft, ChevronRight, CheckSquare } from 'lucide-react';

interface CoachPlayerProps {
  projectId: string;
}

const CoachPlayer: React.FC<CoachPlayerProps> = ({ projectId }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState<any[]>([
    { id: 'slide-1', title: 'Intro', text: 'Welcome to our platform' },
    { id: 'Prices', title: 'Prices', text: 'Pricing details' },
    { id: 'Competitor Advantages', title: 'Competitor Advantages', text: 'Why we are better' }
  ]);

  const [scenarios, setScenarios] = useState<BuyerScenario[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [dialogMode, setDialogMode] = useState<DialogMode>('questioning');
  
  const [inputText, setInputText] = useState('');
  const [isChecking, setIsChecking] = useState(true); // Default to Check Answer = true
  const [showAnswer, setShowAnswer] = useState(false);
  const [evaluation, setEvaluation] = useState<CoachEvaluation | null>(null);

  // Mock fetching scenarios
  useEffect(() => {
    // In a real app, fetch from /api/coach/generate-questions or existing scenarios
    setScenarios([
      {
        id: 'q1',
        projectId,
        questionText: 'Скільки коштує ваш продукт і які є варіанти підписок?',
        expectedAnswer: 'У нас є різні підписки для різних потреб та бюджетів.',
        expectedSlideId: 'Prices',
        createdAt: new Date().toISOString()
      },
      {
        id: 'q2',
        projectId,
        questionText: 'Чим ви кращі за конкурентів?',
        expectedAnswer: 'У нас є унікальні можливості продукта які надають вам цінності яких немає у конкурентів.',
        expectedSlideId: 'Competitor Advantages',
        createdAt: new Date().toISOString()
      }
    ]);
  }, [projectId]);

  const handleNextSlide = () => {
    if (currentSlide < slides.length - 1) setCurrentSlide(currentSlide + 1);
  };

  const handlePrevSlide = () => {
    if (currentSlide > 0) setCurrentSlide(currentSlide - 1);
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    if (dialogMode === 'questioning') {
      const currentScenario = scenarios[currentQuestionIndex];
      const activeSlideId = slides[currentSlide]?.id;

      if (isChecking) {
        // Send to Evaluate API
        try {
          const res = await fetch('/api/coach/evaluate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              projectId,
              questionText: currentScenario.questionText,
              userAnswer: inputText,
              slideShown: activeSlideId,
              expectedAnswer: currentScenario.expectedAnswer,
              expectedSlideId: currentScenario.expectedSlideId
            })
          });
          const data = await res.json();
          if (data.success) {
            setEvaluation({
              result: data.isCorrect ? 'Correct' : (data.score > 40 ? 'Partially Correct' : 'Incorrect'),
              score: data.score,
              feedback: data.feedback,
              recommendations: data.isCorrect ? [] : ['Review the value proposition', 'Make sure to select the correct slide'],
              productKnowledge: data.score,
              objectionHandling: data.score,
              needsIdentification: data.score,
              valuePresentation: data.score,
              slideUsage: data.slideMatched ? 100 : 0
            });
          }
        } catch (e) {
          console.error(e);
        }
      }
    } else {
      // Hybrid Dialog mode (Seller asks, Avatar answers)
      // Call RAG or Chat API
      console.log('Sending message to avatar in answering mode:', inputText);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < scenarios.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setInputText('');
      setEvaluation(null);
      setShowAnswer(false);
    }
  };

  const activeScenario = scenarios[currentQuestionIndex];

  return (
    <div className={styles.container}>
      {/* LEFT PANEL: Slide Viewer & Avatar */}
      <div className={styles.stage}>
        <div className={styles.slideArea}>
          <div className={styles.slideContent}>
            <div className={styles.slideTitle}>{slides[currentSlide]?.title}</div>
            <div className={styles.slideBody}>{slides[currentSlide]?.text}</div>
          </div>

          <div className={styles.avatarOverlay}>
            <div className={styles.avatarRipple}></div>
            <User size={64} color="#fff" />
            <div className={styles.avatarLabel}>Buyer Avatar</div>
          </div>
        </div>

        <div className={styles.controlsBar}>
          <button className={styles.navBtn} onClick={handlePrevSlide} disabled={currentSlide === 0}>
            <ChevronLeft size={20} />
          </button>
          
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill} 
              style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
            />
          </div>
          
          <button className={styles.navBtn} onClick={handleNextSlide} disabled={currentSlide === slides.length - 1}>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* RIGHT PANEL: Coach Dashboard */}
      <div className={styles.dashboard}>
        <div className={styles.dashboardHeader}>
          <div className={styles.headerTitle}>
            Coach Mode 
            <span className={styles.badgeRole}>Buyer Role</span>
          </div>
        </div>

        <div className={styles.chatArea}>
          {activeScenario && (
            <div className={styles.messageRow}>
              <div className={styles.messageAvatar}>
                <strong>Avatar:</strong> {activeScenario.questionText}
              </div>
            </div>
          )}

          {evaluation && (
            <div className={styles.messageRow}>
              <div className={styles.messageUser}>
                <strong>You:</strong> {inputText}
              </div>
              <div className={styles.evalCard}>
                <EvaluationCard evaluation={evaluation} />
              </div>
            </div>
          )}

          {showAnswer && activeScenario && (
            <div className={styles.answerReveal}>
              <div className={styles.answerLabel}>Expected Answer</div>
              <p>"{activeScenario.expectedAnswer}"</p>
              <div className={styles.answerLabel} style={{marginTop: '0.5rem'}}>Expected Slide</div>
              <p>{activeScenario.expectedSlideId || 'Any'}</p>
            </div>
          )}
        </div>

        <div className={styles.inputArea}>
          <div className={styles.inputToolbar}>
            <label className={styles.checkboxLabel}>
              <input 
                type="checkbox" 
                className={styles.checkbox}
                checked={isChecking}
                onChange={(e) => setIsChecking(e.target.checked)}
              />
              Check Answer
            </label>

            {evaluation && (
              <button className={styles.showAnswerBtn} onClick={() => setShowAnswer(!showAnswer)}>
                {showAnswer ? 'Hide Answer' : 'Show Answer'}
              </button>
            )}
          </div>

          <div className={styles.inputWrapper}>
            <input 
              type="text" 
              className={styles.textInput}
              placeholder={dialogMode === 'questioning' ? "Type your answer..." : "Ask the buyer..."}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button className={styles.iconBtn} title="Switch to Hybrid Dialog" onClick={() => setDialogMode(dialogMode === 'questioning' ? 'answering' : 'questioning')}>
              <CheckSquare size={18} />
            </button>
            <button className={`${styles.iconBtn} ${styles.sendBtn}`} onClick={handleSend}>
              <Send size={16} />
            </button>
          </div>

          {evaluation && (
            <button 
              className={styles.showAnswerBtn} 
              style={{ background: '#3b82f6', color: '#fff', border: 'none' }}
              onClick={handleNextQuestion}
            >
              Next Question
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoachPlayer;
