import React, { useState } from 'react'
import styles from './ProjectsTable.module.css'
import { Project } from '@/types'
import { cn } from '@/lib/utils'
import { MoreHorizontal, Link as LinkIcon, Eye, Users, FileUp, FolderInput, Copy, Trash2, Edit2, Play, Plus, Settings, GraduationCap, Globe, Download, Dumbbell } from 'lucide-react'
import { useToast } from '@/components/ui/ToastProvider'
import { useRouter } from 'next/navigation'
import { deleteProject } from '@/app/actions/projects'
import ShareEnrollModal from '../ShareEnrollModal/ShareEnrollModal'
import { useUIStore } from '@/lib/store'
import { useAuth } from '@/context/AuthContext'
import { trackActivationEvent } from '@/lib/stonly'
import { ProjectType } from '@/types'

const PROJECT_COLUMNS = [
  { id: 'Project', label: 'Project', defaultVisible: true, required: true },
  { id: 'Preview', label: 'Preview', defaultVisible: true, required: false },
  { id: 'Edit', label: 'Edit', defaultVisible: false, required: false },
  { id: 'Type', label: 'Type', defaultVisible: true, required: false },
  { id: 'Mode', label: 'Mode', defaultVisible: true, required: false },
  { id: 'AI Avatar', label: 'AI Avatar', defaultVisible: true, required: false },
  { id: 'Author', label: 'Author', defaultVisible: true, required: false },
  { id: 'Date', label: 'Date', defaultVisible: true, required: false },
  { id: 'Language', label: 'Language', defaultVisible: true, required: false },
  { id: 'Status', label: 'Status', defaultVisible: true, required: false },
  { id: 'Script', label: 'Script', defaultVisible: false, required: false },
  { id: 'Slides', label: 'Slides', defaultVisible: false, required: false },
  { id: 'Enrollments', label: 'Attendees', defaultVisible: false, required: false },
]

interface ProjectsTableProps {
  projects: Project[]
  onBulkDelete?: (ids: string[]) => void
}

export default function ProjectsTable({ projects, onBulkDelete }: ProjectsTableProps) {
  const { isFutureVersion, activeSkinDomain } = useUIStore()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [activeGearId, setActiveGearId] = useState<string | null>(null)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [shareProjectTitle, setShareProjectTitle] = useState('')
  const [shareProjectId, setShareProjectId] = useState('')
  const [shareProjectType, setShareProjectType] = useState<ProjectType | undefined>(undefined)
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { user } = useAuth()
  const { showToast } = useToast()
  const router = useRouter()

  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'my' | 'shared'>('my')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [typeFilter, setTypeFilter] = useState('Project Type')
  const [showTypeDropdown, setShowTypeDropdown] = useState(false)
  const [modeFilter, setModeFilter] = useState('Mode')
  const [showModeDropdown, setShowModeDropdown] = useState(false)
  const [languageFilter, setLanguageFilter] = useState('Language')
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false)
  const [dateFilter, setDateFilter] = useState('Date')
  const [showDateDropdown, setShowDateDropdown] = useState(false)
  const [authorFilter, setAuthorFilter] = useState('Author')
  const [showAuthorDropdown, setShowAuthorDropdown] = useState(false)
  const [statusFilter, setStatusFilter] = useState('Status')
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)

  const [showFiltersBar, setShowFiltersBar] = useState(false)
  const [showColumnsDropdown, setShowColumnsDropdown] = useState(false)
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    PROJECT_COLUMNS.filter(c => c.defaultVisible).map(c => c.id)
  )

  const resetColumnsToDefault = () => {
    setVisibleColumns(PROJECT_COLUMNS.filter(c => c.defaultVisible).map(c => c.id))
  }

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

  const filteredProjects = projects.filter(project => {
    if (typeFilter !== 'Project Type' && typeFilter !== 'All types' && project.type !== (typeFilter === 'Video' ? 'video' : 'presentation')) return false;
    if (modeFilter !== 'Mode' && modeFilter !== 'All modes') {
      const isCoach = project.isCoachMode === true;
      if (modeFilter === 'Coach' && !isCoach) return false;
      if (modeFilter === 'Standard' && isCoach) return false;
    }
    if (languageFilter !== 'Language' && languageFilter !== 'All languages' && 'English' !== languageFilter) return false;
    // Status, Date, Author filtering mock logic can go here
    if (searchQuery && !project.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredProjects.length / pageSize) || 1;
  const paginatedProjects = filteredProjects.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className={styles.tableCard}>
      <div className={styles.tableTabs}>
        <div className={styles.tabGroup}>
          <button 
            className={cn(styles.tab, activeTab === 'my' && styles.activeTab)}
            onClick={() => setActiveTab('my')}
          >
            My Projects
          </button>
          <button 
            className={cn(styles.tab, activeTab === 'shared' && styles.activeTab)} 
            onClick={() => { setActiveTab('shared'); showToast("Shared projects view coming soon", "info") }}
          >
            Shared with me
          </button>
        </div>
        <div className={styles.tabGroupRight}>
          <button className={cn(styles.filterBtn, showFiltersBar && styles.activeFilterBtn)} onClick={() => setShowFiltersBar(!showFiltersBar)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
            </svg>
            Filters
          </button>
          
          <div className={styles.dropdownContainer}>
            <button className={cn(styles.filterBtn, showColumnsDropdown && styles.activeFilterBtn)} onClick={() => setShowColumnsDropdown(!showColumnsDropdown)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="9" y1="3" x2="9" y2="21"></line>
              </svg>
              Columns
            </button>
            {showColumnsDropdown && (
              <div className={styles.dropdownPopover} style={{ right: 0, left: 'auto', width: '280px', padding: '16px 0 8px 0' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '0 16px' }}>
                  {PROJECT_COLUMNS.map(col => (
                    <label key={col.id} className={styles.toggleLabel} style={{ cursor: col.required ? 'not-allowed' : 'pointer' }}>
                      <div className={cn(styles.toggleSwitch, visibleColumns.includes(col.id) && styles.toggleSwitchActive, col.required && styles.toggleSwitchDisabled)}>
                        <input
                          type="checkbox"
                          className={styles.hiddenCheckbox}
                          checked={visibleColumns.includes(col.id)}
                          disabled={col.required}
                          onChange={(e) => {
                            if (col.required) return;
                            if (e.target.checked) setVisibleColumns([...visibleColumns, col.id])
                            else setVisibleColumns(visibleColumns.filter(id => id !== col.id))
                          }}
                        />
                        <span className={styles.toggleKnob}></span>
                      </div>
                      <span className={styles.toggleText}>{col.label}</span>
                    </label>
                  ))}
                </div>
                <div className={styles.dropdownDivider}></div>
                <button 
                  className={styles.resetColumnsBtn}
                  onClick={resetColumnsToDefault}
                >
                  Reset to default
                </button>
              </div>
            )}
          </div>
          
          <button className={styles.filterBtn} onClick={() => showToast("Expand view coming soon", "info")}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"></path>
            </svg>
            Expand
          </button>
        </div>
      </div>

      {showFiltersBar && (
        <div className={styles.filtersBar}>
          <div className={styles.searchWrapper}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>

          <div className={styles.dropdownContainer}>
            <button className={styles.dropdownBtn} onClick={() => { setShowTypeDropdown(!showTypeDropdown); setShowLanguageDropdown(false); setShowDateDropdown(false); setShowAuthorDropdown(false); setShowStatusDropdown(false); setShowModeDropdown(false); }}>
              <span>{typeFilter}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            {showTypeDropdown && (
              <div className={styles.dropdownPopover}>
                {['All types', 'Video', 'Presentation'].map(type => (
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
            <button className={styles.dropdownBtn} onClick={() => { setShowModeDropdown(!showModeDropdown); setShowTypeDropdown(false); setShowLanguageDropdown(false); setShowDateDropdown(false); setShowAuthorDropdown(false); setShowStatusDropdown(false); }}>
              <span>{modeFilter}</span>
              {modeFilter === 'Mode' && <span className={styles.newBadge}>NEW</span>}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            {showModeDropdown && (
              <div className={styles.dropdownPopover}>
                {['All modes', 'Coach', 'Standard'].map(mode => (
                  <button
                    key={mode}
                    className={cn(styles.dropdownItem, modeFilter === mode && styles.dropdownItemActive)}
                    onClick={() => { setModeFilter(mode); setShowModeDropdown(false); }}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className={styles.dropdownContainer}>
            <button className={styles.dropdownBtn} onClick={() => { setShowDateDropdown(!showDateDropdown); setShowTypeDropdown(false); setShowLanguageDropdown(false); setShowAuthorDropdown(false); setShowStatusDropdown(false); setShowModeDropdown(false); }}>
              <span>{dateFilter}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            {showDateDropdown && (
              <div className={styles.dropdownPopover}>
                {['All time', 'Last week', 'Last month'].map(dt => (
                  <button
                    key={dt}
                    className={cn(styles.dropdownItem, dateFilter === dt && styles.dropdownItemActive)}
                    onClick={() => { setDateFilter(dt); setShowDateDropdown(false); }}
                  >
                    {dt}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className={styles.dropdownContainer}>
            <button className={styles.dropdownBtn} onClick={() => { setShowAuthorDropdown(!showAuthorDropdown); setShowTypeDropdown(false); setShowLanguageDropdown(false); setShowDateDropdown(false); setShowStatusDropdown(false); setShowModeDropdown(false); }}>
              <span>{authorFilter}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            {showAuthorDropdown && (
              <div className={styles.dropdownPopover}>
                {['All authors', 'Mine', 'Others'].map(auth => (
                  <button
                    key={auth}
                    className={cn(styles.dropdownItem, authorFilter === auth && styles.dropdownItemActive)}
                    onClick={() => { setAuthorFilter(auth); setShowAuthorDropdown(false); }}
                  >
                    {auth}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className={styles.dropdownContainer}>
            <button className={styles.dropdownBtn} onClick={() => { setShowLanguageDropdown(!showLanguageDropdown); setShowTypeDropdown(false); setShowDateDropdown(false); setShowAuthorDropdown(false); setShowStatusDropdown(false); setShowModeDropdown(false); }}>
              <span>{languageFilter}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            {showLanguageDropdown && (
              <div className={styles.dropdownPopover}>
                {['All languages', 'English', 'Spanish', 'French'].map(lang => (
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

          <div className={styles.dropdownContainer}>
            <button className={styles.dropdownBtn} onClick={() => { setShowStatusDropdown(!showStatusDropdown); setShowTypeDropdown(false); setShowLanguageDropdown(false); setShowDateDropdown(false); setShowAuthorDropdown(false); setShowModeDropdown(false); }}>
              <span>{statusFilter}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            {showStatusDropdown && (
              <div className={styles.dropdownPopover}>
                {['All statuses', 'Active', 'Archived'].map(st => (
                  <button
                    key={st}
                    className={cn(styles.dropdownItem, statusFilter === st && styles.dropdownItemActive)}
                    onClick={() => { setStatusFilter(st); setShowStatusDropdown(false); }}
                  >
                    {st}
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
              {isFutureVersion && (
                <th style={{ width: '40px' }}>
                  <input 
                    type="checkbox"
                    className={styles.checkbox}
                    checked={projects.length > 0 && selectedIds.length === projects.length}
                    onChange={toggleAll}
                  />
                </th>
              )}
              {visibleColumns.includes('Project') && <th>Project</th>}
              {visibleColumns.includes('Preview') && <th>Preview</th>}
              {visibleColumns.includes('Edit') && <th>Edit</th>}
              {visibleColumns.includes('Type') && <th>Type</th>}
              {visibleColumns.includes('Mode') && <th>Mode <span className={styles.newBadge}>NEW</span></th>}
              {visibleColumns.includes('AI Avatar') && <th>AI Avatar</th>}
              {visibleColumns.includes('Author') && <th>Author</th>}
              {visibleColumns.includes('Date') && <th>Date</th>}
              {visibleColumns.includes('Language') && <th>Language</th>}
              {visibleColumns.includes('Status') && <th>Status</th>}
              {visibleColumns.includes('Script') && <th>Script</th>}
              {visibleColumns.includes('Slides') && <th>Slides</th>}
              {visibleColumns.includes('Enrollments') && <th>Attendees</th>}
              <th style={{ width: '40px' }}></th>
            </tr>
          </thead>
          <tbody>
            {paginatedProjects.map(project => (
              <tr key={project.id} className={selectedIds.includes(project.id) ? styles.selectedRow : ''} onClick={() => router.push(`/editor?projectId=${project.id}`)}>
                {isFutureVersion && (
                  <td onClick={(e) => e.stopPropagation()}>
                    <input 
                      type="checkbox"
                      className={styles.checkbox}
                      checked={selectedIds.includes(project.id)}
                      onChange={() => toggleOne(project.id)}
                    />
                  </td>
                )}
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
                      <div className={styles.projectTitle}>
                        {project.title}
                      </div>
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
                    <div className={styles.projectIcon} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {project.type === 'video' ? <Play size={16} /> : <FileUp size={16} />}
                    </div>
                  </td>
                )}
                {visibleColumns.includes('Mode') && (
                  <td className={styles.modeCell}>
                    {project.isCoachMode ? (
                      <span title="Coach Mode" className={styles.coachModeBadge}>
                        <Dumbbell size={14} /> Coach
                      </span>
                    ) : '—'}
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
                {visibleColumns.includes('Date') && <td className={styles.dateCell}>{project.createdAt}</td>}
                {visibleColumns.includes('Language') && <td className={styles.dateCell}>English</td>}
                {visibleColumns.includes('Status') && <td className={styles.dateCell}>
                  <div className={styles.statusActive}>Active</div>
                </td>}
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
                        {activeSkinDomain === 'hr' ? (
                          <button className={styles.gearItem} onClick={() => {
                            setShareProjectTitle(project.title);
                            setShareProjectId(project.id);
                            setShareProjectType(project.type);
                            setIsShareModalOpen(true);
                            setActiveGearId(null);
                          }}>
                            <Users size={14} /> Enrollment
                          </button>
                        ) : (
                          <>
                            <button className={styles.gearItem} onClick={() => {
                              setShareProjectTitle(project.title);
                              setShareProjectId(project.id);
                              setShareProjectType(project.type);
                              setIsShareModalOpen(true);
                              setActiveGearId(null);
                            }}>
                              <LinkIcon size={14} /> Share Link
                            </button>
                            <button className={styles.gearItem} onClick={() => {
                              setShareProjectTitle(project.title);
                              setShareProjectId(project.id);
                              setShareProjectType(project.type);
                              setIsShareModalOpen(true);
                              setActiveGearId(null);
                            }}>
                              <Users size={14} /> Enrollment
                            </button>
                          </>
                        )}
                        <button className={styles.gearItem} onClick={() => { showToast("Publish to Marketplace coming soon", "info"); setActiveGearId(null); }}>
                          <Globe size={14} /> Publish to Marketplace (Soon)
                        </button>
                        <button className={styles.gearItem} onClick={() => { showToast("Duplicate action", "info"); setActiveGearId(null); }}>
                          <Copy size={14} /> Duplicate
                        </button>
                        <button className={styles.gearItem} onClick={() => { showToast("Move to folder action", "info"); setActiveGearId(null); }}>
                          <FolderInput size={14} /> Move to folder
                        </button>
                        <button className={styles.gearItem} onClick={() => {
                          showToast("Download action", "info");
                          setActiveGearId(null);
                          if (project.type === 'video') {
                            const isLocGoal = user?.user_metadata?.main_goal === 'dub_or_translate_my_video' || user?.user_metadata?.goal === 'dub_or_translate_my_video';
                            if (isLocGoal) {
                              trackActivationEvent('tour_loc_download', user?.id, user?.user_metadata?.main_goal);
                            }
                          }
                        }}>
                          <Download size={14} /> Download
                        </button>
                        <button className={`${styles.gearItem} ${styles.gearItemDelete}`} onClick={() => { 
                          setProjectToDelete(project);
                          setActiveGearId(null); 
                        }}>
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

      <div className={styles.pagination}>
        <div className={styles.pageControls}>
          <button 
            className={styles.pageBtn} 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
            Back
          </button>
          
          <div className={styles.pageNumbers}>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button 
                key={i} 
                className={cn(styles.pageNum, currentPage === i + 1 && styles.activePageNum)}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button 
            className={styles.pageBtn}
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          >
            Next
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>

        <div className={styles.pageSizeControl}>
          <span>Rows per page</span>
          <div className={styles.pageSizeSelect}>
            <select 
              value={pageSize} 
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      <ShareEnrollModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        projectTitle={shareProjectTitle} 
        projectId={shareProjectId}
        projectType={shareProjectType}
      />

      {projectToDelete && (
        <div className={styles.modalOverlay} onClick={() => !isDeleting && setProjectToDelete(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Delete project?</h3>
            <p className={styles.modalDescription}>
              Are you sure you want to delete the project <strong>&quot;{projectToDelete.title}&quot;</strong>? This action cannot be undone.
            </p>
            <div className={styles.modalActions}>
              <button 
                className={styles.cancelBtn} 
                onClick={() => setProjectToDelete(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button 
                className={styles.confirmDeleteBtn} 
                onClick={async () => {
                  setIsDeleting(true);
                  try {
                    await deleteProject(projectToDelete.id);
                    showToast("Project successfully deleted", "success");
                    window.location.reload();
                  } catch (e) {
                    showToast("Error while deleting", "error");
                    setIsDeleting(false);
                    setProjectToDelete(null);
                  }
                }}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
