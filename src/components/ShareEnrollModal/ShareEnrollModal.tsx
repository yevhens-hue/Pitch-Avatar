import React, { useState } from 'react';
import styles from './ShareEnrollModal.module.css';
import { Copy, Link as LinkIcon, X, ExternalLink, Settings, Share2, RefreshCw } from 'lucide-react';
import LinkReadyModal from './LinkReadyModal';
import { useToast } from '@/components/ui/ToastProvider';
import { createEnrollmentDraft, generateEnrollmentLinks, refreshEnrollmentLinks, sendEnrollmentInvitationAction, updateEnrollment, getGroups, getEnrollmentLinks, getPresenters } from '@/app/actions/enrollments';
import { Info } from 'lucide-react';
import OverageModal from '@/components/Modals/OverageModal';
import { getListeners } from '@/app/actions/listeners';
import { useAuth } from '@/context/AuthContext';
import { trackActivationEvent } from '@/lib/stonly';
import { ProjectType } from '@/types';

interface ShareEnrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectTitle?: string;
  projectId?: string;
  projectType?: ProjectType;
}

export default function ShareEnrollModal({ isOpen, onClose, projectTitle = "Untitled Project", projectId = "test-project-id", projectType }: ShareEnrollModalProps) {
  const { showToast } = useToast();
  const { user } = useAuth();
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
  const [currentEnrollmentId, setCurrentEnrollmentId] = useState<string | null>(null);
  const [isLinkReadyModalOpen, setIsLinkReadyModalOpen] = useState(false);
  const [isOverageModalOpen, setIsOverageModalOpen] = useState(false);

  const [advancedSettings, setAdvancedSettings] = useState<Record<string, boolean>>({});
  const toggleAdvancedSetting = (setting: string) => {
    setAdvancedSettings(prev => ({ ...prev, [setting]: !prev[setting] }));
  };

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
    
    if (projectType === 'chat-avatar') {
      trackActivationEvent('tour_chat_get_link', user?.id, user?.user_metadata?.main_goal);
    } else if (projectType === 'video') {
      trackActivationEvent('tour_share_video', user?.id, user?.user_metadata?.main_goal);
    } else if (projectType === 'slides') {
      trackActivationEvent('tour_share_slides', user?.id, user?.user_metadata?.main_goal);
    }
  };

  const handleUpdate = async (enrollmentId: string) => {
    try {
      const updatedLinks = await refreshEnrollmentLinks(enrollmentId);
      setEnrollments(updatedLinks);
      showToast("Link updated. The shared link now serves the latest project data.", "success");
    } catch(err: any) {
      showToast(err.message, "error");
    }
  };

  const handleCreate = async (sendInviteNow: boolean = false) => {
    setIsSubmitting(true);
    try {
      let enrollmentId = currentEnrollmentId;
      
      if (!enrollmentId) {
        const draft = await createEnrollmentDraft({
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

        if (draft && (draft as any)._error) {
          throw new Error((draft as any)._error);
        }

        enrollmentId = draft.id;
        setCurrentEnrollmentId(draft.id);
      }

      const newLinks = await generateEnrollmentLinks(enrollmentId!);
      if (newLinks && (newLinks as any)._error) {
        throw new Error((newLinks as any)._error);
      }
      setEnrollments(newLinks);

      if (sendInviteNow) {
        const inviteRes = await sendEnrollmentInvitationAction(enrollmentId!);
        if (inviteRes && (inviteRes as any)._error) {
          throw new Error((inviteRes as any)._error);
        }
      }

      showToast(sendInviteNow ? "Enrollment link created and email queued." : "Enrollment link created successfully.", "success");
      setActiveTab('links');
      setTitle('');
    } catch (err: any) {
      if (err.message?.includes('QUOTA_EXCEEDED')) {
        showToast("You have reached the maximum number of enrollments for your plan.", "error");
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
            <button 
              className={`${styles.tab} ${activeTab === 'leadForm' ? styles.active : ''}`}
              onClick={() => setActiveTab('leadForm')}
            >
              Lead form
            </button>
            <button 
              className={`${styles.tab} ${activeTab === 'advanced' ? styles.active : ''}`}
              onClick={() => setActiveTab('advanced')}
            >
              Advanced
            </button>
            <button 
              className={`${styles.tab} ${activeTab === 'languageSettings' ? styles.active : ''}`}
              onClick={() => setActiveTab('languageSettings')}
            >
              Language settings
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



              <div className={styles.toggleRow}>
                <div className={styles.toggleText}>Don&apos;t send notifications when the listener opens the link</div>
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
                <label className={styles.label}>Invitation Subject</label>
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
                                <button className={styles.actionMenuItem} onClick={() => { handleUpdate(enrollment.assignmentId); setActiveActionId(null); }}>
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

          {activeTab === 'leadForm' && (
            <div className={styles.tabContent}>
              <div className={styles.sectionTitle}>Lead form settings</div>
              <div style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <Info size={18} style={{ color: '#64748b', marginTop: '2px', flexShrink: 0 }} />
                <span style={{ fontSize: '0.85rem', color: '#475569' }}>Note: If you don&apos;t mark any fields as required in your lead form, listener can skip it without completing.</span>
              </div>
              
              <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '1rem', border: '1px solid #e2e8f0' }}>
                {[
                  { name: 'First Name', req: false },
                  { name: 'Last Name', req: false },
                  { name: 'Email', req: false },
                  { name: 'Phone', req: false },
                  { name: 'Company', req: false },
                  { name: 'Role', req: false },
                  { name: 'Country', req: false },
                  { name: 'Industry', req: false },
                ].map((field) => (
                  <div key={field.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid #e2e8f0' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                      <input type="checkbox" style={{ width: '16px', height: '16px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                      <span style={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: 500 }}>{field.name}</span>
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Required</span>
                      <div className={styles.toggleSwitch} style={{ opacity: 0.5 }} />
                    </div>
                  </div>
                ))}
                
                <button type="button" style={{ width: '100%', padding: '0.75rem', marginTop: '1rem', background: '#fff', border: '1px dashed #3b82f6', borderRadius: '8px', color: '#3b82f6', fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer' }}>
                  + Add a field
                </button>
              </div>

              <div className={styles.formGroup} style={{ marginTop: '1.5rem' }}>
                <label className={styles.label}>Select the slide before which to show the data collection form</label>
                <select className={styles.select}>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="end">At the end</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Message</label>
                <input type="text" className={styles.input} placeholder="To continue presentation please enter your data" />
              </div>
            </div>
          )}

          {activeTab === 'advanced' && (
            <div className={styles.tabContent}>
              <div className={styles.sectionTitle}>Advanced Settings</div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  'Show slide feed',
                  'Allow listener to share slides',
                  'Enable chat with listener',
                  'Allow comments',
                  'Allow to download original presentation file',
                  'Allow listener to call presenter',
                  'Allow listener to schedule meeting',
                  'Enable subtitles',
                  'Voice recognition',
                  'Send PDF report to email after each session',
                  'Send report on this link performance to email',
                  'Allow listeners to view presentation via link',
                  'Disable text chat'
                ].map((setting, idx, arr) => (
                  <div key={idx} style={{ padding: '0.75rem 0', borderBottom: idx < arr.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.9rem', color: '#0f172a' }}>{setting}</span>
                        <Info size={14} style={{ color: '#94a3b8' }} />
                      </div>
                      <div 
                        className={`${styles.toggleSwitch} ${advancedSettings[setting] ? styles.active : ''}`}
                        onClick={() => toggleAdvancedSetting(setting)}
                      />
                    </div>
                    {setting === 'Allow listener to call presenter' && (
                      <div style={{ marginTop: '0.75rem', paddingLeft: '1rem' }}>
                        <label className={styles.label} style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Text for button</label>
                        <input type="text" className={styles.input} value="Call presenter" readOnly style={{ background: '#f8fafc' }} />
                      </div>
                    )}
                    {setting === 'Allow listener to schedule meeting' && (
                      <div style={{ marginTop: '0.75rem', paddingLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div>
                          <label className={styles.label} style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Link to calendar</label>
                          <input type="text" className={styles.input} placeholder="Link to calendar" />
                        </div>
                        <div>
                          <label className={styles.label} style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Text for button</label>
                          <input type="text" className={styles.input} value="Schedule meeting" readOnly style={{ background: '#f8fafc' }} />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                
                <div className={styles.formGroup}>
                  <input type="text" className={styles.input} placeholder="Presentation Link" />
                </div>
                
                <div className={styles.formGroup}>
                  <textarea className={styles.input} placeholder="Comment" style={{ minHeight: '80px', resize: 'vertical' }} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'languageSettings' && (
            <div className={styles.tabContent}>
              <div className={styles.sectionTitle}>Language Settings</div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Languages the avatar can respond in</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '8px', minHeight: '42px', alignItems: 'center' }}>
                  {['Amharic', 'Bosnian', 'Azerbaijani'].map((lang) => (
                    <div key={lang} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: '#eff6ff', color: '#1e40af', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem' }}>
                      {lang} <X size={12} style={{ cursor: 'pointer' }} />
                    </div>
                  ))}
                  <input type="text" style={{ border: 'none', outline: 'none', flex: 1, minWidth: '100px', fontSize: '0.85rem' }} placeholder="Add language..." />
                </div>
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
            {isSubmitting ? 'Processing...' : (enrollments.length > 0 ? 'Update Enrollment' : 'Create Enrollment Links')}
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
