import React, { useState } from 'react';
import styles from './LinkReadyModal.module.css';
import { X, Copy, Code, MonitorPlay, Mail, Facebook, Twitter, Linkedin, Check } from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';
import { QRCodeCanvas } from 'qrcode.react';

interface LinkReadyModalProps {
  isOpen: boolean;
  onClose: () => void;
  linkUrl: string;
}

export default function LinkReadyModal({ isOpen, onClose, linkUrl }: LinkReadyModalProps) {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);
  const [activeEmbedType, setActiveEmbedType] = useState<'html' | 'script' | null>(null);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(linkUrl);
    setCopied(true);
    showToast("Link copied to clipboard", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyEmbed = (code: string, type: string) => {
    navigator.clipboard.writeText(code);
    showToast(`${type} code copied!`, "success");
    setActiveEmbedType(null);
  };

  const shareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(linkUrl)}`, '_blank', 'width=600,height=400');
  };

  const shareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(linkUrl)}&text=${encodeURIComponent('Check out this interactive presentation!')}`, '_blank', 'width=600,height=400');
  };

  const shareLinkedin = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(linkUrl)}`, '_blank', 'width=600,height=400');
  };

  const shareEmail = () => {
    window.open(`mailto:?subject=${encodeURIComponent('Interactive Presentation invitation')}&body=${encodeURIComponent(`Hello,\n\nPlease view the interactive presentation using the following link:\n\n${linkUrl}`)}`, '_self');
  };

  const iframeCode = `<iframe src="${linkUrl}" width="100%" height="600px" frameborder="0" allowfullscreen allow="microphone; camera"></iframe>`;
  const scriptCode = `<script src="${linkUrl.replace('/v/', '/embed/')}.js" async></script>`;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        <div className={styles.title}>Your link is ready</div>

        <div className={styles.qrContainer}>
          <div style={{ padding: '0.75rem', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <QRCodeCanvas value={linkUrl} size={160} level="H" includeMargin={true} />
          </div>
        </div>

        <div className={styles.linkGroup}>
          <div className={styles.linkGroupLabel}>Link to be viewed by the listener</div>
          <div className={styles.linkInputWrapper}>
            <input type="text" className={styles.linkInput} readOnly value={linkUrl} />
            <button className={styles.copyBtn} onClick={handleCopy}>
              {copied ? <Check size={14} /> : <LinkIcon size={14} />} {copied ? 'Copied' : 'Copy link'}
            </button>
          </div>
        </div>

        <div className={styles.socialRow}>
          <button className={styles.socialBtn} onClick={() => setActiveEmbedType('html')}>
            <Code size={24} />
            <span>Embed html</span>
          </button>
          <button className={styles.socialBtn} onClick={() => setActiveEmbedType('script')}>
            <MonitorPlay size={24} />
            <span>Embed script</span>
          </button>
          <button className={styles.socialBtn} onClick={shareEmail}>
            <Mail size={24} />
            <span>Email</span>
          </button>
          <button className={styles.socialBtn} onClick={shareFacebook}>
            <Facebook size={24} />
            <span>Facebook</span>
          </button>
          <button className={styles.socialBtn} onClick={shareTwitter}>
            <Twitter size={24} />
            <span>X (Twitter)</span>
          </button>
          <button className={styles.socialBtn} onClick={shareLinkedin}>
            <Linkedin size={24} />
            <span>Linkedin</span>
          </button>
        </div>

        {/* Embedded HTML Overlay Panel */}
        {activeEmbedType && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            background: 'white', borderRadius: '16px', padding: '2rem',
            display: 'flex', flexDirection: 'column', gap: '1.25rem', zIndex: 10
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
                {activeEmbedType === 'html' ? 'HTML Embed Code' : 'Script Embed Code'}
              </h4>
              <button 
                type="button" 
                onClick={() => setActiveEmbedType(null)} 
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
              Copy the code block below to embed this presentation on your site:
            </p>
            <textarea
              readOnly
              style={{
                width: '100%', minHeight: '120px', padding: '0.75rem', fontSize: '0.8rem',
                fontFamily: 'monospace', borderRadius: '8px', border: '1px solid #cbd5e1',
                background: '#f8fafc', color: '#334155', resize: 'none'
              }}
              value={activeEmbedType === 'html' ? iframeCode : scriptCode}
            />
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button 
                type="button" 
                className={styles.copyBtn} 
                style={{ background: 'transparent', color: '#475569', borderColor: '#cbd5e1' }}
                onClick={() => setActiveEmbedType(null)}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className={styles.copyBtn}
                onClick={() => handleCopyEmbed(activeEmbedType === 'html' ? iframeCode : scriptCode, activeEmbedType === 'html' ? 'HTML' : 'Script')}
              >
                Copy Code
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const LinkIcon = ({ size }: { size: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
);
