import React from 'react';
import { X } from 'lucide-react';
import styles from './EnterpriseRequestModal.module.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function EnterpriseRequestModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          <X size={20} />
        </button>
        
        <h2 className={styles.title}>Fill the form</h2>
        <p className={styles.subtitle}>
          Get a custom offer for maximum efficiency
        </p>

        <form className={styles.form} onSubmit={e => { e.preventDefault(); onClose(); }}>
          <div className={styles.inputGroup}>
            <input type="text" placeholder="Name*" required className={styles.input} />
          </div>
          <div className={styles.inputGroup}>
            <input type="text" placeholder="Company*" required className={styles.input} />
          </div>
          <div className={styles.inputGroup}>
            <input type="email" placeholder="Email*" required className={styles.input} />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.floatingLabel}>Phone number*</label>
            <input type="tel" placeholder=" " required className={styles.input} style={{ paddingTop: '1.2rem' }} />
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              CANCEL
            </button>
            <button type="submit" className={styles.submitBtn}>
              SEND
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
