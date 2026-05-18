'use client'

import React, { useState } from 'react'
import { Info, Hash, Mic, Video, Wand2, Plus } from 'lucide-react'
import { SelectedElement } from './TemplateEditor'
import styles from './PropertiesPanel.module.css'

interface PropertiesPanelProps {
  selectedElement: SelectedElement
  onUpdateElement: (updates: Partial<SelectedElement>) => void
}

type TabType = 'script' | 'about' | 'elements'

export default function PropertiesPanel({ selectedElement, onUpdateElement }: PropertiesPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('script')
  const [scriptText, setScriptText] = useState('')

  if (selectedElement) {
    return (
      <div className={styles.panel}>
        <div className={styles.header}>
          <h3>Control - {selectedElement.type}</h3>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>Параметр</div>
          <div className={styles.paramInputWrapper}>
            <input 
              type="text" 
              className={styles.input} 
              defaultValue="Resulting Presentation Current Slide Text" 
            />
            <Hash size={16} color="#9ca3af" className={styles.paramIcon} />
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>Позиция</div>
          <div className={styles.grid2}>
            <div className={styles.inputGroup}>
              <label>X</label>
              <input 
                type="number" 
                className={styles.input} 
                value={selectedElement.x}
                onChange={e => onUpdateElement({ x: Number(e.target.value) })}
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Y</label>
              <input 
                type="number" 
                className={styles.input} 
                value={selectedElement.y}
                onChange={e => onUpdateElement({ y: Number(e.target.value) })}
              />
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>Размер</div>
          <div className={styles.grid2}>
            <div className={styles.inputGroup}>
              <label>W</label>
              <input 
                type="number" 
                className={styles.input} 
                value={selectedElement.w}
                onChange={e => onUpdateElement({ w: Number(e.target.value) })}
              />
            </div>
            <div className={styles.inputGroup}>
              <label>H</label>
              <input 
                type="number" 
                className={styles.input} 
                value={selectedElement.h}
                onChange={e => onUpdateElement({ h: Number(e.target.value) })}
              />
            </div>
          </div>
        </div>

        {/* Accordions Mock */}
        <div className={styles.accordion}>
          <div className={styles.accordionHeader}>
            <div style={{display: 'flex', gap: 8, alignItems: 'center'}}>
              Текст <Info size={14} color="#9ca3af" />
            </div>
            <Plus size={16} color="#9ca3af" />
          </div>
        </div>
        <div className={styles.accordion}>
          <div className={styles.accordionHeader}>
            <div style={{display: 'flex', gap: 8, alignItems: 'center'}}>
              Шрифт <Info size={14} color="#9ca3af" />
            </div>
            <Plus size={16} color="#9ca3af" />
          </div>
        </div>
        <div className={styles.accordion}>
          <div className={styles.accordionHeader}>
            <div style={{display: 'flex', gap: 8, alignItems: 'center'}}>
              Обводка <Info size={14} color="#9ca3af" />
            </div>
            <Plus size={16} color="#9ca3af" />
          </div>
        </div>
      </div>
    )
  }

  // default state (no selection)
  return (
    <div className={styles.panel}>
      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'script' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('script')}
        >
          Скрипт
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'about' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('about')}
        >
          О нас
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'elements' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('elements')}
        >
          Элементы
        </button>
      </div>

      <div className={styles.tabContent}>
        {activeTab === 'script' && (
          <div className={styles.scriptTab}>
            <div className={styles.sectionTitle}>Скрипт для слайда</div>
            <div className={styles.textareaWrapper}>
              <textarea 
                className={styles.textarea}
                placeholder="Введите описание слайда или позвольте ИИ сгенерировать его для вас"
                value={scriptText}
                onChange={e => setScriptText(e.target.value)}
              />
              <div className={styles.charCount}>{scriptText.length}/20000</div>
            </div>
            <button className={styles.aiBtn}>
              <Wand2 size={16} /> Генерировать текст с помощью ИИ
            </button>

            <div className={styles.mediaRow}>
              <div className={styles.mediaHeader}>Аудио</div>
              <div className={styles.mediaControls}>
                <Mic size={16} color="#9ca3af" />
                <span className={styles.mediaText}>Начать запись</span>
              </div>
              <button className={styles.aiBtnSecondary}>
                <Wand2 size={14} /> Генерировать аудио с помощью AI
              </button>
            </div>

            <div className={styles.mediaRow}>
              <div className={styles.mediaHeader}>Видео</div>
              <div className={styles.mediaControls}>
                <Video size={16} color="#9ca3af" />
                <span className={styles.mediaText}>Начать запись</span>
              </div>
              <button className={styles.aiBtnSecondary}>
                <User size={14} /> Создать аватар с помощью ИИ
              </button>
            </div>
          </div>
        )}

        {activeTab === 'about' && (
          <div className={styles.aboutTab}>
            <div className={styles.inputGroup}>
              <label>Тема слайда</label>
              <input type="text" className={styles.input} />
            </div>
            <div className={styles.inputGroup}>
              <label>Внутренний ID</label>
              <input type="text" className={styles.input} />
            </div>
            <div className={styles.inputGroup}>
              <label>На какой вопрос отвечает слайд?</label>
              <textarea className={styles.textarea} style={{ height: 80 }} placeholder="Введите ответ" />
            </div>
          </div>
        )}

        {activeTab === 'elements' && (
          <div className={styles.elementsTab}>
            <div className={styles.sectionTitle}>Шаблоны</div>
            <div className={styles.sectionTitle}>Ввод текста</div>
            <button className={styles.elementBtn}>Текстовый ввод (область)</button>
            <button className={styles.elementBtn}>Чекбокс</button>
            <button className={styles.elementBtn}>Радиокнопка</button>

            <div className={styles.sectionTitle} style={{marginTop: 16}}>Вывод текста</div>
            <button className={styles.elementBtn}>Текстовый вывод (область)</button>
            <button className={styles.elementBtn}>Изображение</button>
            <button className={styles.elementBtn}>Кнопка</button>
          </div>
        )}
      </div>
    </div>
  )
}

function User(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
}
