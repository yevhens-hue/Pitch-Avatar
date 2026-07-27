'use client'

import React, { useState, useMemo } from 'react'
import { Search, X, FileText, Bot, Presentation } from 'lucide-react'
import { Project } from '@/types'
import styles from './SourceProjectPicker.module.css'

interface SourceProjectPickerProps {
  projects: Project[]
  selectedProjectId: string
  onSelectProject: (id: string) => void
}

export default function SourceProjectPicker({
  projects,
  selectedProjectId,
  onSelectProject,
}: SourceProjectPickerProps) {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('All')
  const [languageFilter, setLanguageFilter] = useState<string>('All')
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 5

  // Map project to display values
  const mappedProjects = useMemo(() => {
    return projects.map((p, idx) => {
      const isAvatar = p.type === 'chat-avatar' || p.isWidget || p.isCoachMode || !!p.metadata?.coachSettings
      const typeLabel: 'Presentation + Avatar' | 'Presentation' = isAvatar ? 'Presentation + Avatar' : 'Presentation'
      
      const lang = idx % 2 === 0 ? 'English' : 'Russian'
      let statusLabel: 'Успешно' | 'В процессе' | 'Ошибка' = 'Успешно'
      if (idx === 2) statusLabel = 'Ошибка'
      if (idx === 3) statusLabel = 'В процессе'

      const dateStr = p.createdAt ? p.createdAt.slice(0, 10) : 'July 24, 2026'

      return {
        ...p,
        typeLabel,
        languageLabel: lang,
        statusLabel,
        dateStr,
      }
    })
  }, [projects])

  // Filtering
  const filteredProjects = useMemo(() => {
    return mappedProjects.filter(p => {
      if (typeFilter !== 'All' && p.typeLabel !== typeFilter) return false
      if (languageFilter !== 'All' && p.languageLabel !== languageFilter) return false
      if (statusFilter !== 'All' && p.statusLabel !== statusFilter) return false
      if (search.trim()) {
        const q = search.toLowerCase().trim()
        if (!p.title.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [mappedProjects, typeFilter, languageFilter, statusFilter, search])

  // Pagination
  const totalCount = filteredProjects.length
  const totalPages = Math.ceil(totalCount / pageSize) || 1
  const validPage = Math.min(currentPage, totalPages)
  const paginatedProjects = useMemo(() => {
    const start = (validPage - 1) * pageSize
    return filteredProjects.slice(start, start + pageSize)
  }, [filteredProjects, validPage, pageSize])

  return (
    <div className={styles.container}>
      {/* Sidebar / Left Info */}
      <div className={styles.sidebar}>
        <h3 className={styles.sidebarTitle}>Исходный проект</h3>
        <p className={styles.sidebarSub}>
          Настройте шаблон и выберите проект, который будет дублироваться.
        </p>
      </div>

      {/* Main Table Area */}
      <div className={styles.mainArea}>
        {/* Top Filters Bar */}
        <div className={styles.filterBar}>
          {/* Search Input */}
          <div className={styles.searchWrap}>
            <Search size={15} className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Поиск"
              value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            />
            {search && (
              <button className={styles.clearSearchBtn} onClick={() => setSearch('')}>
                <X size={13} />
              </button>
            )}
          </div>

          {/* Type Filter */}
          <select
            className={styles.filterSelect}
            value={typeFilter}
            onChange={e => { setTypeFilter(e.target.value); setCurrentPage(1); }}
            aria-label="Фильтр по типу проекта"
          >
            <option value="All">Все типы</option>
            <option value="Presentation">Presentation</option>
            <option value="Presentation + Avatar">Presentation + Avatar</option>
          </select>

          {/* Language Filter */}
          <select
            className={styles.filterSelect}
            value={languageFilter}
            onChange={e => { setLanguageFilter(e.target.value); setCurrentPage(1); }}
            aria-label="Фильтр по языку"
          >
            <option value="All">Язык</option>
            <option value="English">English</option>
            <option value="Russian">Russian</option>
          </select>

          {/* Status Filter */}
          <select
            className={styles.filterSelect}
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            aria-label="Фильтр по статусу"
          >
            <option value="All">Статус</option>
            <option value="Успешно">Успешно</option>
            <option value="В процессе">В процессе</option>
            <option value="Ошибка">Ошибка</option>
          </select>
        </div>

        {/* Table */}
        <div className={styles.tableCard}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: '38%' }}>Проект</th>
                <th style={{ width: '22%' }}>Тип проекта</th>
                <th style={{ width: '12%' }}>Язык</th>
                <th style={{ width: '14%' }}>Статус</th>
                <th style={{ width: '14%' }}>Дата создания</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProjects.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                    Проекты не найдены
                  </td>
                </tr>
              ) : (
                paginatedProjects.map(p => {
                  const isSelected = p.id === selectedProjectId
                  return (
                    <tr
                      key={p.id}
                      className={`${styles.rowSelectable} ${isSelected ? styles.rowActive : ''}`}
                      onClick={() => onSelectProject(p.id)}
                    >
                      {/* Title */}
                      <td>
                        <div className={styles.projectTitleCell}>
                          <div className={styles.fileIcon}>
                            <FileText size={16} />
                          </div>
                          <span>{p.title}</span>
                        </div>
                      </td>

                      {/* Project Type Badge */}
                      <td>
                        {p.typeLabel === 'Presentation + Avatar' ? (
                          <span className={styles.typeBadgeAvatar}>
                            <Bot size={13} /> Presentation + Avatar
                          </span>
                        ) : (
                          <span className={styles.typeBadgePresentation}>
                            <Presentation size={13} /> Presentation
                          </span>
                        )}
                      </td>

                      {/* Language */}
                      <td>{p.languageLabel}</td>

                      {/* Status */}
                      <td>
                        {p.statusLabel === 'Успешно' && (
                          <span className={styles.statusSuccess}>Успешно</span>
                        )}
                        {p.statusLabel === 'В процессе' && (
                          <span className={styles.statusProcessing}>В процессе</span>
                        )}
                        {p.statusLabel === 'Ошибка' && (
                          <span className={styles.statusError}>Ошибка</span>
                        )}
                      </td>

                      {/* Date */}
                      <td>{p.dateStr}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>

          {/* Pagination Bar */}
          <div className={styles.paginationBar}>
            <span>
              {pageSize} на странице / всего {totalCount}
            </span>
            <div className={styles.paginationControls}>
              <button
                className={styles.pageBtn}
                disabled={validPage <= 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              >
                Назад
              </button>
              <span>
                {validPage} / {totalPages}
              </span>
              <button
                className={styles.pageBtn}
                disabled={validPage >= totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              >
                Далее
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
