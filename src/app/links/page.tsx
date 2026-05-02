'use client'

import React, { useState } from 'react'
import styles from '@/components/Library/Library.module.css'
import pageStyles from '@/components/ui/Pages.module.css'
import linkStyles from './Links.module.css'
import { MOCK_LINKS } from '@/services/mock-data'
import { useUIStore } from '@/lib/store'

type Link = (typeof MOCK_LINKS)[number]

// ── Embed / Build-on-site modal ───────────────────────────────────────────────
function EmbedModal({ link, onClose }: { link: Link; onClose: () => void }) {
  const [tab, setTab] = useState<'share' | 'embed' | 'widget'>('share')
  const [copied, setCopied] = useState(false)
  const completeActiveChecklist = useUIStore(state => state.completeActiveChecklist)

  const shareUrl = `https://${link.url}`
  const iframeCode = `<iframe
  src="${shareUrl}"
  width="100%"
  height="520"
  frameborder="0"
  allow="autoplay; fullscreen"
  title="${link.presentation}"
></iframe>`
  const widgetCode = `<!-- Pitch Avatar Widget -->
<script>
  window.PITCH_AVATAR_LINK = "${link.url}";
</script>
<script async src="https://pitch-avatar.vercel.app/widget.js"></script>
<div id="pitch-avatar-widget"></div>`

  const code =
    tab === 'share' ? shareUrl : tab === 'embed' ? iframeCode : widgetCode

  const copy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    completeActiveChecklist()
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={linkStyles.overlay} onClick={onClose}>
      <div className={linkStyles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={linkStyles.modalHeader}>
          <h2 className={linkStyles.modalTitle}>Share &amp; Embed</h2>
          <p className={linkStyles.modalSub}>{link.presentation}</p>
          <button className={linkStyles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* Tabs */}
        <div className={linkStyles.tabs}>
          <button
            className={`${linkStyles.tab} ${tab === 'share' ? linkStyles.tabActive : ''}`}
            onClick={() => setTab('share')}
          >
            🔗 Share Link
          </button>
          <button
            className={`${linkStyles.tab} ${tab === 'embed' ? linkStyles.tabActive : ''}`}
            onClick={() => setTab('embed')}
          >
            &lt;/&gt; Embed iFrame
          </button>
          <button
            className={`${linkStyles.tab} ${tab === 'widget' ? linkStyles.tabActive : ''}`}
            onClick={() => setTab('widget')}
          >
            🏗️ Build on your site
          </button>
        </div>

        {/* Code block */}
        <div className={linkStyles.codeWrap}>
          <pre className={linkStyles.code}>{code}</pre>
          <button className={linkStyles.copyBtn} onClick={copy}>
            {copied ? '✅ Copied!' : '📋 Copy'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function Links() {
  const [activeLink, setActiveLink] = useState<Link | null>(null)
  const completeActiveChecklist = useUIStore(state => state.completeActiveChecklist)

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>My Links</h1>
        <button
          className={`${styles.createBtn} ${linkStyles.buildBtn}`}
          onClick={() => {
            if (MOCK_LINKS[0]) setActiveLink(MOCK_LINKS[0])
            completeActiveChecklist()
          }}
        >
          🏗️ Build on your site
        </button>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Link / Presentation</th>
              <th>Clicks</th>
              <th>Leads Collected</th>
              <th>Created Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_LINKS.map((l) => (
              <tr key={l.id}>
                <td className={styles.nameCell}>
                  <div>
                    <div className={pageStyles.linkUrl}>{l.url}</div>
                    <div className={pageStyles.linkPresentation}>Presentation: {l.presentation}</div>
                  </div>
                </td>
                <td>{l.clicks}</td>
                <td>{l.leads}</td>
                <td>{l.created}</td>
                <td>
                  <button
                    className={styles.gearBtn}
                    aria-label="Copy link"
                    title="Copy"
                    onClick={() => {
                      navigator.clipboard.writeText(`https://${l.url}`)
                      completeActiveChecklist()
                    }}
                  >📋</button>
                  <button
                    className={styles.gearBtn}
                    aria-label="Link settings"
                    title="Settings"
                    onClick={() => setActiveLink(l)}
                  >⚙️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {activeLink && (
        <EmbedModal link={activeLink} onClose={() => setActiveLink(null)} />
      )}
    </div>
  )
}

