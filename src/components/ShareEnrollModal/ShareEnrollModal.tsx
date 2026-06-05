import React, { useState } from 'react';
import styles from './ShareEnrollModal.module.css';
import { Copy, Link as LinkIcon, X } from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';

interface ShareEnrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectTitle?: string;
}

export default function ShareEnrollModal({ isOpen, onClose, projectTitle = "Untitled Project" }: ShareEnrollModalProps) {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('general');
  const [notificationsOff, setNotificationsOff] = useState(false);
  const [choiceAtBeginning, setChoiceAtBeginning] = useState(false);
  
  // Invitation & Reminders Tab states
  const [invitationText, setInvitationText] = useState('');
  const [sendAnimatedGif, setSendAnimatedGif] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [enableReminders, setEnableReminders] = useState(false);

  const insertPlaceholder = (tag: string) => {
    setInvitationText(prev => prev + (prev ? ' ' : '') + tag);
  };

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText("https://avatar-story-wizard.lovable.app/p/da288cfbcb1209236cbf4848");
    showToast("Link copied to clipboard", "success");
  };

  const handleUpdate = () => {
    showToast("Link updated. The shared link now serves the latest project data.", "success");
    onClose();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.titleArea}>
            <div className={styles.title}>Share / Enroll</div>
            <div className={styles.subtitle}>Create a new assignment link or manage existing ones for this project.</div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.body}>
          {/* Top blue link section */}
          <div className={styles.linkSection}>
            <div className={styles.linkLabel}>Enrollment Link</div>
            <div className={styles.linkInputGroup}>
              <input 
                type="text" 
                className={styles.linkInput} 
                readOnly 
                value="https://avatar-story-wizard.lovable.app/p/da288cfbcb1209236cbf4848"
              />
              <button className={styles.copyBtn} onClick={handleCopy}>
                <Copy size={16} />
              </button>
            </div>
            <div className={styles.linkSubtext}>Share this link with your Listener(s)</div>
          </div>

          {/* Tabs */}
          <div className={styles.tabs}>
            <button 
              className={`${styles.tab} ${activeTab === 'general' ? styles.active : ''}`}
              onClick={() => setActiveTab('general')}
            >
              General
            </button>
            <button 
              className={`${styles.tab} ${activeTab === 'invitation' ? styles.active : ''}`}
              onClick={() => setActiveTab('invitation')}
            >
              Invitation and Reminders
            </button>
            <button 
              className={`${styles.tab} ${activeTab === 'enrollments' ? styles.active : ''}`}
              onClick={() => setActiveTab('enrollments')}
            >
              Enrollments <span className={styles.badge}>1</span>
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'general' && (
            <div className={styles.tabContent}>
              <div className={styles.sectionTitle}>Enrollment Details</div>
              
              <div className={styles.formGroup}>
                <label className={styles.label}>Title (shown to listener) <span>*</span></label>
                <input type="text" className={styles.input} placeholder="Enter assignment title" />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Presenter(s)</label>
                <select className={styles.select}>
                  <option value="" disabled selected>Select presenters from your company...</option>
                  <option value="yevhen">yevhen.shaforostov@roi4cio.com</option>
                </select>
                <div className={styles.subtext}>Choose one or more presenters from your company.</div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Link to calendar</label>
                <input type="text" className={styles.input} defaultValue="https://meetings.hubspot.com/your-handle" />
                <div className={styles.subtext}>Default value is taken from Account Settings → Integrations.</div>
              </div>

              <div className={styles.toggleRow}>
                <div className={styles.toggleText}>Don't send notifications when the listener opens the link</div>
                <div 
                  className={`${styles.toggleSwitch} ${notificationsOff ? styles.active : ''}`}
                  onClick={() => setNotificationsOff(!notificationsOff)}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Target Type</label>
                <select className={styles.select}>
                  <option value="anonymous">Anonymous (no target)</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Project</label>
                <div className={styles.projectPillContainer}>
                  <input type="text" className={styles.input} readOnly value={projectTitle} style={{background: '#f8fafc', color: '#64748b'}} />
                  <div className={styles.projectPill}>Current</div>
                </div>
                <div className={styles.subtext}>This share applies to the project you are currently editing.</div>
              </div>

              <div className={styles.toggleRow}>
                <div className={styles.toggleText}>Choice at the beginning: book calendar OR start avatar now</div>
                <div 
                  className={`${styles.toggleSwitch} ${choiceAtBeginning ? styles.active : ''}`}
                  onClick={() => setChoiceAtBeginning(!choiceAtBeginning)}
                />
              </div>
            </div>
          )}

          {activeTab === 'invitation' && (
            <div className={styles.tabContent}>
              <div className={styles.sectionTitle}>Invitation</div>
              
              <div className={styles.formGroup}>
                <label className={styles.label}>Invitation Text</label>
                <textarea 
                  className={`${styles.input} ${styles.textarea}`}
                  rows={4}
                  placeholder="Enter the invitation message..."
                  value={invitationText}
                  onChange={(e) => setInvitationText(e.target.value)}
                />
                <div className={styles.placeholdersContainer}>
                  Available placeholders:
                  <div className={styles.placeholderList}>
                    {[
                      '#Listener First Name#',
                      '#Listener Second Name#',
                      '#Avatar Name#',
                      '#Course Name#',
                      '#Assignment Name#',
                      '#Presenter First Name#',
                      '#Presenter Second Name#',
                    ].map(placeholder => (
                      <span 
                        key={placeholder} 
                        className={styles.placeholderBadge}
                        onClick={() => insertPlaceholder(placeholder)}
                      >
                        {placeholder}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className={styles.leftToggleRow}>
                <div 
                  className={`${styles.toggleSwitch} ${sendAnimatedGif ? styles.active : ''}`}
                  onClick={() => setSendAnimatedGif(!sendAnimatedGif)}
                />
                <span className={styles.toggleLabelRight}>Send animated GIF</span>
              </div>

              <div className={styles.subSectionTitle}>Scheduled Invitation</div>

              <div className={styles.formRow2}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Start Date</label>
                  <input 
                    type="date" 
                    className={styles.input} 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                  <div className={styles.subtext}>Date when invitation will be sent</div>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Time</label>
                  <input 
                    type="time" 
                    className={styles.input} 
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                  <div className={styles.subtext}>Time when invitation will be sent</div>
                </div>
              </div>

              <div className={styles.sectionTitle} style={{marginTop: '2rem'}}>Reminders</div>

              <div className={styles.leftToggleRow}>
                <div 
                  className={`${styles.toggleSwitch} ${enableReminders ? styles.active : ''}`}
                  onClick={() => setEnableReminders(!enableReminders)}
                />
                <span className={styles.toggleLabelRight}>Enable reminders</span>
              </div>

              <button 
                type="button" 
                className={styles.sendBtn}
                onClick={() => showToast("Emails queued for sending successfully.", "success")}
              >
                Send Invitation Emails Now
              </button>
            </div>
          )}
          {activeTab === 'enrollments' && <div style={{color: '#64748b', fontSize: '0.9rem'}}>Enrollment management coming soon.</div>}
          
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button className={styles.updateBtn} onClick={handleUpdate}>
            <LinkIcon size={16} />
            Update Enrollment Links
          </button>
        </div>
      </div>
    </div>
  );
}
