import React, { useState } from 'react'
import styles from './ProjectsTable.module.css'
import { Project } from '@/types'
import { cn } from '@/lib/utils'
import { MoreHorizontal, Link as LinkIcon, Eye, Users, FileUp, FolderInput, Copy, Trash2, Edit2, Play, Plus, Settings, GraduationCap, Globe, Download } from 'lucide-react'
import { useToast } from '@/components/ui/ToastProvider'
import { useRouter } from 'next/navigation'
import ShareEnrollModal from '../ShareEnrollModal/ShareEnrollModal'

const PROJECT_COLUMNS = [
  { id: 'Project', label: 'Project', required: true },
  { id: 'Preview', label: 'Preview', required: false },
  { id: 'Edit', label: 'Edit', required: false },
  { id: 'Type', label: 'Type', required: false },
  { id: 'AI Avatar', label: 'AI Avatar', required: false },
  { id: 'Author', label: 'Author', required: false },
  { id: 'Created', label: 'Created', required: false },
  { id: 'Language', label: 'Language', required: false },
  { id: 'Courses', label: 'Courses', required: false },
  { id: 'Enrollments', label: 'Enrollments', required: false, isAuto: true },
  { id: 'Script', label: 'Script', required: false },
  { id: 'Slides', label: 'Slides', required: false },
  { id: 'Opened', label: 'Opened', required: false },
]

interface ProjectsTableProps {
  projects: Project[]
  onBulkDelete?: (ids: string[]) => void
}

export default function ProjectsTable({ projects, onBulkDelete }: ProjectsTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [activeGearId, setActiveGearId] = useState<string | null>(null)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [shareProjectTitle, setShareProjectTitle] = useState('')
  const [shareProjectId, setShareProjectId] = useState('')
  const { showToast } = useToast()
  const router = useRouter()

  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('All Types')
  const [showTypeDropdown, setShowTypeDropdown] = useState(false)
  const [languageFilter, setLanguageFilter] = useState('All Languages')
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false)

  const [showFiltersBar, setShowFiltersBar] = useState(true)
  const [showColumnsDropdown, setShowColumnsDropdown] = useState(false)
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    PROJECT_COLUMNS.map(c => c.id)
  )

  const toggleAll = () => {
    if (selectedIds.length === projects.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(projects.map(p => p.id))
    }
  }

  const toggleOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  // Filter projects based on the selected filters
  const filteredProjects = projects.filter(project => {
    if (typeFilter !== 'All Types' && project.type !== typeFilter.toLowerCase()) return false;
    // For language, we'd ideally check project.language but the type doesn't have it strongly typed right now, assuming 'English' for testing
    if (languageFilter !== 'All Languages' && 'English' !== languageFilter) return false;
    if (searchQuery && !project.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className={styles.tableCard}>
      <div className={styles.tableTabs}>
        <div className={styles.tabGroup}>
          <button className={cn(styles.tab, styles.activeTab)}>My projects</button>
          <button className={styles.tab} onClick={() => showToast("Shared projects view coming soon", "info")}>Shared with me</button>
        </div>
        <div className={styles.tabGroupRight}>
          <button className={cn(styles.filterBtn, showFiltersBar && styles.activeTab)} onClick={() => setShowFiltersBar(!showFiltersBar)}>Filters</button>
          
          <div className={styles.dropdownContainer}>
            <button className={cn(styles.filterBtn, showColumnsDropdown && styles.activeTab)} onClick={() => setShowColumnsDropdown(!showColumnsDropdown)}>
              Columns
            </button>
            {showColumnsDropdown && (
              <div className={styles.dropdownPopover} style={{ right: 0, left: 'auto', width: '220px', padding: '12px' }}>
                <div style={{ fontSize: '13px', fontWeight: 500, color: '#64748b', marginBottom: '8px' }}>Visible columns</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {PROJECT_COLUMNS.map(col => (
                    <label key={col.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: col.required ? 'not-allowed' : 'pointer' }}>
                      <input
                        type="checkbox"
                        className={styles.checkbox}
                        checked={visibleColumns.includes(col.id)}
                        disabled={col.required}
                        onChange={(e) => {
                          if (col.required) return;
                          if (e.target.checked) setVisibleColumns([...visibleColumns, col.id])
                          else setVisibleColumns(visibleColumns.filter(id => id !== col.id))
                        }}
                      />
                      <span style={{ fontSize: '14px', color: '#334155', flex: 1 }}>{col.label}</span>
                      {col.required && <span style={{ fontSize: '11px', background: '#e2e8f0', padding: '2px 6px', borderRadius: '10px', color: '#475569' }}>Required</span>}
                      {col.isAuto && <span style={{ fontSize: '11px', border: '1px solid #e2e8f0', padding: '2px 6px', borderRadius: '10px', color: '#475569' }}>Auto</span>}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <button className={styles.filterBtn} onClick={() => showToast("Expand view coming soon", "info")}>Expand</button>
        </div>
      </div>

      {showFiltersBar && (
        <div className={styles.filtersBar}>
          <div className={styles.searchWrapper}>
            <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className={styles.dropdownContainer}>
            <button className={styles.dropdownBtn} onClick={() => { setShowTypeDropdown(!showTypeDropdown); setShowLanguageDropdown(false); }}>
              <span>{typeFilter}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            {showTypeDropdown && (
              <div className={styles.dropdownPopover}>
                {['All Types', 'Video', 'Presentation'].map(type => (
                  <button
                    key={type}
                    className={cn(styles.dropdownItem, typeFilter === type && styles.dropdownItemActive)}
                    onClick={() => { setTypeFilter(type); setShowTypeDropdown(false); }}
                  >
                    {type}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className={styles.dropdownContainer}>
            <button className={styles.dropdownBtn} onClick={() => { setShowLanguageDropdown(!showLanguageDropdown); setShowTypeDropdown(false); }}>
              <span>{languageFilter}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            {showLanguageDropdown && (
              <div className={styles.dropdownPopover}>
                {['All Languages', 'English', 'Spanish', 'French'].map(lang => (
                  <button
                    key={lang}
                    className={cn(styles.dropdownItem, languageFilter === lang && styles.dropdownItemActive)}
                    onClick={() => { setLanguageFilter(lang); setShowLanguageDropdown(false); }}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className={styles.tableHeaderWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ width: '40px' }}>
                <input 
                  type="checkbox"
                  className={styles.checkbox}
                  checked={projects.length > 0 && selectedIds.length === projects.length}
                  onChange={toggleAll}
                />
              </th>
              {visibleColumns.includes('Project') && <th>Project</th>}
              {visibleColumns.includes('Preview') && <th>Preview</th>}
              {visibleColumns.includes('Edit') && <th>Edit</th>}
              {visibleColumns.includes('Type') && <th>Type</th>}
              {visibleColumns.includes('AI Avatar') && <th>AI Avatar</th>}
              {visibleColumns.includes('Author') && <th>Author</th>}
              {visibleColumns.includes('Created') && <th>Created</th>}
              {visibleColumns.includes('Language') && <th>Language</th>}
              {visibleColumns.includes('Courses') && <th>Courses</th>}
              {visibleColumns.includes('Enrollments') && <th>Enrollments</th>}
              {visibleColumns.includes('Script') && <th>Script</th>}
              {visibleColumns.includes('Slides') && <th>Slides</th>}
              {visibleColumns.includes('Opened') && <th>Opened</th>}
              <th style={{ width: '40px' }}></th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects.map(project => (
              <tr key={project.id} className={selectedIds.includes(project.id) ? styles.selectedRow : ''} onClick={() => router.push(`/editor?projectId=${project.id}`)}>
                <td onClick={(e) => e.stopPropagation()}>
                  <input 
                    type="checkbox"
                    className={styles.checkbox}
                    checked={selectedIds.includes(project.id)}
                    onChange={() => toggleOne(project.id)}
                  />
                </td>
                {visibleColumns.includes('Project') && (
                  <td>
                    <div className={styles.projectInfo}>
                      <div className={styles.previewThumbMini}>
                        {project.thumbnailUrl ? (
                          <img src={project.thumbnailUrl} alt="Preview" />
                        ) : (
                          <span className={styles.emptyPreviewText}>---</span>
                        )}
                      </div>
                      <div className={styles.projectTitle}>{project.title}</div>
                    </div>
                  </td>
                )}
                {visibleColumns.includes('Preview') && (
                  <td>
                    <button className={styles.iconBtn} onClick={() => router.push('/play')}>
                      <Eye size={16} />
                    </button>
                  </td>
                )}
                {visibleColumns.includes('Edit') && (
                  <td>
                    <button className={styles.iconBtn} onClick={() => router.push(`/editor?projectId=${project.id}`)}>
                      <Edit2 size={16} />
                    </button>
                  </td>
                )}
                {visibleColumns.includes('Type') && (
                  <td>
                    <div className={styles.projectIcon}>
                      {project.type === 'video' ? <Play size={16} /> : <FileUp size={16} />}
                    </div>
                  </td>
                )}
                {visibleColumns.includes('AI Avatar') && (
                  <td>
                    <div className={styles.assistantCell}>
                      {project.assistantStatus === 'active' ? (
                        <div className={styles.assistantAvatar}>AI</div>
                      ) : (
                        <button className={styles.addAssistantBtn} onClick={() => showToast("Add AI Assistant coming soon", "info")}>
                          <Plus size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                )}
                {visibleColumns.includes('Author') && <td className={styles.dateCell}>info</td>}
                {visibleColumns.includes('Created') && <td className={styles.dateCell}>{project.createdAt}</td>}
                {visibleColumns.includes('Language') && <td className={styles.dateCell}>English</td>}
                {visibleColumns.includes('Courses') && <td className={styles.dateCell}>0</td>}
                {visibleColumns.includes('Enrollments') && <td className={styles.dateCell}>{project.linksCount || 0}</td>}
                {visibleColumns.includes('Script') && <td className={styles.dateCell}>—</td>}
                {visibleColumns.includes('Slides') && <td className={styles.dateCell}>{project.slidesCount || 0}</td>}
                {visibleColumns.includes('Opened') && <td className={styles.dateCell}>{project.views || 0}</td>}
                <td>
                  <div className={styles.gearContainer} onClick={(e) => e.stopPropagation()}>
                    <button
                      className={styles.gearBtn}
                      onClick={() => setActiveGearId(activeGearId === project.id ? null : project.id)}
                    >
                      <Settings size={16} />
                    </button>
                    {activeGearId === project.id && (
                      <div className={styles.gearDropdown}>
                        <button className={styles.gearItem} onClick={() => router.push('/editor')}>
                          <Edit2 size={14} /> Edit
                        </button>
                        <button className={styles.gearItem} onClick={() => { showToast("Train coming soon", "info"); setActiveGearId(null); }}>
                          <GraduationCap size={14} /> Train (Soon)
                        </button>
                        <button className={styles.gearItem} onClick={() => {
                          setShareProjectTitle(project.title);
                          setShareProjectId(project.id);
                          setIsShareModalOpen(true);
                          setActiveGearId(null);
                        }}>
                          <LinkIcon size={14} /> Share/Enroll
                        </button>
                        <button className={styles.gearItem} onClick={() => { showToast("Publish to Marketplace coming soon", "info"); setActiveGearId(null); }}>
                          <Globe size={14} /> Publish to Marketplace (Soon)
                        </button>
                        <button className={styles.gearItem} onClick={() => { showToast("Duplicate action", "info"); setActiveGearId(null); }}>
                          <Copy size={14} /> Duplicate
                        </button>
                        <button className={styles.gearItem} onClick={() => { showToast("Move to folder action", "info"); setActiveGearId(null); }}>
                          <FolderInput size={14} /> Move to folder
                        </button>
                        <button className={styles.gearItem} onClick={() => { showToast("Download action", "info"); setActiveGearId(null); }}>
                          <Download size={14} /> Download
                        </button>
                        <button className={`${styles.gearItem} ${styles.gearItemDelete}`} onClick={() => { showToast("Delete action", "info"); setActiveGearId(null); }}>
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filteredProjects.length === 0 && (
              <tr>
                <td colSpan={visibleColumns.length + 2} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                  No projects found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ShareEnrollModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        projectTitle={shareProjectTitle} 
        projectId={shareProjectId}
      />
    </div>
  )
}
