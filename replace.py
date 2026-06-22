import re

with open('src/app/enrollments/[[...slug]]/page.tsx', 'r') as f:
    content = f.read()

# Find the start and end of the block we want to replace
start_marker = "              {/* Tab 4: Viewer Layout splitLayout */}"
end_marker = "              {activeTab === 'languageSettings' && ("

start_idx = content.find(start_marker)
end_idx = content.find("              {activeTab === 'languageSettings'")

if start_idx != -1 and end_idx != -1:
    new_content = """              {activeTab === 'advanced' && (
                <div className={styles.formCard}>
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
                    'Use voice message for audience',
                    'Allow listener to change the level of detail',
                    'Show debugger mode'
                  ].map((setting, idx) => (
                    <div key={idx} style={{ padding: '0.75rem 0', borderBottom: idx < 14 ? '1px solid #f1f5f9' : 'none' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.9rem', color: '#0f172a' }}>{setting}</span>
                          <Info size={14} style={{ color: '#94a3b8' }} />
                        </div>
                        <div className={styles.switchWrapper} style={{ opacity: 0.8 }}>
                          <div className={styles.switchTrack}><div className={styles.switchThumb} /></div>
                        </div>
                      </div>
                      {setting === 'Allow listener to call presenter' && (
                        <div style={{ marginTop: '0.75rem', paddingLeft: '1rem' }}>
                          <label className={styles.formLabel} style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Text for button</label>
                          <input type="text" className={styles.input} value="Call presenter" readOnly style={{ background: '#f8fafc' }} />
                        </div>
                      )}
                      {setting === 'Allow listener to schedule meeting' && (
                        <div style={{ marginTop: '0.75rem', paddingLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          <div>
                            <label className={styles.formLabel} style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Link to calendar</label>
                            <input type="text" className={styles.input} placeholder="Link to calendar" />
                          </div>
                          <div>
                            <label className={styles.formLabel} style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Text for button</label>
                            <input type="text" className={styles.input} value="Schedule meeting" readOnly style={{ background: '#f8fafc' }} />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Level of detail</label>
                      <select className={styles.input} style={{ appearance: 'auto' }}>
                        <option value="Full-length presentation">Full-length presentation</option>
                      </select>
                    </div>
                    
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Start from this slide</label>
                      <input type="text" className={styles.input} value="1" readOnly style={{ background: '#f8fafc' }} />
                    </div>
                    
                    <div className={styles.formGroup}>
                      <input type="text" className={styles.input} placeholder="Presentation Link" />
                    </div>
                    
                    <div className={styles.formGroup}>
                      <textarea className={styles.input} placeholder="Comment" style={{ minHeight: '80px', resize: 'vertical' }} />
                    </div>
                  </div>
                </div>
              )}

"""
    
    with open('src/app/enrollments/[[...slug]]/page.tsx', 'w') as f:
        f.write(content[:start_idx] + new_content + content[end_idx:])
    print("Replaced successfully!")
else:
    print("Markers not found!")
    if start_idx == -1: print("start marker not found")
    if end_idx == -1: print("end marker not found")

