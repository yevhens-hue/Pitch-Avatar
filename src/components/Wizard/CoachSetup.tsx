'use client';

import React from 'react';
import { GraduationCap } from 'lucide-react';
import { MOCK_ROLES } from '@/services/mock-data';
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
    <div className={`warning-box ${className || ''}`}>
      <div className={styles.header}>
        <label className="toggle-container" style={{ cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={isCoachMode}
            onChange={(e) => setIsCoachMode(e.target.checked)}
            className={styles.checkbox}
            aria-label="Coach Mode"
          />
          <span className={styles.titleText}>Coach Mode</span>
          <span className={styles.newBadge}>NEW</span>
        </label>
        <p className={styles.description}>
          Turns this project into a training simulation. Enabling it adds the Coach Q&A Set and Coach Settings steps. The role below now defines the trainee&apos;s role, not the avatar&apos;s.
        </p>
      </div>

      {isCoachMode && (
        <div className={styles.roleContainer}>
          <label className={styles.label}>Trainee Role (Coach Mode is enabled)</label>
          <select
            className={styles.select}
            value={traineeRole}
            onChange={(e) => setTraineeRole(e.target.value)}
            required
          >
            <option value="" disabled>Select a role...</option>
            {MOCK_ROLES.map((t) => (
              <option key={t.id} value={t.name}>
                {t.name} - {t.description}
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
