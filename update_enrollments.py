import re

with open('src/app/enrollments/page.tsx', 'r') as f:
    content = f.read()

# 1. Add Columns to lucide-react imports
if 'Columns' not in content:
    content = re.sub(r'(import {[^}]+)LayoutGrid', r'\1Columns, LayoutGrid', content)

# 2. Add ENROLLMENT_COLUMNS constant
columns_const = """
// ── Table Columns Config ───────────────────────────────────────────────────────
const ENROLLMENT_COLUMNS = [
  { id: 'Name', label: 'Name', required: true },
  { id: 'ListenerGroup', label: 'Listener / Group' },
  { id: 'ProjectCourse', label: 'Project / Course' },
  { id: 'TargetType', label: 'Target Type' },
  { id: 'ContentType', label: 'Content Type' },
  { id: 'Status', label: 'Status' },
  { id: 'Link', label: 'Link' },
  { id: 'Progress', label: 'Progress' },
  { id: 'VideoRecording', label: 'Video Recording' },
  { id: 'TranscriptionSummary', label: 'Transcription/Summary' },
  { id: 'StartDate', label: 'Start Date' },
  { id: 'TimeSpent', label: 'Time Spent' },
  { id: 'Score', label: 'Score' }
]
"""
if 'ENROLLMENT_COLUMNS' not in content:
    content = content.replace('// ── Kanban columns config ──────────────────────────────────────────────────────', columns_const + '\n// ── Kanban columns config ──────────────────────────────────────────────────────')

# 3. Add visibleColumns state
state_code = """
  // Columns state
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    ENROLLMENT_COLUMNS.map(c => c.id)
  )
  const [showColumnsDropdown, setShowColumnsDropdown] = useState(false)
"""
if 'visibleColumns' not in content:
    content = content.replace('const [search, setSearch] = useState(\'\')', state_code + '\n  const [search, setSearch] = useState(\'\')')

# Remove showGroups and showCourses
content = re.sub(r'  const \[showGroups, setShowGroups\] = useState\(false\)\n', '', content)
content = re.sub(r'  const \[showCourses, setShowCourses\] = useState\(false\)\n', '', content)

# 4. Replace controls toggles
toggles_old = """          <div className={styles.togglesGroup}>
            <label className={styles.toggleLabel}>
              <input type="checkbox" className={styles.toggleInput} checked={showGroups} onChange={(e) => setShowGroups(e.target.checked)} />
              Listener Groups
            </label>
            <label className={styles.toggleLabel}>
              <input type="checkbox" className={styles.toggleInput} checked={showCourses} onChange={(e) => setShowCourses(e.target.checked)} />
              Course Sequences
            </label>
          </div>"""

toggles_new = """          <div className={styles.togglesGroup}>
            <div className={styles.columnsDropdownContainer}>
              <button className={styles.btnSecondary} onClick={() => setShowColumnsDropdown(!showColumnsDropdown)}>
                <Columns size={16} /> Columns
              </button>
              {showColumnsDropdown && (
                <div className={styles.columnsDropdown}>
                  <div className={styles.columnsDropdownHeader}>Visible columns</div>
                  {ENROLLMENT_COLUMNS.map(col => (
                    <label key={col.id} className={styles.columnOption}>
                      <input
                        type="checkbox"
                        checked={visibleColumns.includes(col.id)}
                        disabled={col.required}
                        onChange={(e) => {
                          if (e.target.checked) setVisibleColumns([...visibleColumns, col.id])
                          else setVisibleColumns(visibleColumns.filter(id => id !== col.id))
                        }}
                      />
                      {col.label} {col.required && <span className={styles.requiredBadge}>Required</span>}
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>"""
content = content.replace(toggles_old, toggles_new)

# 5. Replace table header
thead_old = """              <thead>
                <tr>
                  <th style={{ width: '40px', paddingRight: '0.5rem' }}>
                    <input
                      type="checkbox"
                      className={styles.checkbox}
                      checked={selectedIds.length === filteredEnrollments.length && filteredEnrollments.length > 0}
                      onChange={toggleSelectAll}
                      aria-label="Select all"
                    />
                  </th>
                  <th>Project / Courses</th>
                  <th>Listener / Group</th>
                  <th>Status</th>
                  <th>Start Date</th>
                  <th>Reminders</th>
                  <th style={{ width: '120px' }}>Actions</th>
                </tr>
              </thead>"""

thead_new = """              <thead>
                <tr>
                  <th style={{ width: '40px', paddingRight: '0.5rem' }}>
                    <input
                      type="checkbox"
                      className={styles.checkbox}
                      checked={selectedIds.length === filteredEnrollments.length && filteredEnrollments.length > 0}
                      onChange={toggleSelectAll}
                      aria-label="Select all"
                    />
                  </th>
                  {ENROLLMENT_COLUMNS.map(col => 
                    visibleColumns.includes(col.id) && <th key={col.id}>{col.label}</th>
                  )}
                  <th style={{ width: '120px' }}>Actions</th>
                </tr>
              </thead>"""
content = content.replace(thead_old, thead_new)

# 6. Replace table body cells
tbody_start = """                      <td style={{ paddingRight: '0.5rem' }}>
                        <input
                          type="checkbox"
                          className={styles.checkbox}
                          checked={selectedIds.includes(enrollment.id)}
                          onChange={() => toggleSelect(enrollment.id)}
                          aria-label={`Select ${enrollment.title}`}
                        />
                      </td>"""

# Since tbody is very large, let's use a regex to capture everything between tbody_start and the actions cell.
# The actions cell starts with:
actions_cell = """                      <td>
                        <div className={styles.actionsCell}>"""

# We'll replace all the <td> elements in between.
tds_new = """                      {visibleColumns.includes('Name') && (
                        <td>
                          <span className={styles.projectTitle}>{enrollment.title}</span>
                        </td>
                      )}
                      {visibleColumns.includes('ListenerGroup') && (
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            {enrollment.listenerId ? (
                              <>
                                <div className={styles.listenerAvatar} style={getAvatarStyle(enrollment.listenerEmail || enrollment.id)}>
                                  {(enrollment.listenerName?.[0] || 'L').toUpperCase()}
                                </div>
                                <div className={styles.nameCell}>
                                  <span className={styles.listenerName}>{enrollment.listenerName || 'Listener'}</span>
                                  <span className={styles.listenerEmail}>{enrollment.listenerEmail}</span>
                                </div>
                              </>
                            ) : (
                              <span style={{ color: '#94a3b8', fontSize: '0.82rem', fontStyle: 'italic' }}>Anonymous Access</span>
                            )}
                          </div>
                        </td>
                      )}
                      {visibleColumns.includes('ProjectCourse') && (
                        <td>
                          <div className={styles.nameCell}>
                            <span className={styles.projectTitle}>{enrollment.projectTitle || 'Loading…'}</span>
                          </div>
                        </td>
                      )}
                      {visibleColumns.includes('TargetType') && (
                        <td><span style={{ fontSize: '0.85rem' }}>{enrollment.listenerId ? 'Listener' : 'Anonymous'}</span></td>
                      )}
                      {visibleColumns.includes('ContentType') && (
                        <td><span style={{ fontSize: '0.85rem' }}>Project</span></td>
                      )}
                      {visibleColumns.includes('Status') && (
                        <td>
                          <span className={`${styles.statusBadge} ${getStatusClass(enrollment.status)}`}>
                            {enrollment.status}
                          </span>
                        </td>
                      )}
                      {visibleColumns.includes('Link') && (
                        <td>
                          <button className={styles.actionBtn} onClick={() => handleCopyLink(enrollment.id)} style={{ padding: '0.2rem' }}>
                            <LinkIcon size={14} style={{ marginRight: '0.3rem' }} /> Copy URL
                          </button>
                        </td>
                      )}
                      {visibleColumns.includes('Progress') && (
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div className={styles.progressBar} style={{ width: '60px', height: '4px' }}>
                              <div className={styles.progressFill} style={{ width: '0%' }} />
                            </div>
                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>0%</span>
                          </div>
                        </td>
                      )}
                      {visibleColumns.includes('VideoRecording') && (
                        <td><span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>—</span></td>
                      )}
                      {visibleColumns.includes('TranscriptionSummary') && (
                        <td><span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>—</span></td>
                      )}
                      {visibleColumns.includes('StartDate') && (
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#475569' }}>
                            <Calendar size={14} style={{ color: '#94a3b8' }} />
                            <span style={{ fontSize: '0.85rem' }}>
                              {enrollment.startDate ? enrollment.startDate.split('T')[0] : 'Immediate'}
                            </span>
                          </div>
                        </td>
                      )}
                      {visibleColumns.includes('TimeSpent') && (
                        <td><span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>0m 0s</span></td>
                      )}
                      {visibleColumns.includes('Score') && (
                        <td><span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>—</span></td>
                      )}
"""

pattern = re.compile(re.escape(tbody_start) + r'.*?(?=' + re.escape(actions_cell) + ')', re.DOTALL)
content = pattern.sub(tbody_start + '\n' + tds_new, content)

with open('src/app/enrollments/page.tsx', 'w') as f:
    f.write(content)

