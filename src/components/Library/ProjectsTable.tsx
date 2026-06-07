import React, { useState } from 'react'
import styles from './ProjectsTable.module.css'
import { Project } from '@/types'
import { cn } from '@/lib/utils'
import { MoreHorizontal, Link as LinkIcon, Eye, Users, FileUp, FolderInput, Copy, Trash2, Edit2, Play, Plus, Settings, GraduationCap, Globe, Download } from 'lucide-react'
import { useToast } from '@/components/ui/ToastProvider'
import { useRouter } from 'next/navigation'
import ShareEnrollModal from '../ShareEnrollModal/ShareEnrollModal'

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

  return (
    <div className={styles.tableCard}>
      <div className={styles.tableTabs}>
        <div className={styles.tabGroup}>
          <button className={cn(styles.tab, styles.activeTab)}>My projects</button>
          <button className={styles.tab} onClick={() => showToast("Shared projects view coming soon", "info")}>Shared with me</button>
        </div>
        <div className={styles.tabGroupRight}>
          <button className={styles.filterBtn} onClick={() => showToast("Filters coming soon", "info")}>Filters</button>
          <button className={styles.filterBtn} onClick={() => showToast("Column settings coming soon", "info")}>Columns</button>
          <button className={styles.filterBtn} onClick={() => showToast("Expand view coming soon", "info")}>Expand</button>
        </div>
      </div>

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
              <th>Project</th>
              <th>Preview</th>
              <th>Edit</th>
              <th>Type</th>
              <th>AI Avatar</th>
              <th>Author</th>
              <th>Created</th>
              <th>Language</th>
              <th>Courses</th>
              <th>Enrollments</th>
              <th>Script</th>
              <th>Slides</th>
              <th>Opened</th>
              <th style={{ width: '40px' }}></th>
            </tr>
          </thead>
          <tbody>
            {projects.map(project => (
              <tr key={project.id} className={selectedIds.includes(project.id) ? styles.selectedRow : ''}>
                <td>
                  <input 
                    type="checkbox"
                    className={styles.checkbox}
                    checked={selectedIds.includes(project.id)}
                    onChange={() => toggleOne(project.id)}
                  />
                </td>
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
                <td>
                  <button className={styles.iconBtn} onClick={() => router.push('/play')}>
                    <Eye size={16} />
                  </button>
                </td>
                <td>
                  <button className={styles.iconBtn} onClick={() => router.push(`/editor?projectId=${project.id}`)}>
                    <Edit2 size={16} />
                  </button>
                </td>
                <td>
                  <div className={styles.projectIcon}>
                    {project.type === 'video' ? <Play size={16} /> : <FileUp size={16} />}
                  </div>
                </td>
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
                <td className={styles.dateCell}>info</td>
                <td className={styles.dateCell}>{project.createdAt}</td>
                <td className={styles.dateCell}>English</td>
                <td className={styles.dateCell}>0</td>
                <td className={styles.dateCell}>{project.linksCount || 0}</td>
                <td className={styles.dateCell}>—</td>
                <td className={styles.dateCell}>{project.slidesCount || 0}</td>
                <td className={styles.dateCell}>{project.views || 0}</td>
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
            {projects.length === 0 && (
              <tr>
                <td colSpan={15} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
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
