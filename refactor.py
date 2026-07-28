import re

def refactor_page():
    with open('src/app/enrollments/[[...slug]]/page.tsx', 'r', encoding='utf-8') as f:
        content = f.read()
    
    header_start = content.find('{/* ── Header ── */}')
    modal_start = content.find('{/* ── Upgraded Create / Edit Enrollment Wizard Modal ── */}')
    
    if header_start == -1 or modal_start == -1:
        print("Could not find start/end markers")
        return
        
    before_header = content[:header_start]
    main_list_content = content[header_start:modal_start]
    
    before_header = before_header.replace(
        '<div className={isExpanded ? styles.containerExpanded : styles.container}>',
        "<div className={isExpanded ? styles.containerExpanded : styles.container} style={{ background: isOpen ? '#f8fafc' : undefined, minHeight: '100vh' }}>\n      {!isOpen ? (\n        <>"
    )
    
    main_list_content = main_list_content + "        </>\n      ) : (\n"
    
    form_end = content.find('</form>', modal_start)
    if form_end == -1:
        print("Could not find </form>")
        return
        
    modal_end = content.find('</div>\n        </div>\n      )}', form_end)
    if modal_end == -1:
        modal_end = content.find(')}', form_end) + 2
        
    new_form_layout = """        <div className={styles.fullPageContainer}>
          <div className={styles.fullPageBreadcrumb}>
            Enrollments / {editingId ? 'Edit enrollment' : 'New enrollment'} / {activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace(/([A-Z])/g, ' $1').toLowerCase()} / Target type — {formData.targetType === 'anonymous' ? 'Global shared link' : 'Listener (Personalized Link)'}
          </div>
          
          <div className={styles.fullPageCard}>
             <button className={styles.modalClose} onClick={closeModal} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
             
             <div className={styles.fullPageHeader}>
               <h1 className={styles.fullPageTitle}>{editingId ? 'Edit Enrollment' : 'Add Enrollment'}</h1>
               <p className={styles.fullPageSubtitle}>Set up a new enrollment: pick who's enrolled, link a project, and configure access</p>
             </div>
             
             <div className={styles.tabsHeaderPill}>
                <button type="button" className={`${styles.tabPill} ${activeTab === 'general' ? styles.tabPillActive : ''}`} onClick={() => setActiveTab('general')}>General</button>
                <button type="button" className={`${styles.tabPill} ${activeTab === 'invitations' ? styles.tabPillActive : ''}`} onClick={() => setActiveTab('invitations')}>Invitation and Reminders</button>
                <button type="button" className={`${styles.tabPill} ${activeTab === 'links' ? styles.tabPillActive : ''}`} onClick={() => setActiveTab('links')}>Links</button>
                <button type="button" className={`${styles.tabPill} ${activeTab === 'leadForm' ? styles.tabPillActive : ''}`} onClick={() => setActiveTab('leadForm')}>Lead form</button>
                <button type="button" className={`${styles.tabPill} ${activeTab === 'advanced' ? styles.tabPillActive : ''}`} onClick={() => setActiveTab('advanced')}>Advanced</button>
                <button type="button" className={`${styles.tabPill} ${activeTab === 'languageSettings' ? styles.tabPillActive : ''}`} onClick={() => setActiveTab('languageSettings')}>Language settings</button>
             </div>
             
             <form id="enrollment-form" onSubmit={handleSave} className={styles.fullPageFormBody}>
                {/* Tab 1: General */}
                {activeTab === 'general' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                    
                    {quotaExceeded && (
                      <div className={styles.alertBox}>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <AlertTriangle size={18} />
                          <span className={styles.alertTitle}>Active Seats Limit Reached</span>
                        </div>
                        <p className={styles.alertDesc}>
                          You have used <strong>{quotaActive} of {quotaMax} seats</strong>. New active enrollments are blocked.
                        </p>
                        <a href="/plans#listener-seats-addons" className={styles.alertLink}>Upgrade Listener Seats →</a>
                      </div>
                    )}

                    <div className={styles.formSectionRow}>
                      <div className={styles.formSectionLeft}>
                        <div className={styles.formSectionTitle}>Identity</div>
                        <div className={styles.formSectionDesc}>Basic information about this enrollment</div>
                      </div>
                      <div className={styles.formSectionRight}>
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel} htmlFor="title">Title (shown to listener) *</label>
                          <input type="text" id="title" className={styles.input} required
                            value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                        </div>
                      </div>
                    </div>
                    
                    <div className={styles.formSectionRow}>
                      <div className={styles.formSectionLeft}>
                        <div className={styles.formSectionTitle}>Content & Target</div>
                        <div className={styles.formSectionDesc}>What is being shared and with whom</div>
                      </div>
                      <div className={styles.formSectionRight}>
                        <div className={styles.row}>
                          <div className={styles.formGroup}>
                            <label className={styles.formLabel} htmlFor="targetType">Target Type</label>
                            <select id="targetType" className={styles.input} value={formData.targetType}
                              onChange={(e) => setFormData({ ...formData, targetType: e.target.value as typeof formData.targetType })}>
                              <option value="anonymous">Anonymous (Shared Link)</option>
                              <option value="listener">Listener (Personalized Link)</option>
                              <option value="group">Group (soon)</option>
                            </select>
                          </div>

                          <div className={styles.formGroup}>
                            <label className={styles.formLabel} htmlFor="contentType">Content Type</label>
                            <select id="contentType" className={styles.input} value={formData.contentType}
                              onChange={(e) => setFormData({ ...formData, contentType: e.target.value as typeof formData.contentType })}>
                              <option value="project">Project</option>
                              <option value="course">Course (soon)</option>
                            </select>
                          </div>
                        </div>

                        {formData.targetType?.toLowerCase() === 'listener' && (
                          <div className={styles.formGroup}>
                            <label className={styles.formLabel} htmlFor="listenerSelect">Select Listener *</label>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                              <select id="listenerSelect" className={styles.input} required
                                value={formData.listenerId} onChange={(e) => setFormData({ ...formData, listenerId: e.target.value })}
                                style={{ flex: 1 }}>
                                <option value="" disabled>Select listener…</option>
                                {listeners.map(l => (
                                  <option key={l.id} value={l.id}>{l.firstName || ''} {l.lastName || ''} ({l.email})</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        )}

                        {formData.targetType?.toLowerCase() === 'group' && (
                          <div className={styles.formGroup}>
                            <label className={styles.formLabel} htmlFor="groupSelect">Select Group *</label>
                            <select id="groupSelect" className={styles.input} required
                              value={(formData as any).groupId || ''} onChange={(e) => setFormData({ ...formData, targetType: 'Group', groupId: e.target.value } as any)}>
                              <option value="" disabled>Select group…</option>
                              {groups.map(g => (
                                <option key={g.id} value={g.name}>{g.name}</option>
                              ))}
                            </select>
                          </div>
                        )}

                        {formData.contentType?.toLowerCase() === 'project' && (
                          <div className={styles.formGroup}>
                            <label className={styles.formLabel} htmlFor="projectSelect">Select Project *</label>
                            <select id="projectSelect" className={styles.input} required
                              value={formData.projectId} onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}>
                              <option value="" disabled>Select project…</option>
                              {projects.map(p => <option key={p.id} value={p.id}>{p.title} ({p.type})</option>)}
                            </select>
                          </div>
                        )}

                        {formData.contentType?.toLowerCase() === 'course' && (
                          <div className={styles.formGroup}>
                            <label className={styles.formLabel} htmlFor="courseSelect">Select Course *</label>
                            <select id="courseSelect" className={styles.input} required
                              value={formData.projectId} onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}>
                              <option value="" disabled>Select course…</option>
                              {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className={styles.formSectionRow}>
                      <div className={styles.formSectionLeft}>
                        <div className={styles.formSectionTitle}>Notifications</div>
                        <div className={styles.formSectionDesc}>Who gets informed when a listener completes this enrollment</div>
                      </div>
                      <div className={styles.formSectionRight}>
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>Presenter(s)</label>
                          <div className={styles.tagList}>
                            {presenters.map((p, i) => (
                              <span key={i} className={styles.removableTag}>
                                {p}
                                <button type="button" onClick={() => removePresenter(p)}><X size={12} /></button>
                              </span>
                            ))}
                            <input
                              type="email"
                              className={styles.input}
                              placeholder="Add email and press Enter"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault()
                                  addPresenter(e.currentTarget.value)
                                  e.currentTarget.value = ''
                                }
                              }}
                              style={{ flex: 1, minWidth: '200px', border: 'none', boxShadow: 'none', padding: '0.25rem' }}
                            />
                          </div>
                          <p className={styles.helperText}>These email addresses will receive session transcripts and results notifications.</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className={styles.formSectionRow}>
                      <div className={styles.formSectionLeft}>
                        <div className={styles.formSectionTitle}>Scheduling</div>
                        <div className={styles.formSectionDesc}>When it runs and how listener can book</div>
                      </div>
                      <div className={styles.formSectionRight}>
                         {/* We omit this implementation to keep it simple, but we can add dummy inputs based on the screenshot */}
                         <div className={styles.formGroup}>
                           <label className={styles.formLabel}>Link to calendar</label>
                           <input type="text" className={styles.input} placeholder="https://meetings.hubspot.com/your-handle" />
                         </div>
                         <div className={styles.row}>
                           <div className={styles.formGroup}>
                             <label className={styles.formLabel}>Start date</label>
                             <input type="date" className={styles.input} />
                           </div>
                           <div className={styles.formGroup}>
                             <label className={styles.formLabel}>Status</label>
                             <select className={styles.input}>
                               <option>In progress</option>
                             </select>
                           </div>
                         </div>
                      </div>
                    </div>
                    
                    <div className={styles.formSectionRow}>
                      <div className={styles.formSectionLeft}>
                        <div className={styles.formSectionTitle}>Options</div>
                        <div className={styles.formSectionDesc}>Extra behavior for this enrollment</div>
                      </div>
                      <div className={styles.formSectionRight}>
                         <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                           <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.9rem', color: '#334155' }}>
                             <input type="checkbox" style={{ accentColor: '#3b82f6', width: '16px', height: '16px' }} defaultChecked />
                             Don't send notifications when listener opens enrollment
                           </label>
                           <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.9rem', color: '#334155' }}>
                             <input type="checkbox" style={{ accentColor: '#3b82f6', width: '16px', height: '16px' }} />
                             Choice at the beginning: book calendar OR start avatar now
                           </label>
                         </div>
                      </div>
                    </div>

                  </div>
                )}
                
                {/* Placeholder for other tabs */}
                {activeTab !== 'general' && (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                    Tab content for {activeTab} (migrate other tabs layout here...)
                  </div>
                )}

                <div className={styles.formFooter}>
                  <button type="button" className={styles.btnSecondary} onClick={closeModal}>Cancel</button>
                  <button type="submit" className={styles.btnPrimary}>
                    {editingId ? 'Save Changes' : 'Create Enrollment'}
                  </button>
                </div>
             </form>
          </div>
        </div>
      )}
"""
    
    old_form_start = content.find('<form id="enrollment-form"', modal_start)
    
    if old_form_start != -1:
        tab_invitations_start = content.find("{/* Tab 2: Invitations", old_form_start)
        form_end_tag = content.find('</form>', old_form_start)
        
        other_tabs_content = content[tab_invitations_start:form_end_tag]
        
        new_form_layout = new_form_layout.replace(
            '{/* Placeholder for other tabs */}\n                {activeTab !== \'general\' && (\n                  <div style={{ padding: \'2rem\', textAlign: \'center\', color: \'#64748b\' }}>\n                    Tab content for {activeTab} (migrate other tabs layout here...)\n                  </div>\n                )}',
            other_tabs_content
        )
    
    after_modal = content[modal_end:]
    
    final_content = before_header + main_list_content + new_form_layout + after_modal
    
    with open('src/app/enrollments/[[...slug]]/page.tsx', 'w', encoding='utf-8') as f:
        f.write(final_content)
        
    print("Refactoring complete.")

if __name__ == '__main__':
    refactor_page()
