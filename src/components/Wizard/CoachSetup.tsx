'use client';

import React from 'react';
import { GraduationCap } from 'lucide-react';
import { ROLE_TEMPLATES } from '@/types/coach';
import styles from './CoachSetup.module.css';

export interface CoachSetupProps {
  isCoachMode: boolean;
  setIsCoachMode: (value: boolean) => void;
  traineeRole: string;
  setTraineeRole: (value: string) => void;
  className?: string;
}

const CoachSetup: React.FC<CoachSetupProps> = ({
  isCoachMode,
  setIsCoachMode,
  traineeRole,
  setTraineeRole,
  className
}) => {
  return (
    <div className={`${styles.container} ${className || ''}`}>
      <div className={styles.header}>
        <div className={styles.titleContainer}>
          <h3 className={styles.title}>
            <GraduationCap size={18} />
            Enable Coach Mode
          </h3>
          <p className={styles.description}>
            Configure this project as a training simulation.
          </p>
        </div>
        <input
          type="checkbox"
          checked={isCoachMode}
          onChange={(e) => setIsCoachMode(e.target.checked)}
          className={styles.checkbox}
        />
      </div>

      {isCoachMode && (
        <div className={styles.roleContainer}>
          <label className={styles.label}>Trainee Role *</label>
          <select
            className={styles.select}
            value={traineeRole}
            onChange={(e) => setTraineeRole(e.target.value)}
            required
          >
            <option value="" disabled>Select a role...</option>
            {ROLE_TEMPLATES.map((t) => (
              <option key={t.role} value={t.role}>
                {t.label}
              </option>
            ))}
          </select>
          <p className={styles.hint}>
            This role will be used to generate appropriate questions for the training session.
          </p>
        </div>
      )}
    </div>
  );
};

export default CoachSetup;
