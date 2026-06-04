import React, { useState } from 'react'
import styles from './ProjectsTable.module.css'
import { Project } from '@/types'
import { cn } from '@/lib/utils'
import { MoreHorizontal, Link as LinkIcon, Eye, Users, FileUp, FolderInput, Copy, Trash2, Edit2, Play, Plus } from 'lucide-react'
import { useToast } from '@/components/ui/ToastProvider'

interface ProjectsTableProps {
  projects: Project[]
  onBulkDelete?: (ids: string[]) => void
}

export default function ProjectsTable({ projects, onBulkDelete }: ProjectsTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [activeGearId, setActiveGearId] = useState<string | null>(null)
  const { showToast } = useToast()

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
                    <div className={styles.projectTitle}>{project.title}</div>
                  </div>
                </td>
                <td>
                  <div className={styles.previewThumb}>
                    {project.thumbnailUrl ? (
                      <img src={project.thumbnailUrl} alt="Preview" />
                    ) : (
                      <div className={styles.emptyPreview}>No preview</div>
                    )}
                  </div>
                </td>
                <td>
                  <button className={styles.gearBtn} onClick={() => showToast("Edit project coming soon", "info")}>
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
              </tr>
            ))}
            {projects.length === 0 && (
              <tr>
                <td colSpan={14} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                  No projects found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
