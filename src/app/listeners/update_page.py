import re

with open('page.tsx', 'r') as f:
    content = f.read()

# 1. Update imports
imports_target = """import {
  Users, Search, Plus, Trash2, Edit3, Globe, X,
  ChevronLeft, ChevronRight, Download, UploadCloud, Linkedin,
  File, FileText, BarChart2, Clock, Award, FileSpreadsheet,
  AlertCircle, CheckCircle,
} from 'lucide-react'"""
imports_replacement = """import {
  Users, Search, Plus, Trash2, Edit3, Globe, X,
  ChevronLeft, ChevronRight, Download, UploadCloud, Linkedin,
  File, FileText, BarChart2, Clock, Award, FileSpreadsheet,
  AlertCircle, CheckCircle, Columns, Maximize2, Filter, Check, FilterX
} from 'lucide-react'"""
content = content.replace(imports_target, imports_replacement)

# 2. Add columns constants
cols_target = "const emptyFormState = {"
cols_replacement = """const ALL_COLUMNS = ['Name', 'First Name', 'Last Name', 'Email', 'Phone', 'Position', 'Department', 'Company', 'Country', 'LinkedIn', 'Language', 'Group', 'Documents', 'Last Activity', 'Enrollments', 'Last Result', 'Positive Result Date', 'Last Enrollment Summary']
const AUTO_COLUMNS = ['Name', 'Enrollments', 'Last Result', 'Positive Result Date', 'Last Enrollment Summary']
const DEFAULT_COLUMNS = ['Name', 'Email', 'Position', 'Group', 'Last Activity']

const emptyFormState = {"""
content = content.replace(cols_target, cols_replacement)

# 3. Add state
state_target = """  // Debounce search"""
state_replacement = """  // Columns & Filters state
  const [visibleColumns, setVisibleColumns] = useState<string[]>(DEFAULT_COLUMNS)
  const [isColumnsOpen, setIsColumnsOpen] = useState(false)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [filterCountry, setFilterCountry] = useState('All Country')
  const [filterDepartment, setFilterDepartment] = useState('All Department')
  
  // Selection state
  const [selectedListeners, setSelectedListeners] = useState<string[]>([])
  
  // Close dropdowns on outside click
  const dropdownsRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownsRef.current && !dropdownsRef.current.contains(event.target as Node)) {
        setIsColumnsOpen(false)
        setIsFiltersOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleColumn = (col: string) => {
    setVisibleColumns(prev => 
      prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]
    )
  }

  // Get unique filter options
  const countryOptions = ['All Country', ...Array.from(new Set(listeners.map(l => l.country).filter(Boolean)))].sort()
  const deptOptions = ['All Department', ...Array.from(new Set(listeners.map(l => l.department).filter(Boolean)))].sort()

  const filteredListeners = listeners.filter(l => {
    if (filterCountry !== 'All Country' && l.country !== filterCountry) return false
    if (filterDepartment !== 'All Department' && l.department !== filterDepartment) return false
    return true
  })

  // Debounce search"""
content = content.replace(state_target, state_replacement)

# 4. Update Header actions
header_target = """        <div className={styles.headerActions}>
          <button className={styles.btnSecondary} onClick={handleExportCSV} aria-label="Export CSV">
            <Download size={16} /> Export
          </button>
          <button className={styles.btnSecondary} onClick={openImportModal} aria-label="Import listeners">
            <UploadCloud size={16} /> Import
          </button>
          <button className={styles.btnPrimary} onClick={handleOpenCreate} aria-label="Add listener">
            <Plus size={16} /> Add Listener
          </button>
        </div>"""
header_replacement = """        <div className={styles.headerActions}>
          <button className={styles.btnSecondary} onClick={handleExportCSV} aria-label="Export CSV">
            <Download size={16} /> Export
          </button>
          <button className={styles.btnSecondary} onClick={openImportModal} aria-label="Import listeners">
            <UploadCloud size={16} /> Import
          </button>
          <button className={styles.btnPrimary} onClick={handleOpenCreate} aria-label="Add listener">
            <Plus size={16} /> Add Listener
          </button>
        </div>"""
content = content.replace(header_target, header_replacement)

# 5. Update controls bar
controls_target = """      {/* ── Search bar ── */}
      <div className={styles.controlsBar}>
        <div className={styles.searchWrapper}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text" className={styles.searchInput}
            placeholder="Search by name, email, position…"
            value={search} onChange={(e) => setSearch(e.target.value)}
            aria-label="Search listeners"
          />
        </div>
      </div>"""
controls_replacement = """      {/* ── Search & Filters bar ── */}
      <div className={styles.controlsBar} ref={dropdownsRef}>
        <div className={styles.searchWrapper} style={{ maxWidth: '300px' }}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text" className={styles.searchInput}
            placeholder="Search listeners..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            aria-label="Search listeners"
          />
        </div>

        <div className={styles.dropdownContainer}>
          <button className={styles.btnSecondary} onClick={() => { setIsFiltersOpen(!isFiltersOpen); setIsColumnsOpen(false); }}>
            <Filter size={16} /> Filters
          </button>
          {isFiltersOpen && (
            <div className={styles.dropdownMenu} style={{ minWidth: '240px', left: 0, right: 'auto' }}>
              <div className={styles.dropdownSelectGroup}>
                <label className={styles.dropdownSelectLabel}>Country</label>
                <select 
                  className={styles.dropdownSelect} 
                  value={filterCountry} 
                  onChange={(e) => setFilterCountry(e.target.value)}
                >
                  {countryOptions.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className={styles.dropdownSelectGroup} style={{ marginTop: '0.5rem' }}>
                <label className={styles.dropdownSelectLabel}>Department</label>
                <select 
                  className={styles.dropdownSelect} 
                  value={filterDepartment} 
                  onChange={(e) => setFilterDepartment(e.target.value)}
                >
                  {deptOptions.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
          )}
        </div>

        <div style={{ flex: 1 }}></div>

        <div className={styles.dropdownContainer}>
          <button className={styles.btnSecondary} onClick={() => { setIsColumnsOpen(!isColumnsOpen); setIsFiltersOpen(false); }}>
            <Columns size={16} /> Columns
          </button>
          {isColumnsOpen && (
            <div className={styles.dropdownMenu} style={{ right: 0 }}>
              <div className={styles.dropdownHeader}>Visible columns</div>
              <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                {ALL_COLUMNS.map(col => {
                  const isAuto = AUTO_COLUMNS.includes(col)
                  const isChecked = visibleColumns.includes(col)
                  return (
                    <div key={col} className={styles.dropdownItem} onClick={() => toggleColumn(col)}>
                      <div className={styles.dropdownCheckbox} data-checked={isChecked}>
                        {isChecked && <Check size={12} strokeWidth={3} />}
                      </div>
                      <span>{col}</span>
                      {isAuto && <span className={styles.badgeAuto}>Auto</span>}
                    </div>
                  )
                })}
              </div>
              <div className={styles.dropdownAction} onClick={() => setVisibleColumns(DEFAULT_COLUMNS)}>
                Reset to default
              </div>
            </div>
          )}
        </div>
        
        <button className={styles.btnSecondary} aria-label="Expand view">
          <Maximize2 size={16} /> Expand
        </button>
      </div>"""
content = content.replace(controls_target, controls_replacement)

# 6. Table replacement
table_target = """            <thead>
              <tr>
                <th>Listener Info</th>
                <th>Company &amp; Dept</th>
                <th>Location &amp; Lang</th>
                <th>Documents</th>
                <th style={{ width: '80px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isPending ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading…</td></tr>
              ) : (
                listeners.map((listener) => {
                  const nameStr = `${listener.firstName || ''} ${listener.lastName || ''}`.trim()
                  const nameDisplay = nameStr || 'Anonymous Listener'
                  const initials = (listener.firstName?.[0] || '') + (listener.lastName?.[0] || '') || listener.email[0].toUpperCase()
                  return (
                    <tr key={listener.id}>
                      <td>
                        <div className={styles.userCell}>
                          <div className={styles.avatar} style={getAvatarStyle(listener.email)}>{initials}</div>
                          <div className={styles.userInfo}>
                            <span className={styles.userName}>{nameDisplay}</span>
                            <span className={styles.userEmail}>{listener.email}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className={styles.userInfo}>
                          <span className={styles.userName}>{listener.position || '—'}</span>
                          <span className={styles.userEmail}>{listener.company ? `${listener.company}${listener.department ? ` · ${listener.department}` : ''}` : '—'}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
                          <span className={`${styles.tag} ${styles.tagLanguage}`}>
                            <Globe size={12} style={{ marginRight: '0.2rem' }} />{listener.language.toUpperCase()}
                          </span>
                          {listener.country && <span className={styles.userEmail}>{listener.country}</span>}
                        </div>
                      </td>
                      <td>
                        {listener.documents?.length > 0 ? (
                          <span
                            className={`${styles.tag} ${styles.tagDocs}`}
                            style={{ cursor: 'pointer' }}
                            onClick={() => { handleOpenEdit(listener); setDrawerTab('files') }}
                            role="button"
                          >
                            <File size={12} /> {listener.documents.length} file{listener.documents.length > 1 ? 's' : ''}
                          </span>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>None</span>
                        )}
                      </td>
                      <td>
                        <div className={styles.actionsCell}>
                          <button className={styles.actionBtn} onClick={() => handleOpenEdit(listener)} title="Edit" aria-label={`Edit ${nameDisplay}`}>
                            <Edit3 size={16} />
                          </button>
                          <button className={`${styles.actionBtn} ${styles.actionBtnDelete}`} onClick={() => handleDelete(listener.id)} title="Delete" aria-label={`Delete ${nameDisplay}`}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>"""
table_replacement = """            <thead>
              <tr>
                <th className={styles.checkboxColumn}>
                  <div 
                    className={styles.tableCheckboxContainer}
                    data-checked={filteredListeners.length > 0 && selectedListeners.length === filteredListeners.length}
                    onClick={() => {
                      if (selectedListeners.length === filteredListeners.length) {
                        setSelectedListeners([])
                      } else {
                        setSelectedListeners(filteredListeners.map(l => l.id))
                      }
                    }}
                  >
                    {filteredListeners.length > 0 && selectedListeners.length === filteredListeners.length && <Check size={12} strokeWidth={3} />}
                  </div>
                </th>
                {ALL_COLUMNS.map(col => visibleColumns.includes(col) && <th key={col}>{col}</th>)}
                <th style={{ width: '80px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isPending ? (
                <tr><td colSpan={visibleColumns.length + 2} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading…</td></tr>
              ) : (
                filteredListeners.map((listener) => {
                  const nameStr = `${listener.firstName || ''} ${listener.lastName || ''}`.trim()
                  const nameDisplay = nameStr || 'Anonymous Listener'
                  const isChecked = selectedListeners.includes(listener.id)
                  
                  return (
                    <tr key={listener.id}>
                      <td className={styles.checkboxColumn}>
                        <div 
                          className={styles.tableCheckboxContainer}
                          data-checked={isChecked}
                          onClick={() => {
                            if (isChecked) {
                              setSelectedListeners(prev => prev.filter(id => id !== listener.id))
                            } else {
                              setSelectedListeners(prev => [...prev, listener.id])
                            }
                          }}
                        >
                          {isChecked && <Check size={12} strokeWidth={3} />}
                        </div>
                      </td>
                      {visibleColumns.map(col => {
                        let content: React.ReactNode = '—'
                        
                        switch (col) {
                          case 'Name': content = <span className={styles.userName}>{nameDisplay}</span>; break;
                          case 'First Name': content = listener.firstName || '—'; break;
                          case 'Last Name': content = listener.lastName || '—'; break;
                          case 'Email': content = <span className={styles.userEmail}>{listener.email}</span>; break;
                          case 'Phone': content = '—'; break; // phone not in type currently
                          case 'Position': content = listener.position || '—'; break;
                          case 'Department': content = listener.department || '—'; break;
                          case 'Company': content = listener.company || '—'; break;
                          case 'Country': content = listener.country || '—'; break;
                          case 'LinkedIn': content = listener.linkedin ? 'Linked' : '—'; break;
                          case 'Language': content = listener.language || 'en'; break;
                          case 'Group': content = '—'; break; // Group not implemented in data yet
                          case 'Documents': 
                            content = listener.documents?.length > 0 ? (
                              <span
                                className={`${styles.tag} ${styles.tagDocs}`}
                                style={{ cursor: 'pointer', margin: 0 }}
                                onClick={() => { handleOpenEdit(listener); setDrawerTab('files') }}
                              >
                                {listener.documents.length} file{listener.documents.length > 1 ? 's' : ''}
                              </span>
                            ) : 'None';
                            break;
                          case 'Last Activity': content = 'Jun 1, 2026'; break; // Hardcoded mock based on screenshot
                          case 'Enrollments': content = '—'; break;
                          case 'Last Result': content = '—'; break;
                          case 'Positive Result Date': content = '—'; break;
                          case 'Last Enrollment Summary': content = '—'; break;
                        }
                        
                        return <td key={col}>{content}</td>
                      })}
                      <td>
                        <div className={styles.actionsCell} style={{ justifyContent: 'flex-end' }}>
                          <button className={styles.actionBtn} onClick={() => handleOpenEdit(listener)} title="Edit" aria-label={`Edit ${nameDisplay}`}>
                            <Edit3 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>"""
content = content.replace(table_target, table_replacement)

with open('page.tsx', 'w') as f:
    f.write(content)
