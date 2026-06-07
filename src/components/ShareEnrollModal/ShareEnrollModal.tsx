import React, { useState } from 'react';
import styles from './ShareEnrollModal.module.css';
import { Copy, Link as LinkIcon, X, ExternalLink, Settings, Share2, RefreshCw } from 'lucide-react';
import LinkReadyModal from './LinkReadyModal';
import { useToast } from '@/components/ui/ToastProvider';
import { createEnrollment, getGroups, getEnrollmentLinks, getPresenters } from '@/app/actions/enrollments';
import { getListeners } from '@/app/actions/listeners';

interface ShareEnrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectTitle?: string;
  projectId?: string;
}

export default function ShareEnrollModal({ isOpen, onClose, projectTitle = "Untitled Project", projectId = "test-project-id" }: ShareEnrollModalProps) {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('general');
  const [notificationsOff, setNotificationsOff] = useState(false);
  const [choiceAtBeginning, setChoiceAtBeginning] = useState(false);
  
  // Invitation & Reminders Tab states
  const [invitationText, setInvitationText] = useState('');
  const [inviteSubject, setInviteSubject] = useState('Welcome to your onboarding training session');
  const [sendAnimatedGif, setSendAnimatedGif] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [enableReminders, setEnableReminders] = useState(false);

  const [activeActionId, setActiveActionId] = useState<number | null>(null);
  const [isLinkReadyModalOpen, setIsLinkReadyModalOpen] = useState(false);

  // General Tab States
  const [title, setTitle] = useState('');
  const [targetType, setTargetType] = useState<'anonymous' | 'listener' | 'group'>('anonymous');
  const [selectedListenerId, setSelectedListenerId] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [listeners, setListeners] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [presenters, setPresenters] = useState<any[]>([]);

  React.useEffect(() => {
    if (isOpen) {
      getListeners('', 1, 100).then(res => setListeners(res?.data || []));
      getGroups().then(res => setGroups(res || []));
      getPresenters().then(res => setPresenters(res || []));
      getEnrollmentLinks(projectId).then(res => setEnrollments(res || []));
    }
  }, [isOpen, projectId]);

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

  const handleCreate = async (sendInviteNow: boolean = false) => {
    setIsSubmitting(true);
    try {
      await createEnrollment({
        title: title || 'Untitled Enrollment',
        projectId: projectId,
        status: 'Pending',
        targetType,
        listenerId: targetType === 'listener' ? selectedListenerId : null,
        groupId: targetType === 'group' ? selectedGroupId : null,
        contentType: 'project',
        emailSchedule: {
          sendInvite: sendInviteNow,
          inviteSubject: inviteSubject,
          inviteBody: invitationText,
        },
        bookCalendarOrStartAvatar: choiceAtBeginning,
      });
      showToast(sendInviteNow ? "Enrollment link created and email queued." : "Enrollment link created successfully.", "success");
      setActiveTab('enrollments');
      setTitle('');
    } catch (err: any) {
      if (err.message?.includes('QUOTA_EXCEEDED')) {
        showToast("You have reached your limit of active Listener Seats. Please upgrade your seat plan or archive active enrollments.", "error");
      } else {
        showToast(err.message || "Failed to create enrollment", "error");
      }
    } finally {
      setIsSubmitting(false);
    }
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
                <input 
                  type="text" 
                  className={styles.input} 
                  placeholder="Enter assignment title" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Presenter(s)</label>
                <select className={styles.select} defaultValue="">
                  <option value="" disabled>Select presenters from your company...</option>
                  {presenters.map(p => (
                    <option key={p.id} value={p.id}>{p.email}</option>
                  ))}
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
                <label className={styles.label} htmlFor="targetTypeSelect">Target Type</label>
                <select 
                  id="targetTypeSelect"
                  className={styles.select}
                  value={targetType}
                  onChange={(e) => {
                    setTargetType(e.target.value as any);
                    setSelectedListenerId('');
                    setSelectedGroupId('');
                  }}
                >
                  <option value="anonymous">Anonymous (no target)</option>
                  <option value="listener">Specific Listener</option>
                  <option value="group">Listener Group</option>
                </select>
              </div>

              {targetType === 'listener' && (
                <div className={styles.formGroup}>
                  <label className={styles.label}>Select Listener</label>
                  <select 
                    className={styles.select}
                    value={selectedListenerId}
                    onChange={(e) => setSelectedListenerId(e.target.value)}
                  >
                    <option value="" disabled>Select a listener...</option>
                    {listeners.map(l => (
                      <option key={l.id} value={l.id}>{l.email}</option>
                    ))}
                  </select>
                </div>
              )}

              {targetType === 'group' && (
                <div className={styles.formGroup}>
                  <label className={styles.label}>Select Group</label>
                  <select 
                    className={styles.select}
                    value={selectedGroupId}
                    onChange={(e) => setSelectedGroupId(e.target.value)}
                  >
                    <option value="" disabled>Select a group...</option>
                    {groups.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>
              )}

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
                <label className={styles.label}>Subject</label>
                <input 
                  type="text" 
                  className={styles.input} 
                  placeholder="Email Subject"
                  value={inviteSubject}
                  onChange={(e) => setInviteSubject(e.target.value)}
                />
              </div>

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
                onClick={() => handleCreate(true)}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Send Invitation Emails Now'}
              </button>
            </div>
          )}
          {activeTab === 'enrollments' && (
            <div className={styles.enrollmentsContainer}>
              <div className={styles.enrollmentsHeader}>
                <div className={styles.enrollmentsText}>
                  All viewer links generated for this project — across every listener and assignment.
                </div>
                <button className={styles.enrollmentsUpdateBtn} onClick={() => showToast("Link updated. The shared link now serves the latest project data.", "success")}>
                  Update
                </button>
              </div>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th style={{width: '40px'}}><input type="checkbox" /></th>
                      <th>Groups / Listeners</th>
                      <th>Enrollments</th>
                      <th>Link</th>
                      <th>Date Created</th>
                      <th style={{textAlign: 'center'}}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrollments.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>
                          No enrollments found.
                        </td>
                      </tr>
                    ) : (
                      enrollments.map((enrollment) => (
                        <tr key={enrollment.id}>
                          <td><input type="checkbox" /></td>
                          <td>{enrollment.listenerName || enrollment.groupName || 'Anonymous'}</td>
                          <td>{enrollment.projectTitle || 'Enrollment'}</td>
                          <td>
                            <div className={styles.linkGroup}>
                              <span className={styles.linkText}>{enrollment.uniqueUrl || 'https://pitch-avatar.com/...'}</span>
                              <button className={styles.iconBtn} title="Copy link" onClick={handleCopy}><Copy size={14} /></button>
                              <button className={styles.iconBtn} title="Open link in new tab"><ExternalLink size={14} /></button>
                            </div>
                          </td>
                          <td>{new Date(enrollment.createdAt).toLocaleDateString()}</td>
                          <td className={styles.actionMenuContainer} style={{ textAlign: 'center' }}>
                            <button 
                              className={styles.iconBtn} 
                              title="Actions"
                              onClick={() => setActiveActionId(activeActionId === enrollment.id ? null : enrollment.id)}
                            >
                              <Settings size={16} />
                            </button>
                            {activeActionId === enrollment.id && (
                              <div className={styles.actionMenu}>
                                <button className={styles.actionMenuItem} onClick={() => { setIsLinkReadyModalOpen(true); setActiveActionId(null); }}>
                                  <Share2 size={14} /> Share
                                </button>
                                <button className={styles.actionMenuItem} onClick={() => { handleUpdate(); setActiveActionId(null); }}>
                                  <RefreshCw size={14} /> Update
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button 
            className={styles.updateBtn} 
            onClick={activeTab === 'enrollments' ? handleUpdate : handleCreate}
            disabled={isSubmitting}
          >
            {activeTab === 'enrollments' && <LinkIcon size={16} />}
            {isSubmitting ? 'Processing...' : (activeTab === 'enrollments' ? 'Update Enrollment Links' : 'Create Enrollment Link')}
          </button>
        </div>
      </div>

      <LinkReadyModal 
        isOpen={isLinkReadyModalOpen} 
        onClose={() => setIsLinkReadyModalOpen(false)} 
        linkUrl="https://avatar-story-wizard.lovable.app/p/da288cfbcb1209236cbf4848" 
      />

    </div>
  );
}
