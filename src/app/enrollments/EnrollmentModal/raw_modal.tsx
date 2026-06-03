      {isOpen && (
        <div className={styles.wideModalOverlay} onClick={closeModal}>
          <div className={styles.modalContentWide} onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className={styles.modalHeader}>
              <div>
                <h2 className={styles.modalTitle} style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', border: 0 }}>Share & Enroll</h2>
                <h2 className={styles.modalTitle}>{editingId ? 'Edit Enrollment' : 'Add Enrollment'}</h2>
                {formData.title && <p className={styles.modalSub}>{formData.title}</p>}
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <button type="button" className={styles.btnSecondary} onClick={closeModal}>Cancel</button>
                <button type="submit" form="enrollment-form" className={styles.btnPrimary} disabled={quotaExceeded && !editingId}>
                  {editingId ? 'Save Changes' : 'Create Enrollment'}
                </button>
              </div>
            </div>

            {/* Tab Headers */}
            <div className={styles.tabsHeader}>
              <button type="button" className={`${styles.tab} ${activeTab === 'general' ? styles.tabActive : ''}`} onClick={() => setActiveTab('general')}>General</button>
              <button type="button" className={`${styles.tab} ${activeTab === 'invitations' ? styles.tabActive : ''}`} onClick={() => setActiveTab('invitations')}>Invitation and Reminders</button>
              <button type="button" className={`${styles.tab} ${activeTab === 'links' ? styles.tabActive : ''}`} onClick={() => setActiveTab('links')}>Links</button>
              <button type="button" className={`${styles.tab} ${activeTab === 'layout' ? styles.tabActive : ''}`} onClick={() => setActiveTab('layout')}>Viewer Layout</button>
              <button type="button" className={`${styles.tab} ${activeTab === 'advanced' ? styles.tabActive : ''}`} onClick={() => setActiveTab('advanced')}>Advanced</button>
              <button type="button" className={`${styles.tab} ${activeTab === 'security' ? styles.tabActive : ''}`} onClick={() => setActiveTab('security')}>Security & Verification</button>
              <button type="button" className={`${styles.tab} ${activeTab === 'results' ? styles.tabActive : ''}`} onClick={() => setActiveTab('results')}>Results</button>
            </div>

            {/* Form & Modal Body */}
            <form id="enrollment-form" onSubmit={handleSave} className={styles.wideModalBody}>
              {/* Tab 1: General */}
              {activeTab === 'general' && (
                <div className={styles.formCard}>
                  <div className={styles.formCardTitle}>Enrollment Details</div>
                  
                  {quotaExceeded && (
                    <div className={styles.alertBox}>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <AlertTriangle size={18} />
                        <span className={styles.alertTitle}>Active Seats Limit Reached</span>
                      </div>
                      <p className={styles.alertDesc}>
                        You have used <strong>{quota?.maxSeats} of {quota?.maxSeats} seats</strong>. New active enrollments are blocked.
                      </p>
                      <a href="/profile#billing-seats" className={styles.alertLink}>Upgrade Listener Seats →</a>
                    </div>
                  )}

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="title">Enrollment Title *</label>
                    <input type="text" id="title" className={styles.input} required
                      value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                  </div>

                  <div className={styles.row}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="targetType">Target Recipient</label>
                      <select id="targetType" className={styles.input} value={formData.targetType}
                        onChange={(e) => setFormData({ ...formData, targetType: e.target.value as typeof formData.targetType })}>
                        <option value="Listener">Individual Listener (Personalized Link)</option>
                        <option value="Anonymous">Anonymous Access (Shared Link)</option>
                        <option value="Group">Cohort Group</option>
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="contentType">Content Type</label>
                      <select id="contentType" className={styles.input} value={formData.contentType}
                        onChange={(e) => setFormData({ ...formData, contentType: e.target.value as typeof formData.contentType })}>
                        <option value="Project">Project Presentation</option>
                        <option value="Course">Full Course Route</option>
                      </select>
                    </div>
                  </div>

                  {formData.targetType === 'Listener' && (
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="listenerSelect">Select Listener *</label>
                      <select id="listenerSelect" className={styles.input} required
                        value={formData.listenerId} onChange={(e) => setFormData({ ...formData, listenerId: e.target.value })}>
                        <option value="" disabled>Select listener…</option>
                        {listeners.map(l => (
                          <option key={l.id} value={l.id}>{l.firstName || ''} {l.lastName || ''} ({l.email})</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {formData.targetType === 'Group' && (
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="groupSelect">Select Group *</label>
                      <select id="groupSelect" className={styles.input} required
                        value={(formData as any).groupId || ''} onChange={(e) => setFormData({ ...formData, targetType: 'Group', groupId: e.target.value } as any)}>
                        <option value="" disabled>Select group…</option>
                        {groups.map(g => (
                          <option key={g.id} value={g.id}>{g.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="projectSelect">Select Presentation *</label>
                    <select id="projectSelect" className={styles.input} required
                      value={formData.projectId} onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}>
                      <option value="" disabled>Select project…</option>
                      {projects.map(p => <option key={p.id} value={p.id}>{p.title} ({p.type})</option>)}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Presenters</label>
                    <div className={styles.tagList}>
                      {presenters.map((p, i) => (
                        <span key={i} className={styles.removableTag}>
                          {p}
                          <button type="button" className={styles.tagCloseBtn} onClick={() => setPresenters(prev => prev.filter((_, idx) => idx !== i))}>
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                      <input
                        type="text"
                        placeholder="Type presenter email and press Enter..."
                        className={styles.input}
                        style={{ border: 'none', outline: 'none', background: 'transparent', flex: 1, minWidth: '180px', padding: '0.1rem 0' }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            const val = e.currentTarget.value.trim()
                            if (val && !presenters.includes(val)) {
                              setPresenters([...presenters, val])
                              e.currentTarget.value = ''
                            }
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="hubspotCalendar">Meeting booking URL (HubSpot, Calendly, etc.)</label>
                    <input type="text" id="hubspotCalendar" className={styles.input} placeholder="https://meetings.hubspot.com/your-handle"
                      value={calendarUrl} onChange={(e) => setCalendarUrl(e.target.value)} />
                  </div>

                  <div className={styles.row}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="startDate">Start Date</label>
                      <input type="date" id="startDate" className={styles.input}
                        value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="status">Status</label>
                      <select id="status" className={styles.input} value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as typeof formData.status })}>
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="Failed">Failed</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                    <label className={styles.switchWrapper}>
                      <input type="checkbox" className={styles.switchInput} checked={dontSendOpenNotifications} onChange={(e) => setDontSendOpenNotifications(e.target.checked)} />
                      <div className={styles.switchTrack}>
                        <div className={styles.switchThumb} />
                      </div>
                      <span className={styles.formLabel}>Don&apos;t send notification when listener opens enrollment</span>
                    </label>

                    <label className={styles.switchWrapper}>
                      <input type="checkbox" className={styles.switchInput} checked={bookCalendarOrStartAvatar} onChange={(e) => setBookCalendarOrStartAvatar(e.target.checked)} />
                      <div className={styles.switchTrack}>
                        <div className={styles.switchThumb} />
                      </div>
                      <span className={styles.formLabel}>Book calendar and then start avatar presentation</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Tab 2: Invitation and Reminders */}
              {activeTab === 'invitations' && (
                <div className={styles.formCard}>
                  <div className={styles.formCardTitle}>Email Invitation Template</div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="inviteSubject">Email Subject</label>
                    <input type="text" id="inviteSubject" className={styles.input}
                      value={formData.emailSchedule.inviteSubject}
                      onChange={(e) => setFormData({ ...formData, emailSchedule: { ...formData.emailSchedule, inviteSubject: e.target.value } })} />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="inviteBody">Email Body</label>
                    <textarea id="inviteBody" className={styles.textarea} style={{ minHeight: '140px' }}
                      value={formData.emailSchedule.inviteBody}
                      onChange={(e) => setFormData({ ...formData, emailSchedule: { ...formData.emailSchedule, inviteBody: e.target.value } })} />
                    
                    <div className={styles.placeholderList}>
                      {([
                        { tag: '{{listener_first_name}}', label: '#Listener First Name#' },
                        { tag: '{{listener_last_name}}', label: '#Listener Last Name#' },
                        { tag: '{{listener_company}}', label: '#Listener Company#' },
                        { tag: '{{presenter_first_name}}', label: '#Presenter First Name#' },
                        { tag: '{{presenter_last_name}}', label: '#Presenter Last Name#' },
                        { tag: '{{presentation_title}}', label: '#Presentation Title#' },
                        { tag: '{{presentation_link}}', label: '#Presentation Link#' },
                        { tag: '{{avatar_name}}', label: '#Avatar Name#' }
                      ]).map(p => (
                        <button
                          key={p.tag}
                          type="button"
                          className={styles.placeholderPill}
                          onClick={() => {
                            const textarea = document.getElementById('inviteBody') as HTMLTextAreaElement
                            if (textarea) {
                              const start = textarea.selectionStart
                              const end = textarea.selectionEnd
                              const text = formData.emailSchedule.inviteBody
                              const before = text.substring(0, start)
                              const after = text.substring(end, text.length)
                              const newText = before + p.tag + after
                              setFormData({
                                ...formData,
                                emailSchedule: { ...formData.emailSchedule, inviteBody: newText }
                              })
                              setTimeout(() => {
                                textarea.focus()
                                textarea.setSelectionRange(start + p.tag.length, start + p.tag.length)
                              }, 0)
                            }
                          }}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', paddingBottom: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
                    <label className={styles.switchWrapper}>
                      <input type="checkbox" className={styles.switchInput}
                        checked={formData.emailSchedule.translateToListenerLang}
                        onChange={(e) => setFormData({ ...formData, emailSchedule: { ...formData.emailSchedule, translateToListenerLang: e.target.checked } })} />
                      <div className={styles.switchTrack}>
                        <div className={styles.switchThumb} />
                      </div>
                      <span className={styles.formLabel} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Languages size={15} /> Auto-translate to Listener&apos;s language
                      </span>
                    </label>

                    <label className={styles.switchWrapper}>
                      <input type="checkbox" className={styles.switchInput} checked={sendAnimatedGif} onChange={(e) => setSendAnimatedGif(e.target.checked)} />
                      <div className={styles.switchTrack}>
                        <div className={styles.switchThumb} />
                      </div>
                      <span className={styles.formLabel}>Send animated GIF in email</span>
                    </label>
                  </div>

                  <div className={styles.formCardTitle} style={{ marginTop: '0.5rem' }}>Delivery Scheduling</div>

                  <div className={styles.row}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="scheduleDate">Scheduled Date</label>
                      <input type="date" id="scheduleDate" className={styles.input}
                        value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="scheduleTime">Scheduled Time</label>
                      <input type="time" id="scheduleTime" className={styles.input}
                        value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} />
                    </div>
                  </div>

                  <div style={{ marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                    <label className={styles.switchWrapper}>
                      <input type="checkbox" className={styles.switchInput} checked={enableReminders} onChange={(e) => setEnableReminders(e.target.checked)} />
                      <div className={styles.switchTrack}>
                        <div className={styles.switchThumb} />
                      </div>
                      <span className={styles.formLabel}>Send reminders if not opened</span>
                    </label>
                  </div>

                  {enableReminders && (
                    <div className={styles.formGroup} style={{ marginTop: '0.5rem', paddingLeft: '2.5rem' }}>
                      <label className={styles.formLabel} htmlFor="reminderFrequency">Reminder Frequency</label>
                      <select id="reminderFrequency" className={styles.input} style={{ maxWidth: '300px' }}
                        value={formData.emailSchedule.reminderFrequency}
                        onChange={(e) => setFormData({ ...formData, emailSchedule: { ...formData.emailSchedule, reminderFrequency: e.target.value } })}>
                        <option value="daily">Daily (max 3 times)</option>
                        <option value="weekly">Weekly (max 3 times)</option>
                        <option value="custom">Every 3 days (max 3 times)</option>
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Links */}
              {activeTab === 'links' && (
                <div className={styles.formCard}>
                  <div className={styles.formCardTitle}>Enrollment Presentation Access</div>

                  {!editingId ? (
                    <div className={styles.emptyState} style={{ padding: '3rem 1rem' }}>
                      <LinkIcon size={40} style={{ color: '#cbd5e1', marginBottom: '0.5rem' }} />
                      <div className={styles.emptyStateTitle}>Access Links Not Generated Yet</div>
                      <p className={styles.emptyStateDesc} style={{ fontSize: '0.85rem', color: '#64748b' }}>
                        Create or save the enrollment details first. Custom secure redirect URLs, QR access codes, and HTML embedding frames will be generated automatically.
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      <div className={styles.linkBox}>
                        <div className={styles.linkHeader}>
                          <span className={styles.linkTitle}>Personalized Web Link</span>
                          <div className={styles.linkActions}>
                            <button type="button" className={styles.btnSecondary} style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }} onClick={() => handleCopyLink(editingId)}>Copy</button>
                            <button type="button" className={styles.btnSecondary} style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }} onClick={handleUpdateWebLink}>Update</button>
                          </div>
                        </div>
                        <input type="text" className={styles.urlInput} readOnly
                          value={`https://pitch-avatar.com/v/enroll-${editingId.slice(0, 8)}`} />
                      </div>

                      <div className={styles.qrContainer}>
                        <div className={styles.qrPlaceholder}><QrCode size={36} style={{ color: '#cbd5e1' }} /></div>
                        <div className={styles.qrInfo}>
                          <span className={styles.qrTitle}>QR Access Code</span>
                          <span className={styles.qrDesc}>Download for print materials or offline scanning.</span>
                          <button type="button" className={styles.btnSecondary} style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem', alignSelf: 'flex-start', marginTop: '0.25rem' }}>
                            📥 Download QR
                          </button>
                        </div>
                      </div>

                      <div className={styles.linkBox}>
                        <span className={styles.linkTitle} style={{ marginBottom: '0.25rem' }}>HTML Iframe Embed</span>
                        <textarea className={styles.textarea} style={{ fontSize: '0.72rem', fontFamily: 'monospace', minHeight: '55px' }} readOnly
                          value={`<iframe src="https://pitch-avatar.com/v/enroll-${editingId.slice(0, 8)}" width="100%" height="520" frameborder="0" allow="autoplay; fullscreen"></iframe>`} />
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <button type="button" className={styles.btnSecondary} style={{ flex: 1, justifyContent: 'center' }} onClick={handleSendInviteNow}>
                          📧 Send Invite Now
                        </button>
                        <button type="button" className={styles.btnSecondary} style={{ flex: 1, justifyContent: 'center' }} onClick={handleSendReminderNow}>
                          ⏰ Send Reminder Now
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 4: Viewer Layout splitLayout */}
              {activeTab === 'layout' && (
                <div className={styles.splitLayout}>
                  {/* Left Column Settings */}
                  <div className={styles.settingsPanel}>
                    {/* Card 1 */}
                    <div className={styles.formCard}>
                      <div className={styles.formCardTitle}>Slide Player Controls</div>

                      <label className={styles.switchWrapper}>
                        <input type="checkbox" className={styles.switchInput} checked={showAllSlideControls} onChange={(e) => {
                          setShowAllSlideControls(e.target.checked)
                          setShowSlideCounter(e.target.checked)
                          setShowPlayPause(e.target.checked)
                          setShowPrevNext(e.target.checked)
                          setShowProgressBar(e.target.checked)
                          setShowSettingsBtn(e.target.checked)
                          setShowFullscreenBtn(e.target.checked)
                        }} />
                        <div className={styles.switchTrack}>
                          <div className={styles.switchThumb} />
                        </div>
                        <span className={styles.formLabel}>Show all slide player controls</span>
                      </label>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingLeft: '1.5rem', opacity: showAllSlideControls ? 1 : 0.6 }}>
                        <label className={styles.switchWrapper}>
                          <input type="checkbox" className={styles.switchInput} disabled={!showAllSlideControls} checked={showSlideCounter} onChange={(e) => setShowSlideCounter(e.target.checked)} />
                          <div className={styles.switchTrack}>
                            <div className={styles.switchThumb} />
                          </div>
                          <span>Slide counter index indicator</span>
                        </label>

                        <label className={styles.switchWrapper}>
                          <input type="checkbox" className={styles.switchInput} disabled={!showAllSlideControls} checked={showPlayPause} onChange={(e) => setShowPlayPause(e.target.checked)} />
                          <div className={styles.switchTrack}>
                            <div className={styles.switchThumb} />
                          </div>
                          <span>Play / Pause button</span>
                        </label>

                        <label className={styles.switchWrapper}>
                          <input type="checkbox" className={styles.switchInput} disabled={!showAllSlideControls} checked={showPrevNext} onChange={(e) => setShowPrevNext(e.target.checked)} />
                          <div className={styles.switchTrack}>
                            <div className={styles.switchThumb} />
                          </div>
                          <span>Next and Previous slide arrows</span>
                        </label>

                        <label className={styles.switchWrapper}>
                          <input type="checkbox" className={styles.switchInput} disabled={!showAllSlideControls} checked={showProgressBar} onChange={(e) => setShowProgressBar(e.target.checked)} />
                          <div className={styles.switchTrack}>
                            <div className={styles.switchThumb} />
                          </div>
                          <span>Progress bar track</span>
                        </label>

                        <label className={styles.switchWrapper}>
                          <input type="checkbox" className={styles.switchInput} disabled={!showAllSlideControls} checked={showSettingsBtn} onChange={(e) => setShowSettingsBtn(e.target.checked)} />
                          <div className={styles.switchTrack}>
                            <div className={styles.switchThumb} />
                          </div>
                          <span>Quality & Speeds Settings cog</span>
                        </label>

                        <label className={styles.switchWrapper}>
                          <input type="checkbox" className={styles.switchInput} disabled={!showAllSlideControls} checked={showFullscreenBtn} onChange={(e) => setShowFullscreenBtn(e.target.checked)} />
                          <div className={styles.switchTrack}>
                            <div className={styles.switchThumb} />
                          </div>
                          <span>Fullscreen viewport toggle</span>
                        </label>
                      </div>
                    </div>

                    {/* Card 2 */}
                    <div className={styles.formCard}>
                      <div className={styles.formCardTitle}>Avatar & Chat Panel</div>

                      <label className={styles.switchWrapper}>
                        <input type="checkbox" className={styles.switchInput} checked={showAvatarPanel} onChange={(e) => setShowAvatarPanel(e.target.checked)} />
                        <div className={styles.switchTrack}>
                          <div className={styles.switchThumb} />
                        </div>
                        <span className={styles.formLabel}>Show side Speaker Avatar & Chat panel</span>
                      </label>

                      {showAvatarPanel && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', paddingLeft: '1.5rem' }}>
                          <label className={styles.switchWrapper}>
                            <input type="checkbox" className={styles.switchInput} checked={showAvatarVideoPhoto} onChange={(e) => setShowAvatarVideoPhoto(e.target.checked)} />
                            <div className={styles.switchTrack}>
                              <div className={styles.switchThumb} />
                            </div>
                            <span>Display Avatar photo / speaking video feed</span>
                          </label>

                          <label className={styles.switchWrapper}>
                            <input type="checkbox" className={styles.switchInput} checked={showAvatarNameLabel} onChange={(e) => setShowAvatarNameLabel(e.target.checked)} />
                            <div className={styles.switchTrack}>
                              <div className={styles.switchThumb} />
                            </div>
                            <span>Show presenter / avatar name label</span>
                          </label>

                          <label className={styles.switchWrapper}>
                            <input type="checkbox" className={styles.switchInput} checked={showMuteBtn} onChange={(e) => setShowMuteBtn(e.target.checked)} />
                            <div className={styles.switchTrack}>
                              <div className={styles.switchThumb} />
                            </div>
                            <span>Audio mute / volume control key</span>
                          </label>

                          <label className={styles.switchWrapper}>
                            <input type="checkbox" className={styles.switchInput} checked={showChatMessages} onChange={(e) => setShowChatMessages(e.target.checked)} />
                            <div className={styles.switchTrack}>
                              <div className={styles.switchThumb} />
                            </div>
                            <span>Show interactive chat log window</span>
                          </label>

                          <label className={styles.switchWrapper}>
                            <input type="checkbox" className={styles.switchInput} checked={showChatInput} onChange={(e) => setShowChatInput(e.target.checked)} />
                            <div className={styles.switchTrack}>
                              <div className={styles.switchThumb} />
                            </div>
                            <span>Allow user text questions input field</span>
                          </label>

                          <label className={styles.switchWrapper}>
                            <input type="checkbox" className={styles.switchInput} checked={showMicrophoneBtn} onChange={(e) => setShowMicrophoneBtn(e.target.checked)} />
                            <div className={styles.switchTrack}>
                              <div className={styles.switchThumb} />
                            </div>
                            <span>Enable microphone voice commands key</span>
                          </label>

                          <label className={styles.switchWrapper}>
                            <input type="checkbox" className={styles.switchInput} checked={showAvatarFrameBorder} onChange={(e) => setShowAvatarFrameBorder(e.target.checked)} />
                            <div className={styles.switchTrack}>
                              <div className={styles.switchThumb} />
                            </div>
                            <span>Highlight avatar face border frame</span>
                          </label>

                          <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Avatar Display Position</label>
                            <select className={styles.input} value={avatarPosition} onChange={(e) => setAvatarPosition(e.target.value)}>
                              <option value="Right">Split column right-side</option>
                              <option value="Left">Split column left-side</option>
                            </select>
                          </div>

                          <div className={styles.sliderWrapper}>
                            <div className={styles.sliderLabelRow}>
                              <span>Avatar Vertical Scale Ratio</span>
                              <span>{avatarHeight}%</span>
                            </div>
                            <input type="range" className={styles.sliderTrack} min="20" max="80"
                              value={avatarHeight} onChange={(e) => setAvatarHeight(Number(e.target.value))} />
                          </div>

                          <div className={styles.sliderWrapper}>
                            <div className={styles.sliderLabelRow}>
                              <span>Interactive Chat Box Ratio</span>
                              <span>{chatHeight}%</span>
                            </div>
                            <input type="range" className={styles.sliderTrack} min="20" max="80"
                              value={chatHeight} onChange={(e) => setChatHeight(Number(e.target.value))} />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Card 3 */}
                    <div className={styles.formCard}>
                      <div className={styles.formCardTitle}>Bottom Bar Action Keys</div>

                      <label className={styles.switchWrapper}>
                        <input type="checkbox" className={styles.switchInput} checked={showPresenterInfo} onChange={(e) => setShowPresenterInfo(e.target.checked)} />
                        <div className={styles.switchTrack}>
                          <div className={styles.switchThumb} />
                        </div>
                        <span>Display Presenter identity card badge</span>
                      </label>

                      <label className={styles.switchWrapper}>
                        <input type="checkbox" className={styles.switchInput} checked={showCallPresenter} onChange={(e) => setShowCallPresenter(e.target.checked)} />
                        <div className={styles.switchTrack}>
                          <div className={styles.switchThumb} />
                        </div>
                        <span>Show &apos;Call Presenter&apos; dynamic key</span>
                      </label>

                      <label className={styles.switchWrapper}>
                        <input type="checkbox" className={styles.switchInput} checked={showScheduleMeeting} onChange={(e) => setShowScheduleMeeting(e.target.checked)} />
                        <div className={styles.switchTrack}>
                          <div className={styles.switchThumb} />
                        </div>
                        <span>Show &apos;Schedule Meeting&apos; booking link</span>
                      </label>

                      <label className={styles.switchWrapper}>
                        <input type="checkbox" className={styles.switchInput} checked={showLikeThumbs} onChange={(e) => setShowLikeThumbs(e.target.checked)} />
                        <div className={styles.switchTrack}>
                          <div className={styles.switchThumb} />
                        </div>
                        <span>Show slide feedback thumbs keys</span>
                      </label>

                      <label className={styles.switchWrapper}>
                        <input type="checkbox" className={styles.switchInput} checked={showCommentFeedback} onChange={(e) => setShowCommentFeedback(e.target.checked)} />
                        <div className={styles.switchTrack}>
                          <div className={styles.switchThumb} />
                        </div>
                        <span>Allow leave slide commentaries input</span>
                      </label>

                      <label className={styles.switchWrapper}>
                        <input type="checkbox" className={styles.switchInput} checked={showShareBtn} onChange={(e) => setShowShareBtn(e.target.checked)} />
                        <div className={styles.switchTrack}>
                          <div className={styles.switchThumb} />
                        </div>
                        <span>Display Quick Socials Share options</span>
                      </label>

                      <label className={styles.switchWrapper}>
                        <input type="checkbox" className={styles.switchInput} checked={showSlidesDropdown} onChange={(e) => setShowSlidesDropdown(e.target.checked)} />
                        <div className={styles.switchTrack}>
                          <div className={styles.switchThumb} />
                        </div>
                        <span>Display Slide selector dropdown grid</span>
                      </label>
                    </div>
                  </div>

                  {/* Right Column Preview */}
                  <div className={styles.previewBox}>
                    <div className={styles.formCardTitle} style={{ borderBottom: 'none', padding: 0 }}>Interactive Live Preview</div>
                    <div style={{ height: '0.25rem' }} />
                    
                    <div className={styles.playerMock}>
                      {/* Split Position Layout rendering */}
                      {avatarPosition === 'Left' && showAvatarPanel && (
                        <div className={styles.mockAvatarArea} style={{ borderRight: '1px solid #1e293b' }}>
                          {showAvatarVideoPhoto && (
                            <div className={styles.mockAvatarVideo} style={{ height: `${avatarHeight}%`, borderBottom: '1px solid #1e293b', border: showAvatarFrameBorder ? '2px solid #3b82f6' : 'none' }}>
                              {showAvatarNameLabel && <span style={{ position: 'absolute', bottom: '2px', left: '4px', fontSize: '0.55rem', background: 'rgba(0,0,0,0.6)', padding: '1px 3px', borderRadius: '2px', color: 'white' }}>Avatar Feed</span>}
                            </div>
                          )}
                          {(showChatMessages || showChatInput) && (
                            <div className={styles.mockChatArea} style={{ height: `${100 - avatarHeight}%` }}>
                              {showChatMessages && (
                                <div className={styles.mockChatMessage}>Mock active chat logs...</div>
                              )}
                              {showChatInput && (
                                <div className={styles.mockChatInput} style={{ display: 'flex', alignItems: 'center', padding: '0 4px', fontSize: '0.55rem', color: '#64748b' }}>
                                  Type question... {showMicrophoneBtn && <span style={{ marginLeft: 'auto' }}>🎙️</span>}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      <div className={styles.mockSlideArea}>
                        <div style={{ textAlign: 'center', padding: '1rem' }}>
                          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'white' }}>Course Project Slide Content</div>
                          <div style={{ fontSize: '0.6rem', color: '#64748b', marginTop: '0.2rem' }}>Interactive presentation live view</div>
                        </div>

                        {showAllSlideControls && (
                          <div className={styles.mockPlayerControls}>
                            {showPlayPause && <div className={styles.mockPlayBtn} />}
                            {showSlideCounter && <span style={{ fontSize: '0.55rem', color: '#94a3b8' }}>1 / 12</span>}
                            {showProgressBar && (
                              <div className={styles.mockProgressTrack}>
                                <div className={styles.mockProgressFill} />
                                <div className={styles.mockProgressThumb} />
                              </div>
                            )}
                            <div className={styles.mockControlIcons}>
                              {showPrevNext && (
                                <>
                                  <div className={styles.mockControlDot} />
                                  <div className={styles.mockControlDot} />
                                </>
                              )}
                              {showSettingsBtn && <div className={styles.mockControlDot} style={{ backgroundColor: '#3b82f6' }} />}
                              {showFullscreenBtn && <div className={styles.mockControlDot} style={{ borderRadius: 0 }} />}
                            </div>
                          </div>
                        )}
                      </div>

                      {avatarPosition === 'Right' && showAvatarPanel && (
                        <div className={styles.mockAvatarArea} style={{ borderLeft: '1px solid #1e293b' }}>
                          {showAvatarVideoPhoto && (
                            <div className={styles.mockAvatarVideo} style={{ height: `${avatarHeight}%`, borderBottom: '1px solid #1e293b', border: showAvatarFrameBorder ? '2px solid #3b82f6' : 'none' }}>
                              {showAvatarNameLabel && <span style={{ position: 'absolute', bottom: '2px', left: '4px', fontSize: '0.55rem', background: 'rgba(0,0,0,0.6)', padding: '1px 3px', borderRadius: '2px', color: 'white' }}>Avatar Feed</span>}
                            </div>
                          )}
                          {(showChatMessages || showChatInput) && (
                            <div className={styles.mockChatArea} style={{ height: `${100 - avatarHeight}%` }}>
                              {showChatMessages && (
                                <div className={styles.mockChatMessage}>Mock active chat logs...</div>
                              )}
                              {showChatInput && (
                                <div className={styles.mockChatInput} style={{ display: 'flex', alignItems: 'center', padding: '0 4px', fontSize: '0.55rem', color: '#64748b' }}>
                                  Type question... {showMicrophoneBtn && <span style={{ marginLeft: 'auto' }}>🎙️</span>}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className={styles.previewText}>
                      Real-time interactive client side player render. All configuration options adjust structural elements live.
                    </div>

                    {/* Bottom bar preview simulation */}
                    <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginTop: '0.8rem', justifyContent: 'center', width: '100%', padding: '0.5rem', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                      {showPresenterInfo && <span style={{ fontSize: '0.55rem', background: '#e2e8f0', padding: '2px 4px', borderRadius: '3px', fontWeight: 600 }}>👤 ROI4CIO</span>}
                      {showCallPresenter && <span style={{ fontSize: '0.55rem', background: '#eff6ff', color: '#3b82f6', padding: '2px 4px', borderRadius: '3px', border: '1px solid #bfdbfe' }}>📞 Call</span>}
                      {showScheduleMeeting && <span style={{ fontSize: '0.55rem', background: '#f0fdf4', color: '#16a34a', padding: '2px 4px', borderRadius: '3px', border: '1px solid #bbf7d0' }}>📅 Calendar</span>}
                      {showLikeThumbs && <span style={{ fontSize: '0.55rem' }}>👍 👎</span>}
                      {showCommentFeedback && <span style={{ fontSize: '0.55rem', background: 'white', border: '1px solid #cbd5e1', padding: '1px 3px' }}>💬 comment...</span>}
                      {showShareBtn && <span style={{ fontSize: '0.55rem' }}>🔗 social</span>}
                      {showSlidesDropdown && <span style={{ fontSize: '0.55rem', background: '#f1f5f9', padding: '2px 4px' }}>☰ Slide list</span>}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 5: Advanced Options */}
              {activeTab === 'advanced' && (
                <div className={styles.formCard}>
                  <div className={styles.formCardTitle}>Advanced Presentation Capabilities</div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    <label className={styles.switchWrapper}>
                      <input type="checkbox" className={styles.switchInput} checked={showSlideFeed} onChange={(e) => setShowSlideFeed(e.target.checked)} />
                      <div className={styles.switchTrack}>
                        <div className={styles.switchThumb} />
                      </div>
                      <span className={styles.formLabel}>Show slide feed navigation in sidebar drawer</span>
                    </label>

                    <label className={styles.switchWrapper}>
                      <input type="checkbox" className={styles.switchInput} checked={allowListenerShareSlides} onChange={(e) => setAllowListenerShareSlides(e.target.checked)} />
                      <div className={styles.switchTrack}>
                        <div className={styles.switchThumb} />
                      </div>
                      <span className={styles.formLabel}>Allow listener to share slides directly to socials</span>
                    </label>

                    <label className={styles.switchWrapper}>
                      <input type="checkbox" className={styles.switchInput} checked={enableChatWithListener} onChange={(e) => setEnableChatWithListener(e.target.checked)} />
                      <div className={styles.switchTrack}>
                        <div className={styles.switchThumb} />
                      </div>
                      <span className={styles.formLabel}>Enable live chat conversation and help desk</span>
                    </label>

                    <label className={styles.switchWrapper}>
                      <input type="checkbox" className={styles.switchInput} checked={allowComments} onChange={(e) => setAllowComments(e.target.checked)} />
                      <div className={styles.switchTrack}>
                        <div className={styles.switchThumb} />
                      </div>
                      <span className={styles.formLabel}>Allow comments on individual slides</span>
                    </label>

                    <label className={styles.switchWrapper}>
                      <input type="checkbox" className={styles.switchInput} checked={allowDownloadFile} onChange={(e) => setAllowDownloadFile(e.target.checked)} />
                      <div className={styles.switchTrack}>
                        <div className={styles.switchThumb} />
                      </div>
                      <span className={styles.formLabel}>Allow PDF document download of presentation</span>
                    </label>

                    <label className={styles.switchWrapper}>
                      <input type="checkbox" className={styles.switchInput} checked={allowCallPresenter} onChange={(e) => setAllowCallPresenter(e.target.checked)} />
                      <div className={styles.switchTrack}>
                        <div className={styles.switchThumb} />
                      </div>
                      <span className={styles.formLabel}>Allow call presenter (realtime voice/video handoff)</span>
                    </label>

                    {allowCallPresenter && (
                      <div className={styles.formGroup} style={{ paddingLeft: '2.5rem' }}>
                        <label className={styles.formLabel} htmlFor="callPresenterBtn">Call Presenter Button Label Text</label>
                        <input type="text" id="callPresenterBtn" className={styles.input} style={{ maxWidth: '300px' }}
                          value={callPresenterBtnText} onChange={(e) => setCallPresenterBtnText(e.target.value)} />
                      </div>
                    )}

                    <label className={styles.switchWrapper}>
                      <input type="checkbox" className={styles.switchInput} checked={allowScheduleMeeting} onChange={(e) => setAllowScheduleMeeting(e.target.checked)} />
                      <div className={styles.switchTrack}>
                        <div className={styles.switchThumb} />
                      </div>
                      <span className={styles.formLabel}>Allow schedule meeting integrations</span>
                    </label>

                    {allowScheduleMeeting && (
                      <div style={{ display: 'flex', gap: '1rem', paddingLeft: '2.5rem' }}>
                        <div className={styles.formGroup} style={{ flex: 1 }}>
                          <label className={styles.formLabel} htmlFor="schedMeetingBtn">Button Label Text</label>
                          <input type="text" id="schedMeetingBtn" className={styles.input}
                            value={scheduleMeetingBtnText} onChange={(e) => setScheduleMeetingBtnText(e.target.value)} />
                        </div>
                        <div className={styles.formGroup} style={{ flex: 2 }}>
                          <label className={styles.formLabel} htmlFor="schedMeetingUrl">Custom Meeting booking URL (HubSpot, Calendly, etc.)</label>
                          <input type="text" id="schedMeetingUrl" className={styles.input}
                            value={scheduleMeetingCalendarUrl} onChange={(e) => setScheduleMeetingCalendarUrl(e.target.value)} />
                        </div>
                      </div>
                    )}

                    <label className={styles.switchWrapper}>
                      <input type="checkbox" className={styles.switchInput} checked={enableSubtitles} onChange={(e) => setEnableSubtitles(e.target.checked)} />
                      <div className={styles.switchTrack}>
                        <div className={styles.switchThumb} />
                      </div>
                      <span className={styles.formLabel}>Enable speech-to-text live translation subtitles</span>
                    </label>

                    <label className={styles.switchWrapper}>
                      <input type="checkbox" className={styles.switchInput} checked={voiceRecognition} onChange={(e) => setVoiceRecognition(e.target.checked)} />
                      <div className={styles.switchTrack}>
                        <div className={styles.switchThumb} />
                      </div>
                      <span className={styles.formLabel}>Use local browser voice recognition engine</span>
                    </label>

                    <label className={styles.switchWrapper}>
                      <input type="checkbox" className={styles.switchInput} checked={sendPdfReportEmail} onChange={(e) => setSendPdfReportEmail(e.target.checked)} />
                      <div className={styles.switchTrack}>
                        <div className={styles.switchThumb} />
                      </div>
                      <span className={styles.formLabel}>Send PDF presentation report via email to presenter</span>
                    </label>

                    <label className={styles.switchWrapper}>
                      <input type="checkbox" className={styles.switchInput} checked={sendPerformanceReportEmail} onChange={(e) => setSendPerformanceReportEmail(e.target.checked)} />
                      <div className={styles.switchTrack}>
                        <div className={styles.switchThumb} />
                      </div>
                      <span className={styles.formLabel}>Send performance analysis report to CRM email</span>
                    </label>

                    <label className={styles.switchWrapper}>
                      <input type="checkbox" className={styles.switchInput} checked={allowListenersViewViaLink} onChange={(e) => setAllowListenersViewViaLink(e.target.checked)} />
                      <div className={styles.switchTrack}>
                        <div className={styles.switchThumb} />
                      </div>
                      <span className={styles.formLabel}>Allow anonymous listeners view presentation via link</span>
                    </label>

                    <label className={styles.switchWrapper}>
                      <input type="checkbox" className={styles.switchInput} checked={useVoiceMessageAudience} onChange={(e) => setUseVoiceMessageAudience(e.target.checked)} />
                      <div className={styles.switchTrack}>
                        <div className={styles.switchThumb} />
                      </div>
                      <span className={styles.formLabel}>Use voice messaging for audience response channel</span>
                    </label>

                    <label className={styles.switchWrapper}>
                      <input type="checkbox" className={styles.switchInput} checked={allowChangeDetailLevel} onChange={(e) => setAllowChangeDetailLevel(e.target.checked)} />
                      <div className={styles.switchTrack}>
                        <div className={styles.switchThumb} />
                      </div>
                      <span className={styles.formLabel}>Allow listeners to change avatar detail level</span>
                    </label>

                    {allowChangeDetailLevel && (
                      <div className={styles.formGroup} style={{ paddingLeft: '2.5rem', maxWidth: '300px' }}>
                        <label className={styles.formLabel} htmlFor="levelOfDetail">Default Level of Detail</label>
                        <select id="levelOfDetail" className={styles.input} value={levelOfDetail} onChange={(e) => setLevelOfDetail(e.target.value)}>
                          <option value="Full-length presentation">Full-length presentation</option>
                          <option value="Highlight slides only">Highlight slides only</option>
                          <option value="Summary points">Summary points</option>
                        </select>
                      </div>
                    )}

                    <div className={styles.row} style={{ marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel} htmlFor="startSlideNum">Start Presentation from Slide #</label>
                        <input type="number" id="startSlideNum" className={styles.input} min="1" max="99" style={{ maxWidth: '120px' }}
                          value={startFromSlide} onChange={(e) => setStartFromSlide(Number(e.target.value))} />
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.formLabel} htmlFor="devModeToggle" style={{ visibility: 'hidden' }}>Dummy</label>
                        <label className={styles.switchWrapper} style={{ marginTop: '0.4rem' }}>
                          <input type="checkbox" className={styles.switchInput} checked={showDebuggerMode} onChange={(e) => setShowDebuggerMode(e.target.checked)} />
                          <div className={styles.switchTrack}>
                            <div className={styles.switchThumb} />
                          </div>
                          <span>Show developer debugger overlay</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 6: Security & Verification */}
              {activeTab === 'security' && (
                <div className={styles.formCard}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem', marginBottom: '0.25rem' }}>
                    <Shield size={20} style={{ color: '#2563eb' }} />
                    <span className={styles.formCardTitle} style={{ borderBottom: 'none', padding: 0, margin: 0 }}>Security & Verification</span>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                     Enable safeguards to verify the listener&apos;s identity and protect against fraud during the session.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
                    <label className={styles.switchWrapper}>
                      <input type="checkbox" className={styles.switchInput} checked={securityHumanDetection} onChange={(e) => setSecurityHumanDetection(e.target.checked)} />
                      <div className={styles.switchTrack}>
                        <div className={styles.switchThumb} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0f172a' }}>Human Detection</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>Inject quick Captcha checks to ensure a real listener is present.</div>
                      </div>
                    </label>

                    <label className={styles.switchWrapper}>
                      <input type="checkbox" className={styles.switchInput} checked={securityAntiFraud} onChange={(e) => setSecurityAntiFraud(e.target.checked)} />
                      <div className={styles.switchTrack}>
                        <div className={styles.switchThumb} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0f172a' }}>Anti-Fraud</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>Flag navigation events and tab switching outside of active presentation viewport.</div>
                      </div>
                    </label>

                    <label className={styles.switchWrapper}>
                      <input type="checkbox" className={styles.switchInput} checked={securityIdentityVerification} onChange={(e) => setSecurityIdentityVerification(e.target.checked)} />
                      <div className={styles.switchTrack}>
                        <div className={styles.switchThumb} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0f172a' }}>Identity Verification</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>Request selfie uploads or official IDs before granting credentials.</div>
                      </div>
                    </label>

                    <label className={styles.switchWrapper}>
                      <input type="checkbox" className={styles.switchInput} checked={securityAntiImpersonation} onChange={(e) => setSecurityAntiImpersonation(e.target.checked)} />
                      <div className={styles.switchTrack}>
                        <div className={styles.switchThumb} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0f172a' }}>Anti-Impersonation</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>Activate camera face recognition at random intervals to verify watcher matches listener profile.</div>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* Tab 7: Results */}
              {activeTab === 'results' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div className={styles.formCard}>
                    <div className={styles.formCardTitle}>Results Settings</div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <label className={styles.switchWrapper}>
                        <input type="checkbox" className={styles.switchInput} checked={resultsRecording} onChange={(e) => setResultsRecording(e.target.checked)} />
                        <div className={styles.switchTrack}>
                          <div className={styles.switchThumb} />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0f172a' }}>Recording (enable video recording + request consent)</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>Save screen or selfie video recording of the entire session.</div>
                        </div>
                      </label>

                      <label className={styles.switchWrapper}>
                        <input type="checkbox" className={styles.switchInput} checked={resultsSendToListener} onChange={(e) => setResultsSendToListener(e.target.checked)} />
                        <div className={styles.switchTrack}>
                          <div className={styles.switchThumb} />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0f172a' }}>Send Results to Listener by email after All Projects passed by Listener</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>Automatically trigger final completion scores and summaries directly to target watcher.</div>
                        </div>
                      </label>

                      <label className={styles.switchWrapper}>
                        <input type="checkbox" className={styles.switchInput} checked={resultsSendToPresenterListener} onChange={(e) => setResultsSendToPresenterListener(e.target.checked)} />
                        <div className={styles.switchTrack}>
                          <div className={styles.switchThumb} />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0f172a' }}>Send Results to Presenter by email after All Projects passed by Listener</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>Send personal session transcript and score logs to all presenters listed.</div>
                        </div>
                      </label>

                      <label className={styles.switchWrapper}>
                        <input type="checkbox" className={styles.switchInput} checked={resultsSendToPresenterGroup} onChange={(e) => setResultsSendToPresenterGroup(e.target.checked)} />
                        <div className={styles.switchTrack}>
                          <div className={styles.switchThumb} />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0f172a' }}>Send Results to Presenter by email after All Projects passed by Group</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>Deliver aggregated progress reports to instructors once cohort finishes.</div>
                        </div>
                      </label>

                      <label className={styles.switchWrapper}>
                        <input type="checkbox" className={styles.switchInput} checked={resultsGenerateSummary} onChange={(e) => setResultsGenerateSummary(e.target.checked)} />
                        <div className={styles.switchTrack}>
                          <div className={styles.switchThumb} />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0f172a' }}>Generate Summary</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>Leverage generative AI to summarize main questions and key takeaways.</div>
                        </div>
                      </label>

                      <label className={styles.switchWrapper}>
                        <input type="checkbox" className={styles.switchInput} checked={resultsShowCorrectAnswer} onChange={(e) => setResultsShowCorrectAnswer(e.target.checked)} />
                        <div className={styles.switchTrack}>
                          <div className={styles.switchThumb} />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0f172a' }}>Show correct answer after submission</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>Let the listener see detailed feedback immediately upon completing questions.</div>
                        </div>
                      </label>

                      <label className={styles.switchWrapper}>
                        <input type="checkbox" className={styles.switchInput} checked={resultsAnswerLimitedTime} onChange={(e) => setResultsAnswerLimitedTime(e.target.checked)} />
                        <div className={styles.switchTrack}>
                          <div className={styles.switchThumb} />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0f172a' }}>Answer Limited Time</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>Limit the timeframe allowed to solve or reply to interactive slides questions.</div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Custom Results Metrics Section */}
                  <div className={styles.formCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem', marginBottom: '0.25rem' }}>
                      <div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Custom Results</div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.15rem' }}>Pick the Results to track and override for this enrollment.</div>
                      </div>
                      
                      <div className={styles.dropdownContainer}>
                        <button
                          type="button"
                          className={styles.btnSecondary}
                          style={{ padding: '0.4rem 0.85rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                          onClick={() => setShowCustomResultDropdown(v => !v)}
                        >
                          + Add result <ChevronDown size={14} />
                        </button>
                        
                        {showCustomResultDropdown && (
                          <div className={styles.dropdownPopover} style={{ right: 0, left: 'auto', width: '280px', padding: '0.5rem', maxHeight: '300px', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
                            <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.35rem', marginBottom: '0.35rem' }}>
                              <Search size={12} style={{ color: '#94a3b8', marginRight: '0.3rem' }} />
                              <input
                                type="text"
                                placeholder="Search results..."
                                className={styles.input}
                                style={{ border: 'none', outline: 'none', padding: '0.2rem', fontSize: '0.8rem', background: 'transparent' }}
                                value={customResultsSearch}
                                onChange={(e) => setCustomResultsSearch(e.target.value)}
                              />
                            </div>

                            {([
                              { name: 'Visited', desc: 'Listener opened the enrollment at least once.' },
                              { name: 'Time Spent (sec)', desc: 'Total time the listener spent in the enrollment...' },
                              { name: 'Slides Viewed', desc: 'Number of unique slides the listener has...' },
                              { name: 'Completion %', desc: 'Completion percentage from 0 to 100 (slides...' },
                              { name: 'Course Completed', desc: 'True when listener reached the last slide and...' },
                              { name: 'Test Score', desc: 'Score the listener earned in the embedded test.' }
                            ]).filter(m => 
                              (m.name.toLowerCase().includes(customResultsSearch.toLowerCase()) || m.desc.toLowerCase().includes(customResultsSearch.toLowerCase())) &&
                              !customResultsList.includes(m.name)
                            ).map((metric) => (
                              <button
                                key={metric.name}
                                type="button"
                                className={styles.dropdownItem}
                                style={{ padding: '0.45rem', display: 'flex', flexDirection: 'column', gap: '0.15rem', alignItems: 'flex-start' }}
                                onClick={() => {
                                  setCustomResultsList([...customResultsList, metric.name])
                                  setShowCustomResultDropdown(false)
                                }}
                              >
                                <span style={{ fontWeight: 600, fontSize: '0.82rem', color: '#0f172a' }}>{metric.name}</span>
                                <span style={{ fontSize: '0.68rem', color: '#64748b' }}>{metric.desc}</span>
                              </button>
                            ))}
                            {([
                              { name: 'Visited', desc: 'Listener opened the enrollment at least once.' },
                              { name: 'Time Spent (sec)', desc: 'Total time the listener spent in the enrollment...' },
                              { name: 'Slides Viewed', desc: 'Number of unique slides the listener has...' },
                              { name: 'Completion %', desc: 'Completion percentage from 0 to 100 (slides...' },
                              { name: 'Course Completed', desc: 'True when listener reached the last slide and...' },
                              { name: 'Test Score', desc: 'Score the listener earned in the embedded test.' }
                            ]).filter(m => 
                              (m.name.toLowerCase().includes(customResultsSearch.toLowerCase()) || m.desc.toLowerCase().includes(customResultsSearch.toLowerCase())) &&
                              !customResultsList.includes(m.name)
                            ).length === 0 && (
                              <div style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center', padding: '0.5rem' }}>No results match filter.</div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {customResultsList.length === 0 ? (
                      <div
                        style={{ border: '1px dashed #cbd5e1', borderRadius: '8px', padding: '2.5rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.88rem', backgroundColor: '#f8fafc' }}
                      >
                        No custom results added yet.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.25rem' }}>
                        {customResultsList.map(metric => (
                          <span key={metric} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: '#eff6ff', color: '#2563eb', padding: '0.3rem 0.75rem', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 600, border: '1px solid #bfdbfe' }}>
                            {metric}
                            <button type="button" className={styles.tagCloseBtn} style={{ color: '#2563eb' }}
                              onClick={() => setCustomResultsList(customResultsList.filter(m => m !== metric))}
                              aria-label={`Remove ${metric}`}
                            >
                              <X size={13} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {editingId && (
                    <div style={{ paddingTop: '0.25rem', borderTop: '1px solid #e2e8f0' }}>
                      <button
                        type="button"
                        className={styles.btnSecondary}
                        style={{ width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                        onClick={() => {
                          const current = enrollments.find(e => e.id === editingId)
                          if (current) handleOpenManual(current)
                        }}
                      >
                        ✏️ Enter Results Manually (Override)
                      </button>
                    </div>
                  )}
                </div>
              )}
            </form>

            {/* Removed Bottom Absolute Action Bar as requested */}
          </div>
        </div>
      )}

      {/* ── Manual Override Modal ── */}
      {isManualOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsManualOpen(false)} style={{ alignItems: 'center', justifyContent: 'center' }}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}
            style={{ height: 'auto', maxHeight: '90vh', borderRadius: '12px', maxWidth: '420px' }}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Manual Result Entry</h2>
              <button className={styles.modalClose} onClick={() => setIsManualOpen(false)} aria-label="Close"><X size={20} /></button>
            </div>
            <div className={styles.modalBody}>
              <p style={{ fontSize: '0.85rem', color: 'var(--sara-text-muted)', lineHeight: '1.4' }}>
                Manually override the enrollment result for offline or ATS/CRM-integrated onboarding flows.
              </p>
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="manualStatus">Final Status</label>
                <select id="manualStatus" className={styles.input} value={manualStatus}
                  onChange={(e) => setManualStatus(e.target.value as typeof manualStatus)}>
                  <option value="Completed">Completed (Passed)</option>
                  <option value="Failed">Failed (Not Passed)</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="manualDate">Completion Date</label>
                <input type="date" id="manualDate" className={styles.input}
                  value={manualDate} onChange={(e) => setManualDate(e.target.value)} />
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button type="button" className={styles.btnSecondary} onClick={() => setIsManualOpen(false)}>Cancel</button>
              <button type="button" className={styles.btnPrimary} onClick={handleSaveManual}>Confirm Override</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
