'use client'

import React, { useState } from 'react'
import styles from '@/components/Library/Library.module.css'
import pageStyles from '@/components/ui/Pages.module.css'
import linkStyles from './Links.module.css'
import { MOCK_LINKS } from '@/services/mock-data'

type Link = (typeof MOCK_LINKS)[number]

// ── Embed / Build-on-site modal ───────────────────────────────────────────────
function EmbedModal({ link, onClose }: { link: Link; onClose: () => void }) {
  const [tab, setTab] = useState<'share' | 'embed' | 'widget'>('share')
  const [copied, setCopied] = useState(false)

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
            id="stonly-link-build-on-site"
            data-tour="build-on-site"
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

        {tab === 'widget' && (
          <div className={linkStyles.widgetInfo}>
            <div className={linkStyles.widgetStep}>
              <span className={linkStyles.stepNum}>1</span>
              <span>Paste the snippet above into your website's <code>&lt;body&gt;</code>.</span>
            </div>
            <div className={linkStyles.widgetStep}>
              <span className={linkStyles.stepNum}>2</span>
              <span>The widget will appear as a floating button on your page.</span>
            </div>
            <div className={linkStyles.widgetStep}>
              <span className={linkStyles.stepNum}>3</span>
              <span>Visitors click it to launch the interactive AI presentation.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function Links() {
  const [activeLink, setActiveLink] = useState<Link | null>(null)

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>My Links</h1>
        <button
          className={`${styles.createBtn} ${linkStyles.buildBtn}`}
          id="stonly-build-on-site-header"
          data-tour="build-on-site"
          onClick={() => MOCK_LINKS[0] && setActiveLink(MOCK_LINKS[0])}
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
                    id={`stonly-link-copy-${l.id}`}
                    aria-label="Copy link"
                    title="Copy"
                    onClick={() => {
                      navigator.clipboard.writeText(`https://${l.url}`)
                    }}
                  >📋</button>
                  <button
                    className={styles.gearBtn}
                    id={`stonly-link-settings-${l.id}`}
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
