'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useWizardLogic } from '@/hooks/useWizardLogic';
import styles from './ChatWizard.module.css';
import { Send, Bot, User as UserIcon, Settings, Sparkles, Plus, Image as ImageIcon } from 'lucide-react';

const ChatWizard: React.FC = () => {
  const { projectName, setProjectName, aiMode, setAiMode } = useWizardLogic();
  const [messages, setMessages] = useState<{role: 'bot' | 'user', text: string, options?: string[]}[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [step, setChatStep] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const addBotMessage = (text: string, options?: string[]) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'bot', text, options }]);
      setIsTyping(false);
    }, 1200);
  };

  useEffect(() => {
    addBotMessage("Hi there! 👋 I'm your AI Setup Assistant. Let's create something amazing. First, which industry are you in?", ["Sales", "Marketing", "HR", "Other"]);
  }, []);

  useEffect(scrollToBottom, [messages, isTyping]);

  const handleSend = (text?: string) => {
    const msg = text || inputValue.trim();
    if (!msg) return;

    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setInputValue('');
    processStep(msg);
  };

  const processStep = (msg: string) => {
    if (step === 0) {
      addBotMessage(`Awesome! ${msg} is a great field. Now, what's your primary goal for this project?`, ["Generate Leads", "Onboard Team", "Product Demo", "Internal Comms"]);
      setChatStep(1);
    } else if (step === 1) {
      addBotMessage(`Perfect. I'll optimize the AI for ${msg}. What should we name your first project?`);
      setChatStep(2);
    } else if (step === 2) {
      setProjectName(msg);
      addBotMessage(`"${msg}" — I like it! Next, do you want a full Video Avatar or just Voice over?`, ["Full Video Avatar", "Voice Only"]);
      setChatStep(3);
    } else if (step === 3) {
      const mode = msg.toLowerCase().includes('voice') ? 'voice' : 'video';
      setAiMode(mode);
      addBotMessage(`Great. I've set the AI mode to ${mode}. Final step: upload your content (PDF/PPTX) so I can start generating the slides!`, ["Upload PDF", "Upload PPTX", "Skip for now"]);
      setChatStep(4);
    } else {
      addBotMessage("I'm analyzing your preferences... You're almost ready to go to the editor!");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.chatPanel}>
        <div className={styles.chatHeader}>
          <div className={styles.avatar}>
            <Bot size={24} color="white" />
            <div className={styles.onlineStatus} />
          </div>
          <div className={styles.headerInfo}>
            <h3>AI Setup Assistant</h3>
            <p>Typically replies instantly</p>
          </div>
          <div className={styles.headerActions}>
            <Sparkles size={18} />
          </div>
        </div>

        <div className={styles.messages}>
          {messages.map((m, i) => (
            <div key={i} className={`${styles.messageContainer} ${m.role === 'bot' ? styles.botContainer : styles.userContainer}`}>
              {m.role === 'bot' && <div className={styles.msgAvatar}><Bot size={14} /></div>}
              <div className={styles.messageContent}>
                <div className={`${styles.message} ${m.role === 'bot' ? styles.bot : styles.user}`}>
                  {m.text}
                </div>
                {m.options && (
                  <div className={styles.options}>
                    {m.options.map(opt => (
                      <button key={opt} className={styles.optionBtn} onClick={() => handleSend(opt)}>
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className={styles.botContainer}>
              <div className={styles.msgAvatar}><Bot size={14} /></div>
              <div className={styles.typingIndicator}>
                <span></span><span></span><span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className={styles.inputArea}>
          <div className={styles.inputWrapper}>
            <button className={styles.attachBtn}><Plus size={20} /></button>
            <input 
              className={styles.input} 
              placeholder="Type your message..." 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <button className={styles.sendBtn} onClick={() => handleSend()} disabled={!inputValue.trim()}>
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className={styles.previewPanel}>
        <div className={styles.liveHeader}>
          <ImageIcon size={16} />
          <span>Real-time Configuration</span>
        </div>
        
        <div className={styles.livePreview}>
          <div className={styles.previewGlow} />
          <div className={styles.previewContent}>
            <div className={styles.avatarCircle}>
              <UserIcon size={56} color="#6366f1" />
              <div className={styles.scanLine} />
            </div>
            <div className={styles.previewDetails}>
              <div className={styles.detailItem}>
                <span>Tone</span>
                <div className={styles.progressBar}><div className={styles.progressFill} style={{ width: step > 1 ? '85%' : '0%' }} /></div>
              </div>
              <div className={styles.detailItem}>
                <span>Context</span>
                <div className={styles.progressBar}><div className={styles.progressFill} style={{ width: step > 2 ? '60%' : '0%' }} /></div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.configCard}>
          <div className={styles.configHeader}>
            <Settings size={14} />
            <span>Active Config</span>
          </div>
          <div className={styles.configList}>
            <div className={styles.configRow}>
              <label>Project</label>
              <span>{projectName || '---'}</span>
            </div>
            <div className={styles.configRow}>
              <label>AI Mode</label>
              <span style={{ textTransform: 'capitalize' }}>{aiMode}</span>
            </div>
            <div className={styles.configRow}>
              <label>Status</label>
              <span className={styles.statusActive}>
                <div className={styles.pulse} /> {step < 4 ? 'Configuring' : 'Ready'}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.infoBox}>
          <p>The AI will adapt its body language and facial expressions based on your industry and goals.</p>
        </div>
      </div>
    </div>
  );
};

export default ChatWizard;
