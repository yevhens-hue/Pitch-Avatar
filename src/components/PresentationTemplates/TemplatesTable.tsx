'use client'

import React, { useState } from 'react'
import { MoreHorizontal, Edit, Trash2, Copy, Filter, LayoutGrid, Maximize, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Image as ImageIcon } from 'lucide-react'
import { PresentationTemplate } from '@/data/presentation-templates'
import styles from './TemplatesTable.module.css'

interface TemplatesTableProps {
  templates: PresentationTemplate[]
  onEdit: (template: PresentationTemplate) => void
  onDelete: (id: string) => void
  onCopy: (template: PresentationTemplate) => void
}

export default function TemplatesTable({ templates, onEdit, onDelete, onCopy }: TemplatesTableProps) {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

  const toggleMenu = (id: string) => {
    setActiveMenuId(activeMenuId === id ? null : id)
  }

  // Calculate pagination
  const totalPages = Math.ceil(templates.length / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const visibleTemplates = templates.slice(startIndex, startIndex + rowsPerPage)

  return (
    <div className={styles.tableContainer}>
      <div className={styles.tableControls}>
        <div className={styles.tableFilters}>
          <button className={styles.iconBtn}><Filter size={18} color="#64748b" /></button>
          <button className={styles.iconBtn}><LayoutGrid size={18} color="#64748b" /></button>
          <button className={styles.iconBtn}><Maximize size={18} color="#64748b" /></button>
        </div>
      </div>

      <div className={styles.tableScroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ width: 60 }}></th>
              <th>Название</th>
              <th>Типы продуктов</th>
              <th>Тип доступа</th>
              <th>Дата создания</th>
              <th>Тип шаблона</th>
              <th style={{ width: 80 }}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {visibleTemplates.map(template => (
              <tr key={template.id}>
                <td className={styles.thumbnailCell}>
                  {template.thumbnailUrl ? (
                    <img src={template.thumbnailUrl} alt={template.name} className={styles.thumbnail} />
                  ) : (
                    <div className={styles.thumbnailPlaceholder}>
                      <ImageIcon size={24} color="#3b82f6" />
                    </div>
                  )}
                </td>
                <td className={styles.nameCell}>{template.name}</td>
                <td>{template.productTypes.join(', ')}</td>
                <td>{template.accessType}</td>
                <td>{template.createdAt}</td>
                <td>{template.templateType}</td>
                <td className={styles.actionsCell}>
                  <button className={styles.actionToggle} onClick={() => toggleMenu(template.id)}>
                    <MoreHorizontal size={20} color="#94a3b8" />
                  </button>
                  {activeMenuId === template.id && (
                    <div className={styles.actionMenu}>
                      <button onClick={() => { onEdit(template); toggleMenu(template.id) }}>
                        <Edit size={16} /> Редактировать
                      </button>
                      <button onClick={() => { onCopy(template); toggleMenu(template.id) }}>
                        <Copy size={16} /> Копировать
                      </button>
                      <button onClick={() => { onDelete(template.id); toggleMenu(template.id) }} className={styles.dangerItem}>
                        <Trash2 size={16} /> Удалить
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {visibleTemplates.length === 0 && (
              <tr>
                <td colSpan={7} className={styles.emptyCell}>Нет шаблонов</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className={styles.pagination}>
        <div className={styles.pageSize}>
          <span>Строк на странице</span>
          <select 
            value={rowsPerPage} 
            onChange={e => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
            className={styles.pageSizeSelect}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
          </select>
        </div>
        
        <div className={styles.pageInfo}>
          {startIndex + 1}-{Math.min(startIndex + rowsPerPage, templates.length)} из {templates.length}
        </div>
        
        <div className={styles.pageControls}>
          <button 
            disabled={currentPage === 1} 
            onClick={() => setCurrentPage(1)}
            className={styles.pageBtn}
          >
            <ChevronsLeft size={18} />
          </button>
          <button 
            disabled={currentPage === 1} 
            onClick={() => setCurrentPage(prev => prev - 1)}
            className={styles.pageBtn}
          >
            <ChevronLeft size={18} />
          </button>
          <button 
            disabled={currentPage === totalPages || totalPages === 0} 
            onClick={() => setCurrentPage(prev => prev + 1)}
            className={styles.pageBtn}
          >
            <ChevronRight size={18} />
          </button>
          <button 
            disabled={currentPage === totalPages || totalPages === 0} 
            onClick={() => setCurrentPage(totalPages)}
            className={styles.pageBtn}
          >
            <ChevronsRight size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
