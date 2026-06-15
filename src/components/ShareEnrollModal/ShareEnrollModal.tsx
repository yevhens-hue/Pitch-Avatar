import React, { useState } from 'react';
import styles from './ShareEnrollModal.module.css';
import { Copy, Link as LinkIcon, X, ExternalLink, Settings, Share2, RefreshCw } from 'lucide-react';
import LinkReadyModal from './LinkReadyModal';
import { useToast } from '@/components/ui/ToastProvider';
import { createEnrollment, getGroups, getEnrollmentLinks, getPresenters } from '@/app/actions/enrollments';
import OverageModal from '@/components/Modals/OverageModal';
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
  const [translateToListenerLanguage, setTranslateToListenerLanguage] = useState(false);
  const [reminderSubject, setReminderSubject] = useState('');
  const [reminderText, setReminderText] = useState('');
  const [reminderFrequency, setReminderFrequency] = useState('Every day');
  const [reminderCount, setReminderCount] = useState('3');
  const [stopRemindersOnOpen, setStopRemindersOnOpen] = useState(true);

  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [isLinkReadyModalOpen, setIsLinkReadyModalOpen] = useState(false);
  const [isOverageModalOpen, setIsOverageModalOpen] = useState(false);

  // General Tab States
  const [title, setTitle] = useState('');
  const [expirationDays, setExpirationDays] = useState(14);
  const [targetType, setTargetType] = useState<'anonymous' | 'listener' | 'group'>('anonymous');
  const [contentType, setContentType] = useState<'project' | 'course'>('project');
  const [selectedListenerId, setSelectedListenerId] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedPresenterIds, setSelectedPresenterIds] = useState<string[]>([]);
  const [calendarLink, setCalendarLink] = useState('https://meetings.hubspot.com/your-handle');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [listeners, setListeners] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [presenters, setPresenters] = useState<any[]>([]);

  React.useEffect(() => {
    if (isOpen) {
      getListeners('', 1, 100).then(res => setListeners(res?.data || []));
      getGroups().then(res => setGroups(res || []));
      getPresenters().then(res => {
        setPresenters(res || []);
        if (res && res.length > 0) {
          setExpirationDays(res[0].default_link_expiration_days ?? 14);
        }
      });
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
        contentType: contentType,
        courseId: contentType === 'course' ? selectedCourseId : null,
        startDate: startDate ? `${startDate}T${startTime || '00:00'}:00Z` : null,
        calendarLink,
        presenterIds: selectedPresenterIds,
        translateToListenerLanguage,
        emailSchedule: {
          sendInvite: sendInviteNow,
          inviteSubject: inviteSubject,
          inviteBody: invitationText,
        },
        bookCalendarOrStartAvatar: choiceAtBeginning,
        enableReminders,
        reminderSubject,
        reminderText,
        reminderFrequency,
        reminderCount,
        stopRemindersOnOpen,
        expirationDays,
      });
      showToast(sendInviteNow ? "Enrollment link created and email queued." : "Enrollment link created successfully.", "success");
      setActiveTab('links');
      setTitle('');
    } catch (err: any) {
      if (err.message?.includes('QUOTA_EXCEEDED')) {
        setIsOverageModalOpen(true);
      } else if (err.message?.includes('resend_domain_required') || err.message?.includes('409')) {
        showToast("Please verify your domain in Account Settings before sending emails.", "error");
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
            <div className={styles.subtitle}>Create a new enrollment link or manage existing ones for this project.</div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.body}>
          {/* Top blue link section */}
          {enrollments.length > 0 && (
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
          )}

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
              className={`${styles.tab} ${activeTab === 'links' ? styles.active : ''}`}
              onClick={() => setActiveTab('links')}
            >
              Enrollments <span className={styles.badge}>{enrollments.length}</span>
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
                  placeholder="Enter enrollment title" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Presenter(s)</label>
                <select 
                  className={styles.select} 
                  multiple 
                  value={selectedPresenterIds}
                  onChange={(e) => {
                    const options = Array.from(e.target.selectedOptions);
                    setSelectedPresenterIds(options.map(o => o.value));
                  }}
                  style={{ height: 'auto', minHeight: '80px' }}
                >
                  <option value="" disabled>Select presenters from your company (Cmd/Ctrl+Click for multiple)</option>
                  {presenters.map(p => (
                    <option key={p.id} value={p.id}>{p.email}</option>
                  ))}
                </select>
                <div className={styles.subtext}>Choose one or more presenters from your company.</div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Link to calendar</label>
                <input 
                  type="text" 
                  className={styles.input} 
                  value={calendarLink} 
                  onChange={(e) => setCalendarLink(e.target.value)}
                />
                <div className={styles.subtext}>Default value is taken from Account Settings → Integrations.</div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Link Expiration (days)</label>
                <input 
                  type="number" 
                  className={styles.input} 
                  value={expirationDays} 
                  onChange={(e) => setExpirationDays(parseInt(e.target.value) || 0)}
                />
                <div className={styles.subtext}>Number of days before the link expires.</div>
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
                  <option value="anonymous">Anonymous</option>
                  <option value="listener">Listener</option>
                  <option value="group">Group (soon)</option>
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
                    disabled
                  >
                    <option value="" disabled>Groups coming soon...</option>
                    {groups.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="contentTypeSelect">Content Type</label>
                <select 
                  id="contentTypeSelect"
                  className={styles.select}
                  value={contentType}
                  onChange={(e) => {
                    setContentType(e.target.value as any);
                    setSelectedCourseId('');
                  }}
                >
                  <option value="project">Project</option>
                  <option value="course">Course (soon)</option>
                </select>
              </div>

              {contentType === 'project' && (
                <div className={styles.formGroup}>
                  <label className={styles.label}>Select Project</label>
                  <div className={styles.projectPillContainer}>
                    <input type="text" className={styles.input} readOnly value={projectTitle} style={{background: '#f8fafc', color: '#64748b'}} />
                    <div className={styles.projectPill}>Current</div>
                  </div>
                  <div className={styles.subtext}>This share applies to the project you are currently editing.</div>
                </div>
              )}

              {contentType === 'course' && (
                <div className={styles.formGroup}>
                  <label className={styles.label}>Select Course</label>
                  <select 
                    className={styles.select}
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    disabled
                  >
                    <option value="" disabled>Courses coming soon...</option>
                  </select>
                </div>
              )}

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
                      '#Enrollment Name#',
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
                <span className={styles.toggleLabelRight}>Send animated GIF (soon)</span>
              </div>

              <div className={styles.leftToggleRow}>
                <div 
                  className={`${styles.toggleSwitch} ${translateToListenerLanguage ? styles.active : ''}`}
                  onClick={() => setTranslateToListenerLanguage(!translateToListenerLanguage)}
                />
                <span className={styles.toggleLabelRight}>Translate to Listener Language</span>
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

              {enableReminders && (
                <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Reminder Subject</label>
                    <input 
                      type="text" 
                      className={styles.input} 
                      placeholder="Reminder Subject"
                      value={reminderSubject}
                      onChange={(e) => setReminderSubject(e.target.value)}
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Reminder Text</label>
                    <textarea 
                      className={`${styles.input} ${styles.textarea}`}
                      rows={3}
                      placeholder="Enter the reminder message..."
                      value={reminderText}
                      onChange={(e) => setReminderText(e.target.value)}
                    />
                  </div>

                  <div className={styles.formRow2}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Frequency</label>
                      <select className={styles.select} value={reminderFrequency} onChange={(e) => setReminderFrequency(e.target.value)}>
                        <option value="Every day">Every day</option>
                        <option value="Every 2 days">Every 2 days</option>
                        <option value="Every week">Every week</option>
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Count</label>
                      <select className={styles.select} value={reminderCount} onChange={(e) => setReminderCount(e.target.value)}>
                        <option value="1">1</option>
                        <option value="3">3</option>
                        <option value="5">5</option>
                        <option value="Unlimited">Unlimited</option>
                      </select>
                    </div>
                  </div>

                  <div className={styles.leftToggleRow}>
                    <div 
                      className={`${styles.toggleSwitch} ${stopRemindersOnOpen ? styles.active : ''}`}
                      onClick={() => setStopRemindersOnOpen(!stopRemindersOnOpen)}
                    />
                    <span className={styles.toggleLabelRight}>Stop reminders when project opened</span>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button 
                  type="button" 
                  className={styles.sendBtn}
                  onClick={() => handleCreate(true)}
                  disabled={isSubmitting || !!(startDate && startTime)}
                  style={{ opacity: (isSubmitting || !!(startDate && startTime)) ? 0.5 : 1 }}
                >
                  {isSubmitting ? 'Sending...' : 'Send Invitation Now'}
                </button>

                {enableReminders && (
                  <button 
                    type="button" 
                    className={styles.sendBtn}
                    onClick={() => {
                      showToast("Reminder sent manually (demo).", "success");
                    }}
                    style={{ background: '#f1f5f9', color: '#0f172a', border: '1px solid #cbd5e1' }}
                  >
                    Send Reminder Now
                  </button>
                )}
              </div>
            </div>
          )}
          {activeTab === 'links' && (
            <div className={styles.enrollmentsContainer}>
              <div className={styles.enrollmentsHeader}>
                <div className={styles.enrollmentsText}>
                  All viewer links generated for this project — across every listener and enrollment.
                </div>

              </div>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th style={{width: '40px'}}><input type="checkbox" /></th>
                      <th>Groups / Listeners</th>
                      <th>Courses / Projects</th>
                      <th>Link</th>
                      <th>Date Created</th>
                      <th style={{textAlign: 'center'}}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrollments.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>
                          No links found.
                        </td>
                      </tr>
                    ) : (
                      enrollments.map((enrollment) => (
                        <tr key={enrollment.id}>
                          <td><input type="checkbox" /></td>
                          <td>{enrollment.listenerName || enrollment.groupName || 'Anonymous'}</td>
                          <td>{enrollment.projectTitle || 'Project'}</td>
                          <td>
                            <div className={styles.linkGroup}>
                              <span className={styles.linkText}>{enrollment.uniqueUrl || `${typeof window !== 'undefined' ? window.location.origin : ''}/...`}</span>
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
            onClick={() => handleCreate(false)}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing...' : (enrollments.length > 0 ? 'Update Enrollment' : 'Create Enrollment')}
          </button>
        </div>
      </div>

      <LinkReadyModal 
        isOpen={isLinkReadyModalOpen} 
        onClose={() => setIsLinkReadyModalOpen(false)} 
        linkUrl="https://avatar-story-wizard.lovable.app/p/da288cfbcb1209236cbf4848" 
      />

      <OverageModal
        isOpen={isOverageModalOpen}
        onClose={() => setIsOverageModalOpen(false)}
      />

    </div>
  );
}
