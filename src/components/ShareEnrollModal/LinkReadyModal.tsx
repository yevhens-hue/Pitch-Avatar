import React from 'react';
import styles from './LinkReadyModal.module.css';
import { X, Copy, Code, MonitorPlay, Mail, Facebook, Twitter, Linkedin } from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';

interface LinkReadyModalProps {
  isOpen: boolean;
  onClose: () => void;
  linkUrl: string;
}

export default function LinkReadyModal({ isOpen, onClose, linkUrl }: LinkReadyModalProps) {
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(linkUrl);
    showToast("Link copied to clipboard", "success");
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose}>
          <X size={20} />
        </button>

        <div className={styles.title}>Your link is ready</div>

        <div className={styles.qrContainer}>
          {/* Temporary placeholder for QR code, can use a real library later */}
          <div className={styles.qrPlaceholder}>
            [QR Code]
          </div>
        </div>

        <div className={styles.linkGroup}>
          <div className={styles.linkGroupLabel}>Link to be viewed by the listener</div>
          <div className={styles.linkInputWrapper}>
            <input type="text" className={styles.linkInput} readOnly value={linkUrl} />
            <button className={styles.copyBtn} onClick={handleCopy}>
              <LinkIcon size={14} /> Copy link
            </button>
          </div>
        </div>

        <div className={styles.socialRow}>
          <button className={styles.socialBtn} onClick={() => showToast("Embed html coming soon", "info")}>
            <Code size={24} />
            <span>Embed html</span>
          </button>
          <button className={styles.socialBtn} onClick={() => showToast("Embed script coming soon", "info")}>
            <MonitorPlay size={24} />
            <span>Embed script</span>
          </button>
          <button className={styles.socialBtn} onClick={() => showToast("Email coming soon", "info")}>
            <Mail size={24} />
            <span>Email</span>
          </button>
          <button className={styles.socialBtn} onClick={() => showToast("Facebook coming soon", "info")}>
            <Facebook size={24} />
            <span>Facebook</span>
          </button>
          <button className={styles.socialBtn} onClick={() => showToast("Twitter coming soon", "info")}>
            <Twitter size={24} />
            <span>X (Twitter)</span>
          </button>
          <button className={styles.socialBtn} onClick={() => showToast("Linkedin coming soon", "info")}>
            <Linkedin size={24} />
            <span>Linkedin</span>
          </button>
        </div>
      </div>
    </div>
  );
}

const LinkIcon = ({ size }: { size: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
);
