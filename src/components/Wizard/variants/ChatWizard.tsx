'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useWizardLogic } from '@/hooks/useWizardLogic';
import styles from './ChatWizard.module.css';
import { Send, Bot, User as UserIcon, Check, Settings } from 'lucide-react';

const ChatWizard: React.FC = () => {
  const { projectName, setProjectName, aiMode, setAiMode } = useWizardLogic();
  const [messages, setMessages] = useState<{role: 'bot' | 'user', text: string}[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [step, setChatStep] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const initialMsg = "Hi! I'm your AI guide. Let's build your presentation together. First, where do you work? (e.g. Acme Corp)";
    setMessages([{ role: 'bot', text: initialMsg }]);
  }, []);

  useEffect(scrollToBottom, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMsg = inputValue.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInputValue('');

    setTimeout(() => {
      processStep(userMsg);
    }, 800);
  };

  const processStep = (msg: string) => {
    if (step === 0) {
      setMessages(prev => [...prev, { role: 'bot', text: `Great! And what describes your role at ${msg} best? (Sales, Marketing, L&D, etc.)` }]);
      setChatStep(1);
    } else if (step === 1) {
      setMessages(prev => [...prev, { role: 'bot', text: `Got it. Now let's name your first project.` }]);
      setChatStep(2);
    } else if (step === 2) {
      setProjectName(msg);
      setMessages(prev => [...prev, { role: 'bot', text: `Perfect. Do you want a Video Avatar or Voice Only for "${msg}"?` }]);
      setChatStep(3);
    } else if (step === 3) {
      const mode = msg.toLowerCase().includes('voice') ? 'voice' : 'video';
      setAiMode(mode);
      setMessages(prev => [...prev, { role: 'bot', text: `Excellent. I've configured everything. Now, please upload your content (PDF/PPTX) and I'll generate the slides!` }]);
      setChatStep(4);
    } else {
      setMessages(prev => [...prev, { role: 'bot', text: "Analyzing your input... You're all set!" }]);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.chatPanel}>
        <div className={styles.chatHeader}>
          <div style={{ background: '#6366f1', padding: '8px', borderRadius: '10px' }}>
            <Bot size={20} color="white" />
          </div>
          <div>
            <h3>AI Setup Assistant</h3>
            <p style={{ fontSize: '0.8rem', opacity: 0.5 }}>Online & ready to help</p>
          </div>
        </div>

        <div className={styles.messages}>
          {messages.map((m, i) => (
            <div key={i} className={`${styles.message} ${m.role === 'bot' ? styles.bot : styles.user}`}>
              {m.text}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className={styles.inputArea}>
          <input 
            className={styles.input} 
            placeholder="Type your message..." 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <button className={styles.sendBtn} onClick={handleSend}>
            <Send size={18} />
          </button>
        </div>
      </div>

      <div className={styles.previewPanel}>
        <div className={styles.livePreview}>
          <div className={styles.avatarOverlay}>
            <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '2px solid #6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <UserIcon size={48} color="#6366f1" />
            </div>
            <p style={{ opacity: 0.5 }}>Live Preview Updates</p>
          </div>
        </div>

        <div className={styles.statusCard}>
          <h4 style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>Project Config</h4>
          <div className={styles.statusItem}>
            <span>Project:</span>
            <strong>{projectName}</strong>
          </div>
          <div className={styles.statusItem}>
            <span>AI Mode:</span>
            <strong>{aiMode}</strong>
          </div>
          <div className={styles.statusItem}>
            <span>Status:</span>
            <span style={{ color: '#4ade80', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Check size={14} /> Configuring
            </span>
          </div>
        </div>

        <button 
          style={{ 
            width: '100%', 
            padding: '1rem', 
            borderRadius: '16px', 
            border: 'none', 
            background: 'rgba(255,255,255,0.05)', 
            color: 'white', 
            fontWeight: 600, 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <Settings size={18} /> Open Advanced Settings
        </button>
      </div>
    </div>
  );
};

export default ChatWizard;
