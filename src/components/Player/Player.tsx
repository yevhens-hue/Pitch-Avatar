import React, { useState, useEffect } from 'react';
import styles from './Player.module.css';
import { supabase } from '../../lib/supabase';

type Message = { id: string; role: 'user' | 'bot'; text: string };

const Player: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'bot', text: 'Hi! I am the AI presenter for this deck. Ask me anything about the content!' }
  ]);
  
  // Track View Session on Mount
  useEffect(() => {
    const trackView = async () => {
      await supabase.from('analytics').insert({ event: 'view', timestamp: new Date() });
    };
    trackView();
  }, []);

  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || loading) return;
    
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

  return (
    <div className={styles.container}>
      {/* Left Stage: Slides and Avatar */}
      <div className={styles.stage}>
        <div className={styles.slideArea}>
          SLIDE 1 CONTENT
        </div>
        
        <div className={styles.avatarContainer}>
          {isPlaying && <div className={styles.avatarRipple}></div>}
          <div style={{color: 'white'}}>AI Avatar</div>
        </div>

        <div className={styles.controls}>
          <button className={styles.playBtn} onClick={() => setIsPlaying(!isPlaying)}>
            {isPlaying ? '⏸' : '▶'}
          </button>
          <div style={{flex: 1, background: 'rgba(255,255,255,0.2)', height: '4px', borderRadius: '2px'}}>
            <div style={{background: '#667eea', width: '20%', height: '100%', borderRadius: '2px'}}></div>
          </div>
          <span style={{color: 'white', fontSize: '0.8rem'}}>00:15 / 01:20</span>
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
