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
    <div className={styles.tableContainer}>
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
                  checked={projects.length > 0 && selectedIds.length === projects.length}
                  onChange={toggleAll}
                />
              </th>
              <th>PROJECT</th>
              <th>PREVIEW</th>
              <th>ASSISTANT</th>
              <th>LINKS</th>
              <th>ANALYTICS</th>
              <th style={{ width: '60px' }}>SETTINGS</th>
              <th>CREATED</th>
            </tr>
          </thead>
          <tbody>
            {projects.map(project => (
              <tr key={project.id} className={selectedIds.includes(project.id) ? styles.selectedRow : ''}>
                <td>
                  <input 
                    type="checkbox" 
                    checked={selectedIds.includes(project.id)}
                    onChange={() => toggleOne(project.id)}
                  />
                </td>
                <td>
                  <div className={styles.projectInfo}>
                    <div className={styles.projectIcon}>
                      {project.type === 'video' ? <Play size={16} /> : <FileUp size={16} />}
                    </div>
                    <div>
                      <div className={styles.projectTitle}>{project.title}</div>
                      <div className={styles.projectMeta}>
                        {project.slidesCount ? `${project.slidesCount} slides` : project.duration ? project.duration : '0 slides'}
                      </div>
                    </div>
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
                <td>
                  <div className={styles.linksCell}>
                    <LinkIcon size={14} />
                    <span>{project.linksCount || 0}</span>
                  </div>
                </td>
                <td>
                  <div className={styles.analyticsCell}>
                    <div className={styles.stat}>
                      <Eye size={14} /> {project.views || 0}
                    </div>
                    <div className={styles.stat}>
                      <Users size={14} /> {project.leads || 0}
                    </div>
                  </div>
                </td>
                <td>
                  <button className={styles.settingsBtn} onClick={() => showToast("Project settings coming soon", "info")}>
                    <MoreHorizontal size={16} />
                  </button>
                </td>
                <td className={styles.dateCell}>
                  {project.createdAt}
                </td>
              </tr>
            ))}
            {projects.length === 0 && (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
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
