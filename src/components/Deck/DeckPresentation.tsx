'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, FileText, Volume2, Maximize2 } from 'lucide-react'
import styles from './DeckPresentation.module.css'

/* ─────────────────────────────── Speaker notes ── */
const NOTES = [
  `Всем привет! Я уже почти месяц в команде, двигаюсь строго по онбординг-плану. Сегодня я покажу свои наработки и предложения на оставшийся срок. Изучив продукт, я пришел к выводу: наш следующий фокус — Retention (Удержание). Но чтобы пользователи возвращались, нам нужно начать с первой секунды их знакомства с продуктом.`,
  `Я провел глубокий анализ рынка и воронки лидеров (HeyGen, Synthesia, Colossyan). Что они делают? Жесткая квалификация на входе. Success Checklists (сквозные виджеты). Early Social Loops (приглашение коллег сразу). Я взял эти Quick Wins за основу для нашего нового онбординга.`,
  `Мы внедрили 5 JTBD-сценариев (Stonly + Guideglow). Система теперь ведет пользователя за руку к его Aha-моменту. В планах: Итерация 2 (7-10 готовых шаблонов как у HeyGen) и Итерация 3 (динамическая конфигурация интерфейса под цель клиента).`,
  `Активация — это начало. Для роста я предлагаю: внедрить Карту метрик (Metric Map), построить детальный CJM (убрать барьеры после первой сессии) и внедрить Social Loops (приглашение коллег), что кардинально снижает отток.`,
  `По анализу: мы настроили трекинг в PostHog. Мой план: провести 7-9 глубинных интервью (JTBD), сопоставить их с записями Hotjar и выявить реальные барьеры для декомпозиции в задачи.`,
  `HR Learning — наше сильное преимущество. Я проведу серию юзер-тестов на базе макетов Павла. Результатом станет проработанный Agile-эпик с четкими DoD, готовый к разработке.`,
  `Все инициативы сведены в единый приоритезированный план. К концу испытательного срока мы зафиксируем изменения по воронке активации в PostHog. Улучшение метрик — главный KPI. Спасибо! Готов ответить на вопросы.`,
]

const TOTAL = 7

export default function DeckPresentation() {
  const [slide, setSlide]       = useState(0)
  const [showNotes, setNotes]   = useState(false)
  const [isFullscreen, setFs]   = useState(false)

  const prev = useCallback(() => setSlide(s => Math.max(0, s - 1)), [])
  const next = useCallback(() => setSlide(s => Math.min(TOTAL - 1, s + 1)), [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') next()
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')  prev()
      if (e.key === 'n' || e.key === 'N') setNotes(v => !v)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [next, prev])

  const toggleFs = () => {
    if (!isFullscreen) document.documentElement.requestFullscreen?.()
    else               document.exitFullscreen?.()
    setFs(v => !v)
  }

  return (
    <div className={styles.root}>
      {/* Top bar */}
      <div className={styles.topBar}>
        <div className={styles.brand}>
          <div className={styles.brandDot} />
          Pitch Avatar · CEO Update
        </div>
        <div className={styles.topControls}>
          <span className={styles.counterBadge}>{slide + 1} / {TOTAL}</span>
          <button
            className={`${styles.iconBtn} ${showNotes ? styles.iconBtnActive : ''}`}
            onClick={() => setNotes(v => !v)}
            title="Speaker notes (N)"
          >
            <FileText size={14} />
          </button>
          <button className={styles.iconBtn} title="Audio (coming soon)">
            <Volume2 size={14} />
          </button>
          <button className={styles.iconBtn} onClick={toggleFs} title="Fullscreen">
            <Maximize2 size={14} />
          </button>
        </div>
      </div>

      {/* Slide viewport */}
      <div className={styles.viewport}>
        <div className={styles.slide} key={slide}>
          {slide === 0 && <Slide1 />}
          {slide === 1 && <Slide2 />}
          {slide === 2 && <Slide3 />}
          {slide === 3 && <Slide4 />}
          {slide === 4 && <Slide5 />}
          {slide === 5 && <Slide6 />}
          {slide === 6 && <Slide7 />}
        </div>
      </div>

      {/* Nav dots */}
      <div className={styles.navRow}>
        <button className={styles.navBtn + ' ' + styles.navBtnPrev} onClick={prev} disabled={slide === 0}>
          <ChevronLeft size={16} />
        </button>
        {Array.from({ length: TOTAL }).map((_, i) => (
          <button
            key={i}
            className={`${styles.navDot} ${i === slide ? styles.navDotActive : ''}`}
            onClick={() => setSlide(i)}
          />
        ))}
        <button className={styles.navBtn + ' ' + styles.navBtnNext} onClick={next} disabled={slide === TOTAL - 1}>
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Speaker notes */}
      {showNotes && (
        <div className={styles.notesPanel}>
          <div className={styles.notesLabel}>🎤 Speaker Notes</div>
          <div className={styles.notesText}>{NOTES[slide]}</div>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════ SLIDE 1 ══════════ */
function Slide1() {
  return (
    <div className={styles.themeHero} style={{ height: '100%' }}>
      <div className={styles.heroLeft}>
        <div className={styles.slideTag}>CEO Update · Апрель 2026</div>
        <h1 className={`${styles.slideTitle} ${styles.slideTitleHero}`}>
          Первый месяц<br />в Pitch Avatar:<br />
          <span style={{ color: '#818cf8' }}>Идем по плану</span>
        </h1>
        <p className={styles.slideSubtitle}>
          Отчет по онбординг-плану и предложение по стратегии Retention
        </p>
        <div className={styles.chips}>
          <span className={styles.chip}>Product Strategy</span>
          <span className={styles.chip}>Competitor Analysis</span>
          <span className={styles.chip}>Agile Delivery</span>
        </div>
      </div>
      <div className={styles.heroRight}>
        <div className={styles.photoPlaceholder}>👤</div>
        <div className={styles.speakerName}>Женя Шафоростов</div>
        <div className={styles.speakerRole}>Product Manager</div>
        <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          {['Онбординг-план: ✅ выполнен', 'Стратегия: Retention First', 'Срок: Q2–Q3 2026'].map(t => (
            <div key={t} style={{ fontSize: '0.6em', color: '#94a3b8', textAlign: 'center' }}>{t}</div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════ SLIDE 2 ══════════ */
const Q_DOTS = [
  { label: 'Квалификация\n(HeyGen)', x: 30, y: 80, color: '#f59e0b', bg: 'rgba(245,158,11,0.2)', size: 14 },
  { label: 'Checklists\n(Colossyan)', x: 40, y: 90, color: '#22c55e', bg: 'rgba(34,197,94,0.2)', size: 13 },
  { label: 'Social Loops\n(Elai.io)',   x: 50, y: 70, color: '#a78bfa', bg: 'rgba(167,139,250,0.2)', size: 12 },
  { label: 'Interactivity\n(Our USP)',  x: 80, y: 90, color: '#6366f1', bg: 'rgba(99,102,241,0.3)', size: 16 },
]
function Slide2() {
  return (
    <div className={styles.themeAccent} style={{ height: '100%' }}>
      <div className={styles.slideTag}>Слайд 2 · Анализ рынка</div>
      <h2 className={`${styles.slideTitle} ${styles.slideTitleHero}`} style={{ fontSize: '1.6em' }}>
        Анализ лидеров рынка и Quick Wins
      </h2>
      <div className={styles.cols} style={{ flex: 1, overflow: 'hidden' }}>
        {/* Quadrant */}
        <div className={styles.quadrant} style={{ flex: 1.2 }}>
          <div className={styles.quadrantAxisX} />
          <div className={styles.quadrantAxisY} />
          <div className={`${styles.quadrantLabel} ${styles.qLabelTopRight}`}>
            🎯 Фокус: Pitch Avatar
          </div>
          <div className={`${styles.quadrantLabel} ${styles.qLabelTopLeft}`}>
            🏆 Лидеры: HeyGen, Synthesia
          </div>
          <div className={`${styles.quadrantLabel} ${styles.qLabelBottomLeft}`}>
            🔧 Утилиты: Akool
          </div>
          <div className={`${styles.quadrantLabel} ${styles.qLabelBottomRight}`}>
            🎪 Нишевые: D-ID
          </div>
          <div className={styles.qAxisLabelX}>Низкая сложность → Высокая</div>
          <div className={styles.qAxisLabelY}>Ценность ↑</div>
          {Q_DOTS.map(d => (
            <div
              key={d.label}
              className={styles.qDot}
              style={{
                left: `${d.x}%`,
                bottom: `${d.y - 12}%`,
                width: d.size,
                height: d.size,
                background: d.bg,
                border: `2px solid ${d.color}`,
              }}
            >
              <span className={styles.qDotLabel} style={{ color: d.color }}>
                {d.label.split('\n')[0]}
              </span>
            </div>
          ))}
        </div>
        {/* Bullets */}
        <div className={styles.col}>
          <p style={{ fontSize: '0.7em', fontWeight: 700, color: '#a5b4fc', marginBottom: '0.3em' }}>
            🏆 Что делают лидеры:
          </p>
          <ul className={styles.bullets}>
            {[
              ['Жесткая квалификация на входе', 'green'],
              ['Success Checklists (сквозные виджеты)', 'green'],
              ['Early Social Loops (приглашение коллег)', 'green'],
              ['Персонализированный онбординг по цели', 'amber'],
              ['Шаблоны под индустрию (7–10 штук)', 'amber'],
            ].map(([text, color]) => (
              <li key={text} className={styles.bullet}>
                <div className={`${styles.bulletDot} ${color === 'amber' ? styles.bulletDotAmber : styles.bulletDotGreen}`} />
                <span style={{ color: '#cbd5e1', fontSize: '0.95em' }}>{text}</span>
              </li>
            ))}
          </ul>
          <div className={styles.divider} />
          <p style={{ fontSize: '0.7em', fontWeight: 700, color: '#a5b4fc', marginTop: '0.3em' }}>
            ✅ Наш ответ — уже в работе:
          </p>
          <ul className={styles.bullets}>
            {['Sara AI Widget (снижает drop-off)', '5 JTBD-сценариев (Stonly)', 'PostHog трекинг настроен'].map(t => (
              <li key={t} className={styles.bullet}>
                <div className={styles.bulletDot} />
                <span style={{ color: '#94a3b8', fontSize: '0.95em' }}>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════ SLIDE 3 ══════════ */
function Slide3() {
  return (
    <div className={styles.themeDark} style={{ height: '100%' }}>
      <div className={styles.slideTag}>Слайд 3 · Activation / Conversion</div>
      <h2 className={`${styles.slideTitle} ${styles.slideTitleDark}`} style={{ fontSize: '1.6em' }}>
        Повышение Activation: Онбординг 2.0
      </h2>
      <div className={styles.cols} style={{ flex: 1 }}>
        {/* Left: bullets */}
        <div className={styles.col}>
          <p style={{ fontSize: '0.65em', fontWeight: 700, color: '#818cf8', marginBottom: '0.4em' }}>
            ✅ Итерация 1 (Готово)
          </p>
          <ul className={styles.bullets}>
            {['5 JTBD-сценариев через Stonly + Guideglow', 'Система ведет пользователя к Aha-моменту', 'Интеграция Sara AI — снижение drop-off на Step 2'].map(t => (
              <li key={t} className={styles.bullet}>
                <div className={`${styles.bulletDot} ${styles.bulletDotGreen}`} />
                <span style={{ color: '#cbd5e1' }}>{t}</span>
              </li>
            ))}
          </ul>
          <div className={styles.divider} />
          <p style={{ fontSize: '0.65em', fontWeight: 700, color: '#f59e0b', marginBottom: '0.4em' }}>
            📌 Итерация 2 (В плане)
          </p>
          <ul className={styles.bullets}>
            {['7–10 готовых шаблонов по индустриям (как HeyGen)', 'Wizard-квалификация цели на входе', 'Social Loop: приглашение коллег'].map(t => (
              <li key={t} className={styles.bullet}>
                <div className={`${styles.bulletDot} ${styles.bulletDotAmber}`} />
                <span style={{ color: '#cbd5e1' }}>{t}</span>
              </li>
            ))}
          </ul>
          <div className={styles.divider} />
          <div className={styles.dropBadge}>📉 Target: -15–20% drop-off on Step 2</div>
        </div>
        {/* Right: Sara mockup */}
        <div className={styles.col} style={{ flex: 0.85 }}>
          <p style={{ fontSize: '0.6em', fontWeight: 700, color: '#94a3b8', marginBottom: '0.3em' }}>
            Sara AI Assistant
          </p>
          <div className={styles.saraMockup}>
            <div className={styles.saraMockupHeader}>
              <div className={styles.saraAvatar}>🎓</div>
              <div>
                <div className={styles.saraMockupName}>Sara</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3em' }}>
                  <div className={styles.saraStatusDot} />
                  <span className={styles.saraMockupStatus}>Ready to help</span>
                </div>
              </div>
              <div style={{ marginLeft: 'auto', fontSize: '0.45em', color: '#475569' }}>Step 1: Upload Slides</div>
            </div>
            <div className={styles.saraMockupBubble}>
              👋 Upload your PDF or PPTX here. You can also import from Canva or Google Slides — just click the source card below.
            </div>
            <div className={styles.saraMockupChips}>
              {['What formats work?', 'Max file size?', 'Can I use Google Slides?'].map(c => (
                <span key={c} className={styles.saraMockupChip}>{c}</span>
              ))}
            </div>
            <div className={styles.saraMockupInput}>
              <span className={styles.saraMockupPlaceholder}>Ask Sara anything…</span>
              <div className={styles.saraSendBtn} />
            </div>
          </div>
          <div className={styles.highlightGrid} style={{ marginTop: '0.5em' }}>
            {[
              ['🎤 Voice & TTS', 'Голосовое сопровождение + Speech API'],
              ['💬 Context Aware', 'Подсказки меняются по шагу'],
              ['🔄 Persistent Chips', 'Не исчезают после клика'],
              ['📌 Drag & Move', 'Можно перетащить виджет'],
            ].map(([title, body]) => (
              <div key={title} className={styles.highlightCard}>
                <div className={styles.highlightCardTitle}>{title}</div>
                <div className={styles.highlightCardBody}>{body}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════ SLIDE 4 ══════════ */
function Slide4() {
  return (
    <div className={styles.themeAccent} style={{ height: '100%' }}>
      <div className={styles.slideTag}>Слайд 4 · Retention</div>
      <h2 className={`${styles.slideTitle} ${styles.slideTitleHero}`} style={{ fontSize: '1.6em' }}>
        Стратегия Удержания (Retention)
      </h2>
      {/* Metric map */}
      <div className={styles.statsRow}>
        {[
          { v: 'Metric Map', l: 'Карта метрик активации' },
          { v: 'CJM', l: 'Customer Journey (детальный)' },
          { v: 'Social Loop', l: 'Приглашение коллег' },
          { v: '-40%', l: 'Снижение оттока (цель)' },
        ].map(s => (
          <div key={s.v} className={styles.statCard}>
            <div className={styles.statValue}>{s.v}</div>
            <div className={styles.statLabel}>{s.l}</div>
          </div>
        ))}
      </div>
      {/* CJM */}
      <div style={{ fontSize: '0.65em', fontWeight: 700, color: '#a5b4fc', marginTop: '0.5em' }}>
        CJM Fragment — Customer Journey Map
      </div>
      <div className={styles.cjm}>
        <div className={styles.cjmNode}>
          <div className={`${styles.cjmBox} ${styles.cjmBoxBlue}`}>Setup</div>
        </div>
        <div className={styles.cjmArrow}>→</div>
        <div className={styles.cjmNode}>
          <div className={`${styles.cjmBox} ${styles.cjmBoxGreen}`}>Aha! Moment:<br/>Preview</div>
        </div>
        <div className={styles.cjmArrow}>
          <div>→</div>
          <div className={styles.cjmArrowLabel}>Yes</div>
        </div>
        <div className={styles.cjmNode}>
          <div className={`${styles.cjmBox} ${styles.cjmBoxPurple}`}>Value?<br/>Share Link</div>
        </div>
        <div className={styles.cjmArrow}>→</div>
        <div className={styles.cjmNode}>
          <div className={`${styles.cjmBox} ${styles.cjmBoxGreen}`}>1st View:<br/>Activation</div>
        </div>
        <div className={styles.cjmArrow}>→</div>
        <div className={styles.cjmNode}>
          <div className={`${styles.cjmBox} ${styles.cjmBoxGreen}`}>Returning:<br/>Retention</div>
        </div>
        <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', left: '43%', bottom: '18%' }}>
          <div className={styles.cjmArrowLabelRed}>No</div>
          <div style={{ fontSize: '0.6em', color: '#f87171' }}>↓</div>
          <div className={`${styles.cjmBox} ${styles.cjmBoxRed}`} style={{ position: 'static' }}>Drop-off</div>
        </div>
      </div>
      <div className={styles.divider} />
      <ul className={styles.bullets} style={{ marginTop: '0.3em' }}>
        {[
          'Внедрить Metric Map для PostHog — отслеживать Activation Rate & DAU',
          'CJM детализация: убрать барьеры между Step 2 → Step 3',
          'Social Loops: кнопка "Пригласить коллегу" сразу после Aha-момента',
        ].map((t, i) => (
          <li key={t} className={styles.bullet}>
            <div className={`${styles.bulletDot} ${i === 0 ? '' : i === 1 ? styles.bulletDotAmber : styles.bulletDotGreen}`} />
            <span style={{ color: '#cbd5e1' }}>{t}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ═══════════════════════════ SLIDE 5 ══════════ */
function Slide5() {
  return (
    <div className={styles.themeDark} style={{ height: '100%' }}>
      <div className={styles.slideTag}>Слайд 5 · Research</div>
      <h2 className={`${styles.slideTitle} ${styles.slideTitleDark}`} style={{ fontSize: '1.6em' }}>
        Анализ поведения и JTBD Интервью
      </h2>
      <div className={styles.toolsGrid}>
        {[
          { icon: '📊', name: 'PostHog', desc: 'Трекинг настроен. Воронка активации, session recordings, custom events.' },
          { icon: '🔥', name: 'Hotjar', desc: 'Heatmaps + recordings. Определяем места drop-off и точки фрустрации.' },
          { icon: '🎙️', name: 'JTBD Interviews', desc: '7–9 глубинных интервью. Jobs-To-Be-Done framework, по Боуэру.' },
        ].map(t => (
          <div key={t.name} className={styles.toolCard}>
            <div className={styles.toolIcon}>{t.icon}</div>
            <div className={styles.toolName}>{t.name}</div>
            <div className={styles.toolDesc}>{t.desc}</div>
          </div>
        ))}
      </div>
      <div className={styles.divider} />
      <div className={styles.cols} style={{ flex: 1 }}>
        <div className={styles.col}>
          <p style={{ fontSize: '0.65em', fontWeight: 700, color: '#818cf8', marginBottom: '0.4em' }}>Методология</p>
          <ul className={styles.bullets}>
            {[
              'Jobs-To-Be-Done (Боуэр): «Нанимаем» продукт под конкретную работу',
              '7–9 интервью до конца испытательного срока',
              'Паттерны → декомпозиция в задачи Jira',
              'Верификация гипотез через PostHog данные',
            ].map(t => (
              <li key={t} className={styles.bullet}>
                <div className={styles.bulletDot} />
                <span style={{ color: '#cbd5e1' }}>{t}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className={styles.col}>
          <p style={{ fontSize: '0.65em', fontWeight: 700, color: '#818cf8', marginBottom: '0.4em' }}>Ожидаемые инсайты</p>
          <ul className={styles.bullets}>
            {[
              'Реальные барьеры на Step 2 (Upload → Avatar)',
              'Почему пользователи не возвращаются после первой сессии',
              'Какие шаблоны нужны для HR/Sales/Marketing',
              'Запрос на коллаборацию и Social Features',
            ].map(t => (
              <li key={t} className={styles.bullet}>
                <div className={`${styles.bulletDot} ${styles.bulletDotAmber}`} />
                <span style={{ color: '#94a3b8' }}>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════ SLIDE 6 ══════════ */
function Slide6() {
  return (
    <div className={styles.themeDark} style={{ height: '100%' }}>
      <div className={styles.slideTag}>Слайд 6 · HR Learning</div>
      <h2 className={`${styles.slideTitle} ${styles.slideTitleDark}`} style={{ fontSize: '1.6em' }}>
        Прототип подпродукта: HR Learning
      </h2>
      <div className={styles.agileCards}>
        <div className={styles.agileCard}>
          <div className={styles.agileCardTitle}>🎓 Почему HR Learning?</div>
          <div className={styles.agileCardBody}>
            HR Learning — сильное конкурентное преимущество Pitch Avatar. Интерактивные AI-презентации идеально подходят для корпоративного обучения: онбординг сотрудников, compliance-тренинги, knowledge sharing.
          </div>
          <div className={styles.statusBadge}>
            <div className={styles.statusBadgeDot} />
            Прототипирование
          </div>
        </div>
        <div className={styles.agileCard}>
          <div className={styles.agileCardTitle}>🧪 User Tests</div>
          <div className={styles.agileCardBody}>
            Серия юзер-тестов на базе макетов Павла. Тестируем: onboarding flow для HR, навигацию по модулям, feedback loop и completion metrics.
          </div>
          <div className={styles.statusBadge} style={{ background: 'rgba(245,158,11,0.15)', color: '#fcd34d', borderColor: 'rgba(245,158,11,0.3)' }}>
            <div className={styles.statusBadgeDot} style={{ background: '#f59e0b' }} />
            В планировании
          </div>
        </div>
        <div className={styles.agileCard}>
          <div className={styles.agileCardTitle}>📋 Deliverable</div>
          <div className={styles.agileCardBody}>
            Результат: проработанный Agile-эпик с Definition of Done на каждую историю. Готов к передаче в разработку без доработок.
          </div>
          <div className={styles.statusBadge} style={{ background: 'rgba(34,197,94,0.1)', color: '#86efac', borderColor: 'rgba(34,197,94,0.25)' }}>
            <div className={styles.statusBadgeDot} style={{ background: '#22c55e' }} />
            Agile Epic + DoD
          </div>
        </div>
      </div>
      <div className={styles.divider} />
      <div className={styles.highlightGrid}>
        {[
          ['🎯 Use Case 1', 'Онбординг новых сотрудников — интерактивный AI-гид по компании и процессам'],
          ['📚 Use Case 2', 'Compliance тренинги с Quiz и AI-ассистентом для проверки знаний'],
          ['🔄 Use Case 3', 'Knowledge base — сотрудник задает вопросы AI-аватару эксперта'],
          ['📊 KPI', 'Completion Rate, Quiz Score, Time-to-Competency, Employee NPS'],
        ].map(([title, body]) => (
          <div key={title} className={styles.highlightCard}>
            <div className={styles.highlightCardTitle}>{title}</div>
            <div className={styles.highlightCardBody}>{body}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════ SLIDE 7 ══════════ */
const GANTT_ITEMS = [
  // category, label, start(%), width(%), color
  ['Onboarding',   'Stonly 5 Scenarios', 0,   28,  '#6366f1'],
  ['Onboarding',   'Sara AI Widget',     10,  35,  '#8b5cf6'],
  ['Research',     'JTBD Interviews',    30,  40,  '#f59e0b'],
  ['Research',     'Hotjar Analysis',    25,  30,  '#f97316'],
  ['Features',     'HR Learning Epic',   60,  40,  '#22c55e'],
  ['Features',     'Templates v2.0',     70,  30,  '#06b6d4'],
]
const MONTHS = ['Апр', 'Май', 'Июн', 'Июл']

function Slide7() {
  return (
    <div className={styles.themeAccent} style={{ height: '100%' }}>
      <div className={styles.slideTag}>Слайд 7 · Roadmap & Итоги</div>
      <h2 className={`${styles.slideTitle} ${styles.slideTitleHero}`} style={{ fontSize: '1.6em' }}>
        Бизнес-роудмап Q2–Q3 2026
      </h2>
      {/* Gantt */}
      <div className={styles.gantt}>
        <div className={styles.ganttHeader}>
          {MONTHS.map(m => <div key={m} className={styles.ganttMonthLabel}>{m}</div>)}
        </div>
        {(['Onboarding', 'Research', 'Features'] as const).map(cat => {
          const items = GANTT_ITEMS.filter(i => i[0] === cat)
          return (
            <div key={cat} className={styles.ganttGroup}>
              <div className={styles.ganttCategory}>{cat}</div>
              {items.map(([, label, start, width, color]) => (
                <div key={label as string} className={styles.ganttRow}>
                  <div className={styles.ganttRowLabel}>{label as string}</div>
                  <div className={styles.ganttTrack}>
                    <div
                      className={styles.ganttBar}
                      style={{
                        left: `${start}%`,
                        width: `${width}%`,
                        background: color as string,
                        opacity: 0.85,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )
        })}
      </div>
      <div className={styles.divider} />
      {/* Final KPIs */}
      <div className={styles.statsRow} style={{ marginTop: '0.3em' }}>
        {[
          { v: '-15–20%', l: 'Drop-off Step 2' },
          { v: '7–9', l: 'JTBD Интервью' },
          { v: '1 Epic', l: 'HR Learning DoD' },
          { v: '7–10', l: 'Новых шаблонов' },
        ].map(s => (
          <div key={s.v} className={styles.statCard}>
            <div className={styles.statValue} style={{ fontSize: '1em' }}>{s.v}</div>
            <div className={styles.statLabel}>{s.l}</div>
          </div>
        ))}
      </div>
      <div style={{
        marginTop: '0.8em',
        padding: '0.6em 1em',
        borderRadius: 10,
        background: 'rgba(99,102,241,0.12)',
        border: '1px solid rgba(99,102,241,0.3)',
        fontSize: '0.65em',
        color: '#a5b4fc',
        textAlign: 'center',
        lineHeight: 1.6,
      }}>
        🎯 <strong>Главный KPI:</strong> Улучшение метрик активации в PostHog к концу испытательного срока.
        Спасибо! Готов ответить на вопросы.
      </div>
    </div>
  )
}
