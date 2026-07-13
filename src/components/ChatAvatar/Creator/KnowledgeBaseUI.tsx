import React from 'react'

export type KBItem = { id: string | number, name: string, type: string, date: string, selected: boolean, url?: string }

interface KnowledgeBaseUIProps {
  title?: string
  description?: string
  kbTab: 'file' | 'link' | 'text'
  setKbTab: (tab: 'file' | 'link' | 'text') => void
  currentKbFile: File | null
  setCurrentKbFile: (file: File | null) => void
  currentKbLink: string
  setCurrentKbLink: (link: string) => void
  currentKbText: string
  setCurrentKbText: (text: string) => void
  isKbAddDisabled: boolean
  handleAddKb: () => void
  kbItems: KBItem[]
  setKbItems: (items: KBItem[] | ((prev: KBItem[]) => KBItem[])) => void
  dateColumnLabel?: string
}

export default function KnowledgeBaseUI({
  title = "Knowledge Base",
  description,
  kbTab,
  setKbTab,
  currentKbFile,
  setCurrentKbFile,
  currentKbLink,
  setCurrentKbLink,
  currentKbText,
  setCurrentKbText,
  isKbAddDisabled,
  handleAddKb,
  kbItems,
  setKbItems,
  dateColumnLabel = "Knowledge Base Date"
}: KnowledgeBaseUIProps) {
  return (
    <div style={{ padding: '0 0 1rem 0', width: '100%' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111827', marginBottom: description ? '0.5rem' : '1.5rem' }}>
        {title}
      </h2>
      {description && <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>{description}</p>}

      {/* KB Tabs */}
      <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: '10px', padding: '4px', marginBottom: '1.5rem' }}>
        {(['file', 'link', 'text'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setKbTab(tab)}
            style={{
              flex: 1,
              padding: '0.75rem',
              borderRadius: '8px',
              border: 'none',
              background: kbTab === tab ? '#fff' : 'transparent',
              color: kbTab === tab ? '#111827' : '#6b7280',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              boxShadow: kbTab === tab ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            {tab === 'file' ? 'File' : tab === 'link' ? 'Link' : 'Text'}
          </button>
        ))}
      </div>

      {/* KB Content Based on Tab */}
      {kbTab === 'file' && (
        <>
          <div style={{ background: '#eff6ff', borderRadius: '12px', padding: '1.25rem', display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '1.25rem', color: '#3b82f6' }}>ⓘ</span>
            <p style={{ fontSize: '0.875rem', color: '#1e40af', margin: 0, lineHeight: 1.5 }}>
              Upload files that can serve as a knowledge source. This information will improve responses during conversations.
            </p>
          </div>
          <div style={{ border: '2px dashed #cbd5e1', borderRadius: '16px', padding: '3rem 2rem', display: 'flex', alignItems: 'center', marginBottom: '1rem', background: '#fff' }}>
            <div style={{ flex: 1, textAlign: 'center', paddingRight: '1rem', borderRight: '1px solid #e5e7eb' }}>
              {currentKbFile ? (
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#10b981', margin: '0 0 0.5rem 0' }}>
                  Selected: {currentKbFile.name}
                </p>
              ) : (
                <>
                  <p style={{ fontSize: '1rem', fontWeight: 600, color: '#111827', margin: '0 0 0.5rem 0' }}>Drag and drop files here</p>
                  <label style={{ color: '#3b82f6', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>
                    or click to select
                    <input 
                      type="file" 
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setCurrentKbFile(e.target.files[0])
                        }
                      }}
                    />
                  </label>
                </>
              )}
            </div>
            <div style={{ flex: 1, textAlign: 'center', paddingLeft: '1rem' }}>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827', margin: '0 0 0.75rem 0' }}>Select from</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#374151', fontSize: '0.875rem', fontWeight: 600 }}>
                <span style={{ fontSize: '1.25rem' }}>📁</span> Google Drive
              </div>
            </div>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0 0 1.5rem 0', textAlign: 'center' }}>
            Upload a .pdf, .ppt, .pptx, .doc, .docx, .mp4, or .mp3 file up to 100 MB
          </p>
        </>
      )}

      {kbTab === 'link' && (
        <>
          <div style={{ background: '#eff6ff', borderRadius: '12px', padding: '1.25rem', display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '1.25rem', color: '#3b82f6' }}>ⓘ</span>
            <p style={{ fontSize: '0.875rem', color: '#1e40af', margin: 0, lineHeight: 1.5 }}>
              The avatar can visit and analyze all pages in this group to provide detailed, context-aware answers.
            </p>
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#111827', marginBottom: '0.5rem' }}>Link Type</label>
            <select style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '10px', background: '#fff' }}>
              <option>Link Group</option>
            </select>
          </div>
          <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#111827', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              Link Group <span style={{ color: '#9ca3af', cursor: 'help' }}>ⓘ</span>
            </label>
            <button style={{ background: 'none', border: 'none', color: '#3b82f6', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>+ Upload File</button>
          </div>
          <textarea 
            placeholder="Paste your links here"
            value={currentKbLink}
            onChange={e => setCurrentKbLink(e.target.value)}
            style={{ width: '100%', padding: '1rem', border: '1px solid #d1d5db', borderRadius: '12px', minHeight: '100px', fontSize: '0.9rem', marginBottom: '0.5rem' }}
          />
          <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0 0 1.5rem 0' }}>
            0/50000 remaining characters. Internal links will not work.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <input type="checkbox" style={{ width: '18px', height: '18px' }} />
            <label style={{ fontSize: '0.9rem', color: '#374151', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              Use web images for answers <span style={{ color: '#9ca3af', cursor: 'help' }}>ⓘ</span>
            </label>
          </div>
        </>
      )}

      {kbTab === 'text' && (
        <>
          <div style={{ background: '#eff6ff', borderRadius: '12px', padding: '1.25rem', display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '1.25rem', color: '#3b82f6' }}>ⓘ</span>
            <p style={{ fontSize: '0.875rem', color: '#1e40af', margin: 0, lineHeight: 1.5 }}>
              Enter text here to provide your avatar with a knowledge source to answer your audience.
            </p>
          </div>
          <textarea 
            placeholder="Text"
            value={currentKbText}
            onChange={e => setCurrentKbText(e.target.value)}
            style={{ width: '100%', padding: '1rem', border: '1px solid #d1d5db', borderRadius: '12px', minHeight: '200px', fontSize: '1rem', marginBottom: '1.5rem' }}
          />
        </>
      )}

      <button 
        disabled={isKbAddDisabled}
        onClick={handleAddKb}
        style={{ 
          background: isKbAddDisabled ? '#f3f4f6' : '#3b82f6', 
          color: isKbAddDisabled ? '#9ca3af' : '#fff', 
          border: 'none', 
          padding: '0.625rem 1.5rem', 
          borderRadius: '8px', 
          fontWeight: 600, 
          fontSize: '0.875rem', 
          cursor: isKbAddDisabled ? 'not-allowed' : 'pointer', 
          marginBottom: '2rem' 
      }}>
        Add
      </button>

      {/* KB Table */}
      <div style={{ border: '1px solid #e5e7eb', borderRadius: '16px', overflow: 'hidden', background: '#fff' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ textAlign: 'left', color: '#4b5563', background: '#f9fafb' }}>
              <th style={{ padding: '1rem', fontWeight: 600 }}>Name</th>
              <th style={{ padding: '1rem', fontWeight: 600 }}>Type</th>
              <th style={{ padding: '1rem', fontWeight: 600 }}>Settings</th>
              <th style={{ padding: '1rem', fontWeight: 600 }}>{dateColumnLabel}</th>
            </tr>
          </thead>
          <tbody>
            {kbItems.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                  No knowledge base items yet. Add some files, links, or text above.
                </td>
              </tr>
            ) : kbItems.map((item) => (
              <tr key={item.id} style={{ borderTop: '1px solid #f3f4f6' }}>
                <td style={{ padding: '1rem', color: '#111827', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.2rem' }}>{item.type === 'link' || (item.type === 'Text / Web' && item.url) ? '🔗' : (item.type === 'text' || item.type === 'Text / Web') ? '📝' : '📄'}</span> {item.name}
                </td>
                <td style={{ padding: '1rem', color: '#6b7280' }}>{item.type}</td>
                <td style={{ padding: '1rem' }}></td>
                <td style={{ padding: '1rem', color: '#6b7280', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {item.date}
                  <input 
                    type="checkbox" 
                    checked={item.selected}
                    onChange={(e) => {
                      setKbItems((items: KBItem[]) => items.map(i => i.id === item.id ? { ...i, selected: e.target.checked } : i))
                    }}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }} 
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
