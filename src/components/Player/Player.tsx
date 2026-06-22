import React, { useState, useEffect, useRef } from 'react';
import styles from './Player.module.css';
import { supabase } from '../../lib/supabase';
import { getEnrollmentByLinkId, updateEnrollmentStatusAction } from '../../app/actions/enrollments';
import { useAuth } from '@/context/AuthContext';
import { trackActivationEvent } from '@/lib/stonly';

type Message = { id: string; role: 'user' | 'bot'; text: string };

interface PlayerProps {
  enrollmentLinkId?: string;
}

const Player: React.FC<PlayerProps> = ({ enrollmentLinkId }) => {
  const { user } = useAuth();
  const hasTestedRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slidesCount, setSlidesCount] = useState(12);
  const [enrollmentStatus, setEnrollmentStatus] = useState<string>('');
  
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'bot', text: 'Hi! I am the AI presenter for this deck. Ask me anything about the content!' }
  ]);
  
  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);

  // Track View Session and Load enrollment details on Mount
  useEffect(() => {
    const loadAndTrack = async () => {
      // General analytics tracking
      await supabase.from('analytics').insert({ event: 'view', timestamp: new Date() });

      if (enrollmentLinkId) {
        try {
          const data = await getEnrollmentByLinkId(enrollmentLinkId);
          if (data) {
            setEnrollment(data);
            setSlidesCount(data.slidesCount || 12);
            setEnrollmentStatus(data.status);

            // Auto transition status from 'Pending' to 'In Progress'
            if (data.status === 'Pending') {
              await updateEnrollmentStatusAction(data.enrollmentId, 'In Progress');
              setEnrollmentStatus('In Progress');
              setMessages(prev => [
                ...prev,
                { id: Date.now().toString(), role: 'bot', text: 'Welcome! Your enrollment is now active and set to "In Progress".' }
              ]);
            }
          }
        } catch (error) {
          console.error('Failed to load enrollment details or update status:', error);
        }
      }
    };
    loadAndTrack();
  }, [enrollmentLinkId]);

  const handleNextSlide = async () => {
    if (currentSlide < slidesCount - 1) {
      const nextIndex = currentSlide + 1;
      setCurrentSlide(nextIndex);

      // Auto transition to 'Completed' when reaching the final slide
      if (nextIndex === slidesCount - 1 && enrollment && enrollmentStatus === 'In Progress') {
        try {
          await updateEnrollmentStatusAction(enrollment.enrollmentId, 'Completed');
          setEnrollmentStatus('Completed');
          setMessages(prev => [
            ...prev,
            { id: Date.now().toString(), role: 'bot', text: 'Perfect! You have completed all presentation slides. Your enrollment status has been updated to "Completed".' }
          ]);
        } catch (error) {
          console.error('Failed to update status to Completed:', error);
        }
      }
    }
  };

  const handlePrevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleSimulateStatus = async (status: 'Completed' | 'Failed') => {
    if (!enrollment) {
      alert('Status simulation is only available when previewing a valid enrollment link.');
      return;
    }
    try {
      await updateEnrollmentStatusAction(enrollment.enrollmentId, status);
      setEnrollmentStatus(status);
      setMessages(prev => [
        ...prev,
        { id: Date.now().toString(), role: 'bot', text: `[Simulation Mode] Status successfully updated to: "${status}".` }
      ]);
    } catch (error) {
      console.error(error);
      alert('Failed to update status in database.');
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || loading) return;
    
    if (!hasTestedRef.current) {
      trackActivationEvent('tour_test_chat', user?.id, user?.user_metadata?.main_goal || user?.user_metadata?.goal);
      hasTestedRef.current = true;
    }
    
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: inputVal };
    setMessages(prev => [...prev, userMsg]);
    setInputVal('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: inputVal, context: 'Presentation Preview context' }),
      });

      const data = await response.json();
      
      const botMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'bot', 
        text: data.text || 'I am having trouble connecting to the brain...' 
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
       console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (enrollmentStatus === 'Expired') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: '#cbd5e1', textAlign: 'center', width: '100%' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#fff' }}>The link has expired</h2>
        <p style={{ fontSize: '1.2rem', maxWidth: '500px', lineHeight: 1.5 }}>
          This presentation link is no longer active. If you still need access, please contact the person who shared it with you.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Left Stage: Slides and Avatar */}
      <div className={styles.stage}>
        <div className={styles.slideArea}>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '1.25rem', fontWeight: 700 }}>
              {enrollment?.projectTitle || 'Presentation Deck'}
            </h2>
            <div style={{ fontSize: '1.2rem', color: '#94a3b8', fontWeight: 500 }}>
              Slide {currentSlide + 1} of {slidesCount}
            </div>
            {enrollmentStatus && (
              <div style={{ 
                marginTop: '1.5rem', 
                display: 'inline-block', 
                padding: '0.4rem 1rem', 
                borderRadius: '9999px', 
                fontSize: '0.78rem', 
                fontWeight: 600, 
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                background: enrollmentStatus === 'Completed' ? 'rgba(34, 197, 94, 0.15)' : enrollmentStatus === 'In Progress' ? 'rgba(59, 130, 246, 0.15)' : enrollmentStatus === 'Failed' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(100, 116, 139, 0.15)', 
                border: `1px solid ${enrollmentStatus === 'Completed' ? '#22c55e' : enrollmentStatus === 'In Progress' ? '#3b82f6' : enrollmentStatus === 'Failed' ? '#ef4444' : '#64748b'}`, 
                color: enrollmentStatus === 'Completed' ? '#4ade80' : enrollmentStatus === 'In Progress' ? '#60a5fa' : enrollmentStatus === 'Failed' ? '#f87171' : '#cbd5e1' 
              }}>
                Status: {enrollmentStatus}
              </div>
            )}
          </div>
        </div>
        
        <div className={styles.avatarContainer}>
          {isPlaying && <div className={styles.avatarRipple}></div>}
          <div style={{color: 'white', fontWeight: 600}}>AI Avatar</div>
        </div>

        <div className={styles.controls}>
          <button className={styles.playBtn} onClick={() => setIsPlaying(!isPlaying)}>
            {isPlaying ? '⏸' : '▶'}
          </button>
          
          <button 
            className={styles.navBtn} 
            onClick={handlePrevSlide} 
            disabled={currentSlide === 0}
            style={{ opacity: currentSlide === 0 ? 0.3 : 1, cursor: currentSlide === 0 ? 'not-allowed' : 'pointer' }}
          >
            ◀ Prev
          </button>
          
          <div style={{flex: 1, background: 'rgba(255,255,255,0.2)', height: '4px', borderRadius: '2px'}}>
            <div style={{background: '#667eea', width: `${((currentSlide + 1) / slidesCount) * 100}%`, height: '100%', borderRadius: '2px', transition: 'width 0.3s ease'}}></div>
          </div>
          
          <button 
            className={styles.navBtn} 
            onClick={handleNextSlide} 
            disabled={currentSlide === slidesCount - 1}
            style={{ opacity: currentSlide === slidesCount - 1 ? 0.3 : 1, cursor: currentSlide === slidesCount - 1 ? 'not-allowed' : 'pointer' }}
          >
            Next ▶
          </button>
          
          <span style={{color: 'white', fontSize: '0.8rem', minWidth: '45px', textAlign: 'right'}}>{currentSlide + 1} / {slidesCount}</span>
        </div>
      </div>

      {/* Right Sidebar: AI Chat / RAG */}
      <div className={styles.sidebar}>
        <div className={styles.chatHeader}>
          AI Assistant
        </div>
        <div className={styles.chatMessages}>
          {messages.map(m => (
            <div key={m.id} className={`${styles.message} ${m.role === 'bot' ? styles.messageBot : styles.messageUser}`}>
              {m.text}
            </div>
          ))}
          {loading && <div className={`${styles.message} ${styles.messageBot}`} style={{opacity: 0.5}}>Thinking...</div>}
        </div>
        
        {/* Simulator controls for testing status updates */}
        {enrollment && (
          <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Testing Simulator:</div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                type="button" 
                onClick={() => handleSimulateStatus('Completed')} 
                style={{ flex: 1, padding: '0.4rem', borderRadius: '6px', background: '#22c55e', color: 'white', border: 'none', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Simulate Complete
              </button>
              <button 
                type="button" 
                onClick={() => handleSimulateStatus('Failed')} 
                style={{ flex: 1, padding: '0.4rem', borderRadius: '6px', background: '#ef4444', color: 'white', border: 'none', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Simulate Fail
              </button>
            </div>
          </div>
        )}

        <form className={styles.chatInputArea} onSubmit={handleSend}>
          <input 
            type="text" 
            className={styles.chatInput} 
            placeholder="Ask a question..."
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
          />
          <button type="submit" className={styles.sendBtn}>➤</button>
        </form>
      </div>
    </div>
  );
};

export default Player;
